// Thin typed wrapper around the FastAPI backend.

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const TOKEN_KEY = "laundry_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const detail =
      (body && (body.detail as string)) || `Error ${res.status}`;
    throw new ApiError(res.status, detail);
  }
  return body as T;
}

// ---- Types (mirror the backend schemas) ----

export type MachineType = "washer" | "dryer";
export type MachineStatus = "available" | "in_use" | "finished" | "offline";
export type QueueStatus =
  | "waiting"
  | "notified"
  | "claimed"
  | "expired"
  | "cancelled";

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Machine {
  id: number;
  type: MachineType;
  label: string;
  status: MachineStatus;
  current_user_id: number | null;
  cycle_ends_at: string | null;
  updated_at: string;
}

export interface QueueEntry {
  id: number;
  machine_type: MachineType;
  status: QueueStatus;
  assigned_machine_id: number | null;
  position: number | null;
  created_at: string;
}

export interface Notification {
  id: number;
  message: string;
  kind: string;
  read: boolean;
  created_at: string;
}

// ---- Endpoints ----

export const api = {
  register: (username: string, password: string) =>
    request<{ access_token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  login: (username: string, password: string) =>
    request<{ access_token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  me: () => request<User>("/api/auth/me"),

  machines: () => request<Machine[]>("/api/machines"),

  myQueue: () => request<QueueEntry[]>("/api/queue/me"),
  joinQueue: (type: MachineType) =>
    request<QueueEntry>("/api/queue", {
      method: "POST",
      body: JSON.stringify({ type }),
    }),
  leaveQueue: (id: number) =>
    request<void>(`/api/queue/${id}`, { method: "DELETE" }),
  claim: (id: number) =>
    request<QueueEntry>(`/api/queue/${id}/claim`, { method: "POST" }),

  notifications: () => request<Notification[]>("/api/notifications"),
  markRead: (id: number) =>
    request<Notification>(`/api/notifications/${id}/read`, { method: "POST" }),
};
