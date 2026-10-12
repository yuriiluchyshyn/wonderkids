package com.pulsarkids.api.data.repo;

import com.pulsarkids.api.data.entity.Link;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LinkRepository extends JpaRepository<Link, Integer> {
  List<Link> findAllByOrderByCreatedAtDesc();

  boolean existsByCode(String code);

  /** A new link, unless its code is taken; answers how many rows were written. */
  @Modifying
  @Query(value = "INSERT INTO wk_links (code, name, mode, note) VALUES (:code, :name, :mode, :note) ON CONFLICT (code) DO NOTHING", nativeQuery = true)
  int insertIfFree(@Param("code") String code, @Param("name") String name, @Param("mode") String mode, @Param("note") String note);

  @Modifying
  @Query("UPDATE Link l SET l.name = :name, l.note = :note WHERE l.id = :id")
  int rename(@Param("id") Integer id, @Param("name") String name, @Param("note") String note);

  @Modifying
  @Query("DELETE FROM Link l WHERE l.id = :id")
  int remove(@Param("id") Integer id);
}
