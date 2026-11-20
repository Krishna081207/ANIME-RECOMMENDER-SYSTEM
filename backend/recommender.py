import os
import json
import pickle
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class AnimeRecommender:
    def __init__(self, data_path=None, model_path=None):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_path = data_path or os.path.join(self.base_dir, "data", "anime_dataset.csv")
        self.model_path = model_path or os.path.join(self.base_dir, "models", "recommender_model.pkl")
        
        self.df = None
        self.vectorizer = None
        self.tfidf_matrix = None
        self.id_to_index = {}
        
        self.load_or_train()

    def _prepare_content_features(self, df):
        """Combines genres, synopsis, studio, and type into a unified text feature vector."""
        combined_features = []
        for _, row in df.iterrows():
            genres = str(row.get('genres', '')).replace(',', ' ')
            synopsis = str(row.get('synopsis', ''))
            studio = str(row.get('studio', '')).replace(' ', '')
            anime_type = str(row.get('type', ''))
            
            # Combine fields with genre weight boosting
            content_str = f"{genres} {genres} {genres} {studio} {anime_type} {synopsis}"
            combined_features.append(content_str)
        return combined_features

    def train(self):
        """Trains TF-IDF vectorizer over the full Kaggle dataset."""
        print(f"Loading full Kaggle dataset from: {self.data_path}")
        self.df = pd.read_csv(self.data_path)
        
        # Build anime_id -> dataframe index mapping for O(1) lookup
        self.id_to_index = {row['anime_id']: idx for idx, row in self.df.iterrows()}
        
        # Clean streaming_sources JSON column safely
        def parse_sources(val):
            if isinstance(val, str):
                try:
                    return json.loads(val)
                except Exception:
                    return []
            return val if isinstance(val, list) else []

        self.df['streaming_sources_parsed'] = self.df['streaming_sources'].apply(parse_sources)
        
        features = self._prepare_content_features(self.df)
        
        print("Fitting TF-IDF Vectorizer across 17,000+ anime titles...")
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            sublinear_tf=True,
            max_features=8000
        )
        
        self.tfidf_matrix = self.vectorizer.fit_transform(features)
        
        # Save precomputed model artifacts
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        model_data = {
            'df': self.df,
            'vectorizer': self.vectorizer,
            'tfidf_matrix': self.tfidf_matrix,
            'id_to_index': self.id_to_index
        }
        with open(self.model_path, 'wb') as f:
            pickle.dump(model_data, f)
        print(f"Model saved successfully to {self.model_path}")

    def load_or_train(self):
        """Loads trained model artifacts or triggers fresh training if missing."""
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, 'rb') as f:
                    model_data = pickle.load(f)
                self.df = model_data['df']
                self.vectorizer = model_data['vectorizer']
                self.tfidf_matrix = model_data['tfidf_matrix']
                self.id_to_index = model_data['id_to_index']
                print(f"Loaded existing ML model ({len(self.df)} anime) from {self.model_path}")
                return
            except Exception as e:
                if not os.path.isfile(self.data_path):
                    raise RuntimeError(
                        "Could not load the bundled recommender model. Install backend/requirements.txt "
                        "or provide backend/data/anime_dataset.csv to retrain it."
                    ) from e
                print(f"Failed to load model ({e}). Re-training...")

        self.train()

    def get_all_anime(self, search="", genre="", min_score=0.0, limit=100, page=1):
        """Returns filtered anime list with clean formatted dictionary output."""
        filtered = self.df
        
        query = search.strip()
        if query:
            filtered = filtered[
                filtered['name'].str.contains(query, case=False, regex=False, na=False) |
                filtered['english_name'].str.contains(query, case=False, regex=False, na=False)
            ]
            
        genres = [genre] if isinstance(genre, str) else genre or []
        requested_genres = {name.strip().casefold() for name in genres if name.strip()}
        if requested_genres:
            matches_genre = filtered['genres'].fillna('').str.split(',').map(
                lambda parts: any(part.strip().casefold() in requested_genres for part in parts)
            )
            filtered = filtered.loc[matches_genre]
            
        if min_score > 0:
            filtered = filtered[filtered['score'] >= min_score]
            
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated = filtered.iloc[start_idx:end_idx]
        
        return [self._format_record(record) for record in paginated.to_dict('records')], len(filtered)

    @staticmethod
    def _format_record(record):
        sources = record.pop('streaming_sources_parsed', [])
        record['streaming_sources'] = [
            source for source in (sources if isinstance(sources, list) else [])
            if isinstance(source, dict) and source.get('name') and
            isinstance(source.get('url'), str) and source['url'].startswith(('https://', 'http://'))
        ]
        for key, value in record.items():
            if isinstance(value, (float, np.floating)) and not np.isfinite(value):
                record[key] = None
        return record

    def get_anime_by_id(self, anime_id):
        """Returns single anime details by ID."""
        if anime_id not in self.id_to_index:
            return None
        idx = self.id_to_index[anime_id]
        return self._format_record(self.df.iloc[idx].to_dict())

    def recommend_by_anime_id(self, anime_id, top_n=10, min_score=0.0):
        """Finds top N similar anime given a seed anime ID using on-demand sparse cosine similarity."""
        if anime_id not in self.id_to_index:
            return []
            
        idx = self.id_to_index[anime_id]
        seed_vec = self.tfidf_matrix[idx]
        
        # Calculate cosine similarity vector on demand (fast sparse matrix multiplication)
        sim_vector = cosine_similarity(seed_vec, self.tfidf_matrix)[0]
        
        # Sort indices
        top_indices = np.argsort(sim_vector)[::-1]
        
        # Exclude self
        eligible = (self.df['score'].fillna(0) >= min_score).to_numpy()
        top_indices = [i for i in top_indices if i != idx and eligible[i]][:top_n]
        
        results = []
        seed_row = self.df.iloc[idx]
        
        for sim_idx in top_indices:
            score = sim_vector[sim_idx]
            item = self._format_record(self.df.iloc[sim_idx].to_dict())
                
            match_percentage = round(float(score) * 100, 1)
            item['match_percentage'] = match_percentage
            item['explanation'] = self._generate_explanation(seed_row, item, match_percentage)
            results.append(item)
            
        return results

    def recommend_by_text(self, query, min_score=0.0, top_n=12):
        """Matches a user's description against the existing catalog feature vectors."""
        query_vector = self.vectorizer.transform([query])
        if not query_vector.nnz:
            return []

        similarities = cosine_similarity(query_vector, self.tfidf_matrix)[0]
        eligible = (self.df['score'].fillna(0) >= min_score).to_numpy() & (similarities > 0)
        candidates = np.flatnonzero(eligible)
        top_indices = candidates[np.argsort(-similarities[candidates], kind='stable')[:top_n]]

        results = []
        for idx in top_indices:
            item = self._format_record(self.df.iloc[idx].to_dict())
            item['match_percentage'] = round(float(similarities[idx]) * 100, 1)
            item['explanation'] = 'Shares story themes and keywords with your description.'
            results.append(item)
        return results

    def recommend_by_user_profile(self, favorite_ids=None, favorite_genres=None, min_score=0.0, top_n=12):
        """Generates hybrid ML recommendations using user favorites and genre preferences."""
        favorite_ids = set(favorite_ids or [])
        favorite_genres = [genre.strip() for genre in (favorite_genres or []) if genre.strip()]
        fav_indices = [self.id_to_index[aid] for aid in favorite_ids if aid in self.id_to_index]

        user_vector = np.zeros((1, self.tfidf_matrix.shape[1]))
        if fav_indices:
            user_vector = np.asarray(self.tfidf_matrix[fav_indices].mean(axis=0))
        if favorite_genres:
            genre_query = " ".join([f"{g} {g} {g}" for g in favorite_genres])
            user_vector += self.vectorizer.transform([genre_query]).toarray()

        eligible = ~self.df['anime_id'].isin(favorite_ids) & (self.df['score'].fillna(0) >= min_score)
        if not user_vector.any():
            popular = self.df.loc[eligible].sort_values(['members', 'score'], ascending=False).head(top_n)
            return [
                {**self._format_record(record), 'explanation': 'Popular title based on MyAnimeList community data.'}
                for record in popular.to_dict('records')
            ]

        sim_scores = cosine_similarity(user_vector, self.tfidf_matrix)[0]
        candidates = np.flatnonzero(eligible.to_numpy())
        top_indices = candidates[np.argsort(-sim_scores[candidates], kind='stable')[:top_n]]
        fav_rows = self.df.iloc[fav_indices]
        
        results = []
        for idx in top_indices:
            item = self._format_record(self.df.iloc[idx].to_dict())
            item['match_percentage'] = round(float(sim_scores[idx]) * 100, 1)
            item['explanation'] = self._generate_user_explanation(item, fav_rows, favorite_genres)
            results.append(item)
            
        return results

    def _generate_explanation(self, seed_row, rec_item, match_pct):
        """Generates natural language rationale comparing seed anime with recommendation."""
        seed_genres = set([g.strip() for g in str(seed_row.get('genres', '')).split(',') if g.strip()])
        rec_genres = set([g.strip() for g in str(rec_item.get('genres', '')).split(',') if g.strip()])
        shared_genres = seed_genres.intersection(rec_genres)
        
        reasons = []
        if shared_genres:
            reasons.append(f"shared genres ({', '.join(list(shared_genres)[:3])})")
        if seed_row.get('studio') and seed_row.get('studio') == rec_item.get('studio'):
            reasons.append(f"produced by same studio ({rec_item.get('studio')})")
        if seed_row.get('type') == rec_item.get('type'):
            reasons.append(f"matching {rec_item.get('type')} format")
            
        if reasons:
            return f"{match_pct}% match due to " + " & ".join(reasons) + "."
        return f"{match_pct}% match based on similar story themes and tags."

    def _generate_user_explanation(self, rec_item, fav_df, fav_genres):
        """Generates rationale based on user's aggregated preferences."""
        item_genres = set([g.strip() for g in str(rec_item.get('genres', '')).split(',') if g.strip()])
        matched_fav_genres = item_genres.intersection(set(fav_genres)) if fav_genres else set()
        
        fav_titles = fav_df['name'].tolist() if not fav_df.empty else []
        
        if matched_fav_genres and fav_titles:
            return f"Matches your preferred genres ({', '.join(list(matched_fav_genres)[:2])}) & themes similar to {fav_titles[0]}."
        elif matched_fav_genres:
            return f"Selected for your interest in {', '.join(list(matched_fav_genres)[:3])} anime."
        elif fav_titles:
            return f"Shares story themes with your selected title {fav_titles[0]}."
        return "Recommended for your selected titles and genres."

    def get_model_info(self):
        """Returns internal ML model metadata for backend inspection."""
        genre_list = []
        for g_str in self.df['genres'].dropna():
            genre_list.extend([g.strip() for g in g_str.split(',') if g.strip()])
            
        genre_counts = pd.Series(genre_list).value_counts().to_dict()
        
        feature_names = self.vectorizer.get_feature_names_out()
        vocab_size = len(feature_names)
        
        valid_studios = [s for s in self.df['studio'].dropna() if s.strip()]
        
        return {
            "total_anime": len(self.df),
            "vocab_size": vocab_size,
            "matrix_shape": [self.tfidf_matrix.shape[0], self.tfidf_matrix.shape[1]],
            "genre_distribution": genre_counts,
            "sample_vocabulary": list(feature_names[:40]),
            "algorithm": "TF-IDF (Sublinear Scaling, Bigrams) + Cosine Similarity",
            "studios_count": len(set(valid_studios))
        }
