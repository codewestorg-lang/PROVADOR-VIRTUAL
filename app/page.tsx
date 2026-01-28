'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Produto {
  id: number;
  nome: string;
  imagem: string;
  thumbnail?: string;
  preco: string;
  marca: string;
  url?: string;
}

interface ApiResponse {
  success?: boolean;
  produtos?: Produto[];
  oculos?: Produto[];
  // Suporte para diferentes formatos de resposta
  [key: string]: any;
}

export default function ProvadorVirtual() {
  const [fotoUsuario, setFotoUsuario] = useState<string | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<'upload' | 'selecao' | 'resultado'>('upload');
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

  // URL do webhook n8n (variável de ambiente)
  const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_PRODUTOS_URL || 
                      'https://testes-n8n.t4tvrg.easypanel.host/webhook/produtos';

  // Função para buscar produtos
  const buscarProdutos = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Buscando produtos em:', WEBHOOK_URL);

      const response = await fetch(WEBHOOK_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      console.log('📦 Dados recebidos:', data);

      // Extrair produtos da resposta (suporta diferentes formatos)
      let produtosArray: Produto[] = [];

      if (Array.isArray(data)) {
        // Se a resposta for um array direto
        produtosArray = data;
      } else if (data.produtos && Array.isArray(data.produtos)) {
        // Se vier em data.produtos
        produtosArray = data.produtos;
      } else if (data.oculos && Array.isArray(data.oculos)) {
        // Se vier em data.oculos
        produtosArray = data.oculos;
      } else {
        console.error('❌ Formato de resposta desconhecido:', data);
        throw new Error('Formato de resposta inválido');
      }

      console.log('✅ Produtos processados:', produtosArray.length);

      if (produtosArray.length === 0) {
        setError('Nenhum produto disponível no momento');
      } else {
        setProdutos(produtosArray);
        setEtapa('selecao');
      }

    } catch (err) {
      console.error('❌ Erro ao buscar produtos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  // Função para processar upload de foto
  const handleUploadFoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, envie apenas imagens');
      return;
    }

    // Validar tamanho (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Imagem muito grande. Máximo 5MB');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFotoUsuario(result);
      setError(null);
    };

    reader.onerror = () => {
      setError('Erro ao ler a imagem');
    };

    reader.readAsDataURL(file);
  };

  // Função para continuar após upload
  const handleContinuar = () => {
    if (!fotoUsuario) {
      setError('Por favor, envie uma foto primeiro');
      return;
    }
    
    buscarProdutos();
  };

  // Função para experimentar um óculos
  const experimentarOculos = (produto: Produto) => {
    console.log('👓 Experimentando:', produto.nome);
    setProdutoSelecionado(produto);
    
    // Aqui você chamaria o webhook de try-on com IA
    // Por enquanto, apenas mostra a seleção
    setEtapa('resultado');
  };

  // Função para voltar
  const voltar = () => {
    if (etapa === 'resultado') {
      setEtapa('selecao');
      setProdutoSelecionado(null);
    } else if (etapa === 'selecao') {
      setEtapa('upload');
      setProdutos([]);
      setFotoUsuario(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🕶️ Provador Virtual
          </h1>
          <p className="text-gray-600">
            Experimente nossos óculos virtualmente antes de comprar!
          </p>
        </header>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* ETAPA 1: Upload de Foto */}
        {etapa === 'upload' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              1. Envie sua foto
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Tire ou envie uma foto do seu rosto para experimentar os óculos
            </p>

            <div className="flex flex-col items-center gap-4">
              <label 
                htmlFor="foto-input" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg cursor-pointer hover:opacity-90 transition"
              >
                📸 Escolher Foto
              </label>
              <input
                id="foto-input"
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleUploadFoto}
                className="hidden"
              />

              {/* Preview da foto */}
              {fotoUsuario && (
                <div className="mt-4">
                  <div className="relative w-64 h-64 rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src={fotoUsuario}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={handleContinuar}
                    disabled={loading}
                    className="mt-4 w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Carregando produtos...' : 'Continuar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ETAPA 2: Seleção de Produtos */}
        {etapa === 'selecao' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                2. Escolha um modelo ({produtos.length} disponíveis)
              </h2>
              <button
                onClick={voltar}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Voltar
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando produtos...</p>
              </div>
            )}

            {/* Grid de produtos */}
            {!loading && produtos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {produtos.map((produto) => (
                  <div
                    key={produto.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                    onClick={() => experimentarOculos(produto)}
                  >
                    <div className="relative h-64">
                      <Image
                        src={produto.thumbnail || produto.imagem}
                        alt={produto.nome}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {produto.nome}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {produto.marca}
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        R$ {produto.preco}
                      </p>
                      <button className="mt-3 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg hover:opacity-90 transition">
                        Experimentar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sem produtos */}
            {!loading && produtos.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                <p>Nenhum produto disponível no momento</p>
              </div>
            )}
          </div>
        )}

        {/* ETAPA 3: Resultado */}
        {etapa === 'resultado' && produtoSelecionado && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">3. Veja o resultado!</h2>
              <button
                onClick={voltar}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Tentar outro
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="relative w-full max-w-md mx-auto h-96 rounded-lg overflow-hidden mb-6">
                {/* Aqui você mostraria a imagem processada pela IA */}
                {/* Por enquanto, mostra a foto original */}
                <Image
                  src={fotoUsuario || ''}
                  alt="Resultado"
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="text-xl font-semibold mb-2">
                {produtoSelecionado.nome}
              </h3>
              <p className="text-3xl font-bold text-purple-600 mb-6">
                R$ {produtoSelecionado.preco}
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={voltar}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
                >
                  🔄 Tentar outro
                </button>
                {produtoSelecionado.url && (
                  <a
                    href={produtoSelecionado.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    🛒 Comprar
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
