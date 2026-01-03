import React, { useState } from 'react';
import { useLocalAuth } from '../../hooks';

export const Login = () => {
    const { login, loading } = useLocalAuth();
    const [password, setPass] = useState('');
    const [error, setError] = useState('');

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
                <form onSubmit={handleLogin} className="space-y-4">
                    <h3 className="font-semibold text-xl text-center text-gray-800">Ingresar al Sistema</h3>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPass(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 disabled:bg-gray-400 transition-colors"
                    >
                        {loading ? 'Procesando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
