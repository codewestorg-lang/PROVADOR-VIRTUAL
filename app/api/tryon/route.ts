import { NextRequest, NextResponse } from 'next/server'

const N8N_TRYON_URL = process.env.NEXT_PUBLIC_N8N_TRYON_URL || 'https://testes-n8n.t4tvrg.easypanel.host/webhook/gerar-tryon'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(N8N_TRYON_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro ao gerar try-on: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Erro na API de try-on:', error)
    return NextResponse.json(
      { error: 'Falha ao conectar com o n8n', details: error.message },
      { status: 500 }
    )
  }
}
