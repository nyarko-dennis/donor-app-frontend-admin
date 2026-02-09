
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { DashboardStats } from "@/types/dashboard";

const getDashboardStats = async (token: string): Promise<DashboardStats> => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const useDashboardStats = () => {
    const { data: session } = useSession();
    const token = session?.accessToken;

    return useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: () => getDashboardStats(token as string),
        enabled: !!token,
    });
};
