package com.pulsarkids.api.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

/** Where a rule about a game or a galaxy holds: everywhere, only in the places listed, or everywhere except them. */
@Getter
@Accessors(fluent = true)
@RequiredArgsConstructor
public enum ItemScope implements Wire {
  ALL("all"),
  ONLY("only"),
  EXCEPT("except");

  private final String wire;
}
