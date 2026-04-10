"use client"; // Transforma em Client Component para podermos usar useState e useEffect

import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import api from '@/services/api';
// Assumindo que você tenha o axios ou fetch configurado aqui para lidar com o JWT:
// import api from "@/services/api"; 

export default function Dashboard() {
  // 1. Definição dos Estados da Tela
  const [atestados, setAtestados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Busca dos dados assim que a tela monta
  useEffect(() => {
    async function fetchMeusAtestados() {
      try {
        setIsLoading(true);

        /* EXEMPLO DE INTEGRAÇÃO REAL COM O BACKEND (Módulo Dev 4):
          const response = await api.get('/certificates/me'); // O api.js já deve injetar o token JWT
          setAtestados(response.data);
        */

        const response = await api.get('/certificates');
        setAtestados(response.data);
        setIsLoading(false);

      } catch (err) {
        console.error("Erro ao buscar atestados:", err);
        setError("Não foi possível carregar seus atestados. Tente novamente.");
        setIsLoading(false);
      }
    }

    fetchMeusAtestados();
  }, []);

  // 3. Cálculos Dinâmicos com base nos dados do backend
  const totalAtestados = atestados.length;
  const atestadosAprovados = atestados.filter(a => a.status === 'Aprovado').length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />

      <main className="w-full flex-1 px-8 py-10 flex flex-col gap-6">

        {/* --- CARD 1: Resumo Dinâmico --- */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h1 className="text-3xl font-normal text-gray-900">Olá, Usuário.</h1>
          <p className="text-sm text-gray-500 mt-2 mb-6">Aqui está um resumo dos seus atestados.</p>
          <hr className="border-gray-200 mb-6" />

          <div className="flex gap-12">
            <div className="flex flex-col">
              <span className="text-gray-900 font-medium text-lg">
                {isLoading ? "-" : totalAtestados}
              </span>
              <span className="text-sm text-gray-500">No total</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-900 font-medium text-lg text-[#1a9e9e]">
                {isLoading ? "-" : atestadosAprovados}
              </span>
              <span className="text-sm text-gray-500">Aprovados</span>
            </div>
          </div>
        </div>

        {/* --- CARD 2: Lista Dinâmica / Empty State --- */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-normal text-gray-900">Recentes</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">Seus atestados mais recentes</p>
          <hr className="border-gray-200 mb-6" />

          {/* TRATAMENTO DE ESTADOS: Loading, Erro, Vazio e Preenchido */}
          {isLoading ? (
            <div className="text-center py-4 text-sm text-gray-500">
              Carregando seus atestados...
            </div>
          ) : error ? (
            <div className="text-center py-4 text-sm text-red-500">
              {error}
            </div>
          ) : atestados.length === 0 ? (
            // AQUI ESTÁ O ESTADO VAZIO (EMPTY STATE)
            <div className="text-center py-8 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                {/* Ícone de documento vazio genérico */}
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-900 font-medium">Nenhum atestado encontrado</p>
              <p className="text-sm text-gray-500 mt-1">Você ainda não enviou nenhum atestado para o sistema.</p>
              <a href="/funcionario/novo-atestado" className="mt-4 text-sm text-[#1a9e9e] hover:underline font-medium">
                Enviar meu primeiro atestado
              </a>
            </div>
          ) : (
            // LISTA PREENCHIDA (Mapeando os dados do backend)
            <div className="flex flex-col gap-4">
              {atestados.map((atestado) => (
                <div key={atestado.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${atestado.status === 'Aprovado' ? 'bg-[#1a9e9e]' : atestado.status === 'Recusado' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-800 font-medium">{atestado.motivo}</span>
                      <span className="text-sm text-gray-400 mt-1">
                        {atestado.dataInicio} -- {atestado.dataFim} - {atestado.dias} dias
                      </span>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${atestado.status === 'Aprovado' ? 'text-[#1a9e9e]' : atestado.status === 'Recusado' ? 'text-red-500' : 'text-yellow-600'}`}>
                    {atestado.status}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}