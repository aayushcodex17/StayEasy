package com.ayushcodex.stayease.ratelimit;

import com.ayushcodex.stayease.advices.ApiError;
import com.ayushcodex.stayease.advices.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    // Per-IP buckets for auth and general endpoints
    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> generalBuckets = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper;

    // Stricter limits on auth endpoints to prevent brute force
    private static final int AUTH_CAPACITY = 5;
    private static final Duration AUTH_REFILL_DURATION = Duration.ofMinutes(1);

    // General API limit per IP
    private static final int GENERAL_CAPACITY = 60;
    private static final Duration GENERAL_REFILL_DURATION = Duration.ofMinutes(1);

    private static final List<String> AUTH_PATHS = List.of(
            "/auth/login",
            "/auth/signup",
            "/auth/registerAsHotelManager"
    );

    public RateLimitingFilter() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Webhooks bypass rate limiting — Stripe must always reach us
        if (path.contains("/webhook")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = extractClientIp(request);
        boolean isAuthPath = AUTH_PATHS.stream().anyMatch(path::contains);

        Bucket bucket = isAuthPath
                ? authBuckets.computeIfAbsent(clientIp, k -> createAuthBucket())
                : generalBuckets.computeIfAbsent(clientIp, k -> createGeneralBucket());

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            int limit = isAuthPath ? AUTH_CAPACITY : GENERAL_CAPACITY;
            response.addHeader("X-RateLimit-Limit", String.valueOf(limit));
            response.addHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
            filterChain.doFilter(request, response);
        } else {
            long retryAfterSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;
            log.warn("Rate limit exceeded for IP: {} on path: {}", clientIp, path);
            rejectRequest(response, retryAfterSeconds);
        }
    }

    private void rejectRequest(HttpServletResponse response, long retryAfterSeconds) throws IOException {
        ApiError apiError = ApiError.builder()
                .httpStatus(HttpStatus.TOO_MANY_REQUESTS)
                .message("Too many requests. Please slow down and try again in "
                        + retryAfterSeconds + " second(s).")
                .build();

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.addHeader("X-RateLimit-Retry-After-Seconds", String.valueOf(retryAfterSeconds));

        objectMapper.writeValue(response.getWriter(), new ApiResponse<>(apiError));
    }

    private Bucket createAuthBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(AUTH_CAPACITY)
                        .refillIntervally(AUTH_CAPACITY, AUTH_REFILL_DURATION)
                        .build())
                .build();
    }

    private Bucket createGeneralBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(GENERAL_CAPACITY)
                        .refillIntervally(GENERAL_CAPACITY, GENERAL_REFILL_DURATION)
                        .build())
                .build();
    }

    private String extractClientIp(HttpServletRequest request) {
        // Handle requests behind reverse proxy / load balancer
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
