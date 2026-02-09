import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        user: {
            id: string;
            role: string;
            isTwoFactorSetupRequired?: boolean;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: string;
        accessToken?: string;
        isTwoFactorAuthenticationRequired?: boolean;
        isTwoFactorSetupRequired?: boolean;
        message?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        id?: string;
        role?: string;
        isTwoFactorSetupRequired?: boolean;
    }
}
