'use client';

import React, { useState } from 'react';
import { AIAssistantChat } from '@/components/ai-assistant/AIAssistantChat';
import { DictValidationPanel } from '@/components/ai-assistant/DictValidationPanel';

type Tab = 'chat' | 'dict-validation';

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Assistente de IA</h1>
            <p className="mt-1 text-sm text-gray-500">
              Chat com IA especializado em regulamentações bancárias e validação DICT
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 -mb-px">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Chat com IA
              </div>
            </button>
            <button
              onClick={() => setActiveTab('dict-validation')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'dict-validation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Validação DICT
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chat */}
            <div className="lg:col-span-2">
              <AIAssistantChat
                title="Assistente CoreBanking"
                welcomeMessage="Olá! Sou o assistente de IA especializado em regulamentações bancárias brasileiras, PIX e DICT. Como posso ajudar você hoje?"
                placeholder="Pergunte sobre normas do BACEN, PIX, DICT..."
                useRag={true}
                className="h-[600px]"
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Perguntas Frequentes</h3>
                <div className="space-y-2">
                  {[
                    'Quais são os requisitos para registro de chave PIX CPF?',
                    'Como funciona a portabilidade de chave PIX?',
                    'Qual o prazo para reivindicação de chave?',
                    'Quais são os tipos de conta válidos para PIX?',
                    'Como validar um CNPJ para chave PIX?',
                  ].map((question, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Sobre o Assistente</h3>
                <p className="text-sm text-blue-700">
                  Este assistente utiliza RAG (Retrieval Augmented Generation) para consultar
                  documentos normativos do BACEN e fornecer respostas precisas sobre
                  regulamentações PIX e DICT.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-blue-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  As respostas são geradas com base em documentos indexados
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dict-validation' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Validation Panel */}
            <div className="lg:col-span-2">
              <DictValidationPanel />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Info Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Tipos de Requisição DICT</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Registro de Chave</h4>
                    <p className="text-xs text-gray-500">Vinculação de uma chave PIX a uma conta</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Exclusão de Chave</h4>
                    <p className="text-xs text-gray-500">Remoção de uma chave PIX existente</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Portabilidade</h4>
                    <p className="text-xs text-gray-500">Transferência de chave entre instituições</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Reivindicação</h4>
                    <p className="text-xs text-gray-500">Disputa de propriedade de uma chave</p>
                  </div>
                </div>
              </div>

              {/* Key Types */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Tipos de Chave PIX</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-xs font-mono bg-gray-100 px-2 py-1 rounded">CPF</span>
                    <span className="text-xs text-gray-600">Cadastro de Pessoa Física</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-xs font-mono bg-gray-100 px-2 py-1 rounded">CNPJ</span>
                    <span className="text-xs text-gray-600">Cadastro de Pessoa Jurídica</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-xs font-mono bg-gray-100 px-2 py-1 rounded">EMAIL</span>
                    <span className="text-xs text-gray-600">Endereço de e-mail</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-xs font-mono bg-gray-100 px-2 py-1 rounded">PHONE</span>
                    <span className="text-xs text-gray-600">Número de celular</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-xs font-mono bg-gray-100 px-2 py-1 rounded">EVP</span>
                    <span className="text-xs text-gray-600">Chave aleatória (UUID)</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Atenção</h4>
                    <p className="text-xs text-yellow-700 mt-1">
                      A validação é realizada com base nas normas do BACEN vigentes.
                      Consulte sempre a documentação oficial para casos específicos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
