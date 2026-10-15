<a id="top"></a>

<div align="center">
<p align="center">
  <img width="100" height="100" alt="logo" src="https://github.com/user-attachments/assets/b7e4ebc4-a290-4c5d-8c10-047d5ec3457d" />
</p>
  <h2>Gyorsítsd fel a fotós workflow-d!</h2>
  <p><em>EXIF adatok kinyerése és manipulálása, képszerkesztés és közösségi médiára felkészítés egy helyen.</em></p>
<p align="center">
  <a href="../README.md#technologiak">Technológiák</a> |
  <a href="../README.md#roadmap">Roadmap</a> |
  <a href="../README.md#architektura">Architektúra</a> |
  <a href="START_DEV.md"><strong>Első indítás (Fejlesztői)</strong></a> |
  <a href="../README.md#screenshot">Screenshot</a> |
  <a href="../README.md#kozremukodes">Közreműködés</a> |
</p>
</div>

---

## Első indítás - Dev setup

### Követelmények

- Docker + Docker Compose

### 0. GitHub Repository leklónozása

```bash
git clone https://github.com/bencso/WizPX.git
cd WizPX/src
```

> [!NOTE]
> Minden további parancsot a `src/` mappából kell futtatni, itt van a `compose.yml`.

### 1. `.env` fájlok létrehozása

A `compose.yml` mindkét szolgáltatásnál `env_file`-t vár, ezért a fájloknak léteznie kell. Másold le a mintákat:

```bash
cp ./frontend/.env.example ./frontend/.env
cp ./backend/.env.example ./backend/.env
```

> [!NOTE]
> - `frontend/.env`: a `NEXT_PUBLIC_API_URL` a backend **teljes elérési alapja**, a frontend ehhez fűzi hozzá az útvonalat (`NEXT_PUBLIC_API_URL + /images/upload`, `/images/export`). Nginx mögött (Docker Compose, `http://localhost`) értéke `/api`, mert az nginx a `/api` előtagot leveszi és továbbítja a backendnek. A backendet közvetlenül is hívhatod (`NEXT_PUBLIC_API_URL=http://localhost:3001`), ilyenkor a böngészőből elérhető címet kell megadni (a Docker-belső `http://backend:3001` nem az), és CORS kell (lásd lent). A változó kötelező, nélküle a hívások a frontend saját útvonalára mennének.
> - `backend/.env`: `CORS_ORIGINS` (vesszővel elválasztva) azok az origin-ek, amelyekről a böngésző közvetlenül hívhatja a backendet. Alapértelmezés: `http://localhost,http://localhost:3000`. Az nginx-en keresztüli hívásnál (`/api`) nincs szükség CORS-ra, mert egy origin-ről jön a frontend és az API is. A backend maga nem ismeri az `/api` előtagot. Ugyanitt állíthatók a feltöltési korlátok: `MAX_UPLOAD_MB` (fájlonként, alapértelmezés 100) és `MAX_IMAGE_MEGAPIXELS` (alapértelmezés 100). A korlát feletti feltöltésre a backend 413-as választ ad.
> - A fájlok akkor is kellenek, ha üresek, mert a `compose.yml` `env_file`-ként hivatkozik rájuk.

---

### 2. Build + indítás

```bash
docker compose up --build
```

- A `--build` mindig újraépíti a frontend és backend image-eket.
- Ha csak a kód változik, de a Dockerfile nem, elég az alábbi parancs:

```bash
docker compose up
```

---

### 3. Elérés

| Szolgáltatás | URL                                                  |
| ------------ | ---------------------------------------------------- |
| Frontend (nginx-en keresztül) | [http://localhost](http://localhost) |
| Frontend (közvetlenül)        | [http://localhost:3000](http://localhost:3000) |
| Backend API  | [http://localhost/api](http://localhost/api)         |
| Backend státusz | [http://localhost/api/status](http://localhost/api/status) |

---

### 4. Konténerek állapotának ellenőrzése

```bash
docker compose ps
docker compose logs -f
```

> [!NOTE]
> Kódfrissítéshez **volumes miatt** nem kell újra buildelni. Dockerfile vagy `package.json` / `requirements.txt` módosítása után viszont igen (`docker compose up --build`).

---

### Konténerek leállítása / újraindítása

```bash
# Leállítás és network törlés
docker compose down

# Csak újraindítás (network és volumes megmarad)
docker compose restart
```

---

### Futtatás Docker nélkül (opcionális)

**Frontend**

```bash
cd src/frontend
npm install
npm run dev
```

**Backend** (Python 3.14, `libvips` szükséges)

```bash
cd src/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 3001
```

Ebben az esetben az nginx nincs a háttérben, ezért a `frontend/.env`-ben `NEXT_PUBLIC_API_URL=http://localhost:3001` kell (és a backend `CORS_ORIGINS`-ében szerepelnie kell a frontend origin-jének, alapból a `http://localhost:3000` benne van).
