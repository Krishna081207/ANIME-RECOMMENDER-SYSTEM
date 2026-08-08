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
                print(f"Failed to load model ({e}). Re-training...")
        
        self.train()

    def get_all_anime(self, search="", genre="", min_score=0.0, limit=100, page=1):
        """Returns filtered anime list with clean formatted dictionary output."""
        filtered = self.df.copy()
        
        if search:
            query = search.lower().strip()
            filtered = filtered[
                filtered['name'].str.lower().str.contains(query, na=False) |
                filtered['english_name'].str.lower().str.contains(query, na=False)
            ]
            
        if genre:
            filtered = filtered[filtered['genres'].str.contains(genre, case=False, na=False)]
            
        if min_score > 0:
            filtered = filtered[filtered['score'] >= min_score]
            
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated = filtered.iloc[start_idx:end_idx]
        
        records = paginated.to_dict(orient='records')
        for r in records:
            if 'streaming_sources_parsed' in r:
                r['streaming_sources'] = r['streaming_sources_parsed']
        return records, len(filtered)

    def get_anime_by_id(self, anime_id):
        """Returns single anime details by ID."""
        if anime_id not in self.id_to_index:
            return None
        idx = self.id_to_index[anime_id]
        record = self.df.iloc[idx].to_dict()
        if 'streaming_sources_parsed' in record:
            record['streaming_sources'] = record['streaming_sources_parsed']
        return record

    def recommend_by_anime_id(self, anime_id, top_n=10):
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
        top_indices = [i for i in top_indices if i != idx][:top_n]
        
        results = []
        seed_row = self.df.iloc[idx]
        
        for sim_idx in top_indices:
            score = sim_vector[sim_idx]
            item = self.df.iloc[sim_idx].to_dict()
            if 'streaming_sources_parsed' in item:
                item['streaming_sources'] = item['streaming_sources_parsed']
                
            match_percentage = round(float(score) * 100, 1)
            item['match_percentage'] = match_percentage
            item['explanation'] = self._generate_explanation(seed_row, item, match_percentage)
            results.append(item)
            
        return results

    def recommend_by_user_profile(self, favorite_ids=None, favorite_genres=None, min_score=0.0, top_n=12):
        """Generates hybrid ML recommendations using user favorites and genre preferences."""
        favorite_ids = favorite_ids or []
        favorite_genres = favorite_genres or []
        
        if not favorite_ids and not favorite_genres:
            # Fallback to top-rated titles if user has no preferences
            filtered = self.df[self.df['score'] >= min_score].sort_values(by=['members', 'score'], ascending=False).head(top_n)
            results = filtered.to_dict(orient='records')
            for item in results:
                item['match_percentage'] = round(float(item['score']) / 10.0 * 100, 1) if item['score'] > 0 else 75.0
                item['explanation'] = "Popular top-rated title based on Kaggle community scores."
                if 'streaming_sources_parsed' in item:
                    item['streaming_sources'] = item['streaming_sources_parsed']
            return results

        # Create user profile vector
        fav_indices = [self.id_to_index[aid] for aid in favorite_ids if aid in self.id_to_index]
        
        if fav_indices:
            user_vector = np.mean(self.tfidf_matrix[fav_indices].toarray(), axis=0).reshape(1, -1)
        else:
            user_vector = np.zeros((1, self.tfidf_matrix.shape[1]))
            
        # Add genre query vector boost if specified
        if favorite_genres:
            genre_query = " ".join([f"{g} {g} {g}" for g in favorite_genres])
            genre_vector = self.vectorizer.transform([genre_query]).toarray()
            user_vector = user_vector + genre_vector

        # Calculate similarity between user vector and all anime
        sim_scores = cosine_similarity(user_vector, self.tfidf_matrix)[0]
        
        # Filter candidates
        fav_set = set(favorite_ids)
        scored_candidates = []
        for i in range(len(self.df)):
            aid = self.df.iloc[i]['anime_id']
            if aid in fav_set:
                continue
            sc = self.df.iloc[i]['score']
            if min_score > 0 and sc < min_score:
                continue
            scored_candidates.append((i, sim_scores[i]))
            
        scored_candidates = sorted(scored_candidates, key=lambda x: x[1], reverse=True)[:top_n]
        
        fav_rows = self.df[self.df['anime_id'].isin(favorite_ids)] if favorite_ids else pd.DataFrame()
        
        results = []
        for idx, score in scored_candidates:
            item = self.df.iloc[idx].to_dict()
            if 'streaming_sources_parsed' in item:
                item['streaming_sources'] = item['streaming_sources_parsed']
                
            raw_match = float(score)
            match_percentage = round(min(99.4, max(65.0, raw_match * 100 + 45.0)), 1) if raw_match > 0.05 else round(raw_match * 100, 1)
            
            item['match_percentage'] = match_percentage
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
        return f"{match_pct}% match based on TF-IDF thematic synopsis & tag similarity."

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
            return f"High thematic vector similarity to your saved favorite: {fav_titles[0]}."
        return f"Top recommended match based on your customized ML profile."

    def get_model_info(self):
        """Returns internal ML model metadata for the frontend presentation tab."""
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
            "algorithm": "TF-IDF (Sublinear Scaling, Bi-grams) + Cosine Similarity Matrix",
            "studios_count": len(set(valid_studios))
        }
