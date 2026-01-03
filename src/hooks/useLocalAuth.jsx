import React, { createContext, useContext, useEffect, useState } from 'react';
import bcrypt from 'bcryptjs';

const AUTH_HASH_KEY = 'ifrix_auth_hash';
const AUTH_TOKEN_KEY = 'ifrix_auth_token';
const DEFAULT_PASSWORD_ADMIN = 'Ifrix2025#';
const DEFAULT_PASSWORD_OPERATOR = 'operador123';

const AuthContext = createContext();
export const useLocalAuth = () => useContext(AuthContext);

export const LocalAuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem(AUTH_TOKEN_KEY));
    const [userRole, setUserRole] = useState(() => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) return null;
        try {
            const obj = JSON.parse(token);
            return obj.role || null;
        } catch {
            return null;
        }
    });
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
            let role = null;
            
            // Verificar contraseña de admin
            if (password === DEFAULT_PASSWORD_ADMIN) {
                role = 'admin';
            }
            // Verificar contraseña de operador
            else if (password === DEFAULT_PASSWORD_OPERATOR) {
                role = 'operator';
            }
            // Verificar contraseña personalizada (siempre es admin)
            else {
                const hash = localStorage.getItem(AUTH_HASH_KEY);
                if (hash && bcrypt.compareSync(password, hash)) {
                    role = 'admin';
                }
            }
            
            if (role) {
                const token = JSON.stringify({ 
                    t: Date.now(), 
                    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
                    role: role
                });
                localStorage.setItem(AUTH_TOKEN_KEY, token);
                setIsAuthenticated(true);
                setUserRole(role);
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
        setUserRole(null);
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
                setUserRole(obj.role || 'admin');
            }
        } catch (e) {
            console.error('Invalid auth token', e);
            logout();
        }
    }, []);

    const value = {
        isAuthenticated,
        userRole,
        isSetup,
        loading,
        setPassword,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
