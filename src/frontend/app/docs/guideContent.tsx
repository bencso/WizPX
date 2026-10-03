import { ReactNode } from "react";
import {
  LuFrame,
  LuImages,
  LuImageUpscale,
  LuTag,
  LuType,
  LuVenetianMask,
} from "react-icons/lu";
import { HiAdjustments } from "react-icons/hi";
import { TbColorFilter, TbColorSwatch, TbGradienter, TbShadow, TbTemperature } from "react-icons/tb";

export interface MenuGuide {
  name: string;
  icon: ReactNode;
  summary: string;
  details: string[];
}

export const uploadSteps = [
  {
    title: "Képek feltöltése",
    description:
      "Húzd a képeket a feltöltő mezőre, vagy kattints rá és válaszd ki őket. Egyszerre legfeljebb 5 kép tölthető fel (AVIF, JPEG, PNG, TIFF, WebP).",
  },
  {
    title: "Tovább",
    description:
      "A „Tovább” gombbal megnyílik a szerkesztő. Ha több képet töltöttél fel, a bal oldali sávban mindegyik előnézete látszik.",
  },
  {
    title: "Szerkesztés",
    description:
      "A jobb oldali menüből válaszd ki a kívánt funkciót. A változások valós időben, a böngészőben jelennek meg a képen.",
  },
  {
    title: "Exportálás",
    description:
      "Az „Exportálás” gombbal állítsd be a formátumot és az EXIF adatokat, majd töltsd le az elkészült képeket.",
  },
];

export const layoutParts = [
  {
    name: "Navigáció (bal oldal)",
    description:
      "Főoldal (feltöltés és szerkesztő) és Leírás (ez az oldal). Alul: a sáv összecsukása, verzióinfó, világos/sötét mód és nyelvváltó.",
  },
  {
    name: "Képsáv",
    description:
      "Több kép esetén a feltöltött képek előnézete. Kattints egy képre a váltáshoz, a kiválasztott kép teljesen látszik, a többi halványabb.",
  },
  {
    name: "Munkaterület (közép)",
    description:
      "A szerkesztett kép előnézete. Itt rajzolhatsz maszkot, itt húzhatod a szövegeket és az overlay képet, itt állítod be a kivágást.",
  },
  {
    name: "Rétegek (a vászon bal felső sarka)",
    description:
      "A rétegek ikonra kattintva megnyílik a rétegek listája: Kép (0. réteg), új layer létrehozása, réteg kiválasztása vagy törlése.",
  },
  {
    name: "Szerkesztő menü (jobb oldal)",
    description:
      "A funkciók gombjai. Egy gombra kattintva felugrik a hozzá tartozó panel. Alul az Exportálás gomb.",
  },
];

