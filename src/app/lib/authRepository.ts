import { extractErrorMessage } from "./spotRepository";

export interface SessionUser {
  id: string;
  email: string | null;
  username: string | null;
  homeCity: string | null;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface SignUpParams {
  username: string;
  email: string;
  password: string;
  homeCity?: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const response = await fetch("/api/auth/session");

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  const { user } = await response.json();
  return user;
}

export async function signIn(params: SignInParams): Promise<void> {
  const response = await fetch("/api/auth/sign-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }
}

export async function signUp(params: SignUpParams): Promise<void> {
  const response = await fetch("/api/auth/sign-up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }
}

export async function signOut(): Promise<void> {
  const response = await fetch("/api/auth/sign-out", { method: "POST" });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }
}
