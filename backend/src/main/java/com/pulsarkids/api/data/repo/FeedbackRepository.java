package com.pulsarkids.api.data.repo;

import com.pulsarkids.api.data.entity.Feedback;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
  /** Letters this sender wrote within the last hour, and everybody within a day. */
  interface Recent {
    int getMine();

    int getEveryone();
  }

  @Query(
      value = "SELECT CAST(count(*) FILTER (WHERE ip_hash = :ipHash AND created_at > now() - interval '1 hour') AS int) AS mine, "
          + "CAST(count(*) FILTER (WHERE created_at > now() - interval '1 day') AS int) AS everyone FROM wk_feedback",
      nativeQuery = true)
  Recent countRecent(@Param("ipHash") String ipHash);

  List<Feedback> findTop500ByOrderByIdDesc();

  /** No more files will come. Touches no row when the letter was closed already. */
  @Modifying
  @Query("UPDATE Feedback f SET f.closed = true WHERE f.id = :id AND f.closed = false")
  int close(@Param("id") Integer id);

  @Modifying
  @Query("UPDATE Feedback f SET f.status = 'answered' WHERE f.id = :id AND f.status = 'new'")
  int markAnswered(@Param("id") Integer id);

  @Modifying
  @Query("UPDATE Feedback f SET f.status = :status WHERE f.id = :id")
  int setStatus(@Param("id") Integer id, @Param("status") String status);

  @Modifying
  @Query("UPDATE Feedback f SET f.mailError = :error WHERE f.id = :id")
  int setMailError(@Param("id") Integer id, @Param("error") String error);

  @Modifying
  @Query("UPDATE Feedback f SET f.mailedAt = :now, f.mailError = NULL WHERE f.id = :id")
  int markMailed(@Param("id") Integer id, @Param("now") Instant now);

  @Modifying
  @Query("DELETE FROM Feedback f WHERE f.id = :id")
  int remove(@Param("id") Integer id);
}