export const menuGuides: MenuGuide[] = [
  {
    name: "Kép szöveg",
    icon: <LuTag />,
    summary: "Caption (képaláírás) szöveg az EXIF adatokból.",
    details: [
      "Csak akkor jelenik meg, ha a képhez van EXIF adat.",
      "Az „Előre létrehozott caption-ök” listából kiválaszthatsz egy mintát, az „Alkalmaz” gombbal pedig beírja a szövegmezőbe.",
      "A „Caption szöveg” mezőben szabadon szerkesztheted a szöveget. A címkékre (tag) kattintva beilleszthetsz EXIF adatokat, például a gépet, az objektívet vagy a záridőt.",
      "Emoji is beilleszthető az emoji-választóval.",
    ],
  },
  {
    name: "Maszkolás",
    icon: <LuVenetianMask />,
    summary: "Rajzolt, puha szélű maszk: a szűrők csak a maszkolt területre hatnak.",
    details: [
      "Rajzolni csak az újonnan létrehozott rétegeken lehet, a 0. rétegre (Kép) nem.",
      "Draw / Erase: rajzolás vagy törlés mód.",
      "Ecset mérete: az ecset sugara.",
      "Ecset átmente: mennyire puha az ecset széle (0 = éles, 10 = teljesen puha).",
      "Részletes leírás: lásd a Maszkolás fület.",
    ],
  },
  {
    name: "LUT",
    icon: <TbColorSwatch />,
    summary: "Look Up Table (.cube) betöltése színvilág (grading) alkalmazásához.",
    details: [
      "Húzz egy .cube fájlt a mezőre, vagy kattints és válaszd ki.",
      "A LUT az egész képre érvényes.",
      "A LUT működéséről a docs/kepszerkeszt-megertesehez.md ír részletesen.",
    ],
  },
  {
    name: "Szűrők",
    icon: <HiAdjustments />,
    summary: "Alap tónusbeállítások.",
    details: [
      "Fényerő (−100 … 100)",
      "Expozíció",
      "Kontraszt",
      "Minden csúszkánál van egy visszaállító gomb, ami az alapértékre állítja.",
    ],
  },
  {
    name: "Levels",
    icon: <TbShadow />,
    summary: "Fekete- és fehérpont, gamma, kimeneti tartomány.",
    details: [
      "Shadows: a fekete pont, ami ennél sötétebb, az fekete lesz.",
      "Midtones - Gamma: a középtónusok világossága.",
      "Highlights: a fehér pont.",
      "Output: a kimeneti tartomány (fekete és fehér szint) szűkítése, például halványabb, „matt” hatáshoz.",
    ],
  },
  {
    name: "HSV",
    icon: <TbGradienter />,
    summary: "Színárnyalat, telítettség és érték.",
    details: [
      "Hue: a színek eltolása a színkörön.",
      "Telítettség: a színek erőssége.",
      "Érték: a színek világossága.",
    ],
  },
  {
    name: "Channel mixer",
    icon: <TbColorFilter />,
    summary: "A kimeneti csatornák keverése a bemeneti csatornákból.",
    details: [
      "Piros, Zöld, Kék: kiválasztod a kimeneti csatornát, és beállítod, mennyit ad hozzá a piros, zöld és kék bemenet.",
      "Offset: a csatorna eltolása.",
    ],
  },
  {
    name: "Egyéb",
    icon: <TbTemperature />,
    summary: "Fehéregyensúly és vibrance.",
    details: [
      "Színhőmérséklet: melegebb (sárgásabb) vagy hidegebb (kékesebb) kép.",
      "Árnyalat: zöld és magenta irányú eltolás.",
      "Vibrance: a kevésbé telített színeket erősíti, a bőrtónusokat védi, így nem lesz narancssárga az arc.",
    ],
  },
  {
    name: "Szövegek",
    icon: <LuType />,
    summary: "Szöveg a fotóra.",
    details: [
      "Írd be a szöveget, és a + gombbal add hozzá. Szerkesztéskor a gomb pipára vált.",
      "Beállítható a betűtípus, a méret, a vastagság és a szín.",
      "A szöveget a munkaterületen húzással helyezheted el.",
      "A szövegek exportáláskor kerülnek rá a végleges képre.",
    ],
  },
  {
    name: "Overlay kép",
    icon: <LuImages />,
    summary: "Saját kép (például vízjel vagy logó) a fotóra.",
    details: [
      "Húzd a képet a mezőre, vagy kattints és válaszd ki.",
      "Méret és áttetszőség beállítható.",
      "Az overlay képet a munkaterületen húzással helyezheted el.",
    ],
  },
  {
    name: "Képkeret",
    icon: <LuFrame />,
    summary: "Keret a kép köré.",
    details: [
      "Képkeret méret: 0–200 között. A 0 kikapcsolja a keretet.",
      "A keret színét a színválasztóval állíthatod be (hex érték is beírható).",
    ],
  },
  {
    name: "Méretezés",
    icon: <LuImageUpscale />,
    summary: "A kép kivágása vagy átméretezése közösségi média formátumra.",
    details: [
      "Nincs: nincs átméretezés.",
      "Kivágás: szabadon kivágható terület. A kijelölés után a gombbal mented a kivágást.",
      "Átméretezés: előre beállított méretek. Instagram (Story 1080×1920, Square 1080×1080, Portrait 1080×1350, Landscape 1080×566), Facebook (Post 1200×628, Feed Landscape 1280×720, Feed Portrait 720×1280), X (Post 1200×670, Portrait 720×1280), Pinterest (Pin 735×1102, Standard Pins 1080×1620, Pin Square 1080×1080, Pin Vertical 1080×1920).",
      "Az átméretezés a képet a választott vászonra illeszti, a maradék helyet a háttérszín tölti ki (a színt a Képkeret menüben állíthatod).",
    ],
  },
];

export const shortcuts: { keys: string[]; description: string; where: string }[] = [
  {
    keys: ["←"],
    description: "Előző kép",
    where: "Szerkesztő, több kép esetén",
  },
  {
    keys: ["→"],
    description: "Következő kép",
    where: "Szerkesztő, több kép esetén",
  },
  {
    keys: ["Shift", "R"],
    description:
      "Újrakezdés: visszalép a feltöltéshez és törli az összes képet és szerkesztést",
    where: "Szerkesztő",
  },
];

