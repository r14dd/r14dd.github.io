// Static per-language profile payloads. English ships inline in the homepage
// document; RU/AZ are fetched on demand by applyLanguage — keeping ~30KB of
// unused locale JSON off the mobile critical path.
import type { APIRoute } from "astro";
import { profiles } from "../../data/profile-i18n";

export function getStaticPaths() {
  return Object.keys(profiles)
    .filter((lang) => lang !== "en")
    .map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params }) => {
  return Response.json(profiles[params.lang!]);
};
