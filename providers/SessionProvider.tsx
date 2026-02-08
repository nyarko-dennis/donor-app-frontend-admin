'use client';

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { SessionProviderProps } from "next-auth/react";
import React from "react";

export default function SessionProvider({
  children,
  session,
}: Readonly<Omit<SessionProviderProps, "refetchInterval">>) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
