package com.pulsarkids.api.data.repo;

import com.pulsarkids.api.data.entity.Child;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChildRepository extends JpaRepository<Child, String> {
  List<Child> findByParentIdOrderBySortIndexAscCreatedAtAsc(Integer parentId);

  List<Child> findAllByOrderByParentIdAscSortIndexAscCreatedAtAsc();

  boolean existsByIdAndParentId(String id, Integer parentId);

  /** Does any of these ids name a child of ANOTHER account? */
  boolean existsByIdInAndParentIdNot(Collection<String> ids, Integer parentId);

  /** A child is found by its nickname or its email, in any case. */
  @Query("SELECT c FROM Child c WHERE LOWER(c.nickname) = :identifier OR LOWER(c.email) = :identifier")
  List<Child> findByLogin(@Param("identifier") String identifier);

  /** Is the nickname taken by any child? */
  @Query("SELECT COUNT(c) > 0 FROM Child c WHERE LOWER(c.nickname) = :nickname")
  boolean nicknameTaken(@Param("nickname") String nickname);

  /** Is the nickname taken by a child of ANOTHER account? */
  @Query("SELECT COUNT(c) > 0 FROM Child c WHERE LOWER(c.nickname) = :nickname AND c.parentId <> :exceptParentId")
  boolean nicknameTakenByOther(@Param("nickname") String nickname, @Param("exceptParentId") Integer exceptParentId);

  /** The children a save no longer lists are gone, with everything of theirs (the tables cascade). */
  @Modifying
  @Query("DELETE FROM Child c WHERE c.parentId = :parentId AND c.id NOT IN :keep")
  int deleteOthers(@Param("parentId") Integer parentId, @Param("keep") Collection<String> keep);

  @Modifying
  @Query("DELETE FROM Child c WHERE c.parentId = :parentId")
  int deleteAllOf(@Param("parentId") Integer parentId);
}
