import { handleSession } from '../../_lib/session.js';
import { resetSession } from '../../_lib/screenTime.js';

/**
 * Parent top-up → POST /api/v1/session/reset
 * Body: { child_profile_id, tz_offset_min }. Refills the tank and clears the
 * cooldown. Parent sessions only — a child token is rejected.
 */
export default function handler(req, res) {
  return handleSession(req, res, {
    method: 'POST',
    parentOnly: true,
    transition: (_state, _limits, now, tz) => resetSession(now, tz),
  });
}
