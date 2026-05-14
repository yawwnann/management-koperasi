import { API_BASE_URL } from "./apiConfig";

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/images/user/user-03.png";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  const baseUrl = API_BASE_URL.replace("/api", "");
  return `${baseUrl}${path}`;
}
