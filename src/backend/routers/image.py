import base64
import json
from typing import Annotated
from fastapi import UploadFile, APIRouter, Form, File
from fastapi.responses import JSONResponse, Response
import piexif
from functions.border import Border
from functions.caption_generator import CaptionGenerator
from dependencies import IMAGE_EXTENSIONS
from pyvips import Image
from functions.convert_img_file import Export
from functions.customtext import Text
from functions.lut import Lut
from functions.mask import Mask
from functions.resize_img import ResizeImg
from functions.upload_limits import UploadLimitError, check_pixels, read_limited
from functions.valid_colors import validColors
import PIL
from functions.watermark import WaterMarking
import io

router = APIRouter(prefix="/images", tags=["images"])


@router.post("/upload")
async def uploadImage(file: UploadFile):
    try:
        accepted_files = ["image/" + x.lower() for x in IMAGE_EXTENSIONS]
        if file.content_type not in accepted_files:
            raise Exception(
                f"Hibás fájlformátum, az alábbi fájlokat fogadjuk el: {str.join(', ', IMAGE_EXTENSIONS)}"
            )
        img_file_buffer = await read_limited(file)
        img = Image.new_from_buffer(img_file_buffer, "")
        check_pixels(img.width, img.height)

        caption_helper = CaptionGenerator(img=img)
        caption_sample = caption_helper.getSampleForPhoto() or []

        data = json.dumps(
            {
                "exif_data": [
                    {
                        "key": key,
                        "item": item
                    } for key, item in caption_helper.getExifInfos().items()
                ],
                "caption_samples": caption_sample,
                "byte": base64.b64encode(img_file_buffer).decode("utf-8"),
            }
        )

        return JSONResponse(
            status_code=200,
            content={
                "message": "Sikeres feltöltés",
                "data": data,
            },
        )
    except UploadLimitError as ex:
        return JSONResponse(
            status_code=413,
            content={
                "message": f"{ex}",
            },
        )
    except Exception as ex:
        return JSONResponse(
            status_code=400,
            content={
                "message": f"{ex}",
            },
        )


@router.post("/export")
async def exportImage(
        body: Annotated[str, Form(...)] = None,
        file: Annotated[UploadFile, File()] = None,
        lut: Annotated[UploadFile, File()] = None,
        copyright_image: Annotated[UploadFile, File()] = None,
        masks_files: Annotated[list[UploadFile], File()] = None,
        masks_hald_files: Annotated[list[UploadFile], File()] = None):
    try:
        print("-----")
        data = json.loads(body)
        file_extension = data.get("extension") or "jpg"
        allowed_infos = data.get("exif_data") or []
        optimize = data.get("optimize") or False
        border_size = data.get("border_size") or 0
        border_size = int(border_size)
        border_color = validColors(data.get("border_color")) or "#fff"
        texts = data.get("texts") or []
        expand_mode = data.get("expand_mode") or "no"
        expand_size = data.get("expand_size") or None
        expand_color = data.get("expand_color") or "#fff"
        expand_position = data.get("expand_position") or None
        masks_number = data.get("masks_number") or 0

        if masks_files is not None and len(masks_files) > 0:
            masks_files_buffers = [await read_limited(mask_file) for mask_file in masks_files]

        if masks_hald_files is not None and len(masks_hald_files) > 0:
            masks_hald_files_buffers = [await read_limited(mask_hald_file) for mask_hald_file in masks_hald_files]

        img_buffer = await read_limited(file)

        image = Image.new_from_buffer(img_buffer, "")
        check_pixels(image.width, image.height)
        image = image.autorot()
        image = image.icc_transform("sRGB")

        exif_bytes = None
        hald = None

        exif_bytes = image.get("exif-data") if image.get_typeof("exif-data") != 0 else None
        exif_data = []

        image = PIL.Image.fromarray(image.numpy())

        if lut:
            lut_file_bytes = await read_limited(lut)
            hald = PIL.Image.open(io.BytesIO(lut_file_bytes)).convert("RGB")
            lut_helper = Lut(hald, image)
            image = lut_helper.apply_hald()

        if exif_bytes:
            try:
                exif_data = piexif.load(exif_bytes)
            except Exception as e:
                print("EXIF load hiba:", e)

        if masks_number > 0:
            for mask_file, mask_hald_file in zip(masks_files_buffers, masks_hald_files_buffers):
                mask_helper = Mask(image=image)
                image = mask_helper.apply(mask_file, mask_hald_file)

        if expand_mode != "no" and expand_mode != "border":
            crop_box = (float(expand_position["x"]), float(expand_position["y"]), float(
                expand_position["x"]) + expand_size["width"], float(expand_position["y"]) + expand_size["height"])
            expand_helper = ResizeImg(image=image, height=expand_size["height"], width=expand_size["width"], expand=(
                True if expand_mode == "expand" else False), expand_bg=expand_color, padding=expand_size["padding"], crop_box=crop_box)
            image = expand_helper.apply()

        if border_size > 0:
            border_helper = Border(image, border_size, color=border_color)
            image = border_helper.apply()

        if copyright_image is not None:
            cp_image = await read_limited(copyright_image)
            cp = PIL.Image.open(io.BytesIO(cp_image))

            copyright_image_size = int(data.get("copyright_image_size")) or 0
            copyright_image_position = data.get("copyright_image_position")
            copyright_image_opacity = float(
                data.get("copyright_image_opacity")) or 100
            if not copyright_image_position:
                copyright_image_position = ("LEFT", "TOP")
            else:
                copyright_image_position = (
                    round(copyright_image_position["x"]), round(copyright_image_position["y"]))
            copyright_image_opacity = int(
                (copyright_image_opacity / 100.0) * 255)

            image = WaterMarking(image, position=copyright_image_position, border_size=border_size).watermark_with_image(
                cp, copyright_image_size, copyright_image_opacity, border_size)

        if texts and len(texts) > 0:
            texts_helper = Text(texts, image, border_size)
            image = texts_helper.generate_text()

        exporter = Export(image, output_extension=file_extension,
                          exif_data=exif_data, allowed_infos=allowed_infos, optimized=optimize)
        exporter = exporter.apply()

        if (not isinstance(exporter, bytes)):
            raise Exception(
                "Hiba történt az exportálás közben! Kérjük, próbálja újra")

        return Response(
            content=exporter,
            media_type="image/png"
        )
    except UploadLimitError as ex:
        return JSONResponse(
            status_code=413,
            content={
                "message": f"{ex}",
            },
        )
    except Exception as ex:
        return JSONResponse(
            status_code=400,
            content={
                "message": f"{ex}",
            },
        )


