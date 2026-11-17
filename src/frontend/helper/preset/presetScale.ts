// A preset a forráskép méretében (képpontban) tárolja a pozíciókat és méreteket. Ha a preset másik méretű
// képre kerül, ezeket át kell méretezni, különben rossz helyre és rossz méretben kerülnek.
// Tiszta függvények (nincs külső függőség), hogy külön tesztelhetők legyenek.

export interface Size {
  width: number;
  height: number;
}

export interface PresetScale {
  /** vízszintes arány (cél szélesség / forrás szélesség) */
  x: number;
  /** függőleges arány */
  y: number;
  /** méretekhez (betűméret, logó, keret): a kisebbik arány, hogy semmi ne lógjon ki */
  size: number;
}

const identity: PresetScale = { x: 1, y: 1, size: 1 };

const isValidSize = (size?: Partial<Size> | null): size is Size =>
  !!size &&
  typeof size.width === "number" &&
  typeof size.height === "number" &&
  size.width > 0 &&
  size.height > 0;

/**
 * A preset és a cél kép közötti arányok.
 * Expand módban a vászon mérete fix (az expandSize adja), ezért ott a szövegek / logó / keret
 * nem skálázódnak a kép méretével: azokat a vászon pixeleiben mentette a preset.
 */
export function getPresetScale(
  mode: string,
  source: Partial<Size> | null | undefined,
  target: Partial<Size> | null | undefined,
): PresetScale {
  if (mode === "expand") return identity;
  if (!isValidSize(source) || !isValidSize(target)) return identity;

  const x = target.width / source.width;
  const y = target.height / source.height;

  return { x, y, size: Math.min(x, y) };
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * A vágódoboz átskálázása a cél képre, a kép határain belülre igazítva.
 */
export function scaleCropBox(box: Box, scale: PresetScale, target: Size): Box {
  const width = Math.max(1, Math.min(Math.round(box.width * scale.x), target.width));
  const height = Math.max(1, Math.min(Math.round(box.height * scale.y), target.height));

  return {
    width,
    height,
    x: Math.max(0, Math.min(Math.round(box.x * scale.x), target.width - width)),
    y: Math.max(0, Math.min(Math.round(box.y * scale.y), target.height - height)),
  };
}

export interface Point {
  x: number;
  y: number;
}

export function scalePoint(point: Point, scale: PresetScale): Point {
  return { x: Math.round(point.x * scale.x), y: Math.round(point.y * scale.y) };
}

/**
 * A backend a copyright kép pozícióját tömbként ([x, y]) menti. Régebbi presetekben szöveges értékek
 * is lehetnek (["LEFT", "TOP"]); ilyenkor nincs számszerű pozíció, az alapértelmezés marad.
 */
export function normalizePosition(position: unknown): Point | null {
  let x: unknown;
  let y: unknown;

  if (Array.isArray(position)) {
    [x, y] = position;
  } else if (position && typeof position === "object") {
    ({ x, y } = position as { x?: unknown; y?: unknown });
  } else {
    return null;
  }

  if (typeof x !== "number" || typeof y !== "number") return null;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  return { x, y };
}

/** A backend az átlátszóságot 0-255 között menti, a szerkesztő 0-100 (százalék) között tárolja. */
export function opacityToPercent(opacity: number): number {
  return Math.max(0, Math.min(100, Math.round((opacity / 255) * 100)));
}

/**
 * A copyright kép méretét a backend a magasságból menti (négyzetes méretet kap), a szerkesztő
 * viszont szélességet vár: az eredeti képarány szerint kell visszaszámolni.
 */
export function widthFromHeight(height: number, original: Size): number {
  if (!isValidSize(original)) return height;

  return Math.round((height * original.width) / original.height);
}

export function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  return bytes;
}

/** A kép típusa a fejléce alapján (a preset csak a nyers bájtokat tárolja). */
export function detectImageMime(bytes: Uint8Array): string {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57) return "image/webp";

  return "image/png";
}
