<a id="top"></a>

<div align="center">
<p align="center">
    <img width="100" height="100" alt="logo" src="https://github.com/user-attachments/assets/b7e4ebc4-a290-4c5d-8c10-047d5ec3457d" />
</p>
  <h2>Gyorsítsd fel a fotós workflow-d!</h2>
  <p><em>EXIF adatok kinyerése és manipulálása, képszerkesztés és közösségi médiára felkészítés egy helyen.</em></p>
<p align="center">
  <a href="#technológiák">Technológiák</a> |
  <a href="#roadmap">Roadmap</a> |
  <a href="#architektúra">Architektúra</a> |
  <a href="/docs/START_DEV.md">Első indítás (Fejlesztői)</a> |
  <a href="#screenshot">Screenshot</a> |
  <a href="#közreműködés">Közreműködés</a> |
</p>
</div>

---

## Vízió

> **Cél:** Megkönnyíteni a fotósok közösségi média munkafolyamatát – hogy az alapvető feladatokhoz ne legyen szükség professzionális képszerkesztő szoftverekre.

Az **WizPX** segítségével a fotósok *percek alatt* közösségi médiára kész képeket hozhatnak létre, egy egyszerű és átlátható webes felületen.

### Főbb funkciók:

#### Feldolgozás
- Drag & drop feltöltés, egyszerre legfeljebb 5 kép (`AVIF`, `JPG`, `PNG`, `TIFF`, `WebP`)
- EXIF adatok kinyerése, ezekből caption-ök generálása (a szövegnél is elérhető)

#### Szerkesztés
- **Színkorrekció:** expozíció, fényerő, kontraszt, színhőmérséklet, tint, telítettség, vibrance (bőrtónus védelemmel), hue, value, levels, gamma
- **Channel mixer**
- **LUT** használata
- **Maszkolás:** rétegenként egérrel rajzolt, puha szélű maszk (rajzolás / törlés mód, állítható kefeméret és élesség), a szűrők csak a maszkolt területre hatnak
- A szerkesztés előnézete valós időben, a böngészőben (WebGL) fut

#### Kompozíció
- Közösségi média méretek (Instagram, Facebook, X) – expand / crop
- Képkeret
- Szöveg a fotóra, vízjel / saját copyright kép

#### Export
- `JPG`, `PNG`, `BMP`, `WebP`, `GIF`, `TIFF`
- Több kép exportálása egyszerre

#### Tervezett
- `HEIC` támogatás
- LUT készítése a webes felületen

<p align="right"><a href="#top">Vissza a tetejére</a></p>

---

## Gyors indítás

```bash
git clone https://github.com/bencso/WizPX.git
cd WizPX/src
cp ./frontend/.env.example ./frontend/.env
cp ./backend/.env.example ./backend/.env
docker compose up --build
```

