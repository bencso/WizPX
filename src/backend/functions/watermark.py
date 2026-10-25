from PIL import Image
from PIL import ImageOps
from typing import Optional
from dependencies import X_AXIS, Y_AXIS
from functions.customtext import Text
import io

class WaterMarking:
    def __init__(
        self,
        image: Image.Image,
        position: Optional[tuple[str, str] | tuple[int, int]] = None,  # type: ignore
        border_size: int = None
    ) -> None:
        self.img = image
        self.position = position
        self.border_size = border_size

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.buffer = io.BytesIO()
        self.img.save(self.buffer, format="PNG")
        self.buffer.seek(0)

    def apply(self, watermark_image: Optional[Image.Image] = None):
        if watermark_image is not None:
            return self.watermark_with_image(watermark_image=watermark_image)
        else:
            return self.watermark()

    def watermark(self, text: Text):
        if self.img.mode != "RGBA":
            self.img = self.img.convert("RGBA")

        txt_layer = Image.new("RGBA", self.img.size, (255, 255, 255, 0))

        bbox = text.generate_text_box(txt_layer=txt_layer)
        position = text.get_position(position=self.position, bbox=bbox)
        txt_layer = text.generate_text(position)

        watermarked = Image.alpha_composite(self.img, txt_layer)
        watermarked = watermarked.convert("RGB")

        return watermarked

    def watermark_with_image(self, watermark_image: Image.Image, watermark_size: int, watermark_opacity: int, border_size: int):
        SIZE = (watermark_size or 300, watermark_size or 300)        
        print(watermark_size)
        try:
            # Először a forgatás (EXIF), utána RGBA-ra alakítás: a korábbi sorrendben a convert eredményét
            # azonnal felülírta az eredeti kép, így a palettás/átlátszó PNG-k alfája elveszett vagy hibázott
            watermark_image_png = ImageOps.exif_transpose(watermark_image)
            watermark_image_png = watermark_image_png.convert("RGBA")
            watermark_image_png = ImageOps.cover(
                watermark_image_png,
                SIZE,
            )

            # A beállított átlátszóság a kép saját alfájával szorzódik, nem írja felül (különben az átlátszó
            # háttérű logó négyzetként jelenne meg)
            alpha = watermark_image_png.getchannel("A").point(
                lambda a: a * watermark_opacity // 255
            )
            watermark_image_png.putalpha(alpha)
            print("---asd---")
            print(watermark_image_png.height, watermark_image_png.width)

            x, y = self.position
            if type(x) == int and type(y) == int:
                image_position = (int(x) , int(y))
            else:
                if x == "LEFT":
                    x = 30 + border_size
                elif x == "RIGHT":
                    x = self.img.width - watermark_image_png.width - (30 + (border_size))
                elif x == "CENTER":
                    x = (self.img.width / 2) - (watermark_image_png.width / 2)
                if y == "TOP":
                    y = 30  + (border_size)
                elif y == "BOTTOM":
                    y = self.img.height - watermark_image_png.height  - (30 + (border_size))
                elif y == "CENTER":
                    y = (self.img.height / 2) - (watermark_image_png.height / 2)
            
                image_position = (int(x) , int(y) )

            self.img.paste(
                watermark_image_png, image_position, mask=watermark_image_png
            )

            return self.img
        except Exception as ex:
            # kivételt kell dobni: egy hibaüzenet-string képként továbbmenne az exportban
            raise Exception(f"Az overlay kép feldolgozása sikertelen: {ex}") from ex