export const mouseActions: { action: string; description: string }[] = [
  { action: "Kattintás a képsávon", description: "Másik kép kiválasztása." },
  {
    action: "Húzás a munkaterületen (Maszkolás)",
    description: "Maszk rajzolása vagy törlése az ecsettel, az egér felengedésekor véglegesedik.",
  },
  {
    action: "Húzás a munkaterületen (Szöveg, Overlay kép)",
    description: "A szöveg vagy az overlay kép elhelyezése.",
  },
  {
    action: "Húzás a munkaterületen (Kivágás)",
    description: "A kivágási keret mozgatása és átméretezése.",
  },
  {
    action: "Csúszka húzása",
    description: "Az érték valós időben látszik a képen, a gomb mellett a visszaállító ikon az alapértékre állít.",
  },
];

export const maskSteps = [
  {
    title: "Új réteg",
    description:
      "Nyisd meg a rétegek listáját (a vászon bal felső sarkában lévő ikon), és kattints az „Új layer” gombra. Az új réteg automatikusan kijelölődik.",
  },
  {
    title: "Szűrők beállítása a rétegen",
    description:
      "Amíg a réteg ki van választva, a Szűrők, Levels, HSV, Channel mixer és Egyéb menü értékei erre a rétegre vonatkoznak. A hatás csak a maszkolt területen látszik.",
  },
  {
    title: "Rajzolás",
    description:
      "A Maszkolás menüben válaszd a Draw módot, állítsd be az ecset méretét és átmenetét, majd rajzolj a képre. Rajzolás közben egy gyors előnézet látszik, az egér felengedésekor a maszk véglegesedik, és a réteg szűrői ráhatnak a területre.",
  },
  {
    title: "Javítás",
    description:
      "Az Erase móddal törölheted a maszk egy részét. Ugyanazt a réteget bármikor újra kiválaszthatod és folytathatod a rajzolást.",
  },
];

export const faq: { question: string; answer: string }[] = [
  {
    question: "Miért nem tudok rajzolni a 0. (Kép) rétegen?",
    answer:
      "A 0. réteg az alapréteg, ahol a teljes képre ható szűrők vannak. Maszkot csak új rétegen lehet rajzolni: hozz létre egy új layert, és jelöld ki.",
  },
  {
    question: "Miért lassú vagy akadozik a rajzolás nagy képen?",
    answer:
      "A maszk a kép teljes felbontásán készül, ezért nagy képnél a véglegesítés (az egér felengedése) több időt vehet igénybe. Rajzolás közben csak gyors előnézet frissül.",
  },
  {
    question: "Mit jelent az Optimalizálás az exportálásnál?",
    answer:
      "Bekapcsolva a kép kisebb fájlmérettel (alacsonyabb minőségű tömörítéssel) kerül mentésre, és az EXIF adatok nem kerülnek bele.",
  },
  {
    question: "Nem látom az EXIF adatokat.",
    answer:
      "Nem minden képben van EXIF adat (például képernyőmentésekben vagy más programból exportált képekben nincs). Ilyenkor a Kép szöveg menü nem jelenik meg, az exportnál pedig a „Nincs EXIF adat ehhez a képhez” üzenet látszik.",
  },
  {
    question: "Elvesznek a szerkesztések, ha frissítem az oldalt?",
    answer:
      "Igen, a munkamenet a böngészőben él, nincs szerveroldali mentés. Frissítés vagy az Újrakezdés előtt exportáld az elkészült képeket.",
  },
  {
    question: "Hány képet dolgozhatok fel egyszerre?",
    answer: "Legfeljebb 5 képet. Az exportnál kiválaszthatod az egyes képeket vagy az „Összes kép” opciót.",
  },
];

export const exportOptions = [
  { name: "Kép kiválasztása", description: "Egy konkrét kép vagy az „Összes kép”." },
  { name: "EXIF adatok", description: "Kiválaszthatod, mely EXIF adatok maradjanak a képben. Kereshetsz is köztük." },
  { name: "Formátum", description: "JPG, PNG, BMP, WebP, GIF vagy TIFF." },
  { name: "Optimalizálás", description: "Kisebb fájlméret alacsonyabb minőséggel, EXIF adatok nélkül." },
];
