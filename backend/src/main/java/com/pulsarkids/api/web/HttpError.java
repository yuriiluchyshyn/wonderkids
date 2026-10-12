package com.pulsarkids.api.web;

import com.pulsarkids.api.model.ApiError;
import java.util.Map;
import lombok.Getter;

/** A refusal a controller gives by throwing: `{ error, message, …details }` with the refusal's status. */
@Getter
public final class HttpError extends RuntimeException {
  private final ApiError error;
  private final Map<String, Object> details;

  public HttpError(ApiError error) {
    this(error, Map.of());
  }

  public HttpError(ApiError error, Map<String, Object> details) {
    super(error.getCode(), null, false, false);
    this.error = error;
    this.details = details;
  }
}
