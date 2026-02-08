'use client';

// A simple single-flight guard to ensure signOut (and related UX) only runs once
// across concurrent requests/components.
import { signOut } from 'next-auth/react';

let signingOut = false;
let sessionToastShown = false;

export function isSigningOut(): boolean {
  return signingOut;
}

export async function triggerSignOutOnce(callbackUrl: string): Promise<void> {
  if (signingOut) return;
  signingOut = true;
  try {
    await signOut({ redirect: true, callbackUrl });
  } catch {
    // ignore
  }
}

export function notifySessionExpiredOnce(notify: () => void): void {
  if (sessionToastShown) return;
  sessionToastShown = true;
  try {
    notify();
  } catch {
    // ignore
  }
}
