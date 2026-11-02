from pathlib import Path
from zipfile import ZipFile
root = Path(__file__).resolve().parents[1]
with ZipFile(root / "dist" / "extension.zip", "w") as archive:
    for file in sorted((root / "extension").glob("*")):
        if file.is_file():
            archive.write(file, file.name)
print("Created dist/extension.zip")
