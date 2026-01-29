'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

// URLs das APIs internas (proxy para n8n)
const API_PRODUTOS_URL = '/api/produtos'
const API_TRYON_URL = '/api/tryon'

interface Produto {
  id: number
  nome: string
  imagem: string
  thumbnail: string
  preco: string
  marca: string
  url: string
}

export default function Home() {
  const [step, setStep] = useState<'upload' | 'select' | 'result'>('upload')
  const [fotoCliente, setFotoCliente] = useState<string | null>(null)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [imagemResultado, setImagemResultado] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [networkStatus, setNetworkStatus] = useState<'testing' | 'ok' | 'fail'>('testing')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Teste de conexão ao carregar
  useEffect(() => {
    async function testConnection() {
      try {
        const res = await fetch(API_PRODUTOS_URL).catch(() => ({ ok: false }));
        setNetworkStatus(res.ok ? 'ok' : 'fail');
      } catch (e) {
        setNetworkStatus('fail');
      }
    }
    testConnection();
  }, [])

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)
    setDebugInfo(`Arquivo selecionado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    const reader = new FileReader()
    reader.onloadend = () => {
      setFotoCliente(reader.result as string)
      buscarProdutos()
    }
    reader.onerror = () => {
      setError('Erro ao ler arquivo local.')
      setLoading(false)
    }
    reader.readAsDataURL(file)
  }

  const buscarProdutos = async () => {
    setLoading(true)
    setError(null)
    setDebugInfo('Chamando webhook de produtos...')
    
    try {
      const response = await fetch(API_PRODUTOS_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

      let data = await response.json()
      
      // Normalização de dados
      if (Array.isArray(data) && data.length > 0) data = data[0]
      const oculosArray = data.oculos || data.produtos || (Array.isArray(data) ? data : [])

      if (oculosArray.length > 0) {
        setProdutos(oculosArray.map((item: any, i: number) => ({
          id: item.id || i,
          nome: item.nome || `Óculos ${i + 1}`,
          imagem: item.imagem || '',
          thumbnail: item.thumbnail || item.imagem || '',
          preco: item.preco || '168.00',
          marca: item.marca || 'MODESTY',
          url: item.url || ''
        })))
        setStep('select')
      } else {
        setError('O n8n respondeu, mas a lista de óculos está vazia.')
        setDebugInfo(`Resposta recebida: ${JSON.stringify(data).substring(0, 100)}`)
      }
    } catch (err: any) {
      setError(`Falha na conexão com o n8n. Verifique se o webhook está ativo.`)
      setDebugInfo(`Erro técnico: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const gerarTryOn = async (produto: Produto) => {
    setLoading(true)
    setError(null)
    setProdutoSelecionado(produto)
    setDebugInfo(`Enviando para processamento IA: ${produto.nome}`)

    try {
      const response = await fetch(API_TRYON_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fotoCliente,
          produtoId: produto.id,
          imagemOculos: produto.imagem
        }),
      })

      if (!response.ok) throw new Error(`Erro IA: ${response.status}`)

      const data = await response.json()
      const url = data.resultado_url || data.imagem_final || data.imagem || data.url
      
      if (url) {
        setImagemResultado(url)
        setStep('result')
      } else {
        throw new Error('Webhook não retornou URL da imagem.')
      }
    } catch (err: any) {
      setError('Erro ao processar imagem com IA.')
      setDebugInfo(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetar = () => {
    setStep('upload')
    setFotoCliente(null)
    setProdutos([])
    setError(null)
    setDebugInfo(null)
  }

  return (
    <main className="min-h-screen bg-white text-black p-4 md:p-8">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-12 border-b pb-6">
        <h1 className="text-2xl font-black tracking-tighter uppercase">MODESTY COMPANY ®</h1>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${networkStatus === 'ok' ? 'bg-green-500' : networkStatus === 'fail' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`}></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Status n8n</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-2xl text-red-800">
            <p className="font-bold mb-1 uppercase text-xs tracking-widest">⚠️ Atenção</p>
            <p className="text-sm mb-4">{error}</p>
            {debugInfo && <code className="block p-3 bg-white/50 rounded text-[10px] mb-4 break-all">{debugInfo}</code>}
            <button onClick={() => buscarProdutos()} className="bg-red-800 text-white px-6 py-2 rounded-full text-xs font-bold uppercase">Tentar Novamente</button>
          </div>
        )}

        {step === 'upload' && (
          <div className="text-center space-y-8 py-12">
            <div className="space-y-2">
              <h2 className="text-5xl font-black uppercase tracking-tighter">Provador Virtual</h2>
              <p className="text-gray-400 uppercase text-[10px] tracking-[0.4em]">Powered by AI Technology</p>
            </div>
            <div className="relative group max-w-md mx-auto">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="border-2 border-dashed border-gray-200 rounded-[40px] p-16 group-hover:border-black transition-all">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-black group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <p className="font-bold uppercase text-xs tracking-widest">Carregar Foto</p>
              </div>
            </div>
          </div>
        )}

        {step === 'select' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="aspect-[3/4] relative rounded-3xl overflow-hidden shadow-2xl">
                {fotoCliente && <Image src={fotoCliente} alt="Sua foto" fill className="object-cover" />}
                <button onClick={resetar} className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest">Trocar Foto</button>
              </div>
            </div>
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Escolha seu Óculos</h3>
              <div className="grid grid-cols-2 gap-4">
                {produtos.map((p) => (
                  <div key={p.id} onClick={() => gerarTryOn(p)} className="group cursor-pointer border rounded-2xl p-4 hover:border-black transition-all">
                    <div className="aspect-square relative mb-4">
                      <Image src={p.thumbnail} alt={p.nome} fill className="object-contain group-hover:scale-110 transition-all" unoptimized />
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{p.marca}</p>
                    <p className="text-xs font-bold truncate">{p.nome}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'result' && imagemResultado && (
          <div className="text-center space-y-8">
            <div className="aspect-square relative max-w-xl mx-auto rounded-[40px] overflow-hidden shadow-2xl border">
              <Image src={imagemResultado} alt="Resultado" fill className="object-contain bg-gray-50" unoptimized />
            </div>
            <div className="flex gap-4 justify-center">
              <a href={imagemResultado} download className="bg-black text-white px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest">Baixar Foto</a>
              <button onClick={() => setStep('select')} className="border-2 border-black px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest">Tentar Outro</button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-center items-center justify-center flex-col gap-6">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse mb-2">Processando</p>
            {debugInfo && <p className="text-[9px] text-gray-400 uppercase tracking-widest">{debugInfo}</p>}
          </div>
        </div>
      )}
    </main>
  )
}
