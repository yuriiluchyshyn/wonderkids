package com.pulsarkids.api.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

/** A phrase already spoken by the cloud voice: each one is paid for once. */
@Getter
@Setter
@Entity
@Table(name = "wk_tts_cache")
public class TtsCache {
  @Id
  private String hash;

  private String voice;
  private String audio;

  @Column(insertable = false, updatable = false)
  private Instant createdAt;
}
