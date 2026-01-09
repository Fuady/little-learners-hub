/**
 * Token storage utility for managing JWT tokens
 */

const TOKEN_KEY = 'kidlearn_access_token';

export const tokenStorage = {
    /**
     * Store authentication token
     */
    setToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    },

    /**
     * Retrieve authentication token
     */
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },

    /**
     * Remove authentication token
     */
    removeToken(): void {
        localStorage.removeItem(TOKEN_KEY);
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.getToken();
    },
};