@router.post("/preset")
async def savePreset(
        body: Annotated[str, Form(...)] = None,
        lut: Annotated[UploadFile, File()] = None,
        copyright_image: Annotated[UploadFile, File()] = None,
        masks_files: Annotated[list[UploadFile], File()] = None,
        masks_hald_files: Annotated[list[UploadFile], File()] = None):
    
    try:
        # Ugy kéne hogy a képeket byteokká alakítjuk, és felépítünk egy JSON (dict) szerkezetet amit majd hashelünk
        print("-----")
        preset_data  = {}
        
        data = json.loads(body)
        file_extension = data.get("extension") or "jpg"
        allowed_infos = data.get("exif_data") or []
        optimize = data.get("optimize") or False
        border_size = data.get("border_size") or 0
        border_size = int(border_size)
        border_color = validColors(data.get("border_color")) or "#fff"
        texts = data.get("texts") or []
        expand_mode = data.get("expand_mode") or "no"
        expand_size = data.get("expand_size") or None
        expand_color = data.get("expand_color") or "#fff"
        expand_position = data.get("expand_position") or None
        masks_number = data.get("masks_number") or 0

        if masks_files is not None and len(masks_files) > 0:
            masks_files_buffers = [await read_limited(mask_file) for mask_file in masks_files]

        if masks_hald_files is not None and len(masks_hald_files) > 0:
            masks_hald_files_buffers = [await read_limited(mask_hald_file) for mask_hald_file in masks_hald_files]

        if lut:
            lut_file_bytes = await read_limited(lut)
            preset_data["lut_file_bytes"] = lut_file_bytes
            
        if masks_number > 0:
            preset_data["masks_files_buffers"] = masks_files_buffers
            preset_data["masks_hald_files_buffers"] = masks_hald_files_buffers

        if expand_mode != "no" and expand_mode != "border" and expand_mode == "expand":
                print(expand_color, expand_size, expand_position)

        if border_size > 0:
            print(border_size, border_color)

        if copyright_image is not None:
            cp_image = await read_limited(copyright_image)
            cp = PIL.Image.open(io.BytesIO(cp_image))

            copyright_image_size = int(data.get("copyright_image_size")) or 0
            copyright_image_position = data.get("copyright_image_position")
            copyright_image_opacity = float(
                data.get("copyright_image_opacity")) or 100
            if not copyright_image_position:
                copyright_image_position = ("LEFT", "TOP")
            else:
                copyright_image_position = (
                    round(copyright_image_position["x"]), round(copyright_image_position["y"]))
            copyright_image_opacity = int(
                (copyright_image_opacity / 100.0) * 255)

            preset_data["copyright_image"] = cp_image
            preset_data["copyright_image_opacity"] = copyright_image_opacity
            preset_data["copyright_image_position"] = copyright_image_position
            preset_data["copyright_image_size"] = copyright_image_size

        if texts and len(texts) > 0:
            preset_data["texts"] = texts
            

        preset_data["file_extension"] = file_extension
        preset_data["allowed_infos"] = allowed_infos
        preset_data["optimize"] = optimize
        
        return JSONResponse(
                    status_code=200,
                    content=json.dumps(preset_data)
                )
        
    except UploadLimitError as ex:
        return JSONResponse(
            status_code=413,
            content={
                "message": f"{ex}",
            },
        )
    except Exception as ex:
        return JSONResponse(
            status_code=400,
            content={
                "message": f"{ex}",
            },
        )
