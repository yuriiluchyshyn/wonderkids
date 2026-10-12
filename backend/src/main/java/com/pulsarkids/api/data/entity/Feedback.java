package com.pulsarkids.api.data.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.model.FeedbackStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** A letter from the public site. Its text stays here; its files only wait in `FeedbackPart` until it is mailed. */
@Getter
@Setter
@Entity
@Table(name = "wk_feedback")
public class Feedback {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  private String kind;
  private String message;
  private String email = "";

  /** What was attached: [{ name, type, size }]. */
  @JdbcTypeCode(SqlTypes.JSON)
  private JsonNode files;

  private String status = FeedbackStatus.NEW.wire();
  /** No more files will come. */
  private boolean closed;
  private Instant mailedAt;
  private String mailError;
  /** The language the sender wrote in — the one an answer is written in. NULL — a letter from before this was kept. */
  private String lang;

  private String ipHash = "";
  private String userAgent = "";

  @Column(updatable = false)
  private Instant createdAt = Instant.now();
}
