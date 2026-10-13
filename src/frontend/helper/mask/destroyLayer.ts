import { MasksLayers } from "@/interfaces/interface";

// Egy réteg GPU-erőforrásainak felszabadítása. A maszk és az eredmény textúra teljes képfelbontású,
// ezért a lista kivétele (deleteLayer) önmagában nem elég: destroy nélkül a GPU-memória foglalt marad.
export function destroyLayerResources(layer: MasksLayers | undefined) {
  if (!layer) return;

  const destroy = (fn: () => void) => {
    try {
      fn();
    } catch {
      // már felszabadított erőforrás
    }
  };

  destroy(() => layer.maskTexture?.destroy(true));
  destroy(() => layer.resultTexture?.destroy(true));
  destroy(() => layer.haldSprite?.destroy({ texture: true, textureSource: true }));
  destroy(() => layer.renderSprite?.destroy());
}
