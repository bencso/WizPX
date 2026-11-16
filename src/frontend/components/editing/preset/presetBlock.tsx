import { apiUrl } from "@/helper/api";
import { useSessionStore } from "@/stores/sessionData";
import { Box, IconButton, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import { LuUpload } from "react-icons/lu";
//@ts-ignore
import parseCubeLUT from "parse-cube-lut";
import { convertCubeToFilter, generateHald } from "@/handlers/lut/lutFunctions";
import { ColorMapFilter } from "pixi-filters";
import { useWorkSession } from "@/providers/sessionprovider";

export default function PresetBlock() {
  const [presetValue, setPresetValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { setLut, setBorderSize, setExpandBackground, setExportFileOptimize, setExportFileExtension, setExpandMode, setExpandSize, setCopyrightImageOpacity, setCopyrightImagePosition, setCopyrightImageSize, saveCopyrightImage } = useSessionStore();
  const { selectedImg, imageScale } = useWorkSession();

  async function usePreset() {
    const body = {
      preset_id: presetValue,
    };
    const formData = new FormData();

    formData.append(
      "preset_id",
      new Blob([body.preset_id], { type: "text/plain" }),
      "preset.txt",
    );

    const res = await fetch(apiUrl("/preset/load"), {
      method: "POST",
      body: formData,
    })
      .catch(() => null)
      .finally(() => setLoading(false));

    if (res) {
      const data = JSON.parse(await res.json());

      async function stripPngToCube(base64: string): Promise<string> {
        const blob = await (
          await fetch(`data:image/png;base64,${base64}`)
        ).blob();
        const bmp = await createImageBitmap(blob);
        const n = bmp.height;
        const canvas = new OffscreenCanvas(bmp.width, bmp.height);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(bmp, 0, 0);
        const px = ctx.getImageData(0, 0, bmp.width, bmp.height).data;

        const lines = [`LUT_3D_SIZE ${n}`];
        for (let b = 0; b < n; b++)
          for (let g = 0; g < n; g++)
            for (let r = 0; r < n; r++) {
              const i = (g * bmp.width + b * n + r) * 4;
              lines.push(
                `${(px[i] / 255).toFixed(6)} ${(px[i + 1] / 255).toFixed(6)} ${(px[i + 2] / 255).toFixed(6)}`,
              );
            }
        return lines.join("\n") + "\n";
      }

      if (data) {
        /*
      export interface ExportText {
        uiWidth: number;
        uiAscent: number;
        uiDescent: number;
        id: string;
        text: string;
        position: DraggableImageEventPosition;
        relativePosition?: { x: XPositions | number; y: YPositions | number };
        enabled: boolean;
        fontSize: number;
        fontFamily: string;
        fontWeight: number;
        color: string;
        opacity: number;
      }
        */
        const masksImages = data.masks_files_buffers;
        const masksHalds = data.masks_hald_files_buffers;
        const copyrightImage = data.copyright_image;

        const borderSize = data["border_size"] ?? 0;
        const borderColor = data["border_color"] ?? null;

        const isOptimize = data["optimize"] ?? false;
        const exportFileExt = data["file_extension"] ?? "jpg";

        const expandMode = data["expand_mode"] ?? "no";
        const expandSize = data["expand_size"] ?? null;
        const expandPostion = data["expand_position"] ?? null;
        const expandColor = data["expand_color"] ?? null;

        const copyrightImageOpacity = data["copyright_image_opacity"] ?? null;
        const copyrightImagePosition = data["copyright_image_position"] ?? null;
        const copyrightImageSize = data["copyright_image_size"] ?? null;


        if (masksHalds.length > 0) {
          const cubeText = await stripPngToCube(masksHalds[0]);
          const lut = parseCubeLUT(cubeText);
          const lutFilter = convertCubeToFilter(lut) as ColorMapFilter;

          const lutFile = new File([cubeText], "preset.cube", {
            type: "text/plain",
          });
          setLut(selectedImg, lutFilter, lutFile);
        }

        if (borderSize !== 0) {
          console.log(borderSize);
          setBorderSize(selectedImg, {
            x: borderSize,
            y: borderSize
          });
        }

        if (borderColor)
          setExpandBackground(selectedImg, borderColor);

        if (isOptimize)
          setExportFileOptimize(selectedImg, isOptimize)

        if (exportFileExt) setExportFileExtension(selectedImg, exportFileExt)

        if (expandMode)
          setExpandMode(selectedImg, expandMode);
        if (expandColor) setExpandBackground(selectedImg, expandColor)
        if (expandSize) {
          if (expandPostion) setExpandSize(selectedImg, expandSize, expandPostion);
          else setExpandSize(selectedImg, expandSize);
        }

        if (copyrightImage) {
          saveCopyrightImage(selectedImg, copyrightImage);

          if (copyrightImageOpacity) setCopyrightImageOpacity(selectedImg, copyrightImageOpacity);
          if (copyrightImagePosition) setCopyrightImagePosition(selectedImg, copyrightImagePosition, imageScale);
          if (copyrightImageSize) setCopyrightImageSize(selectedImg, copyrightImageSize);
        }
      }
    }
  }

  return (
    <Box w={"full"} maxW={"300px"} minW={0}>
      <Input
        placeholder="Preset ID"
        value={presetValue}
        onChange={(e) => setPresetValue(e.target.value)}
        variant="outline"
      />
      <IconButton
        mt={"3"}
        w={"full"}
        variant={"surface"}
        colorPalette={"teal"}
        disabled={loading}
        onClick={() => {
          setLoading(true);
          usePreset();
        }}
      >
        <LuUpload /> <Text>Alkalmazás</Text>
      </IconButton>
    </Box>
  );
}
