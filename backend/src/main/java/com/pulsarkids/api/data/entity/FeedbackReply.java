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

/** The owner's answer to a letter. */
@Getter
@Setter
@Entity
@Table(name = "wk_feedback_replies")
public class FeedbackReply {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  private Integer feedbackId;
  private String body;
  private boolean mailed;

  @Column(updatable = false)
  private Instant createdAt = Instant.now();
}