Ezután a frontend a [http://localhost](http://localhost) címen érhető el. A részletes leírás: [`docs/START_DEV.md`](docs/START_DEV.md).

---

## Dokumentáció

| Dokumentum | Tartalom |
|---|---|
| [`docs/START_DEV.md`](docs/START_DEV.md) | Fejlesztői környezet indítása (Docker és Docker nélkül) |
| Beépített útmutató (`/docs`, a „Leírás” menüpont) | Felhasználói guide: felület, menüpontok, billentyűparancsok, maszkolás, exportálás |
| [`src/frontend/README.md`](src/frontend/README.md) | Frontend felépítés, a maszkrajzolás működése |
| [`docs/kepszerkeszt-megertesehez.md`](docs/kepszerkeszt-megertesehez.md) | A szűrők mögötti matematika és GLSL implementációk (LUT, HSV, levels, channel mixer, white balance, vibrance) |

## Projektszerkezet

```text
src/
├── frontend/   Next.js + Chakra UI + Pixi.js (szerkesztőfelület)
├── backend/    FastAPI + pyvips / Pillow (export, LUT, maszk, vízjel, keret)
├── nginx/      reverse proxy (/ → frontend, /api → backend)
└── compose.yml
docs/           fejlesztői dokumentáció
```

<p align="right"><a href="#top">Vissza a tetejére</a></p>

---

## Technológiák

|     Terület     |                           Technológia                           |                     Miért?                     |
|:---------------:|:---------------------------------------------------------------:|:---------------------------------------------:|
| *Frontend*      | ![nextjs](https://www.readmecodegen.com/api/social-icon?name=nextjs&size=40&shape=circle&reverseBackground=true&textAlignment=horizontal&showText=true&textColor=%237e7f7f) | Gyors, reszponzív UI komponensek React alapokon |
| *UI library*    | ![chakraui](https://www.readmecodegen.com/api/social-icon?name=chakraui&size=40&shape=circle&reverseBackground=true&textAlignment=horizontal&showText=true&textColor=%237e7f7f) |  |
| *Képfeldolgozás (böngésző)* | Pixi.js (WebGL / GLSL) | Valós idejű szűrők és maszkok GPU-n |
| *Backend*       | ![fastapi](https://www.readmecodegen.com/api/social-icon?name=fastapi&size=40&shape=circle&reverseBackground=true&textAlignment=horizontal&showText=true&textColor=%237e7f7f) | Modern Python REST API, az exportált kép előállítása (pyvips + Pillow) |
| *Futtatás*      | ![docker](https://www.readmecodegen.com/api/social-icon?name=docker&size=40&shape=circle&reverseBackground=true&textAlignment=horizontal&showText=true&textColor=%237e7f7f) | Könnyen telepíthető, konténerezett környezet    |

<p align="right"><a href="#top">Vissza a tetejére</a></p>

---

## Roadmap

```mermaid
---
config:
  look: handDrawn
  layout: elk
---
flowchart LR
 subgraph MVP["<br>"]
        m1["Több fájl támogatás - JPG, PNG, HEIC"]
        m2["EXIF + caption generálás"]
        m3["Kép méret optimalizálás"]
        m4["Testreszabható vízjel"]
        m5["Kép szerkesztés"]
        m6["LUT kezelések"]
  end
 subgraph WEB["<br>"]
        w1["Drag & Drop feltöltés"]
        w2["Kép szerkesztés"]
        w3["Vízjel pozíció/méret"]
        w4["Szöveg elhelyezés"]
        w5["Előnézet"]
        w6["FastAPI API\nfolyamatban"]
  end
 subgraph ADV["</br>"]
        a1["Saját galéria"]
        a2["Térkép képekhez"]
        a3["OAuth2 autentikáció"]
        a4["LUT generálás WEBes felületen keresztül (amit fel lehet használni majd a fotókhoz - mentheti a felhasználó ezeket)"]
  end
    Start["Projekt indulás"] --> MVP
    MVP --> WEB
    WEB --> ADV
    ADV --> End(["Release"])

    Start@{ shape: terminal}
    style MVP fill:#C8E6C9,color:#00C853
    style WEB fill:#FFE0B2
    style ADV fill:#FFCDD2
```

**Kiemelt feature táblázat**

| Funkció | Státusz |
|--------|--------|
| EXIF kinyerés | ✅ Kész |
| Caption generálás | ✅ Kész |
| Vízjel | ✅ Kész |
| Cropolás / Expandolás | ✅ Kész |
| Képkeret funkció | ✅ Kész |
| Szerkesztés (szűrők, channel mixer) | ✅ Kész |
| Maszkolás (rajzolt maszk rétegek) | 🟡 Folyamatban (teljesítmény optimalizálás) |
| LUT használata / készítése | 🟡 Folyamatban |

<p align="right"><a href="#top">Vissza a tetejére</a></p>

---

## Architektúra

```mermaid
---
config:
  look: handDrawn
---
flowchart LR
 subgraph Frontend["Frontend"]
        NextJS["Next.js App"]
  end
 subgraph Backend["Backend"]
        API["Python FastAPI"]
  end
 subgraph subGraph4["Docker Hálózat"]
        Nginx["Nginx Reverse Proxy"]
        Frontend
        Backend
  end
    User["Felhasználó / Böngésző"] -- HTTP --> Nginx
    Nginx -- / --> NextJS
    Nginx -- /api --> API
    NextJS -- "Export: eredeti kép + paraméterek + maszkok" --> API
    API -- "pyvips / Pillow" --> Export["Exportált kép"]
```

> A szerkesztés előnézete teljesen a böngészőben (Pixi.js / WebGL) fut. A backend állapotmentes, nincs adatbázis és nincs tartós fájltárolás: az exportálásnál a kép és a szerkesztési paraméterek (szűrők, LUT, maszkok, szöveg, vízjel, keret) érkeznek meg, és a kész kép megy vissza válaszként.

<p align="right"><a href="#top">Vissza a tetejére</a></p>

---

## Screenshot

> [!WARNING]
> **BÉTA verzió (2026.05.21)** – hibák előfordulhatnak!

<img width="1566" height="990" max-width="100%" alt="Képernyőfotó" src="https://github.com/user-attachments/assets/371d819d-5ec4-4a6e-919b-b9ebd607273c" />

</br>
<p align="right"><a href="#top">Vissza a tetejére</a></p>

---

## Közreműködés

A projekt jelenleg **fejlesztés alatt** áll, ezért külső hozzájárulás még nem elérhető.

**Későbbiekben**:

* PR-ek fogadása
* Hibajelentés és feature javaslatok
* `CONTRIBUTING.md` dokumentáció

<p align="center">
  <img src="https://contrib.rocks/image?repo=bencso/WizPX" />
</p>

<p align="right"><a href="#top">Vissza a tetejére</a></p>

---

<div align="center">

![verzio](https://forthebadge.com/api/badges/generate?panels=2&primaryLabel=VERZI%C3%93&secondaryLabel=0.01&primaryBGColor=%2368bcd1&primaryTextColor=%23FFFFFF&secondaryBGColor=%23273b41&secondaryTextColor=%23FFFFFF&primaryFontSize=12&primaryFontWeight=600&primaryLetterSpacing=2&primaryFontFamily=Montserrat&primaryTextTransform=uppercase&secondaryFontSize=12&secondaryFontWeight=900&secondaryLetterSpacing=0&secondaryFontFamily=Verdana&secondaryTextTransform=uppercase)
&nbsp;
![statusz](https://forthebadge.com/api/badges/generate?panels=2&primaryLabel=ST%C3%81TUSZ&secondaryLabel=FOLYAMATBAN&primaryBGColor=%2368bcd1&primaryTextColor=%23FFFFFF&secondaryBGColor=%23273b41&secondaryTextColor=%23FFFFFF&primaryFontSize=12&primaryFontWeight=600&primaryLetterSpacing=2&primaryFontFamily=Montserrat&primaryTextTransform=uppercase&secondaryFontSize=12&secondaryFontWeight=900&secondaryLetterSpacing=0&secondaryFontFamily=Verdana&secondaryTextTransform=uppercase)
&nbsp;
![celkituzes](https://forthebadge.com/api/badges/generate?panels=2&primaryLabel=C%C3%89L+D%C3%81TUM&secondaryLabel=2026+Q2&primaryBGColor=%2368bcd1&primaryTextColor=%23FFFFFF&secondaryBGColor=%23273b41&secondaryTextColor=%23FFFFFF&primaryFontSize=12&primaryFontWeight=600&primaryLetterSpacing=2&primaryFontFamily=Montserrat&primaryTextTransform=uppercase&secondaryFontSize=12&secondaryFontWeight=900&secondaryLetterSpacing=0&secondaryFontFamily=Verdana&secondaryTextTransform=uppercase)

</div>
