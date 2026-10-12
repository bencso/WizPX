import { CustomImage, XPositions, YPositions } from "@/interfaces/interface";
import { isXPositions, isYPositions } from "../positions/checkXYPositions";
import { calculatePosition } from "../positions/calculationPosition";
import { RefObject } from "react";

export async function getCopyrightImagePosition(
  selectedImage: CustomImage,
  cpRelativePosition:
    | {
        x: number | XPositions;
        y: YPositions | number;
      }
    | undefined,
  scale: number,
  canvasRef: RefObject<HTMLCanvasElement | null>,
) {
  const savedPosition = selectedImage.copyrightImage?.position;

  // Feltöltés után a pozíció szöveges érték (pl. left / top), ilyenkor ez a relatív pozíció
  const relativePosition =
    cpRelativePosition ??
    (isXPositions(savedPosition?.x) && isYPositions(savedPosition?.y)
      ? { x: savedPosition.x, y: savedPosition.y }
      : undefined);

  if (isXPositions(relativePosition?.x) && isYPositions(relativePosition?.y)) {
    const position = calculatePosition({
      positionX: relativePosition?.x,
      positionY: relativePosition?.y,
      elementRef: {
        offsetHeight: Number(selectedImage.copyrightImage?.size?.height ?? 0),
        offsetWidth: Number(selectedImage.copyrightImage?.size?.width ?? 0),
      },
      referenceElement: canvasRef,
      imageScale: scale,
      borderSize: selectedImage.borderSize,
    });

    if (!position) return undefined;

    return {
      x: position.x,
      y: position.y,
    };
  }

  // Kézzel megadott (számokkal tárolt) pozíció
  if (
    typeof savedPosition?.x === "number" &&
    typeof savedPosition?.y === "number"
  ) {
    return { x: savedPosition.x, y: savedPosition.y };
  }

  return undefined;
}
