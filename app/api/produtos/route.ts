import { NextResponse } from 'next/server'

const N8N_PRODUTOS_URL = process.env.NEXT_PUBLIC_N8N_PRODUTOS_URL || 'https://testes-n8n.t4tvrg.easypanel.host/webhook/produtos'

export async function GET() {
  try {
    const response = await fetch(N8N_PRODUTOS_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro ao buscar produtos: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Erro na API de produtos:', error)
    return NextResponse.json(
      { error: 'Falha ao conectar com o n8n', details: error.message },
      { status: 500 }
    )
  }
}
