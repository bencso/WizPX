import { CalculationReFixPositionProps } from "@/interfaces/interface";

export const calculatePosition = (props: CalculationReFixPositionProps) => {
  const imageScale = props.imageScale;

  if (!props.referenceElement.current) return;
  let x, y;

  const imageHeight = props.referenceElement.current.offsetHeight / imageScale;
  const imageWidth = props.referenceElement.current.offsetWidth / imageScale;

  const imageHalf = imageWidth / 2 - props.elementRef.offsetWidth / 2;

  const copyrightImageX = imageWidth - props.elementRef.offsetWidth;
  const copyrightImageY = imageHeight - props.elementRef.offsetHeight;

  const bX = props.borderSize?.x ?? 30 / imageScale;
  const bY = props.borderSize?.y ?? 30 / imageScale;

  x = props.positionX ?? bX;
  y = props.positionY ?? bY;

  const map: any = {
    left: {
      top: { x: bX, y: bY },
      center: { x: bX, y: copyrightImageY / 2 },
      bottom: { x: bX, y: copyrightImageY - bY },
    },
    center: {
      top: { x: imageHalf, y: bY },
      center: { x: imageHalf, y: copyrightImageY / 2 },
      bottom: {
        x: imageHalf,
        y: copyrightImageY - bY,
      },
    },
    right: {
      top: { x: copyrightImageX - bX, y: bY },
      center: {
        x: copyrightImageX - bX,
        y: copyrightImageY / 2,
      },
      bottom: {
        x: copyrightImageX - bX,
        y: copyrightImageY - bY,
      },
    },
  };

  
  return map[x][y] ?? { x, y };
};
