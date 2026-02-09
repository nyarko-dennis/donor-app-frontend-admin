// Ensure the base URL is always absolute (has protocol) and has no trailing slash.
function normalizeBaseUrl(url: string | undefined): string {
    // Default API base fallback
    let base = (url && url.trim()) ? url.trim() : 'https://community-hub-portal-backend-137748040614.us-central1.run.app';

    // If protocol is missing (e.g., "localhost:3000"), default to http://
    if (!/^https?:\/\//i.test(base)) {
        base = `http://${base}`;
    }

    // Remove any trailing slashes to avoid double slashes when joining paths
    base = base.replace(/\/+$/, '');

    return base;
}

const API_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_DEV_URL);

export const API_ENDPOINTS = {
    auth: {
        login: `${API_BASE_URL}/auth/login`,
        forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
        resetPassword: `${API_BASE_URL}/auth/reset-password`,
        profile: `${API_BASE_URL}/auth/profile`,
        changePassword: `${API_BASE_URL}/auth/change-password`,

        generate2FA: `${API_BASE_URL}/auth/2fa/generate`,
        turnOn2FA: `${API_BASE_URL}/auth/2fa/turn-on`,
    },

    users: {
        getUsers: `${API_BASE_URL}/users`,
        getUserById: (id: string) => `${API_BASE_URL}/users/${id}`,
        createUser: `${API_BASE_URL}/users`,
        updateUser: (id: string) => `${API_BASE_URL}/users/${id}`,
        deleteUser: (id: string) => `${API_BASE_URL}/users/${id}`,
    },

    campaigns: {
        getCampaigns: `${API_BASE_URL}/campaigns`,
        getCampaignById: (id: string) => `${API_BASE_URL}/campaigns/${id}`,
        createCampaign: `${API_BASE_URL}/campaigns`,
        updateCampaign: (id: string) => `${API_BASE_URL}/campaigns/${id}`, // Assumed, though not explicitly in controller, good to have standard
        deleteCampaign: (id: string) => `${API_BASE_URL}/campaigns/${id}`,
    },

    donors: {
        getDonors: `${API_BASE_URL}/donors`,
        getDonorById: (id: string) => `${API_BASE_URL}/donors/${id}`,
        createDonor: `${API_BASE_URL}/donors`,
        updateDonor: (id: string) => `${API_BASE_URL}/donors/${id}`, // Assumed
        deleteDonor: (id: string) => `${API_BASE_URL}/donors/${id}`,
    },

    donations: {
        getDonations: `${API_BASE_URL}/donations`,
        getDonationById: (id: string) => `${API_BASE_URL}/donations/${id}`,
        createDonation: `${API_BASE_URL}/donations`,
        updateDonation: (id: string) => `${API_BASE_URL}/donations/${id}`, // Assumed
        deleteDonation: (id: string) => `${API_BASE_URL}/donations/${id}`,
    },

    donationCauses: {
        getDonationCauses: `${API_BASE_URL}/donation-causes`,
        getDonationCauseById: (id: string) => `${API_BASE_URL}/donation-causes/${id}`,
        createDonationCause: `${API_BASE_URL}/donation-causes`,
        updateDonationCause: (id: string) => `${API_BASE_URL}/donation-causes/${id}`,
        deleteDonationCause: (id: string) => `${API_BASE_URL}/donation-causes/${id}`,
    },

    constituencies: {
        getConstituencies: `${API_BASE_URL}/constituencies`,
        getConstituencyById: (id: string) => `${API_BASE_URL}/constituencies/${id}`,
        createConstituency: `${API_BASE_URL}/constituencies`,
        updateConstituency: (id: string) => `${API_BASE_URL}/constituencies/${id}`,
        deleteConstituency: (id: string) => `${API_BASE_URL}/constituencies/${id}`,
        getSubConstituencies: `${API_BASE_URL}/constituencies/sub-constituencies/all`,
        getSubConstituencyById: (id: string) => `${API_BASE_URL}/constituencies/sub-constituencies/${id}`,
        createSubConstituency: (id: string) => `${API_BASE_URL}/constituencies/${id}/sub-constituencies`,
        updateSubConstituency: (id: string) => `${API_BASE_URL}/constituencies/sub-constituencies/${id}`,
        deleteSubConstituency: (id: string) => `${API_BASE_URL}/constituencies/sub-constituencies/${id}`,
    },

    dashboard: {
        getStats: `${API_BASE_URL}/dashboard/stats`,
    },

};
