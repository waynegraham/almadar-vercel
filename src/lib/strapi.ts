const STRAPI_URL = process.env.STRAPI_API_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

async function fetchFromStrapi(endpoint: string, options: RequestInit = {}, requireAuth = false) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  // Only inject the token if draft authorization is explicitly required
  if (requireAuth && STRAPI_TOKEN) {
    headers.set("Authorization", `Bearer ${STRAPI_TOKEN}`);
  }

  const res = await fetch(`${STRAPI_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "No body text");
    console.error(`[Strapi Error API Response]: Status ${res.status} - ${errorText}`);
    throw new Error(`Strapi fetch failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch all works for the public index grid.
 * NO TOKEN REQUIRED because permissions are set to Public.
 */
export async function getAllWorks() {
  const query = new URLSearchParams({
    "fields[0]": "iabCode",
    "fields[1]": "titleEn",
    "fields[2]": "titleAr",
    "fields[3]": "displayTitle",
    "status": "published",
  });

  // requireAuth is false
  const json = await fetchFromStrapi(`/api/works?${query.toString()}`, {
    next: { revalidate: 3600 },
  }, false);

  return json?.data || [];
}

export function buildWorkByIabCodeQuery(iabCode: string, isDraft: boolean) {
  const query = new URLSearchParams();

  query.append("filters[iabCode][$eq]", iabCode);
  query.append("status", isDraft ? "draft" : "published");

  // Deep-populate only the scalar fields needed from relations inside agentCredits.
  query.append("populate[agentCredits][populate][agent][fields][0]", "nameEn");
  query.append("populate[agentCredits][populate][agent][fields][1]", "nameAr");
  query.append("populate[agentCredits][populate][agent][fields][2]", "slug");
  query.append("populate[agentCredits][populate][agent_role][fields][0]", "labelEn");
  query.append("populate[agentCredits][populate][agent_role][fields][1]", "labelAr");

  return query;
}

/**
 * Fetch a single work by iabCode.
 * REQUIREDAUTH IS TRUE IF IT'S A DRAFT to bypass public role restrictions.
 */
export async function getWorkByIabCode(iabCode: string, isDraft: boolean) {
  const query = buildWorkByIabCodeQuery(iabCode, isDraft);

  const json = await fetchFromStrapi(`/api/works?${query.toString()}`, {
    cache: isDraft ? "no-store" : "force-cache",
    next: isDraft ? undefined : { revalidate: 3600 },
  }, isDraft);

  return json?.data?.[0] || null;
}
