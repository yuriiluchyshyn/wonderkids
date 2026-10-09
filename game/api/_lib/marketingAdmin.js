// The owner's side of the links, the visits and the product's settings.
// Served by /api/admin/users?part=… — the deployment has no function to spare.
import { createLink, deleteLink, listLinks, listVisits, renameLink, setSetting } from './db.js';
import { DEMO_MINUTES_DEFAULT, DEMO_MINUTES_MAX, DEMO_MINUTES_MIN, cleanDemoMinutes, cleanLink } from './marketing.js';
import { DEMO_MINUTES_KEY, demoMinutes } from './visits.js';

const settings = async () => ({
  demoMinutes: await demoMinutes(),
  demoMinutesDefault: DEMO_MINUTES_DEFAULT,
  demoMinutesMin: DEMO_MINUTES_MIN,
  demoMinutesMax: DEMO_MINUTES_MAX,
});

/**
 *   GET    ?part=settings                        → { settings }
 *   PUT    ?part=settings  { demoMinutes }       → { settings }
 *   GET    ?part=links[&days=30]                 → { links, visits }   (days=0 — all time)
 *   POST   ?part=links     { name, mode, code?, note? }   a new link
 *   PUT    ?part=links     { id, name, note? }             rename one
 *   DELETE ?part=links&id=…                                its visits stay
 */
export async function marketingAdmin(req, res) {
  const part = req.query?.part;

  if (part === 'settings') {
    if (req.method === 'GET') return res.status(200).json({ settings: await settings() });
    if (req.method === 'PUT') {
      const minutes = cleanDemoMinutes(req.body?.demoMinutes);
      if (minutes === null) return res.status(400).json({ error: 'invalid_demo_minutes' });
      await setSetting(DEMO_MINUTES_KEY, minutes);
      return res.status(200).json({ settings: await settings() });
    }
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (part === 'links') {
    const days = Number(req.query?.days ?? 30);
    const page = async () => ({ links: await listLinks(), visits: await listVisits(Number.isInteger(days) && days >= 0 ? days : 30) });

    if (req.method === 'GET') return res.status(200).json(await page());
    if (req.method === 'POST') {
      const { link, error } = cleanLink(req.body);
      if (error) return res.status(400).json({ error });
      if (!(await createLink(link))) return res.status(409).json({ error: 'code_taken' });
      return res.status(200).json(await page());
    }
    if (req.method === 'PUT') {
      const { id, name, note } = req.body ?? {};
      const text = typeof name === 'string' ? name.trim().slice(0, 80) : '';
      if (!Number.isInteger(id) || !text) return res.status(400).json({ error: 'invalid_name' });
      if (!(await renameLink(id, text, typeof note === 'string' ? note.trim().slice(0, 300) : ''))) return res.status(404).json({ error: 'link_not_found' });
      return res.status(200).json(await page());
    }
    if (req.method === 'DELETE') {
      const id = Number(req.query?.id);
      if (!Number.isInteger(id) || !(await deleteLink(id))) return res.status(404).json({ error: 'link_not_found' });
      return res.status(200).json(await page());
    }
    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  return res.status(400).json({ error: 'unknown_part' });
}
