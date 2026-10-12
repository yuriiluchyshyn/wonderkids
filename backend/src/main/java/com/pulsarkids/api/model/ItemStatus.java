package com.pulsarkids.api.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

/** What a game or a galaxy is somewhere: there, promised, or put away. */
@Getter
@Accessors(fluent = true)
@RequiredArgsConstructor
public enum ItemStatus implements Wire {
  ON("on"),
  SOON("soon"),
  HIDDEN("hidden");

  private final String wire;
}
