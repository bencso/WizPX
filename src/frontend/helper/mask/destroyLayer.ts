import { MasksLayers } from "@/interfaces/interface";

export function destroyLayerResources(layer: MasksLayers | undefined) {
  if (!layer) return;

  const destroy = (fn: () => void) => {
    try {
      fn();
    } catch {}
  };

  destroy(() => layer.maskTexture?.destroy(true));
  destroy(() => layer.resultTexture?.destroy(true));
  destroy(() =>
    layer.haldSprite?.destroy({ texture: true, textureSource: true }),
  );
  destroy(() => layer.renderSprite?.destroy());
}
