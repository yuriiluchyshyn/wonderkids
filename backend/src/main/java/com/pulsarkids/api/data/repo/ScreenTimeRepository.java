package com.pulsarkids.api.data.repo;

import com.pulsarkids.api.data.entity.ScreenTimeRow;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ScreenTimeRepository extends JpaRepository<ScreenTimeRow, String> {
  /** Make sure the child has a row — and never touch what the server has counted in one that is there. */
  @Modifying
  @Query(value = "INSERT INTO wk_screen_time (child_id) VALUES (:childId) ON CONFLICT (child_id) DO NOTHING", nativeQuery = true)
  int insertIfAbsent(@Param("childId") String childId);

  /** The row, locked until the transaction ends (`SELECT … FOR UPDATE`): two beats of one child never count at once. */
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT s FROM ScreenTimeRow s WHERE s.childId = :childId")
  Optional<ScreenTimeRow> lock(@Param("childId") String childId);
}
