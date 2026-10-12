package com.pulsarkids.api.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

/** How a heartbeat says play has stopped: the child left the game, or the tank ran dry and the hand-off is done. */
@Getter
@Accessors(fluent = true)
@RequiredArgsConstructor
public enum SessionEnd implements Wire {
  PAUSE("pause"),
  DEPLETED("depleted");

  private final String wire;
}
