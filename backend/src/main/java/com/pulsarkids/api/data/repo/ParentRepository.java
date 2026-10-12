package com.pulsarkids.api.data.repo;

import com.pulsarkids.api.data.entity.Parent;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ParentRepository extends JpaRepository<Parent, Integer> {
  /** The account that owns this mailbox, however the address was typed: by its key first, by the address as stored otherwise. */
  @Query(
      value = "SELECT * FROM wk_parents WHERE email_key = :key OR email = :email ORDER BY (email_key = :key) DESC, id LIMIT 1",
      nativeQuery = true)
  Optional<Parent> findByMailbox(@Param("key") String key, @Param("email") String email);

  /** Create the account of a mailbox unless one exists already (a double submit); answers how many rows were written. */
  @Modifying
  @Query(
      value = "INSERT INTO wk_parents (email, email_key, signup_source, signup_medium, signup_campaign, signup_link) "
          + "VALUES (:email, :key, :source, :medium, :campaign, :link) ON CONFLICT DO NOTHING",
      nativeQuery = true)
  int insertIfAbsent(
      @Param("email") String email,
      @Param("key") String key,
      @Param("source") String source,
      @Param("medium") String medium,
      @Param("campaign") String campaign,
      @Param("link") String link);

  List<Parent> findAllByOrderByCreatedAtDesc();

  List<Parent> findByTtsKeyIdIsNotNull();

  /** Take a key away from every account but these. */
  @Modifying
  @Query("UPDATE Parent p SET p.ttsKeyId = NULL WHERE p.ttsKeyId = :keyId AND p.id NOT IN :keep")
  int unassignKeyExcept(@Param("keyId") Integer keyId, @Param("keep") Collection<Integer> keep);

  @Modifying
  @Query("UPDATE Parent p SET p.ttsKeyId = NULL WHERE p.ttsKeyId = :keyId")
  int unassignKey(@Param("keyId") Integer keyId);

  @Modifying
  @Query("UPDATE Parent p SET p.ttsKeyId = :keyId WHERE p.id IN :ids")
  int assignKey(@Param("keyId") Integer keyId, @Param("ids") Collection<Integer> ids);

  /** Accounts each link has brought: [signup_link, count]. */
  @Query("SELECT p.signupLink, COUNT(p) FROM Parent p WHERE p.signupLink IS NOT NULL GROUP BY p.signupLink")
  List<Object[]> countBySignupLink();
}
