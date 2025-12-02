import React, { useState } from 'react';
import { useLocalAuth } from '../../hooks';

export const Login = () => {
    const { login, loading } = useLocalAuth();
    const [password, setPass] = useState('');
    const [error, setError] = useState('');

    // La contraseña por defecto está configurada.
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!password) return setError('Ingresa la contraseña');
        const ok = await login(password);
        if (!ok) setError('Credenciales incorrectas');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
                <form onSubmit={handleLogin} className="space-y-3">
                    <h3 className="font-semibold text-lg">Ingresar</h3>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPass(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button className="w-full py-2 bg-cyan-500 text-white rounded">Entrar</button>
                </form>
                {loading && <p className="text-xs text-gray-400">Procesando...</p>}
            </div>
        </div>
    );
};

export default Login;
