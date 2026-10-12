package com.pulsarkids.api.data.repo;

import com.pulsarkids.api.data.entity.ChildTreasure;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChildTreasureRepository extends JpaRepository<ChildTreasure, ChildTreasure.Key> {
  @Query("SELECT t FROM ChildTreasure t WHERE t.id.childId IN :childIds")
  List<ChildTreasure> findOf(@Param("childIds") Collection<String> childIds);

  @Modifying
  @Query("DELETE FROM ChildTreasure t WHERE t.id.childId = :childId")
  int deleteOf(@Param("childId") String childId);
}
