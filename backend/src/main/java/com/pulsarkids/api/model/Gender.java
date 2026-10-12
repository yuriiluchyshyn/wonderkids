package com.pulsarkids.api.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

/** A child's gender, for the words that depend on it. */
@Getter
@Accessors(fluent = true)
@RequiredArgsConstructor
public enum Gender implements Wire {
  GIRL("girl"),
  BOY("boy");

  private final String wire;
}
