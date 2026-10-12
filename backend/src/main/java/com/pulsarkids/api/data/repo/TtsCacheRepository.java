package com.pulsarkids.api.data.repo;

import com.pulsarkids.api.data.entity.TtsCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TtsCacheRepository extends JpaRepository<TtsCache, String> {
  /** Two requests may speak the same new phrase at once: the second one changes nothing. */
  @Modifying
  @Query(value = "INSERT INTO wk_tts_cache (hash, voice, audio) VALUES (:hash, :voice, :audio) ON CONFLICT (hash) DO NOTHING", nativeQuery = true)
  int insertIfAbsent(@Param("hash") String hash, @Param("voice") String voice, @Param("audio") String audio);
}
