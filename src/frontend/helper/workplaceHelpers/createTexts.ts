import { DraggableImageEvent } from "@/interfaces/interface";
import { CreateTextsProps } from "@/interfaces/workplaceHelper.interface";
import { isXPositions, isYPositions } from "../positions/checkXYPositions";
import { calculatePosition } from "../positions/calculationPosition";
import { BitmapText } from "pixi.js";
import { requestRender } from "../render/requestRender";


export function createTexts(props: CreateTextsProps): (() => void) | undefined {
  const texts = props.texts ?? [];
  const appRef = props.appRef;
  const scale = props.scale ?? 1;
  const canvasRef = props.canvasRef;
  const borderSize = props.borderSize;
  const draggableText = props.draggableText;
  const overlayRef = props.overlayRef;
  const selectedImg = props.selectedImg;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const textElements = new Map<string, BitmapText>();

  texts.forEach((text: DraggableImageEvent) => {
    let textPosition = text.position;
    const relativePosition = text.relativePosition;

    ctx.font = `${text.fontSize * scale}px ${text.fontFamily}`;

    const textFont = ctx.measureText(text.text);
    const textSize = {
      offsetHeight: textFont.fontBoundingBoxAscent/scale,
      offsetWidth: textFont.width/scale,
    };

    textPosition = {
      x: Number(textPosition.x) ,
      y: Number(textPosition.y) ,
    };

    if (
      isXPositions(relativePosition?.x) &&
      isYPositions(relativePosition?.y)
    ) {
      textPosition = calculatePosition({
        positionX: relativePosition?.x,
        positionY: relativePosition?.y,
        elementRef: textSize,
        referenceElement: canvasRef,
        imageScale: scale,
        borderSize: borderSize,
      });
    }

    const textElement = new BitmapText({
      text: text.text,
      style: {
        fontFamily: text.fontFamily,
        fontSize: text.fontSize * scale,
        fill: text.color,
      },
    });

    textElement.roundPixels = true;
    textElement.x = (Number(textPosition.x) ?? 0) * scale;
    textElement.y = (Number(textPosition.y) ?? 0) * scale;

    textElement.eventMode = "static";
    textElement.cursor = "pointer";
    textElement.interactive = true;

    textElement.on("pointerdown", (_event) => {
      props.setDraggable(text.id);
      textElement.anchor = 0.5;
    });

    textElements.set(text.id, textElement);

    overlayRef.current?.addChild(textElement);
  });

  const stage = appRef.current?.stage;

  if (!stage) return;

  const onPointerMove = (event: { global: { x: number; y: number } }) => {
    if (draggableText === null) return;

    const dragged = textElements.get(draggableText);
    if (!dragged) return;

    dragged.position.set(event.global.x, event.global.y);
    requestRender(appRef.current);
  };

  const onPointerUp = () => {
    if (draggableText === null) return;

    const dragged = textElements.get(draggableText);

    props.setDraggable(null);

    if (!dragged) return;

    props.setTextPosition(
      selectedImg,
      draggableText,
      { x: dragged.x, y: dragged.y },
      scale,
    );
    props.setTextRelativePosition(selectedImg, draggableText, { x: 0, y: 0 });
  };

  stage.on("pointermove", onPointerMove);
  stage.on("pointerup", onPointerUp);

  requestRender(appRef.current);

  return () => {
    stage.off("pointermove", onPointerMove);
    stage.off("pointerup", onPointerUp);
  };
}
