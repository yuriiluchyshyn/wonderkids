package com.pulsarkids.api.data.repo;

import com.pulsarkids.api.data.entity.ChildProgress;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChildProgressRepository extends JpaRepository<ChildProgress, ChildProgress.Key> {
  @Query("SELECT p FROM ChildProgress p WHERE p.id.childId IN :childIds")
  List<ChildProgress> findOf(@Param("childIds") Collection<String> childIds);

  @Modifying
  @Query("DELETE FROM ChildProgress p WHERE p.id.childId = :childId")
  int deleteOf(@Param("childId") String childId);
}
