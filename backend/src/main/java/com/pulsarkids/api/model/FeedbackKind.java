package com.pulsarkids.api.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

/** What a letter from the site is about. */
@Getter
@Accessors(fluent = true)
@RequiredArgsConstructor
public enum FeedbackKind implements Wire {
  BUG("bug"),
  IDEA("idea"),
  GAME("game"),
  OTHER("other");

  private final String wire;
}
