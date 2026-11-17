import { CustomImage } from "@/interfaces/interface";
import { Application, Rectangle, Sprite, Texture } from "pixi.js";
import { RefObject } from "react";

export interface applyFiltersProps {
  startIndex?: number;
  image: CustomImage | undefined;
  spriteRef: RefObject<Sprite | null>;
  appRef: RefObject<Application | null>;
  textureRef: RefObject<Texture | null>;
  renderSpriteRef: RefObject<Sprite | null>;
}

export function applyFilters(props: applyFiltersProps) {
  const startIndex = props.startIndex ? props.startIndex : 0;
  const image = props.image;
  const lutFilter = image?.lutFilter;
  const spriteRef = props.spriteRef;
  const appRef = props.appRef;
  const textureRef = props.textureRef;
  const renderSpriteRef = props.renderSpriteRef.current;

  if (!appRef.current) return;

  if (
    image &&
    image.renderTextures &&
    image.renderTextures.length > 0 &&
    spriteRef.current
  ) {
    const baseTexture = textureRef.current;
    const cropFrame = getCropFrame(baseTexture);

    let input =
      startIndex === 0
        ? cropFrame && baseTexture
          ? getFullTexture(baseTexture)
          : baseTexture
        : image.renderTextures[startIndex - 1].resultTexture;

    const layers = image.renderTextures;

    for (let i = startIndex; i < layers.length; i++) {
      const layer = image.renderTextures[i];

      if (spriteRef.current && renderSpriteRef) {
        renderSpriteRef.texture = input;

        if (layer.filter && appRef.current) {
          if (layer.filter.resources.layer_mask !== layer.maskTexture.source)
            layer.filter.resources.layer_mask = layer.maskTexture.source;

          layer.haldSprite.filters = [layer.filterMask];
          renderSpriteRef.filters = lutFilter
            ? [layer.filter, lutFilter]
            : [layer.filter];

          appRef.current.renderer.render({
            container: renderSpriteRef,
            target: layer.resultTexture,
            clear: true,
          });

          input = layer.resultTexture;
        }
      }
    }

    spriteRef.current.texture =
      cropFrame && input ? getCroppedView(input, cropFrame) : input;
    spriteRef.current.filters = [];
  }
}

function getCropFrame(texture: Texture | null): Rectangle | null {
  if (!texture) return null;

  const { frame, source } = texture;

  const isCropped =
    frame.x !== 0 ||
    frame.y !== 0 ||
    Math.round(frame.width) !== Math.round(source.width) ||
    Math.round(frame.height) !== Math.round(source.height);

  return isCropped ? frame.clone() : null;
}

const fullTextures = new WeakMap<object, Texture>();

function getFullTexture(texture: Texture): Texture {
  let full = fullTextures.get(texture.source);

  if (!full) {
    full = new Texture({ source: texture.source });
    fullTextures.set(texture.source, full);
  }

  return full;
}

const croppedViews = new WeakMap<object, Texture>();

function getCroppedView(texture: Texture, frame: Rectangle): Texture {
  const previous = croppedViews.get(texture.source);

  if (
    previous &&
    !previous.destroyed &&
    previous.frame.x === frame.x &&
    previous.frame.y === frame.y &&
    previous.frame.width === frame.width &&
    previous.frame.height === frame.height
  )
    return previous;

  previous?.destroy(false);

  const view = new Texture({ source: texture.source, frame });
  croppedViews.set(texture.source, view);

  return view;
}
