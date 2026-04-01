from train.image_models.base_trainer import run_training
from train.image_models.model_configs import MODEL_CONFIGS


def show_menu():
    print("\n🔥 Select Model to Train:\n")

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

    print(f"\n🚀 Running training for: {model_key}")
    print(f"Model: {config['model_name']}")
    print(f"Saving to: {config['save_dir']}")
    run_training(config)


if __name__ == "__main__":
    main()