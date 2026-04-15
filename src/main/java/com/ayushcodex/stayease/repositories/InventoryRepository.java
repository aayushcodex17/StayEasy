package com.ayushcodex.stayease.repositories;

import com.ayushcodex.stayease.dto.HotelDto;
import com.ayushcodex.stayease.entity.Hotel;
import com.ayushcodex.stayease.entity.Inventory;
import com.ayushcodex.stayease.entity.Room;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory,Long> {

    void deleteByRoom(Room room);

    @Query(value = """    
            SELECT *
            FROM hotel
            WHERE id IN (
                    SELECT h1_0.id
                            FROM inventory i1_0
                            JOIN hotel h1_0 ON h1_0.id = i1_0.hotel_id
                            WHERE i1_0.city = :city
                            AND i1_0.inventory_date BETWEEN :startDate AND :endDate
                            AND i1_0.closed = 0
                            AND (i1_0.total_count - i1_0.booked_count - i1_0.reserved_count) >= :roomsCount
            GROUP BY h1_0.id
            HAVING COUNT(DISTINCT i1_0.inventory_date) = :dateCount
            )
            """,nativeQuery = true)
    List<Hotel> findHotelsWithAvailableInventory(
            @Param("city") String city,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("roomsCount") Integer roomsCount,
            @Param("dateCount") Long dateCount
    );

    @Query(value = """
             SELECT i FROM Inventory i
             WHERE i.room.id = :roomId
               AND i.inventoryDate BETWEEN :startDate AND :endDate
               AND i.closed = false
               AND (i.totalCount - i.bookedCount - i.reservedCount) >= :roomsCount
            """)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    /* this will lock the entries for some time until the transactional method ends*/
    List<Inventory> findAndLockAvailableInventory(
            @Param("roomId") Long roomId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("roomsCount") Integer roomsCount
    );

    @Query(value = """
             SELECT i FROM Inventory i
             WHERE i.room.id = :roomId
               AND i.inventoryDate BETWEEN :startDate AND :endDate
               AND i.closed = false
               AND (i.totalCount - i.bookedCount) >= :roomsCount
            """)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
        /* this will lock the entries for some time until the transactional method ends*/
    List<Inventory> findAndLockReservedInventory(
            @Param("roomId") Long roomId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("roomsCount") Integer roomsCount
    );


    List<Inventory> findByHotelAndInventoryDateBetween(Hotel hotel, LocalDate startDate, LocalDate endDate);

    @Modifying
    @Query("""
            UPDATE Inventory i
            SET i.reservedCount  = i.reservedCount - :numberOfRooms,
                i.bookedCount = i.bookedCount + :numberOfRooms
            WHERE i.room.id = :roomId
              AND i.inventoryDate BETWEEN :startDate AND :endDate
              AND (i.totalCount - i.bookedCount) >= :numberOfRooms
              AND i.reservedCount >= :numberOfRooms
              AND i.closed = false
            """)
    void confirmBooking(@Param("roomId") Long roomId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        @Param("numberOfRooms") int numberOfRooms);

    @Modifying
    @Query("""
            UPDATE Inventory i
            SET i.reservedCount = i.reservedCount + :numberOfRooms
            WHERE i.room.id = :roomId
              AND i.inventoryDate BETWEEN :startDate AND :endDate
              AND (i.totalCount - i.bookedCount - i.reservedCount) >= :numberOfRooms
              AND i.closed = false
            """)
    void initBooking(@Param("roomId") Long roomId,
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate,
                     @Param("numberOfRooms") int numberOfRooms);

    @Modifying
    @Query("""
            UPDATE Inventory i
            SET i.bookedCount = i.bookedCount - :numberOfRooms
            WHERE i.room.id = :roomId
              AND i.inventoryDate BETWEEN :startDate AND :endDate
              AND (i.totalCount - i.bookedCount) >= :numberOfRooms
              AND i.closed = false
            """)
    void cancelBooking(@Param("roomId") Long roomId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        @Param("numberOfRooms") int numberOfRooms);


    List<Inventory> findByRoomOrderByInventoryDate(Room room);


    @Query("""
            SELECT i FROM Inventory i
            WHERE i.room.id = :roomId
              AND i.inventoryDate BETWEEN :startDate AND :endDate
            """)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    void getInventoryLockedBeforeUpdating(@Param("roomId") Long roomId,
                         @Param("startDate") LocalDate startDate,
                         @Param("endDate") LocalDate endDate);

    @Modifying
    @Query("""
            UPDATE Inventory i
            SET i.surgeFactor = :surgeFactor,
              i.closed = :closed
            WHERE i.room.id = :roomId
              AND i.inventoryDate BETWEEN :startDate AND :endDate
            """)
    void updateInventory(@Param("roomId") Long roomId,
                       @Param("startDate") LocalDate startDate,
                       @Param("endDate") LocalDate endDate,
                       @Param("closed") Boolean closed,
                       @Param("surgeFactor")BigDecimal surgeFactor);
}
