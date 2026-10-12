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

/** One of the owner's own links, handed out to tell visits apart (see `Marketing`). */
@Getter
@Setter
@Entity
@Table(name = "wk_links")
public class Link {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  private String code;
  private String name;
  private String mode;
  private String note = "";

  @Column(updatable = false)
  private Instant createdAt = Instant.now();
}
