import { useCallback, useEffect, useRef } from 'react';

// ─── Canvas / World Constants ─────────────────────────────────────────────────
const W = 800;
const H = 300;
const GY = 248;          // ground y

// ─── Dino Constants ───────────────────────────────────────────────────────────
const DX = 80;           // dino fixed x
const DSH = 44;          // dino stand height
const DDH = 26;          // dino duck height
const DSW = 22;          // dino stand width
const DDW = 36;          // dino duck width
const DSY = GY - DSH;    // dino stand top y  = 204
const DDY = GY - DDH;    // dino duck top y   = 222

// ─── Physics ──────────────────────────────────────────────────────────────────
const GRAVITY = 0.75;
const JUMP_VY = -12;
const BASE_SPD = 5;
const SPD_STEP = 0.0008; // speed added per score tick

// ─── Types ────────────────────────────────────────────────────────────────────
type Status = 'idle' | 'running' | 'over';
type ObsType = 'cs' | 'cm' | 'cl' | 'pt'; // cactus small/med/large, pterodactyl

interface Obs {
  x: number; y: number; w: number; h: number;
  t: ObsType;
  wf: number; wt: number; // wing frame / timer (pterodactyl)
}

interface State {
  status: Status;
  score: number;
  hi: number;
  spd: number;
  night: boolean;
  cycT: number;
  // dino
  dy: number;     // dino top-y (standing)
  dvy: number;
  djump: boolean;
  dduck: boolean;
  dleg: number;   // 0 | 1 leg animation frame
  dlegt: number;
  dblink: number; // gameover flash timer
  // world
  obs: Obs[];
  clouds: { x: number; y: number }[];
  gx: number;       // ground scroll offset
  nextObs: number;  // distance until next obstacle
}

