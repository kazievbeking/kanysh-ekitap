"""Жоба суреттерін вебке арналған WebP пішіміне сақтау."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path('.tools/pydeps').resolve()))
from PIL import Image
for path in Path('public/images').glob('*.png'):
    image=Image.open(path).convert('RGB')
    image.thumbnail((1600,1600))
    image.save(path.with_suffix('.webp'),'WEBP',quality=88,method=6)
    print(path.stem,path.with_suffix('.webp').stat().st_size)
