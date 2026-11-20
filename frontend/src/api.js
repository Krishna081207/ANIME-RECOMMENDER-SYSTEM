const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

export function animeCatalogPath({ search = "", genres = [], minScore = 0, page = 1, limit = 24 } = {}) {
  const params = new URLSearchParams({ page, limit, min_score: minScore });
  if (search.trim()) params.set("search", search.trim());
  for (const genre of genres) params.append("genre", genre);
  return `/api/anime?${params}`;
}

export async function requestApi(path, { signal, body } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      signal,
      ...(body === undefined ? {} : {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      })
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("Could not reach the anime API.");
  }

  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(
      typeof problem?.detail === "string" ? problem.detail : `The anime API returned HTTP ${response.status}.`
    );
  }

  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error("The anime API returned an unexpected response. Check the API URL.");
  }

  return response.json();
}
