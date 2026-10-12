package com.pulsarkids.api.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

/** A Google Cloud API key for the natural voice, encrypted (see `Secrets`), with the voice it reads in. */
@Getter
@Setter
@Entity
@Table(name = "wk_tts_keys")
public class TtsKey {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  private String label = "";
  private String encryptedKey;
  private String voice;

  /** Serves every account that has no key of its own; one key at a time. */
  @Column(name = "is_global")
  private boolean global;

  @Column(updatable = false)
  private Instant createdAt = Instant.now();
}
