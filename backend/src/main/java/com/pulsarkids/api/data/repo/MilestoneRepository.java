package com.pulsarkids.api.data.repo;

import com.pulsarkids.api.data.entity.Milestone;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MilestoneRepository extends JpaRepository<Milestone, Milestone.Key> {
  @Query("SELECT m FROM Milestone m WHERE m.id.childId IN :childIds ORDER BY m.sortIndex")
  List<Milestone> findOf(@Param("childIds") Collection<String> childIds);

  @Modifying
  @Query("DELETE FROM Milestone m WHERE m.id.childId = :childId")
  int deleteOf(@Param("childId") String childId);
}
