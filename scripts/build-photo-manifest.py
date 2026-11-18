import json
from pathlib import Path


root = Path(__file__).resolve().parent.parent
image_directory = root / "images"
extensions = {".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"}
photos = [
    {
        "title": image.stem.replace("-", " ").replace("_", " ").title(),
        "src": image.relative_to(root).as_posix(),
        "spotlight": "spotlight" in image.relative_to(image_directory).parts,
    }
    for image in sorted(image_directory.rglob("*"), key=lambda path: path.as_posix().lower())
    if image.is_file() and image.suffix.lower() in extensions
]

(root / "photos.json").write_text(json.dumps(photos, indent=2) + "\n", encoding="utf-8")
print(f"Generated photo manifest with {len(photos)} image(s).")
