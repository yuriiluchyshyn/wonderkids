package com.pulsarkids.api.service;

import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.data.entity.Parent;
import com.pulsarkids.api.data.entity.TtsCache;
import com.pulsarkids.api.data.entity.TtsKey;
import com.pulsarkids.api.data.repo.ParentRepository;
import com.pulsarkids.api.data.repo.TtsCacheRepository;
import com.pulsarkids.api.data.repo.TtsKeyRepository;
import com.pulsarkids.api.model.Fields;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Cloud voice (Google TTS): the stored keys, who each one serves, and the
 * phrases already spoken.
 *
 * Which key an account gets is decided in one place, `configOf`: the key
 * assigned to the account wins; otherwise the single GLOBAL key applies; and
 * `Parent.ttsOff` switches the account off regardless.
 */
@Service
@RequiredArgsConstructor
public class SpeechService {
  private final ParentRepository parents;
  private final TtsKeyRepository keys;
  private final TtsCacheRepository cache;

  /** The cloud voice an account actually gets. The key is still encrypted here. */
  public record Config(boolean enabled, String encryptedKey, String voice) {}

  @Transactional(readOnly = true)
  public Config configOf(int userId) {
    Parent parent = parents.findById(userId).orElse(null);
    if (parent == null) return new Config(false, null, null);
    TtsKey key = parent.getTtsKeyId() != null ? keys.findById(parent.getTtsKeyId()).orElse(null) : keys.findFirstByGlobalTrueOrderByIdAsc().orElse(null);
    String secret = key == null ? null : key.getEncryptedKey();
    return new Config(!parent.isTtsOff() && secret != null && !secret.isEmpty(), secret, key == null ? null : key.getVoice());
  }

  /** One stored key by id (encrypted), for the admin's "test" button; null when there is none. */
  @Transactional(readOnly = true)
  public TtsKey key(int keyId) {
    return keys.findById(keyId).orElse(null);
  }

  @Transactional(readOnly = true)
  public String cachedSpeech(String hash) {
    return cache.findById(hash).map((row) -> row.getAudio()).orElse(null);
  }

  @Transactional
  public void cacheSpeech(String hash, String voice, String audio) {
    cache.insertIfAbsent(hash, voice, audio);
  }

  /** Every stored key (encrypted) with the accounts it is assigned to. */
  @Transactional(readOnly = true)
  public List<Map<String, Object>> listKeys() {
    List<Parent> assigned = parents.findByTtsKeyIdIsNotNull();
    List<Map<String, Object>> out = new ArrayList<>();
    for (TtsKey k : keys.findAllByOrderByIdAsc()) {
      out.add(Json.map(
          Fields.ID, k.getId(),
          Fields.LABEL, k.getLabel(),
          Fields.ENCRYPTED_KEY, k.getEncryptedKey(),
          Fields.VOICE, k.getVoice() == null ? "" : k.getVoice(),
          Fields.IS_GLOBAL, k.isGlobal(),
          Fields.CREATED_AT, Json.iso(k.getCreatedAt()),
          Fields.ACCOUNT_IDS, assigned.stream().filter((p) -> k.getId().equals(p.getTtsKeyId())).map((p) -> p.getId()).toList()));
    }
    return out;
  }

  /**
   * Create (`id` null) or update a key and set who it serves, atomically.
   *   - `isGlobal: true`  → it becomes THE global key (any other loses the flag)
   *     and is detached from individual accounts.
   *   - `isGlobal: false` → it serves exactly `accountIds`; an account can hold
   *     one key, so assigning it here takes it away from whatever it had.
   * `encryptedKey` null keeps the stored secret. Returns the key id, or null
   * when `id` does not exist.
   */
  @Transactional
  public Integer saveKey(Integer id, String label, String encryptedKey, String voice, boolean isGlobal, Collection<Integer> accountIds) {
    TtsKey key;
    if (id == null) {
      key = new TtsKey();
    } else {
      key = keys.findById(id).orElse(null);
      if (key == null) return null;
    }
    key.setLabel(label);
    key.setVoice(voice);
    if (encryptedKey != null) key.setEncryptedKey(encryptedKey);
    key.setGlobal(isGlobal);
    Integer keyId = keys.saveAndFlush(key).getId();

    if (isGlobal) keys.clearGlobalExcept(keyId);

    Collection<Integer> ids = isGlobal ? List.of() : accountIds;
    if (ids.isEmpty()) {
      parents.unassignKey(keyId);
    } else {
      parents.unassignKeyExcept(keyId, ids);
      parents.assignKey(keyId, ids);
    }
    return keyId;
  }

  /** Remove a key; accounts that used it fall back to the global one. False for an unknown key. */
  @Transactional
  public boolean deleteKey(int keyId) {
    if (!keys.existsById(keyId)) return false;
    // wk_parents.tts_key_id is set to NULL by the table itself (ON DELETE SET NULL).
    keys.deleteById(keyId);
    return true;
  }
}
