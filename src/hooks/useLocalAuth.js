import React, { createContext, useContext, useEffect, useState } from 'react';
import bcrypt from 'bcryptjs';

const AUTH_HASH_KEY = 'ifrix_auth_hash';
const AUTH_TOKEN_KEY = 'ifrix_auth_token';

const AuthContext = createContext();
export const useLocalAuth = () => useContext(AuthContext);

export const LocalAuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem(AUTH_TOKEN_KEY));
    const [isSetup, setIsSetup] = useState(() => !!localStorage.getItem(AUTH_HASH_KEY));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsSetup(!!localStorage.getItem(AUTH_HASH_KEY));
    }, []);

    const setPassword = async (password) => {
        setLoading(true);
        try {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            localStorage.setItem(AUTH_HASH_KEY, hash);
            setIsSetup(true);
            return true;
        } finally {
            setLoading(false);
        }
    };

    const login = async (password) => {
        setLoading(true);
        try {
            const hash = localStorage.getItem(AUTH_HASH_KEY);
            if (!hash) return false;
            const ok = bcrypt.compareSync(password, hash);
            if (ok) {
                // crear token simple (no JWT) con expiración
                const token = JSON.stringify({ t: Date.now(), exp: Date.now() + 1000 * 60 * 60 * 24 * 7 }); // 7 days
                localStorage.setItem(AUTH_TOKEN_KEY, token);
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setIsAuthenticated(false);
    };

    // Comprobar token con expiración
    useEffect(() => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) return setIsAuthenticated(false);
        try {
            const obj = JSON.parse(token);
            if (obj.exp && Date.now() > obj.exp) {
                logout();
            } else {
                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error('Invalid auth token', e);
            logout();
        }
    }, []);

    const value = {
        isAuthenticated,
        isSetup,
        loading,
        setPassword,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
