// A backend elérése: NEXT_PUBLIC_API_URL + /api (pl. http://localhost -> http://localhost/api/...).
// Ha a változó nincs megadva, relatív /api útvonalat használ (nginx mögött ugyanarra az origin-re mutat).
const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export const apiUrl = (path: string) =>
  `${apiBase}/api${path.startsWith("/") ? path : `/${path}`}`;
