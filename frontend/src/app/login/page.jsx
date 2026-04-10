'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogin() {
        setError('');
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, role } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            if (role === 'ADMIN') {
                router.push('/admin/dashboard');
            } else {
                router.push('/funcionario/dashboard');
            }
        } catch (err) {
            setError('Email ou senha incorretos.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex h-screen">

            <div className="w-1/2 flex flex-col items-center justify-center">

                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-[#1a6b6b]">ATESTE+</h1>
                    <p className="text-sm text-gray-500">Gerenciamento de Atestados</p>
                </div>

                <div className="flex flex-col gap-3 w-72">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-2 text-sm outline-none focus:border-[#1a6b6b]"
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-2 text-sm outline-none focus:border-[#1a6b6b]"
                    />

                    {error && <p className="text-xs text-red-500">{error}</p>}

                    <a href="/redefinir-senha" className="text-right text-xs text-gray-500 hover:underline">
                        Esqueceu sua senha?
                    </a>
                    <button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="bg-[#1a9e9e] text-white py-2 rounded text-sm font-medium hover:bg-[#1a6b6b] transition-colors disabled:opacity-70"
                    >
                        {isLoading ? 'Entrando...' : 'Login'}
                    </button>
                </div>

                <p className="text-xs text-gray-500 mt-4">Ainda não possui conta?{" "}
                    <a href="/cadastro" className="text-[#1a9e9e] hover:underline cursor-pointer">
                        Criar conta
                    </a>
                </p>

            </div>

            <div className="w-1/2 bg-[#e4fcfc] flex items-center justify-center">
                <img src="/FotoInicio.png" alt="Ilustracao" className="w-3/4" />
            </div>

        </div>
    );
}