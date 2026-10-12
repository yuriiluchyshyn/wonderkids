package com.pulsarkids.api.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

/** One base64 piece of a file attached to a letter, on its way to the mailbox. */
@Getter
@Setter
@Entity
@Table(name = "wk_feedback_parts")
public class FeedbackPart {
  @Embeddable
  public record Key(Integer feedbackId, int fileNo, int partNo) {}

  @EmbeddedId
  private Key id;

  private String data;

  @Column(insertable = false, updatable = false)
  private Instant createdAt;
}
