package com.pulsarkids.api.data.repo;

import com.pulsarkids.api.data.entity.Visit;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VisitRepository extends JpaRepository<Visit, Long> {
  /** What one link has brought, all time. */
  interface LinkStats {
    String getLinkCode();

    int getVisits();

    int getVisitors();

    int getDemos();

    int getExpired();

    int getCta();

    Instant getLastVisitAt();
  }

  @Query(
      value = "SELECT link_code AS \"linkCode\", CAST(count(*) AS int) AS visits, CAST(count(DISTINCT visitor) AS int) AS visitors, "
          + "CAST(count(*) FILTER (WHERE mode = 'demo') AS int) AS demos, CAST(count(expired_at) AS int) AS expired, "
          + "CAST(count(cta_at) AS int) AS cta, max(created_at) AS \"lastVisitAt\" "
          + "FROM wk_visits WHERE link_code IS NOT NULL GROUP BY link_code",
      nativeQuery = true)
  List<LinkStats> statsByLink();

  /** How many arrivals this visitor has had counted since `since`. */
  int countByVisitorAndCreatedAtAfter(String visitor, Instant since);

  /** Arrivals, newest first — all of them, or those after `since`. */
  @Query("SELECT v FROM Visit v WHERE v.createdAt > :since ORDER BY v.createdAt DESC")
  List<Visit> findSince(@Param("since") Instant since, Pageable limit);

  @Query("SELECT v FROM Visit v ORDER BY v.createdAt DESC")
  List<Visit> findNewest(Pageable limit);

  /** What became of a trial game — kept once: the first time it is told. */
  @Modifying
  @Query("UPDATE Visit v SET v.expiredAt = :now WHERE v.id = :id AND v.mode = 'demo' AND v.expiredAt IS NULL")
  int markExpired(@Param("id") Long id, @Param("now") Instant now);

  @Modifying
  @Query("UPDATE Visit v SET v.ctaAt = :now WHERE v.id = :id AND v.mode = 'demo' AND v.ctaAt IS NULL")
  int markCta(@Param("id") Long id, @Param("now") Instant now);
}
