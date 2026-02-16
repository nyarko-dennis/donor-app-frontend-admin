
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { useApiQuery } from "@/lib/query/base/use-api-query"; // Not used directly as this is a mutation, but good to have
import { useSession } from "next-auth/react";
import axios from "axios";

interface ChangePasswordParams {
    oldPassword?: string;
    newPassword?: string;
}

export function useChangePassword() {
    const { data: session } = useSession();

    return useMutation({
        mutationFn: async (params: ChangePasswordParams) => {
            if (!session?.accessToken) {
                throw new Error("No access token");
            }

            const response = await axios.post(
                API_ENDPOINTS.auth.changePassword,
                params,
                {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`
                    }
                }
            );
            return response.data;
        },
        onSuccess: () => {
            toast.success("Password changed successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to change password");
        }
    });
}
