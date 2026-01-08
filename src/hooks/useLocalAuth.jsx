import React, { createContext, useContext, useEffect, useState } from 'react';
import bcrypt from 'bcryptjs';
import { findUserByPassword } from '../services/monitorService';

const AUTH_HASH_KEY = 'ifrix_auth_hash';
const AUTH_TOKEN_KEY = 'ifrix_auth_token';
const DEFAULT_PASSWORD_ADMIN = 'Ifrix2025#';
const DEFAULT_PASSWORD_OPERATOR = 'operador123';

const AuthContext = createContext();
export const useLocalAuth = () => useContext(AuthContext);

export const LocalAuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [userRole, setUserRole] = useState('admin');
    const [userData, setUserData] = useState({
        name: 'Admin',
        branchId: 1,
        monitorUser: false
    });
    const [isSetup, setIsSetup] = useState(true);
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
            let userData = null;

            // Verificar contraseña de admin
            if (password === DEFAULT_PASSWORD_ADMIN) {
                role = 'admin';
                // Admin no tiene branchId específico, puede ver todas
                userData = {
                    name: 'Administrador',
                    branchId: null, // null significa acceso a todas las sucursales
                    monitorUser: false
                };
            }
            // Verificar contraseña de operador
            else if (password === DEFAULT_PASSWORD_OPERATOR) {
                role = 'operator';
                // Operador predeterminado se asigna a la primera sucursal disponible
                userData = {
                    name: 'Operador',
                    branchId: 1, // Sucursal Huérfanos por defecto
                    monitorUser: false
                };
            }
            // Verificar contraseña personalizada (siempre es admin)
            else {
                const hash = localStorage.getItem(AUTH_HASH_KEY);
                if (hash && bcrypt.compareSync(password, hash)) {
                    role = 'admin';
                    userData = {
                        name: 'Admin',
                        branchId: null,
                        monitorUser: false
                    };
                }
            }

            // Si no es usuario predefinido, verificar usuarios del Monitor en Supabase
            if (!role) {
                try {
                    const user = await findUserByPassword(password);
                    if (user) {
                        // Mapear rol del monitor al sistema
                        if (user.role === 'admin') role = 'admin';
                        else if (user.role === 'technician') role = 'technician';
                        else role = 'operator';

                        userData = {
                            name: user.name,
                            branchId: user.branchId,
                            monitorUser: true
                        };
                    }
                } catch (error) {
                    console.error('Error fetching user from Supabase:', error);
                }

                // Fallback: verificar en localStorage (para compatibilidad temporal)
                if (!role) {
                    const monitorData = localStorage.getItem('monitor_v11_0_user_edit');
                    if (monitorData) {
                        try {
                            const data = JSON.parse(monitorData);
                            const user = data.users?.find(u => u.pass === password);
                            if (user) {
                                if (user.role === 'admin') role = 'admin';
                                else if (user.role === 'technician') role = 'technician';
                                else role = 'operator';

                                userData = {
                                    name: user.name,
                                    branchId: user.branchId,
                                    monitorUser: true
                                };
                            }
                        } catch (e) {
                            console.error('Error parsing monitor data', e);
                        }
                    }
                }
            }

            if (role) {
                const token = JSON.stringify({
                    t: Date.now(),
                    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
                    role: role,
                    userData: userData
                });
                localStorage.setItem(AUTH_TOKEN_KEY, token);
                setIsAuthenticated(true);
                setUserRole(role);
                setUserData(userData);
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
        setUserData(null);
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
                setUserData(obj.userData || null);
            }
        } catch (e) {
            console.error('Invalid auth token', e);
            logout();
        }
    }, []);

    const value = {
        isAuthenticated,
        userRole,
        userData,
        isSetup,
        loading,
        setPassword,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
