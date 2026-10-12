package com.pulsarkids.api.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

/** How a visitor got into the trial game: by a link, by the button on our own site, or by the button on a game's own page there. */
@Getter
@Accessors(fluent = true)
@RequiredArgsConstructor
public enum VisitVia implements Wire {
  LINK("link"),
  SITE("site"),
  PAGE("page");

  private final String wire;
}
