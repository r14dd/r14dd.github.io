// Static per-language profile payloads. Whichever locale a page was
// prerendered in ships inline in that document; the other two are fetched on
// demand by applyLanguage, keeping ~30KB of unused translation off the mobile
// critical path.
//
// All three are emitted, English included. Since /ru/ and /az/ became real
// prerendered routes, English is the *other* locale for anyone standing on one
// of them — omitting it meant switching back from /ru/ 404'd and silently fell
// back to Russian.
import type { APIRoute } from 'astro';
import { profiles } from '../../data/profile-i18n';

export function getStaticPaths() {
  return Object.keys(profiles).map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params }) => {
  return Response.json(profiles[params.lang!]);
};