// ─── Pixel-art helpers ────────────────────────────────────────────────────────
function r(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

// ─── Draw Dino ────────────────────────────────────────────────────────────────
function drawDino(ctx: CanvasRenderingContext2D, s: State, col: string) {
  // blink on game-over
  if (s.status === 'over' && Math.floor(s.dblink / 5) % 2 === 0) return;

  ctx.fillStyle = col;
  const x = DX;

  if (s.dduck) {
    const y = DDY; // 222
    // body
    r(ctx, x,      y + 8,  28, 12); // main body
    r(ctx, x,      y + 10, 5,  5);  // tail nub
    // head (shifted right in duck)
    r(ctx, x + 18, y,      16, 10);
    ctx.fillStyle = '#f7f7f7';
    r(ctx, x + 28, y + 2,  3,  3);  // eye white
    ctx.fillStyle = col;
    r(ctx, x + 29, y + 3,  2,  2);  // pupil
    // arm
    r(ctx, x + 20, y + 10, 6,  4);
    // legs — bottom at y+26=248=GY
    if (s.dleg === 0) {
      r(ctx, x + 6,  y + 18, 5, 8);
      r(ctx, x + 15, y + 18, 5, 4);
    } else {
      r(ctx, x + 6,  y + 18, 5, 4);
      r(ctx, x + 15, y + 18, 5, 8);
    }
  } else {
    const y = s.dy; // 204 when on ground
    // head
    r(ctx, x + 6,  y,      16, 14);
    ctx.fillStyle = '#f7f7f7';
    r(ctx, x + 16, y + 2,  4,  4);  // eye white
    ctx.fillStyle = col;
    r(ctx, x + 17, y + 3,  2,  2);  // pupil
    // neck + body
    r(ctx, x + 6,  y + 12, 12, 6);  // neck
    r(ctx, x,      y + 16, 20, 16); // body
    r(ctx, x,      y + 18, 4,  8);  // tail
    r(ctx, x + 14, y + 22, 8,  4);  // arm
    // legs — bottom at y+44=248=GY when standing
    if (s.djump) {
      r(ctx, x + 4,  y + 32, 6, 8);
      r(ctx, x + 12, y + 32, 6, 6);
    } else if (s.dleg === 0) {
      r(ctx, x + 4,  y + 32, 6, 12);
      r(ctx, x + 12, y + 32, 6, 6);
    } else {
      r(ctx, x + 4,  y + 32, 6, 6);
      r(ctx, x + 12, y + 32, 6, 12);
    }
  }
}

// ─── Draw Obstacle ────────────────────────────────────────────────────────────
function drawObs(ctx: CanvasRenderingContext2D, o: Obs, col: string) {
  ctx.fillStyle = col;
  const { x, y, t, wf } = o;

  if (t === 'cs') {
    // small single cactus
    r(ctx, x + 4,  y,      8,  o.h);
    r(ctx, x,      y + 12, 4,  8);
    r(ctx, x,      y + 8,  4,  4);
    r(ctx, x + 12, y + 14, 4,  6);
    r(ctx, x + 12, y + 10, 4,  4);
  } else if (t === 'cm') {
    // two cacti side by side
    r(ctx, x + 4,  y + 8,  8,  o.h - 8);
    r(ctx, x,      y + 18, 4,  8);
    r(ctx, x,      y + 14, 4,  4);
    r(ctx, x + 12, y + 20, 4,  6);
    r(ctx, x + 12, y + 16, 4,  4);
    r(ctx, x + 22, y,      8,  o.h - 4);
    r(ctx, x + 18, y + 10, 4,  8);
    r(ctx, x + 18, y + 6,  4,  4);
    r(ctx, x + 30, y + 12, 4,  6);
    r(ctx, x + 30, y + 8,  4,  4);
  } else if (t === 'cl') {
    // large cactus
    r(ctx, x + 6,  y,      10, o.h);
    r(ctx, x,      y + 18, 6,  10);
    r(ctx, x,      y + 12, 6,  6);
    r(ctx, x + 16, y + 20, 6,  8);
    r(ctx, x + 16, y + 14, 6,  6);
  } else {
    // pterodactyl
    r(ctx, x + 8,  y + 10, 16, 8);  // body
    r(ctx, x + 20, y + 6,  12, 8);  // head
    r(ctx, x + 30, y + 8,  8,  4);  // beak
    ctx.fillStyle = '#f7f7f7';
    r(ctx, x + 22, y + 8,  3,  3);  // eye
    ctx.fillStyle = col;
    if (wf === 0) {
      // wings up
      r(ctx, x,      y + 2,  10, 6);
      r(ctx, x + 8,  y + 4,  6,  4);
      r(ctx, x + 22, y + 2,  12, 6);
      r(ctx, x + 16, y + 4,  8,  4);
    } else {
      // wings down
      r(ctx, x,      y + 14, 10, 6);
      r(ctx, x + 8,  y + 12, 6,  4);
      r(ctx, x + 22, y + 14, 12, 6);
      r(ctx, x + 16, y + 12, 8,  4);
    }
  }
}

// ─── Spawn Obstacle ───────────────────────────────────────────────────────────
function spawnObs(score: number): Obs {
  const rn = Math.random();
  if (score > 2000 && rn < 0.22) {
    // pterodactyl — 3 height levels
    const heights = [GY - 58, GY - 85, GY - 115];
    const py = heights[Math.floor(Math.random() * heights.length)];
    return { x: W + 20, y: py, w: 40, h: 26, t: 'pt', wf: 0, wt: 0 };
  } else if (rn < 0.35) {
    return { x: W + 20, y: GY - 48, w: 20, h: 48, t: 'cs', wf: 0, wt: 0 };
  } else if (rn < 0.70) {
    return { x: W + 20, y: GY - 56, w: 38, h: 56, t: 'cm', wf: 0, wt: 0 };
  } else {
    return { x: W + 20, y: GY - 66, w: 28, h: 66, t: 'cl', wf: 0, wt: 0 };
  }
}

// ─── Initial State ────────────────────────────────────────────────────────────
function makeState(hi = 0): State {
  return {
    status: 'idle', score: 0, hi,
    spd: BASE_SPD, night: false, cycT: 0,
    dy: DSY, dvy: 0, djump: false, dduck: false,
    dleg: 0, dlegt: 0, dblink: 0,
    obs: [],
    clouds: [{ x: 180, y: 50 }, { x: 460, y: 32 }, { x: 680, y: 68 }],
    gx: 0, nextObs: 80,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<State>(makeState());
  const rafRef    = useRef<number>(0);
  const keys      = useRef<Set<string>>(new Set());

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s   = stateRef.current;
    const jump = keys.current.has('Space') || keys.current.has('ArrowUp');
    const duck = keys.current.has('ArrowDown');

    // ── State machine transitions
    if (s.status === 'idle' && jump) {
      s.status = 'running';
    } else if (s.status === 'over') {
      s.dblink++;
      if (jump && s.dblink > 25) {
        stateRef.current = makeState(s.hi);
        stateRef.current.status = 'running';
        rafRef.current = requestAnimationFrame(loop);
        return; // skip rest; new frame scheduled above
      }
    }

    // ── Update (only while running)
    if (s.status === 'running') {
      s.spd = BASE_SPD + s.score * SPD_STEP;

      // Jump
      if (jump && !s.djump && !s.dduck) {
        s.dvy = JUMP_VY;
        s.djump = true;
      }

      // Duck (can't duck mid-air)
      s.dduck = duck && !s.djump;

      // Physics
      if (s.djump) {
        s.dy  += s.dvy;
        s.dvy += GRAVITY;
        if (s.dy >= DSY) { s.dy = DSY; s.djump = false; s.dvy = 0; }
      }

      // Leg animation — faster at higher speed
      if (!s.djump) {
        s.dlegt++;
        const interval = Math.max(4, 10 - Math.floor(s.spd - BASE_SPD));
        if (s.dlegt >= interval) { s.dleg ^= 1; s.dlegt = 0; }
      }

      // Score
      s.score++;

      // Day / night cycle every 800 score ticks
      s.cycT++;
      if (s.cycT > 800) { s.night = !s.night; s.cycT = 0; }

      // Clouds
      s.clouds.forEach(c => { c.x -= s.spd * 0.25; });
      s.clouds = s.clouds.filter(c => c.x > -80);
      if (Math.random() < 0.004) {
        s.clouds.push({ x: W + 60, y: 12 + Math.random() * 88 });
      }

      // Ground scroll
      s.gx -= s.spd;
      if (s.gx < -W) s.gx += W;

      // Obstacle spawning
      s.nextObs -= s.spd;
      if (s.nextObs <= 0) {
        s.obs.push(spawnObs(s.score));
        s.nextObs = 250 + Math.random() * 380;
      }

      // Move obstacles + animate pterodactyls
      s.obs.forEach(o => {
        o.x -= s.spd;
        if (o.t === 'pt') {
          o.wt++;
          if (o.wt > 14) { o.wf ^= 1; o.wt = 0; }
        }
      });
      s.obs = s.obs.filter(o => o.x > -120);

      // ── Collision detection (4 px padding for fairness)
      const dl = DX + 2;
      const dr = DX + (s.dduck ? DDW : DSW) - 2;
      const dt = (s.dduck ? DDY : s.dy) + 2;
      const db = (s.dduck ? DDY + DDH : s.dy + DSH) - 2;

      for (const o of s.obs) {
        if (dl < o.x + o.w - 3 && dr > o.x + 3 &&
            dt < o.y + o.h - 3 && db > o.y + 3) {
          s.status = 'over';
          if (s.score > s.hi) s.hi = s.score;
          break;
        }
      }
    }

    // ── Render ──────────────────────────────────────────────────────────────
    const night = s.night;
    const col   = night ? '#d4d4d4' : '#535353';
    const bg    = night ? '#1a1a2e' : '#f7f7f7';

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Stars
    if (night) {
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 28; i++) {
        const sx = (i * 131 + 70)  % (W - 20);
        const sy = (i * 89  + 15)  % (GY - 40);
        ctx.fillRect(sx, sy, 1 + (i % 2), 1 + (i % 2));
      }
    }

    // Moon (night only)
    if (night) {
      ctx.fillStyle = '#d4d4d4';
      ctx.beginPath();
      ctx.arc(W - 80, 48, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(W - 74, 44, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    // Clouds
    ctx.fillStyle = col;
    s.clouds.forEach(c => {
      ctx.fillRect(c.x + 8,  c.y,      28, 8);
      ctx.fillRect(c.x + 2,  c.y + 5,  40, 8);
      ctx.fillRect(c.x,      c.y + 10, 46, 6);
    });

    // Ground line
    ctx.fillStyle = col;
    ctx.fillRect(0, GY, W, 2);

    // Ground pebbles (scrolling)
    for (let i = 0; i < W + 40; i += 40) {
      const gx2 = ((i + s.gx) % W + W) % W;
      ctx.fillRect(gx2,        GY + 4, 5, 2);
      ctx.fillRect((gx2 + 20) % W, GY + 7, 3, 2);
    }

    // Obstacles
    s.obs.forEach(o => drawObs(ctx, o, col));

    // Dino
    drawDino(ctx, s, col);

    // ── HUD: score
    ctx.font      = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'right';
    const scoreStr = String(Math.floor(s.score / 10)).padStart(5, '0');
    const hiStr    = String(Math.floor(s.hi    / 10)).padStart(5, '0');
    if (s.hi > 0) {
      ctx.fillStyle = night ? '#888888' : '#aaaaaa';
      ctx.fillText(`HI ${hiStr}`, W - 90, 28);
    }
    ctx.fillStyle = col;
    ctx.fillText(scoreStr, W - 20, 28);

    // ── Overlay messages
    ctx.textAlign = 'center';
    if (s.status === 'idle') {
      ctx.fillStyle = col;
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillText('Press  SPACE  or  ↑  to  Play', W / 2, H / 2 + 10);
    } else if (s.status === 'over') {
      ctx.fillStyle = col;
      ctx.font = 'bold 22px "Courier New", monospace';
      ctx.fillText('G A M E   O V E R', W / 2, H / 2 - 20);
      if (s.dblink > 25) {
        ctx.font = '15px "Courier New", monospace';
        ctx.fillText('Press  SPACE  or  ↑  to  Restart', W / 2, H / 2 + 12);
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    stateRef.current = makeState();
    rafRef.current   = requestAnimationFrame(loop);

    const onKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
        keys.current.add(e.code);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code);

    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      keys.current.add('Space');
      setTimeout(() => keys.current.delete('Space'), 150);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    canvasRef.current?.addEventListener('touchstart', onTouch, { passive: false });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
    };
  }, [loop]);

  return (
    <div className="game-wrapper">
      <h1 className="game-title">DINO RUN</h1>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="game-canvas"
      />
      <p className="game-hint">
        SPACE &nbsp;/&nbsp; ↑ &nbsp;Jump &nbsp;&nbsp;·&nbsp;&nbsp; ↓ &nbsp;Duck
      </p>
    </div>
  );
}
