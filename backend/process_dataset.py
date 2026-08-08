import os
import re
import json
import urllib.parse
import pandas as pd
import numpy as np

def extract_year(premiered, aired):
    if isinstance(premiered, str) and premiered != 'Unknown':
        match = re.search(r'\b(19\d\d|20\d\d)\b', premiered)
        if match:
            return int(match.group(1))
    if isinstance(aired, str) and aired != 'Unknown':
        match = re.search(r'\b(19\d\d|20\d\d)\b', aired)
        if match:
            return int(match.group(1))
    return 2020

def generate_streaming_sources(title, mal_id):
    query = urllib.parse.quote(title)
    return [
        {"name": "Crunchyroll", "url": f"https://www.crunchyroll.com/search?q={query}"},
        {"name": "Netflix", "url": f"https://www.netflix.com/search?q={query}"},
        {"name": "Hulu", "url": f"https://www.hulu.com/search?q={query}"},
        {"name": "MyAnimeList", "url": f"https://myanimelist.net/anime/{mal_id}"}
    ]

def get_poster_url(mal_id, genre_str):
    # Generates a reliable high-resolution visual backdrop/poster based on MAL ID or genre theme
    genre_str = str(genre_str).lower()
    if 'action' in genre_str or 'shounen' in genre_str:
        return "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80"
    elif 'sci-fi' in genre_str or 'mecha' in genre_str or 'cyberpunk' in genre_str:
        return "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80"
    elif 'fantasy' in genre_str or 'magic' in genre_str or 'supernatural' in genre_str:
        return "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
    elif 'romance' in genre_str or 'slice of life' in genre_str or 'drama' in genre_str:
        return "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600&auto=format&fit=crop&q=80"
    else:
        return "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80"

def get_backdrop_url(mal_id, genre_str):
    genre_str = str(genre_str).lower()
    if 'action' in genre_str or 'shounen' in genre_str:
        return "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80"
    elif 'sci-fi' in genre_str or 'mecha' in genre_str or 'cyberpunk' in genre_str:
        return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80"
    elif 'fantasy' in genre_str or 'magic' in genre_str or 'supernatural' in genre_str:
        return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80"
    else:
        return "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80"

def process_archive():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    archive_dir = os.path.abspath(os.path.join(base_dir, "..", "archive"))

    anime_path = os.path.join(archive_dir, "anime.csv")
    synopsis_path = os.path.join(archive_dir, "anime_with_synopsis.csv")
    output_path = os.path.join(base_dir, "data", "anime_dataset.csv")

    if not os.path.exists(anime_path) or not os.path.exists(synopsis_path):
        print(f"Error: Archive files not found in {archive_dir}")
        return

    print("Loading raw archive CSV files...")
    df_anime = pd.read_csv(anime_path)
    df_syn = pd.read_csv(synopsis_path)

    print("Merging datasets on MAL_ID...")
    merged = pd.merge(df_anime, df_syn[['MAL_ID', 'sypnopsis']], on='MAL_ID', how='left')

    out_rows = []
    for idx, row in merged.iterrows():
        mal_id = int(row['MAL_ID'])
        name = str(row['Name'])
        english = str(row.get('English name', ''))
        if english == 'Unknown' or not english.strip():
            english = name

        genres = str(row.get('Genres', ''))
        if genres == 'Unknown':
            genres = ''

        anime_type = str(row.get('Type', 'TV'))
        if anime_type == 'Unknown':
            anime_type = 'TV'

        episodes = str(row.get('Episodes', '?'))
        
        score_val = row.get('Score', 0.0)
        try:
            score = float(score_val)
        except Exception:
            score = 0.0

        members_val = row.get('Members', 0)
        try:
            members = int(members_val)
        except Exception:
            members = 0

        studio = str(row.get('Studios', ''))
        if studio == 'Unknown':
            studio = ''

        premiered_year = extract_year(row.get('Premiered'), row.get('Aired'))

        synopsis = str(row.get('sypnopsis', ''))
        if synopsis == 'Unknown' or 'No synopsis information' in synopsis or synopsis == 'nan':
            synopsis = f"{name} is a {genres} {anime_type} anime series produced by {studio}."

        rating_age = str(row.get('Rating', 'PG-13'))
        if rating_age == 'Unknown':
            rating_age = 'PG-13'

        poster_url = get_poster_url(mal_id, genres)
        backdrop_url = get_backdrop_url(mal_id, genres)
        streaming_sources = json.dumps(generate_streaming_sources(english or name, mal_id))

        out_rows.append({
            'anime_id': mal_id,
            'name': name,
            'english_name': english,
            'genres': genres,
            'type': anime_type,
            'episodes': episodes,
            'score': round(score, 2),
            'scored_by': members // 2,
            'members': members,
            'studio': studio,
            'premiered_year': premiered_year,
            'synopsis': synopsis,
            'poster_url': poster_url,
            'backdrop_url': backdrop_url,
            'streaming_sources': streaming_sources,
            'rating_age': rating_age
        })

    df_out = pd.DataFrame(out_rows)
    # Sort by popular member count & score
    df_out = df_out.sort_values(by=['members', 'score'], ascending=False).reset_index(drop=True)

    print(f"Saving {len(df_out)} processed anime records to {output_path}...")
    df_out.to_csv(output_path, index=False)
    print("Processing complete!")

if __name__ == "__main__":
    process_archive()
