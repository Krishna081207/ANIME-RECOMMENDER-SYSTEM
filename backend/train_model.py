import os
import sys
from recommender import AnimeRecommender

def main():
    print("=" * 60)
    print("      ANIME RECOMMENDER SYSTEM - MODEL TRAINING PIPELINE")
    print("=" * 60)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "data", "anime_dataset.csv")
    model_path = os.path.join(base_dir, "models", "recommender_model.pkl")
    
    if not os.path.exists(data_path):
        print(f"ERROR: Dataset file not found at {data_path}")
        sys.exit(1)
        
    recommender = AnimeRecommender(data_path=data_path, model_path=model_path)
    recommender.train()
    
    info = recommender.get_model_info()
    print("\n[SUCCESS] Model Training Completed!")
    print(f"  - Total Anime Indexed: {info['total_anime']}")
    print(f"  - TF-IDF Vocab Size:   {info['vocab_size']}")
    print(f"  - Matrix Dimensions:   {info['matrix_shape']}")
    print(f"  - Model Artifact:      {model_path}")
    print("=" * 60)

if __name__ == "__main__":
    main()
