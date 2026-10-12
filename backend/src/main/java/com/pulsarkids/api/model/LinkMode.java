package com.pulsarkids.api.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

/** Where one of the owner's links leads, and so what a visit was a visit to: the public site, or straight into the trial game. */
@Getter
@Accessors(fluent = true)
@RequiredArgsConstructor
public enum LinkMode implements Wire {
  SITE("site"),
  DEMO("demo");

  private final String wire;
}
