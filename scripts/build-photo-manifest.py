import json
import re
from pathlib import Path


root = Path(__file__).resolve().parent.parent
image_directory = root / "images"
extensions = {".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"}


def title_for(image):
    stem = re.sub(
        r"-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        "",
        image.stem,
        flags=re.IGNORECASE,
    )
    return stem.replace("-", " ").replace("_", " ").title()


photos = [
    {
        "title": title_for(image),
        "src": image.relative_to(root).as_posix(),
        "spotlight": "spotlight" in image.relative_to(image_directory).parts,
    }
    for image in sorted(image_directory.rglob("*"), key=lambda path: path.as_posix().lower())
    if image.is_file() and image.suffix.lower() in extensions
]

(root / "photos.json").write_text(json.dumps(photos, indent=2) + "\n", encoding="utf-8")
print(f"Generated photo manifest with {len(photos)} image(s).")
