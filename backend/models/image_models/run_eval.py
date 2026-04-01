import os
from train.image_models.base_evaluator import run_evaluation
from train.image_models.model_configs import MODEL_CONFIGS

def get_best_checkpoint(save_dir):
    if not os.path.exists(save_dir):
        return None
    
    files = [f for f in os.listdir(save_dir) if f.startswith("best_") and f.endswith(".pth")]
    if not files:
        return None
    
    # Sort by value in filename: best_0.9246.pth -> 0.9246
    files.sort(key=lambda x: float(x.split("_")[1].replace(".pth", "")), reverse=True)
    return os.path.join(save_dir, files[0])

def show_menu():
    print("\n🔥 Select Model to Evaluate:\n")
    keys = list(MODEL_CONFIGS.keys())
    for i, key in enumerate(keys):
        print(f"{i+1}. {key}")
    
    choice = input("\nEnter choice: ")
    try:
        idx = int(choice) - 1
        return keys[idx]
    except:
        print("❌ Invalid choice")
        return None

def main():
    model_key = show_menu()
    if model_key is None:
        return

    config = MODEL_CONFIGS[model_key]
    checkpoint_path = get_best_checkpoint(config["save_dir"])
    
    if not checkpoint_path:
        print(f"❌ No checkpoints found in {config['save_dir']}")
        # Ask user for manual path
        manual_path = input("Enter manual checkpoint path (or press enter to exit): ")
        if not manual_path:
            return
        checkpoint_path = manual_path

    print(f"\n🚀 Running evaluation for: {model_key}")
    print(f"Model: {config['model_name']}")
    print(f"Checkpoint: {checkpoint_path}")

    run_evaluation(
        model_name=config["model_name"],
        checkpoint_path=checkpoint_path,
        batch_size=config["batch_size"]
    )

if __name__ == "__main__":
    main()
