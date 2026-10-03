<a id="top"></a>

<div align="center">
<p align="center">
  <img width="100" height="100" alt="logo" src="https://github.com/user-attachments/assets/b7e4ebc4-a290-4c5d-8c10-047d5ec3457d" />
</p>
  <h2>Gyorsítsd fel a fotós workflow-d!</h2>
  <p><em>EXIF adatok kinyerése és manipulálása, képszerkesztés és közösségi médiára felkészítés egy helyen.</em></p>
<p align="center">
  <a href="/README.md#technológiák">Technológiák</a> |
  <a href="/README.md#roadmap">Roadmap</a> |
  <a href="/README.md#architektúra">Architektúra</a> |
  <a href="/docs/START_DEV.md"><strong>Első indítás (Fejlesztői)</strong></a> |
  <a href="/README.md#screenshot">Screenshot</a> |
  <a href="/README.md#közreműködés">Közreműködés</a> |
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
> - `frontend/.env`: a mintában `NEXT_PUBLIC_API_URL=/api` szerepel. Jelenleg a frontend kód nem olvassa, az API hívások fix `/api/...` útvonalra mennek, amit az nginx a backendre irányít.
> - `backend/.env`: a minta üres, a backend jelenleg nem használ környezeti változót.
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

Ebben az esetben az nginx nincs a háttérben, ezért a frontendnek a `/api` útvonalat külön kell a backendre irányítani.
