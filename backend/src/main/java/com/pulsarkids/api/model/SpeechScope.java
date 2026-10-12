package com.pulsarkids.api.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

/** Whom a Google Speech key serves: every account, or the accounts listed. */
@Getter
@Accessors(fluent = true)
@RequiredArgsConstructor
public enum SpeechScope implements Wire {
  GLOBAL("global"),
  ACCOUNTS("accounts");

  private final String wire;
}
