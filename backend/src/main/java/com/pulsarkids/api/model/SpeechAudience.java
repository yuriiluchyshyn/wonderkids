package com.pulsarkids.api.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

/** Who hears the voice the owner chose for a language: every account, or whoever plays the trial game. */
@Getter
@Accessors(fluent = true)
@RequiredArgsConstructor
public enum SpeechAudience implements Wire {
  ACCOUNTS("accounts"),
  TRIAL("trial");

  private final String wire;
}
