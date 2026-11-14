import PIL
from functions.lut import Lut
import base64
import io

class Mask:
    def __init__(self,image):
        self.image = image
        
    
    @staticmethod
    def _png_bytes(data: bytes) -> bytes:
        if data.startswith(b"data:"):
            return base64.b64decode(data.split(b",", 1)[1])
        return data
    
    def apply(self, mask_file, mask_hald_file):
        _, m_encoded = mask_file.split(b",", 1)
        _, mh_encoded = mask_hald_file.split(b",", 1)   
                     
        decoded_mask = base64.b64decode(m_encoded)
        decoded_hald = base64.b64decode(mh_encoded)

        original = self.image.copy()
        original = original.convert("RGBA")

        mask_hald = PIL.Image.open(io.BytesIO(decoded_hald)).convert("RGB")
        mask = PIL.Image.open(io.BytesIO(decoded_mask))
        
        lut_image = Lut(mask_hald, original).apply_hald()
        lut_image = lut_image.convert("RGBA")

        mask = PIL.ImageOps.fit(mask,original.size, PIL.Image.Resampling.LANCZOS)

        self.image = PIL.Image.composite(
            lut_image,
            self.image,
            mask
        )
        
        return self.image.convert("RGB")