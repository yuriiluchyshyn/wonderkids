import { deleteParent, ensureSchema, listAccounts, setSpeechOff } from '../_lib/db.js';
import { requireAdmin } from '../_lib/admin.js';
import { marketingAdmin } from '../_lib/marketingAdmin.js';

/**
 * Admin: accounts →  GET /api/admin/users
 *                    PUT /api/admin/users  { parentId, speechEnabled }
 *                    DELETE /api/admin/users?id=…   (with all children and their data)
 * The PUT switches Google Speech on/off for one account. Keys themselves are
 * managed in /api/admin/speech. Requires `x-admin-key`.
 *
 * With `?part=settings` or `?part=links` the same address serves the product's
 * settings and the owner's links with their visits (`_lib/marketingAdmin.js`).
 */
export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return undefined;

  try {
    await ensureSchema();

    if (req.query?.part) return await marketingAdmin(req, res);

    if (req.method === 'GET') {
      return res.status(200).json({ accounts: await listAccounts() });
    }

    if (req.method === 'PUT') {
      const { parentId, speechEnabled } = req.body ?? {};
      if (!Number.isInteger(parentId)) return res.status(400).json({ error: 'invalid_parent_id' });
      if (typeof speechEnabled !== 'boolean') return res.status(400).json({ error: 'invalid_speech_enabled' });
      if (!(await setSpeechOff(parentId, !speechEnabled))) return res.status(404).json({ error: 'parent_not_found' });
      return res.status(200).json({ ok: true, parentId, speechOff: !speechEnabled });
    }

    if (req.method === 'DELETE') {
      const id = Number(req.query?.id);
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid_parent_id' });
      if (!(await deleteParent(id))) return res.status(404).json({ error: 'parent_not_found' });
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('[admin/users] failed:', err);
    return res.status(500).json({ error: 'server_error' });
  }
}
