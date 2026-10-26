import json
from typing import Annotated
from fastapi import UploadFile, APIRouter, Form, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from functions.upload_limits import UploadLimitError, read_limited
from functions.valid_colors import validColors
from itsdangerous import URLSafeSerializer

router = APIRouter(prefix="/preset", tags=["preset"])


class LoadPresetBody(BaseModel):
    preset_id: str


@router.post("/load")
async def loadPreset(body: Annotated[str, Form(...)] = None):
    if body is None:
        return JSONResponse(
            status_code=400,
            content={
                "message": "Hiányzó paraméter",
            },
        )
    else:
        try:
            data = json.loads(body)

            prest_id_generator = URLSafeSerializer("presetwizpx")
            preset_data = prest_id_generator.loads(data.get("preset_id"))

            return JSONResponse(
                status_code=200,
                content=preset_data,
            )
        except Exception as ex:
            return JSONResponse(
                status_code=400,
                content={
                    "message": f"{ex}",
                },
            )


@router.post("/save")
async def savePreset(
    body: Annotated[str, Form(...)] = None,
    lut: Annotated[UploadFile, File()] = None,
    copyright_image: Annotated[UploadFile, File()] = None,
    masks_files: Annotated[list[UploadFile], File()] = None,
    masks_hald_files: Annotated[list[UploadFile], File()] = None,
):
    try:
        preset_data = {}

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
            masks_files_buffers = [
                await read_limited(mask_file) for mask_file in masks_files
            ]

        if masks_hald_files is not None and len(masks_hald_files) > 0:
            masks_hald_files_buffers = [
                await read_limited(mask_hald_file)
                for mask_hald_file in masks_hald_files
            ]

        if lut:
            lut_file_bytes = await read_limited(lut)
            preset_data["lut_file_bytes"] = lut_file_bytes

        if masks_number > 0:
            preset_data["masks_files_buffers"] = masks_files_buffers
            preset_data["masks_hald_files_buffers"] = masks_hald_files_buffers

        if expand_mode != "no" and expand_mode != "border" and expand_mode == "expand":
            preset_data["expand_color"] = expand_color
            preset_data["expand_size"] = expand_size
            preset_data["expand_position"] = expand_position

        if border_size > 0:
            preset_data["border_color"] = border_color
            preset_data["border_size"] = border_size

        if copyright_image is not None:
            cp_image = await read_limited(copyright_image)
            copyright_image_size = int(data.get("copyright_image_size")) or 0
            copyright_image_position = data.get("copyright_image_position")
            copyright_image_opacity = float(
                data.get("copyright_image_opacity")) or 100
            if not copyright_image_position:
                copyright_image_position = ("LEFT", "TOP")
            else:
                copyright_image_position = (
                    round(copyright_image_position["x"]),
                    round(copyright_image_position["y"]),
                )
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

        prest_id_generator = URLSafeSerializer("presetwizpx")
        preset_id = prest_id_generator.dumps(str(preset_data))

        return JSONResponse(
            status_code=200,
            content={
                "preset_id": f"{preset_id}",
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
