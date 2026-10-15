import os

import PIL.Image
from fastapi import UploadFile

MAX_UPLOAD_BYTES = int(os.environ.get("MAX_UPLOAD_MB", "100")) * 1024 * 1024
MAX_IMAGE_PIXELS = int(os.environ.get("MAX_IMAGE_MEGAPIXELS", "100")) * 1_000_000

PIL.Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS
class UploadLimitError(Exception):
    """A feltöltött fájl túl nagy (méret vagy képpont-szám)."""

async def read_limited(upload: UploadFile) -> bytes:
    data = await upload.read(MAX_UPLOAD_BYTES + 1)

    if len(data) > MAX_UPLOAD_BYTES:
        raise UploadLimitError(
            f"A fájl túl nagy, legfeljebb {MAX_UPLOAD_BYTES // (1024 * 1024)} MB engedélyezett."
        )
    return data

def check_pixels(width: int, height: int) -> None:
    if width * height > MAX_IMAGE_PIXELS:
        raise UploadLimitError(
            f"A kép felbontása túl nagy ({width}x{height}), legfeljebb {MAX_IMAGE_PIXELS // 1_000_000} megapixel engedélyezett."
        )
