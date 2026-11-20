import json
from functools import lru_cache
from time import monotonic
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen


def get_streaming_sources(anime_id):
    # The time bucket expires cached provider listings within one hour.
    return _fetch_streaming_sources(anime_id, int(monotonic() // 3600))


@lru_cache(maxsize=256)
def _fetch_streaming_sources(anime_id, cache_window):
    request = Request(
        f"https://api.jikan.moe/v4/anime/{anime_id}/streaming",
        headers={"Accept": "application/json", "User-Agent": "CineMatchAnime/1.0"},
    )
    try:
        with urlopen(request, timeout=8) as response:
            payload = json.load(response)
    except HTTPError as error:
        if error.code == 404:
            return []
        raise

    if not isinstance(payload, dict) or not isinstance(payload.get('data'), list):
        raise ValueError("Invalid streaming provider response")

    sources = []
    seen_urls = set()
    for entry in payload['data']:
        if not isinstance(entry, dict):
            continue
        name, url = entry.get('name'), entry.get('url')
        if not isinstance(name, str) or not name.strip() or not isinstance(url, str):
            continue
        try:
            parsed = urlsplit(url)
            if parsed.scheme not in ('http', 'https') or not parsed.hostname or parsed.username or parsed.password:
                continue
        except ValueError:
            continue
        if url not in seen_urls:
            sources.append({'name': name.strip(), 'url': url})
            seen_urls.add(url)
    return sources
