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

/** A parent account. The mailbox is its identity: `emailKey` is unique (see `Emails.key`). */
@Getter
@Setter
@Entity
@Table(name = "wk_parents")
public class Parent {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  private String email;
  /** NULL — an older row that shares its mailbox with another account. */
  private String emailKey;
  private String activeChildId;

  @Column(insertable = false, updatable = false)
  private Instant createdAt;

  /** The Google Speech key assigned to this account; NULL — the global one applies. */
  private Integer ttsKeyId;
  private boolean ttsOff;
  /** Switched off by the owner: no sign-in, no save — until switched on again. */
  private boolean disabled;
  /** The cabinet's language; NULL — not chosen. */
  private String lang;

  /** Where the account came from (see `Source`); NULL — registered without a label. */
  private String signupSource;
  private String signupMedium;
  private String signupCampaign;
  private String signupLink;

  /** When the account's game or cabinet last loaded or saved its state (`AccountService.markSeen`). */
  private Instant lastSeenAt;
}
