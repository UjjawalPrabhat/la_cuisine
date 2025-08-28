import { create } from 'zustand';
import {User} from "@/type";
import {getCurrentUser, signOut} from "@/lib/appwrite";

type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;

    fetchAuthenticatedUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,
    isLoading: true,

    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    setUser: (user) => set({ user }),
    setLoading: (value) => set({isLoading: value}),

    fetchAuthenticatedUser: async () => {
        set({isLoading: true});

        try {
            const user = await getCurrentUser();

            if(user) {
                set({ isAuthenticated: true, user: user as User });
            } else {
                set({ isAuthenticated: false, user: null });
            }
        } catch (e) {
            // Security: Only log in development, don't expose sensitive details
            if (__DEV__) {
                console.error('fetchAuthenticatedUser error details:', e);
            }
            set({ isAuthenticated: false, user: null });
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        try {
            await signOut();
            set({ isAuthenticated: false, user: null });
        } catch (e) {
            // Security: Only log in development, don't expose sensitive details  
            if (__DEV__) {
                console.error('logout error details:', e);
            }
            // Even if signOut fails, clear local state for security
            set({ isAuthenticated: false, user: null });
        }
    }
}))

export default useAuthStore;
