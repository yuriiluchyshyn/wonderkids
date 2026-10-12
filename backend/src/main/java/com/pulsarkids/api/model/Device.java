package com.pulsarkids.api.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

/** What a visitor came with — as far as the browser's name tells. */
@Getter
@Accessors(fluent = true)
@RequiredArgsConstructor
public enum Device implements Wire {
  TABLET("tablet"),
  MOBILE("mobile"),
  DESKTOP("desktop");

  private final String wire;
}
