package com.pulsarkids.api.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

/** Where a letter stands with the owner. */
@Getter
@Accessors(fluent = true)
@RequiredArgsConstructor
public enum FeedbackStatus implements Wire {
  NEW("new"),
  ANSWERED("answered"),
  DONE("done");

  private final String wire;
}
