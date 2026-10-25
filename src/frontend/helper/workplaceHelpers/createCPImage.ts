import { Container, ImageSource, Sprite, Texture } from "pixi.js";
import { isXPositions, isYPositions } from "../positions/checkXYPositions";
import { calculatePosition } from "../positions/calculationPosition";
import { CreateCPImageProps } from "@/interfaces/workplaceHelper.interface";
import { requestRender } from "../render/requestRender";

const latestCall = new WeakMap<Container, number>();

export function createCPImage(props: CreateCPImageProps) {
  const copyrightImage = props.copyrightImage;
  const canvasRef = props.canvasRef;
  const borderSize = props.borderSize;
  const scale = props.scale;
  const overlayRef = props.overlayRef;

  const overlay = overlayRef.current;
  if (!overlay) return;

  const callId = (latestCall.get(overlay) ?? 0) + 1;
  latestCall.set(overlay, callId);

  if (!copyrightImage?.blob) return;

  const imageElement = new Image();

  imageElement.onload = () => {
    if (latestCall.get(overlay) !== callId || overlay.destroyed) return;

    const copyrightImageSource = new ImageSource({
      resource: imageElement,
    });
    const copyrightImageTexture = new Texture({
      source: copyrightImageSource,
    });

    const copyrightImageSprite = new Sprite(copyrightImageTexture);

    let position = copyrightImage.position;

    const relativePosition =
      copyrightImage.relativePosition ??
      (isXPositions(position?.x) && isYPositions(position?.y)
        ? { x: position.x, y: position.y }
        : undefined);

        // TODO: Más a kép amit átad meg a  másik kép
    copyrightImageSprite.height = (copyrightImage.size?.height ?? 0) * scale;
    copyrightImageSprite.width = (copyrightImage.size?.width ?? 0) * scale;

    if (
      isXPositions(relativePosition?.x) &&
      isYPositions(relativePosition?.y)
    ) {
      position = calculatePosition({
        positionX: relativePosition?.x,
        positionY: relativePosition?.y,
        elementRef: {
          offsetHeight:
            copyrightImage.size?.height ?? copyrightImageSprite.height,
          offsetWidth: copyrightImage.size?.width ?? copyrightImageSprite.width,
        },
        referenceElement: canvasRef,
        imageScale: scale,
        borderSize: borderSize,
      });
    }

    copyrightImageSprite.x = position?.x ? Number(position.x) * scale : 0;
    copyrightImageSprite.y = position?.y ? Number(position.y) * scale : 0;

    overlay.addChild(copyrightImageSprite);
    requestRender(props.appRef?.current);
  };

  imageElement.src = copyrightImage.blob;
}
