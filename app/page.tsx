'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

// URLs dos webhooks n8n
const N8N_PRODUTOS_URL = process.env.NEXT_PUBLIC_N8N_PRODUTOS_URL || 'https://testes-n8n.t4tvrg.easypanel.host/webhook/produtos'
const N8N_TRYON_URL = process.env.NEXT_PUBLIC_N8N_TRYON_URL || 'https://testes-n8n.t4tvrg.easypanel.host/webhook/gerar-tryon'

interface Produto {
  id: number
  nome: string
  imagem: string
  thumbnail: string
  preco: string
  marca: string
  url: string
  descricao?: string
  categoria?: string
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

  // Logs de inicialização para debug na Vercel
  useEffect(() => {
    console.log('🚀 Provador Virtual Inicializado')
    console.log('📍 Webhook Produtos:', N8N_PRODUTOS_URL)
    console.log('📍 Webhook Try-on:', N8N_TRYON_URL)
  }, [])

  // Upload da foto do cliente
  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida')
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

  const buscarProdutos = async () => {
    setLoading(true)
    setError(null)
    console.log('🔍 Iniciando busca de produtos...')
    
    try {
      const response = await fetch(N8N_PRODUTOS_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`)
      }

      let data = await response.json()
      console.log('📦 Dados brutos recebidos:', data)

      // TRATAMENTO DE ARRAY (Problema identificado anteriormente)
      if (Array.isArray(data) && data.length > 0) {
        console.log('⚠️ Resposta é um array, extraindo primeiro elemento...')
        data = data[0]
      }

      let oculosArray: any[] = []
      if (data.oculos && Array.isArray(data.oculos)) {
        oculosArray = data.oculos
      } else if (data.produtos && Array.isArray(data.produtos)) {
        oculosArray = data.produtos
      } else if (Array.isArray(data)) {
        oculosArray = data
      }

      if (oculosArray.length > 0) {
        console.log(`✅ Sucesso! Encontrados ${oculosArray.length} óculos.`)
        const formatados = oculosArray.map((item: any, index: number) => ({
          id: item.id || index,
          nome: item.nome || item.name || `Óculos ${index + 1}`,
          imagem: item.imagem || item.image || '',
          thumbnail: item.thumbnail || item.imagem || '',
          preco: item.preco || item.price || '189.00',
          marca: item.marca || 'MODESTY',
          url: item.url || ''
        }))
        setProdutos(formatados)
        setStep('select')
      } else {
        console.warn('⚠️ Nenhum produto encontrado na resposta')
        setError(`Nenhum produto encontrado. Resposta do n8n: ${JSON.stringify(data).substring(0, 100)}...`)
      }
    } catch (err: any) {
      console.error('❌ Erro ao buscar produtos:', err)
      setError(err.message || 'Erro ao carregar produtos.')
    } finally {
      setLoading(false)
    }
  }

  const gerarTryOn = async (produto: Produto) => {
    if (!fotoCliente) return

    setLoading(true)
    setError(null)
    setProdutoSelecionado(produto)
    console.log('🎨 Iniciando geração de Try-on...')

    try {
      const response = await fetch(N8N_TRYON_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fotoCliente: fotoCliente,
          produtoId: produto.id,
          imagemOculos: produto.imagem,
          produtoNome: produto.nome
        }),
      })

      if (!response.ok) {
        throw new Error(`Erro ao gerar provador: ${response.status}`)
      }

      const data = await response.json()
      console.log('🖼️ Resultado do Try-on:', data)

      const imagemUrl = data.resultado_url || data.imagem_final || data.imagem || data.url
      
      if (imagemUrl) {
        setImagemResultado(imagemUrl)
        setStep('result')
      } else {
        throw new Error('O webhook não retornou a URL da imagem processada.')
      }
    } catch (err: any) {
      console.error('❌ Erro no Try-on:', err)
      setError(err.message || 'Erro ao processar imagem.')
    } finally {
      setLoading(false)
    }
  }

  const resetar = () => {
    setStep('upload')
    setFotoCliente(null)
    setProdutos([])
    setProdutoSelecionado(null)
    setImagemResultado(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <main className="min-h-screen bg-white text-black font-sans">
      {/* Header Modesty Style */}
      <header className="border-b border-gray-200 py-6 px-4 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight uppercase">
            MODESTY COMPANY <span className="text-xs align-super">®</span>
          </h1>
          <div className="text-sm text-gray-600 hidden md:block tracking-widest">
            PROVADOR VIRTUAL IA
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex flex-col gap-2">
            <div><strong>Erro:</strong> {error}</div>
            <button 
              onClick={() => buscarProdutos()} 
              className="w-fit bg-red-600 text-white px-4 py-1 rounded text-xs font-bold uppercase"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Experimente Agora</h2>
              <p className="text-gray-500 max-w-md mx-auto">Tire uma foto ou escolha um arquivo para começar sua experiência de provador virtual.</p>
            </div>

            <div className="border-2 border-dashed border-gray-200 p-12 rounded-3xl hover:border-black transition-colors group relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFotoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-black group-hover:text-white transition-colors">
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path></svg>
                  )}
                </div>
                <p className="font-bold uppercase tracking-widest text-sm">{loading ? 'Processando...' : 'Enviar Foto'}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Suporta arquivos grandes (até 20MB)</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Seleção */}
        {step === 'select' && (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="w-full md:w-1/3 sticky top-32">
                <div className="aspect-[3/4] relative rounded-3xl overflow-hidden border border-gray-100 shadow-2xl">
                  {fotoCliente && <Image src={fotoCliente} alt="Sua foto" fill className="object-cover" />}
                  <div className="absolute bottom-4 left-4 right-4">
                    <button onClick={resetar} className="w-full bg-white/90 backdrop-blur py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg">Trocar Foto</button>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/3 space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Escolha o Modelo</h2>
                  <p className="text-gray-500">Selecione um dos modelos abaixo para aplicar em sua foto.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {produtos.map((produto) => (
                    <div 
                      key={produto.id} 
                      onClick={() => !loading && gerarTryOn(produto)}
                      className={`group cursor-pointer space-y-4 p-4 rounded-2xl border-2 transition-all ${produtoSelecionado?.id === produto.id ? 'border-black bg-gray-50' : 'border-transparent hover:bg-gray-50'}`}
                    >
                      <div className="aspect-square relative bg-white rounded-xl overflow-hidden">
                        <Image 
                          src={produto.thumbnail || produto.imagem} 
                          alt={produto.nome} 
                          fill 
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-contain p-4 group-hover:scale-110 transition-transform" 
                          unoptimized 
                        />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{produto.marca}</p>
                        <p className="text-sm font-bold truncate">{produto.nome}</p>
                        <p className="text-xs font-medium">R$ {produto.preco}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Resultado */}
        {step === 'result' && imagemResultado && (
          <div className="max-w-4xl mx-auto space-y-8 text-center">
            <div className="space-y-2">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Seu Novo Look</h2>
              <p className="text-gray-500">O que achou? Você pode baixar a foto ou tentar outro modelo.</p>
            </div>

            <div className="aspect-square relative max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
              <Image src={imagemResultado} alt="Resultado" fill className="object-contain bg-gray-50" unoptimized />
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
              <a href={imagemResultado} download="meu-look-modesty.png" className="bg-black text-white px-12 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">Baixar Foto</a>
              <button onClick={() => setStep('select')} className="border-2 border-black px-12 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">Tentar Outro</button>
              <button onClick={resetar} className="text-gray-400 hover:text-black text-xs font-bold uppercase tracking-widest py-4">Começar do Zero</button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center flex-col gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black uppercase tracking-[0.3em] animate-pulse">Processando IA...</p>
        </div>
      )}
    </main>
  )
}
