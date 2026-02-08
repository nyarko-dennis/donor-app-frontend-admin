import { useSession } from "next-auth/react";

export function useAccessToken() {
    const { data: session, status } = useSession();
    const accessToken = session?.accessToken;
    const isReady = status !== "loading";
    const isAuthenticated = status === "authenticated";

    return {
        accessToken,
        isReady,
        isAuthenticated,
        session,
        status
    };
}
