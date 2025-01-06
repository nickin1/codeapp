'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface User {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    isAdmin: boolean;
    isActivated: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    login: async () => { },
    logout: async () => { },
    setUser: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (session?.user) {
            setUser({
                id: session.user.id,
                email: session.user.email ?? null,
                name: session.user.name ?? null,
                image: session.user.image ?? null,
                isAdmin: session.user.isAdmin || false,
                isActivated: session.user.isActivated || false,
            });
        } else if (status === 'unauthenticated') {
            setUser(null);
        }
    }, [session, status]);

    const login = async () => {
        await signIn('github', { callbackUrl: '/' });
    };

    const logout = async () => {
        await signOut({ callbackUrl: '/' });
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading: status === 'loading',
            login,
            logout,
            setUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext); 