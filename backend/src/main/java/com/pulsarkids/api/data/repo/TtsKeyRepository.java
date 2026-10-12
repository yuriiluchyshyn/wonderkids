package com.pulsarkids.api.data.repo;

import com.pulsarkids.api.data.entity.TtsKey;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TtsKeyRepository extends JpaRepository<TtsKey, Integer> {
  List<TtsKey> findAllByOrderByIdAsc();

  /** THE global key (the oldest, should there ever be two). */
  Optional<TtsKey> findFirstByGlobalTrueOrderByIdAsc();

  @Modifying
  @Query("UPDATE TtsKey k SET k.global = false WHERE k.id <> :keyId")
  int clearGlobalExcept(@Param("keyId") Integer keyId);
}
