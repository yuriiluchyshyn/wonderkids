package com.pulsarkids.api.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

/** How a visitor got into the trial game: by a link, or by the button on our own site. */
@Getter
@Accessors(fluent = true)
@RequiredArgsConstructor
public enum VisitVia implements Wire {
  LINK("link"),
  SITE("site");

  private final String wire;
}
