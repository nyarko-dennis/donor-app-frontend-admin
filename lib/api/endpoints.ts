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
        changePassword: `${API_BASE_URL}/auth/change-password`, // Request body: { "currentPassword": "OldPassword123!", "newPassword": "NewSecurePassword123!" }
    },

    users: {
        getUsers: `${API_BASE_URL}/users`,
        getUserById: (id: string) => `${API_BASE_URL}/users/${id}`,
        createUser: `${API_BASE_URL}/users`,
        updateUser: (id: string) => `${API_BASE_URL}/users/${id}`,
        deleteUser: (id: string) => `${API_BASE_URL}/users/${id}`,
    },

};
