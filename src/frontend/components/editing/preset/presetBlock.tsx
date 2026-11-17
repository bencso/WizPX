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
import { XPositions, YPositions } from "@/interfaces/interface";
import { ExportText } from "@/interfaces/exportTexts.interface";
import { toaster } from "@/components/ui/toaster";
import {
  base64ToBytes,
  detectImageMime,
  getPresetScale,
  normalizePosition,
  opacityToPercent,
  scaleCropBox,
  scalePoint,
  widthFromHeight,
} from "@/helper/preset/presetScale";

export default function PresetBlock() {
  const [presetValue, setPresetValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { setLut, setBorderSize, addTexts, setTextColor, setTextFontFamily, setTextFontSize, setTextFontWeight,
    setTextOpacity, setTextPosition, setExpandBackground, setExportFileOptimize, setExportFileExtension, setExpandMode, setExpandSize, setCopyrightImageOpacity, setCopyrightImagePosition, setCopyrightImageSize, saveCopyrightImage, setCropBox, setCropSave, setTextRelativePosition } = useSessionStore();
  const { selectedImg, canvasRef } = useWorkSession();

  async function stripPngToCube(base64: string): Promise<string> {
    const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
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

  async function usePreset() {
    try {
      const formData = new FormData();

      formData.append(
        "preset_id",
        new Blob([presetValue], { type: "text/plain" }),
        "preset.txt",
      );

      const res = await fetch(apiUrl("/preset/load"), {
        method: "POST",
        body: formData,
      }).catch(() => null);

      if (!res || !res.ok) {
        const error = res ? await res.json().catch(() => null) : null;

        toaster.create({
          title: "A preset betöltése sikertelen",
          description: error?.message ?? "A szerver nem érhető el.",
          type: "error",
        });
        return;
      }

      const data = JSON.parse(await res.json());

      if (!data) return;

      // Az aktuális kép adatai: a preset pozíciói és méretei a forráskép méretében vannak megadva
      const getImage = () =>
        useSessionStore.getState().sessionData.find((si) => si.id === selectedImg);
      const targetSize = getImage()?.dimesions;

      const masksHalds = data.masks_hald_files_buffers ?? [];
      const copyrightImage = data.copyright_image;

      const borderSize = data["border_size"] ?? 0;
      const borderColor = data["border_color"] ?? null;

      const isOptimize = data["optimize"] ?? false;
      const exportFileExt = data["file_extension"] ?? "jpg";

      const expandMode: string = data["expand_mode"] ?? "no";
      const expandSize = data["expand_size"] ?? null;
      const expandColor = data["expand_color"] ?? null;
      const expandPosition = data["expand_position"] ?? null;

      const copyrightImageOpacity = data["copyright_image_opacity"] ?? null;
      const copyrightImagePosition = normalizePosition(
        data["copyright_image_position"],
      );
      const copyrightImageSize = data["copyright_image_size"] ?? null;

      // A preset mentésekor a forráskép mérete (a régi presetekben nincs: ilyenkor nem skálázunk)
      const scale = getPresetScale(expandMode, data["image_size"], targetSize);

      const texts = data["texts"] ?? [];

      if (masksHalds.length > 0) {
        const cubeText = await stripPngToCube(masksHalds[0]);
        const lut = parseCubeLUT(cubeText);
        const lutFilter = convertCubeToFilter(lut) as ColorMapFilter;

        const lutFile = new File([cubeText], "preset.cube", {
          type: "text/plain",
        });
        setLut(selectedImg, lutFilter, lutFile);
      }

      if (texts.length > 0) {
        texts.forEach((text: ExportText) => {
          const newId = addTexts(selectedImg, text.text, canvasRef);
          if (!newId) return;

          if (text.color) setTextColor(selectedImg, newId, text.color);
          if (text.fontFamily) setTextFontFamily(selectedImg, newId, text.fontFamily);
          if (text.fontSize)
            setTextFontSize(selectedImg, newId, text.fontSize * scale.size, 1);
          if (text.fontWeight) setTextFontWeight(selectedImg, newId, text.fontWeight);
          if (text.opacity) setTextOpacity(selectedImg, newId, text.opacity);

          const textPosition = normalizePosition(text.position);
          if (textPosition && (textPosition.x || textPosition.y))
            setTextPosition(selectedImg, newId, scalePoint(textPosition, scale), 1);

          // A relatív pozíció (pl. jobb alsó sarok) a cél kép méretéhez igazodik, nem kell skálázni
          if (text.relativePosition)
            setTextRelativePosition(selectedImg, newId, text.relativePosition);
        });
      }

      if (borderSize !== 0) {
        const scaledBorder = Math.round(borderSize * scale.size);

        setBorderSize(selectedImg, { x: scaledBorder, y: scaledBorder });
      }

      if (borderColor) setExpandBackground(selectedImg, borderColor);

      if (isOptimize) setExportFileOptimize(selectedImg, isOptimize);

      if (exportFileExt) setExportFileExtension(selectedImg, exportFileExt);

      // Az üzemmód: a backend csak az expand / crop módot menti, a keretet a méretéből ismerjük fel
      if (expandMode === "expand" || expandMode === "crop")
        setExpandMode(selectedImg, expandMode);
      else setExpandMode(selectedImg, borderSize > 0 ? "border" : "no");

      if (expandColor) setExpandBackground(selectedImg, expandColor);

      if (expandMode === "expand" && expandSize) {
        // az expand méret a kimeneti vászon mérete: független a kép méretétől
        setExpandSize(selectedImg, expandSize, expandSize.padding ?? 0);
      }

      if (expandMode === "crop" && expandSize && expandSize.width && expandSize.height) {
        const fullImage = targetSize ?? { width: expandSize.width, height: expandSize.height };

        const box = scaleCropBox(
          {
            x: expandPosition?.x ?? 0,
            y: expandPosition?.y ?? 0,
            width: expandSize.width,
            height: expandSize.height,
          },
          scale,
          fullImage,
        );

        // A currentWidth / currentHeight nélkül a vágás méretét rosszul számolja a nézet, ezért a
        // vászon aktuális méretét is át kell adni (ahogy a vágókeret húzásakor is megy)
        setCropBox({
          id: selectedImg,
          box: {
            ...box,
            currentWidth: canvasRef.current?.clientWidth ?? 1,
            currentHeight: canvasRef.current?.clientHeight ?? 1,
          },
        });

        // A vágás mentett állapotban érvényesül (a setCropSave átkapcsolja az állapotot)
        if (!getImage()?.cropSave) setCropSave(selectedImg);
      }

      if (copyrightImage) {
        const bytes = base64ToBytes(copyrightImage);

        // a feltöltés aszinkron: be kell várni, különben felülírná a lent beállított értékeket
        await saveCopyrightImage(
          selectedImg,
          bytes.buffer,
          detectImageMime(bytes),
        );

        if (copyrightImageOpacity)
          setCopyrightImageOpacity(selectedImg, opacityToPercent(copyrightImageOpacity));

        if (copyrightImagePosition)
          setCopyrightImagePosition(selectedImg, scalePoint(copyrightImagePosition, scale), 1);

        if (copyrightImageSize) {
          const original = getImage()?.copyrightImage?.defaultSize;
          const height = copyrightImageSize * scale.size;
          const width = original ? widthFromHeight(height, original) : height;

          setCopyrightImageSize(selectedImg, width);
        }
      }
    } catch (error) {
      toaster.create({
        title: "A preset alkalmazása sikertelen",
        description: error instanceof Error ? error.message : String(error),
        type: "error",
      });
    } finally {
      setLoading(false);
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
