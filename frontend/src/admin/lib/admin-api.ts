const API_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:3001") + "/api/admin";

const getToken = (): string | null => {
  try {
    const stored = localStorage.getItem("gkmart.admin.auth.v1");
    if (!stored) return null;
    return JSON.parse(stored)?.token ?? null;
  } catch {
    return null;
  }
};

export async function adminFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent("admin:unauthorized"));
    }
    throw new Error(body?.message ?? `Request failed: ${response.status}`);
  }

  return response.json();
}

export async function adminUpload(path: string, formData: FormData): Promise<unknown> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent("admin:unauthorized"));
    }
    throw new Error(body?.message ?? `Upload failed: ${response.status}`);
  }

  return response.json();
}
