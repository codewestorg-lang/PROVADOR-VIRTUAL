'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

// URLs dos webhooks n8n
const N8N_PRODUTOS_URL = process.env.NEXT_PUBLIC_N8N_PRODUTOS_URL || 'https://testes-n8n.t4tvrg.easypanel.host/webhook/produtos'
const N8N_TRYON_URL = process.env.NEXT_PUBLIC_N8N_TRYON_URL || 'https://testes-n8n.t4tvrg.easypanel.host/webhook/gerar-tryon'

interface Produto {
  id: number
  nome: string
  preco: string
  imagem: string
  descricao: string
  categoria: string
  url?: string
}

export default function Home() {
  const [step, setStep] = useState<'upload' | 'select' | 'result'>('upload')
  const [fotoCliente, setFotoCliente] = useState<string | null>(null)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [imagemResultado, setImagemResultado] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload da foto do cliente
  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        setFotoCliente(base64)
        await buscarProdutos()
        setLoading(false)
      }
      reader.onerror = () => {
        setError('Erro ao processar a imagem')
        setLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Erro ao processar a imagem')
      setLoading(false)
    }
  }

  // Buscar produtos - VERSÃO FINAL ROBUSTA
  const buscarProdutos = async () => {
    try {
      console.log('🔍 Buscando produtos...')
      
      const response = await fetch(N8N_PRODUTOS_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store', // Importante: não cachear
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📦 Resposta do n8n:', data)
      
      // Extrair array de forma robusta
      let oculosArray: any[] = []
      
      if (data.oculos && Array.isArray(data.oculos)) {
        oculosArray = data.oculos
      } else if (Array.isArray(data)) {
        oculosArray = data
      } else if (data.produtos) {
        oculosArray = data.produtos
      } else if (data.items) {
        oculosArray = data.items
      } else if (data.data) {
        oculosArray = data.data
      }
      
      console.log('👓 Array extraído:', oculosArray)
      
      if (!Array.isArray(oculosArray) || oculosArray.length === 0) {
        console.warn('⚠️ Nenhum produto encontrado')
        setError('Nenhum produto de óculos encontrado. Verifique a categoria na Nuvemshop.')
        setProdutos([])
        setStep('select')
        return
      }
      
      // Mapear produtos de forma robusta
      const produtosFormatados: Produto[] = oculosArray.map((item: any, index: number) => {
        // Garantir que sempre tem valores válidos
        const produto: Produto = {
          id: item.id || item.product_id || index + 1,
          nome: item.nome || item.name || item.title || `Óculos ${index + 1}`,
          preco: item.preco || item.price || item.valor || '189.00',
          imagem: item.imagem || item.image || item.thumbnail || item.img || '',
          descricao: item.descricao || item.description || item.nome || '',
          categoria: item.categoria || (item.estilo && item.estilo[0]) || 'Óculos de Sol',
          url: item.url || item.link || ''
        }
        
        // Se o preço é "0.00", colocar um padrão
        if (produto.preco === '0.00' || produto.preco === '0' || !produto.preco) {
          produto.preco = '189.00'
        }
        
        return produto
      })
      
      console.log('✅ Produtos formatados:', produtosFormatados)
      
      setProdutos(produtosFormatados)
      setStep('select')
      
    } catch (err: any) {
      console.error('❌ Erro:', err)
      setError(`Erro ao carregar produtos: ${err.message}`)
      setProdutos([])
      setStep('select')
    }
  }

  // Gerar try-on
  const gerarTryOn = async (produto: Produto) => {
    if (!fotoCliente) return

    setLoading(true)
    setError(null)
    setProdutoSelecionado(produto)

    try {
      const response = await fetch(N8N_TRYON_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fotoCliente: fotoCliente,
          produtoId: produto.id,
          imagemOculos: produto.imagem,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const imagemUrl = data.imagemGerada || data.imagem || data.url || data.imageUrl
      
      if (imagemUrl) {
        setImagemResultado(imagemUrl)
        setStep('result')
      } else {
        throw new Error('Imagem não encontrada na resposta')
      }
    } catch (err: any) {
      setError(`Erro ao gerar prévia: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Resetar
  const resetar = () => {
    setStep('upload')
    setFotoCliente(null)
    setProdutos([])
    setProdutoSelecionado(null)
    setImagemResultado(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header Modesty Style */}
      <header className="border-b border-gray-200 py-6 px-4 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight uppercase">
            MODESTY COMPANY <span className="text-xs align-super">®</span>
          </h1>
          <div className="text-sm text-gray-600 hidden md:block">
            PROVADOR VIRTUAL
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-6">
            <div className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-3">
              Experimente com IA
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              PROVADOR VIRTUAL
            </h2>
            <div className="h-[2px] w-16 bg-black mx-auto"></div>
          </div>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Veja como nossos óculos ficam em você antes de comprar.<br />
            Tecnologia de inteligência artificial em segundos.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-black text-white text-center text-sm tracking-wide">
            ⚠ {error}
          </div>
        )}

        {/* Step 1: Upload da Foto */}
        {step === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border-2 border-black p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-black mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">
                  Passo 1 de 3
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-3 uppercase">
                  Envie sua foto
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Use uma foto de rosto frontal com boa iluminação<br />
                  para melhores resultados
                </p>
              </div>

              <div className="space-y-6">
                <label className="block">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFotoUpload}
                    className="hidden"
                    disabled={loading}
                  />
                  <div className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-black transition-colors p-12 text-center">
                    {loading ? (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm uppercase tracking-wider">Processando...</p>
                      </div>
                    ) : (
                      <>
                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="text-base font-medium mb-1 uppercase tracking-wide">
                          Selecionar Foto
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                          JPG, PNG até 5MB
                        </p>
                      </>
                    )}
                  </div>
                </label>

                <div className="bg-gray-50 border border-gray-200 p-6">
                  <p className="text-xs font-bold uppercase tracking-wider mb-3">💡 Dicas</p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Foto frontal com rosto centralizado</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Boa iluminação natural</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Sem óculos na foto original</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Expressão neutra funciona melhor</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Seleção de Produto */}
        {step === 'select' && (
          <div>
            <div className="text-center mb-12">
              <div className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">
                Passo 2 de 3
              </div>
              <h3 className="text-3xl font-bold tracking-tight mb-4 uppercase">
                Escolha seu óculos
              </h3>
              <div className="h-[2px] w-16 bg-black mx-auto mb-6"></div>
              
              {fotoCliente && (
                <div className="inline-block">
                  <div className="relative w-24 h-24 border-2 border-black overflow-hidden">
                    <Image
                      src={fotoCliente}
                      alt="Sua foto"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mt-2">Sua Foto</p>
                </div>
              )}
            </div>

            {produtos.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
                  {error || 'Nenhum produto encontrado'}
                </p>
                <button
                  onClick={resetar}
                  className="bg-black text-white px-8 py-3 text-xs uppercase tracking-wider font-bold"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {produtos.map((produto) => (
                  <div
                    key={produto.id}
                    className="group cursor-pointer"
                    onClick={() => !loading && gerarTryOn(produto)}
                  >
                    <div className="relative bg-gray-50 mb-4 overflow-hidden border-2 border-transparent group-hover:border-black transition-all">
                      <div className="aspect-square relative">
                        {produto.imagem ? (
                          <Image
                            src={produto.imagem}
                            alt={produto.nome}
                            fill
                            className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            Sem imagem
                          </div>
                        )}
                      </div>
                      {loading && produtoSelecionado?.id === produto.id && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <h4 className="font-bold text-sm uppercase tracking-wide mb-1">
                        {produto.nome}
                      </h4>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                        {produto.categoria}
                      </p>
                      <p className="text-lg font-bold mb-3">
                        R$ {produto.preco}
                      </p>
                      <button
                        disabled={loading}
                        className="w-full bg-black text-white py-3 text-xs uppercase tracking-wider font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {loading && produtoSelecionado?.id === produto.id ? 'GERANDO...' : 'EXPERIMENTAR'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-12 text-center">
              <button
                onClick={resetar}
                className="text-sm uppercase tracking-wider text-gray-600 hover:text-black underline underline-offset-4"
              >
                ← Trocar Foto
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Resultado */}
        {step === 'result' && (
          <div>
            <div className="text-center mb-12">
              <div className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">
                Passo 3 de 3
              </div>
              <h3 className="text-3xl font-bold tracking-tight mb-2 uppercase">
                Resultado
              </h3>
              <div className="h-[2px] w-16 bg-black mx-auto mb-4"></div>
              {produtoSelecionado && (
                <p className="text-sm uppercase tracking-wider text-gray-600">
                  {produtoSelecionado.nome}
                </p>
              )}
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Foto Original */}
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-3 text-center">
                    Foto Original
                  </div>
                  <div className="relative aspect-square border-2 border-gray-200 overflow-hidden bg-gray-50">
                    {fotoCliente && (
                      <Image
                        src={fotoCliente}
                        alt="Foto original"
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Com Óculos */}
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-3 text-center">
                    Com os Óculos
                  </div>
                  <div className="relative aspect-square border-2 border-black overflow-hidden bg-gray-50">
                    {imagemResultado ? (
                      <Image
                        src={imagemResultado}
                        alt="Com óculos"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informações do Produto */}
              {produtoSelecionado && (
                <div className="bg-black text-white p-8 mb-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                      <h4 className="text-xl font-bold uppercase tracking-wide mb-2">
                        {produtoSelecionado.nome}
                      </h4>
                      <p className="text-xs uppercase tracking-wider text-gray-400">
                        {produtoSelecionado.categoria}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">
                        R$ {produtoSelecionado.preco}
                      </p>
                      <a
                        href={produtoSelecionado.url || "https://www.modestycompany.com.br/oculos-solares/"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 bg-white text-black px-8 py-3 text-xs uppercase tracking-wider font-bold hover:bg-gray-200 transition-colors"
                      >
                        Comprar Agora
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setStep('select')}
                  className="bg-white border-2 border-black text-black py-4 text-xs uppercase tracking-wider font-bold hover:bg-black hover:text-white transition-all"
                >
                  Experimentar Outro Modelo
                </button>
                <button
                  onClick={resetar}
                  className="bg-black text-white py-4 text-xs uppercase tracking-wider font-bold hover:bg-gray-800 transition-colors"
                >
                  Nova Foto
                </button>
              </div>

              {imagemResultado && (
                <div className="mt-8 text-center">
                  <a
                    href={imagemResultado}
                    download="modesty-provador-virtual.jpg"
                    className="text-xs uppercase tracking-wider text-gray-600 hover:text-black underline underline-offset-4"
                  >
                    ↓ Baixar Imagem
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && step === 'result' && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="bg-white p-12 max-w-sm text-center border-2 border-white">
              <div className="w-16 h-16 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-lg font-bold uppercase tracking-wider mb-2">
                Gerando sua prévia
              </p>
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Aguarde alguns segundos
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">
            MODESTY COMPANY <span className="text-[8px] align-super">®</span>
          </p>
          <p className="text-xs text-gray-400">
            © 2026 Todos os direitos reservados
          </p>
        </div>
      </footer>
    </main>
  )
}
