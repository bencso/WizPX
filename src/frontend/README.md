# WizPX – Frontend

Next.js (App Router) + Chakra UI + Pixi.js alapú szerkesztőfelület. A szerkesztés előnézete teljes egészében a böngészőben, WebGL-en fut, a backend csak az exportnál dolgozik.

## Indítás

A teljes stack indításához (frontend + backend + nginx) lásd: [`docs/START_DEV.md`](../../docs/START_DEV.md).

Csak a frontend, Docker nélkül:

```bash
cd src/frontend
npm install
npm run dev   # http://localhost:3000
```

Típusellenőrzés: `npx tsc --noEmit`

## Felépítés

| Mappa | Tartalom |
|---|---|
| `app/` | Next.js oldalak (feltöltés, galéria, szerkesztő) |
| `components/webGlComponent.tsx` | Pixi `Application` létrehozása, kép betöltése, layout, szűrők és az első maszk réteg |
| `components/editing/` | Szerkesztő UI: oldalsáv, caption, channel mixer, LUT, maszk, resize, szöveg, vízjel |
| `handlers/filters/` | GLSL fragment shaderek (exposure, brightness, contrast, temperature, hue, levels, channel mixer, vibrance, maszkolt változat) |
| `helper/mask/` | Maszkrajzolás (`useMask.ts`) és a rétegek összefűzése (`applyFilters.ts`) |
| `helper/export/` | Exportáláskor a backendnek küldött adatok összeállítása |
| `providers/sessionprovider.tsx` | Pixi ref-ek és a szerkesztő munkamenet állapota |
| `stores/` | Zustand store-ok (képek, szűrők, rétegek) |

## Maszkolás

Minden réteghez tartozik egy maszk textúra (`RenderTexture`, a kép felbontásán), egy eredmény textúra és egy szűrő. A rétegek egymás után futnak: az előző réteg eredménye a következő bemenete, a maszk pedig megmondja, hol érvényesül a réteg szűrője.

Rajzolás közben (`helper/mask/useMask.ts`):

1. Az egér mozgásából a kefe méretéhez igazított távolságonként (a sugár negyede) kerül stamp a sorba, a köztes szakaszok interpolálva, így gyors húzásnál sincs lyuk, sűrű egér eseményeknél pedig nincs felesleges munka.
2. A sorban álló stamp-ek `requestAnimationFrame`-enként **egyetlen** render hívással kerülnek a *temporary* textúrára (a sprite-ok újrahasznosítva, nincs frame-enkénti allokáció).
3. A stage előnézete legfeljebb ~120 ms-onként renderelődik (`PREVIEW_INTERVAL_MS`), a stroke végén garantáltan még egyszer.
4. Az egér felengedésekor (`pointerup` / `pointerupoutside`) a temporary textúra beleíródik a réteg maszkjába, és csak ekkor fut le a drága rétegkomponálás (`applyFilters`).

A Pixi ticker szándékosan le van állítva (`app.ticker.stop()`), minden renderelést a kód explicit hív.

## Ismert TODO-k

- A maszk textúrák teljes képfelbontásúak; kisebb felbontású előnézeti maszkkal tovább csökkenthető a GPU/CPU terhelés.
- Croppolás nagyobb felbontásnál elcsúszhat (`webGlComponent.tsx`).
