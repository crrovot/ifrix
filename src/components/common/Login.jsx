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
                <form onSubmit={handleLogin} className="space-y-3">
                    <h3 className="font-semibold text-lg text-center">Ingresar al Sistema</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs">
                        <p className="font-semibold mb-1">Usuarios disponibles:</p>
                        <p><span className="font-bold">Admin:</span> Ifrix2025# (acceso total)</p>
                        <p><span className="font-bold">Operador:</span> operador123 (solo Monitor)</p>
                    </div>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPass(e.target.value)}
                        className="w-full p-2 border rounded"
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-cyan-500 text-white rounded font-semibold hover:bg-cyan-600 disabled:bg-gray-400"
                    >
                        {loading ? 'Procesando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
