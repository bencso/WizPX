const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export const apiUrl = (path: string) =>
  `${apiBase}${path.startsWith("/") ? path : `/${path}`}`;
