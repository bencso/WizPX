import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import image

app = FastAPI()

# A frontend a böngészőből közvetlenül is hívhatja a backendet (NEXT_PUBLIC_API_URL),
# ehhez CORS kell. Az engedélyezett origin-ek vesszővel elválasztva: CORS_ORIGINS
cors_origins = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ORIGINS", "http://localhost,http://localhost:3000"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Az nginx az /api előtagot leveszi, ezért a router előtag nélkül is elérhető marad,
# közvetlen hívásnál (pl. http://localhost:3001/api/images/upload) pedig az /api alatt
app.include_router(image.router)
app.include_router(image.router, prefix="/api", include_in_schema=False)


@app.get("/status")
def status():
    return JSONResponse(status_code=200, content={"status": "OK"})
