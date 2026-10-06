import { handleSession } from '../../_lib/session.js';
import { startSession } from '../../_lib/screenTime.js';

/**
 * A play segment begins → POST /api/v1/session/start
 * Body: { tz_offset_min, child_profile_id? }. Returns `remaining_time_seconds`
 * for that child profile — the server, not the browser, owns the play-time
 * budget (PRD v4.0 §2.2).
 */
export default function handler(req, res) {
  return handleSession(req, res, {
    method: 'POST',
    transition: (state, limits, now, tz) => startSession(state, limits, now, tz),
  });
}
