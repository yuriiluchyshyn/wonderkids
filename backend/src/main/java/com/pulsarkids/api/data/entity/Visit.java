package com.pulsarkids.api.data.entity;

import com.pulsarkids.api.model.VisitVia;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

/**
 * One arrival: by a link, or into the trial game. It keeps its link's code, not
 * a reference — deleting a link leaves what it brought in the statistics.
 */
@Getter
@Setter
@Entity
@Table(name = "wk_visits")
public class Visit {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String linkCode;
  private String mode;
  private String via = VisitVia.LINK.wire();
  private String country;
  private String lang;
  private String device;
  private String referrer;
  /** A hash of the visitor's address — enough to count different people. */
  private String visitor = "";
  private Instant expiredAt;
  private Instant ctaAt;

  @Column(updatable = false)
  private Instant createdAt = Instant.now();
}
