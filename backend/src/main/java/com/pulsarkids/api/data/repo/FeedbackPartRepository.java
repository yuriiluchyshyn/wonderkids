package com.pulsarkids.api.data.repo;

import com.pulsarkids.api.data.entity.FeedbackPart;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeedbackPartRepository extends JpaRepository<FeedbackPart, FeedbackPart.Key> {
  /** One piece of a file; sending a piece again replaces it. */
  @Modifying
  @Query(
      value = "INSERT INTO wk_feedback_parts (feedback_id, file_no, part_no, data) VALUES (:id, :fileNo, :partNo, :data) "
          + "ON CONFLICT (feedback_id, file_no, part_no) DO UPDATE SET data = EXCLUDED.data",
      nativeQuery = true)
  int upsert(@Param("id") Integer id, @Param("fileNo") int fileNo, @Param("partNo") int partNo, @Param("data") String data);

  /** The pieces of one attached file, in order (base64). */
  @Query("SELECT p.data FROM FeedbackPart p WHERE p.id.feedbackId = :id AND p.id.fileNo = :fileNo ORDER BY p.id.partNo")
  List<String> piecesOf(@Param("id") Integer id, @Param("fileNo") int fileNo);

  /** The letters whose files are still here. */
  @Query("SELECT DISTINCT p.id.feedbackId FROM FeedbackPart p")
  List<Integer> lettersWithFiles();

  @Modifying
  @Query("DELETE FROM FeedbackPart p WHERE p.id.feedbackId = :id")
  int deleteOf(@Param("id") Integer id);

  /** Files nobody came back for (a failed delivery, a closed tab). */
  @Modifying
  @Query(value = "DELETE FROM wk_feedback_parts WHERE created_at < now() - interval '1 day'", nativeQuery = true)
  int deleteStale();
}
