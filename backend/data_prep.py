import os
import pandas as pd
import numpy as np

base_dir = os.path.dirname(os.path.abspath(__file__))
archive_dir = os.path.abspath(os.path.join(base_dir, "..", "archive"))

anime_csv_path = os.path.join(archive_dir, "anime.csv")
synopsis_csv_path = os.path.join(archive_dir, "anime_with_synopsis.csv")

print(f"Loading {anime_csv_path}...")
df_anime = pd.read_csv(anime_csv_path)
print(f"Loaded anime.csv: {df_anime.shape}")

print(f"Loading {synopsis_csv_path}...")
df_synopsis = pd.read_csv(synopsis_csv_path)
print(f"Loaded anime_with_synopsis.csv: {df_synopsis.shape}")

# Merge on MAL_ID
merged = pd.merge(df_anime, df_synopsis[['MAL_ID', 'sypnopsis']], on='MAL_ID', how='left')
print(f"Merged shape: {merged.shape}")

print(merged[['MAL_ID', 'Name', 'Score', 'Genres', 'Studios', 'sypnopsis']].head())
