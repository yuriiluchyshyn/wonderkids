package com.pulsarkids.api.web;

import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.service.Messages;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 * What every controller of the API shares: its answers are JSON objects; a
 * refusal is `{ error: <code>, message: <text in the client's language> }`
 * (`ApiError`, `Messages`); and whatever goes wrong unexpectedly is logged and
 * answered with the controller's own refusal (`failure()`), never with a
 * stack trace.
 */
public abstract class ApiController {
  protected final Logger log = LoggerFactory.getLogger(getClass());

  @Autowired
  protected Messages messages;

  /** What an unexpected failure is answered with, as this endpoint's clients know it. */
  protected ApiError failure() {
    return ApiError.SERVER_ERROR;
  }

  protected static ResponseEntity<Object> ok(Object... pairs) {
    return ResponseEntity.ok(Json.map(pairs));
  }

  protected static ResponseEntity<Object> ok(Map<String, Object> body) {
    return ResponseEntity.ok(body);
  }

  /** The body of a refusal: its code for the client's logic, its text for the person. */
  protected Map<String, Object> refusal(ApiError error) {
    return Json.map(Fields.ERROR, error.getCode(), Fields.MESSAGE, messages.of(error));
  }

  protected ResponseEntity<Object> refuse(ApiError error) {
    return ResponseEntity.status(error.getStatus()).body(refusal(error));
  }

  @ExceptionHandler(HttpError.class)
  public ResponseEntity<Object> refused(HttpError err) {
    Map<String, Object> body = refusal(err.getError());
    body.putAll(err.getDetails());
    return ResponseEntity.status(err.getError().getStatus()).body(body);
  }

  /** A body that is not JSON. */
  @ExceptionHandler({HttpMessageNotReadableException.class, HttpMediaTypeNotSupportedException.class})
  public ResponseEntity<Object> unreadable(Exception err) {
    return refuse(ApiError.INVALID_JSON);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Object> failed(Exception err) {
    log.error("[{}] failed", getClass().getSimpleName(), err);
    return refuse(failure());
  }
}
