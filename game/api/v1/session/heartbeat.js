import { handleSession } from '../../_lib/session.js';
import { heartbeat } from '../../_lib/screenTime.js';

/**
 * Still playing → PUT /api/v1/session/heartbeat   (every 30 s)
 * Body: { tz_offset_min, child_profile_id?, end? } where `end` is 'pause' when
 * the child leaves the game or 'depleted' once the bedtime hand-off is done.
 * The server banks the elapsed time and returns what is left.
 */
export default function handler(req, res) {
  return handleSession(req, res, {
    method: 'PUT',
    transition: (state, limits, now, tz, body) =>
      heartbeat(state, limits, now, tz, body.end === 'pause' || body.end === 'depleted' ? body.end : undefined),
  });
}
