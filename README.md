# 🕶️ Provador Virtual - Modesty Company

Sistema de provador virtual de óculos usando AI, integrado com n8n e Nuvemshop.

## 📋 Funcionalidades

- ✨ Upload de foto do cliente
- 🤖 Geração de preview com IA (OpenAI)
- 🛍️ Integração com catálogo Nuvemshop
- 📱 Design responsivo e moderno
- ⚡ Performance otimizada

## 🚀 Como Usar

### 1️⃣ Configurar n8n

Primeiro, importe os workflows fornecidos no seu n8n:

1. Acesse seu n8n
2. Importe `workflow-buscar-produtos.json`
3. Importe `workflow-gerar-tryon.json`
4. Configure as credenciais:
   - **Nuvemshop API**: Token de acesso da sua loja
   - **OpenAI API**: Sua chave da OpenAI

5. Ative os workflows e copie as URLs dos webhooks

### 2️⃣ Configurar o Frontend

```bash
# Clone ou baixe o projeto
cd provador-virtual

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas URLs do n8n:

```env
NEXT_PUBLIC_N8N_PRODUTOS_URL=https://seu-n8n.app/webhook/produtos
NEXT_PUBLIC_N8N_TRYON_URL=https://seu-n8n.app/webhook/gerar-tryon
```

### 3️⃣ Rodar Localmente

```bash
npm run dev
```

Acesse: `http://localhost:3000`

### 4️⃣ Deploy na Vercel

#### Opção A: Via GitHub (Recomendado)

1. **Crie um repositório no GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/provador-virtual.git
   git push -u origin main
   ```

2. **Deploy na Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe seu repositório do GitHub
   - Configure as variáveis de ambiente:
     - `NEXT_PUBLIC_N8N_PRODUTOS_URL`
     - `NEXT_PUBLIC_N8N_TRYON_URL`
   - Clique em "Deploy"

#### Opção B: Via Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Para produção
vercel --prod
```

Durante o deploy, configure as variáveis de ambiente quando solicitado.

### 5️⃣ Integrar na Loja

Depois do deploy, você terá uma URL tipo: `https://seu-projeto.vercel.app`

#### Opção 1: iFrame na Página da Loja

Adicione no HTML da sua loja:

```html
<iframe 
  src="https://seu-projeto.vercel.app" 
  width="100%" 
  height="800px" 
  frameborder="0"
  title="Provador Virtual"
></iframe>
```

#### Opção 2: Link Direto

Crie um botão na sua loja:

```html
<a href="https://seu-projeto.vercel.app" 
   target="_blank" 
   class="btn-provador">
  🕶️ Experimentar Virtualmente
</a>
```

#### Opção 3: Popup/Modal

```javascript
<button onclick="abrirProvador()">Provador Virtual</button>

<script>
function abrirProvador() {
  window.open(
    'https://seu-projeto.vercel.app',
    'Provador Virtual',
    'width=1200,height=800'
  );
}
</script>
```

#### Opção 4: Subdomínio Personalizado

Na Vercel, você pode configurar um domínio personalizado:
- Ex: `provador.modestycompany.com.br`

## 🔧 Configurações Avançadas

### Customizar Cores e Marca

Edite `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#sua-cor-primaria',
      secondary: '#sua-cor-secundaria',
    },
  },
}
```

### Adicionar Google Analytics

Instale o pacote:
```bash
npm install @next/third-parties
```

Adicione no `app/layout.tsx`:
```typescript
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
```

### Melhorar Performance das Imagens

As imagens já estão otimizadas com Next.js Image, mas você pode:

1. Adicionar mais domínios em `next.config.js`
2. Configurar cache na Vercel
3. Usar CDN para imagens grandes

## 📊 Monitoramento

### Logs na Vercel

- Acesse seu projeto na Vercel
- Vá em "Deployments" → Clique no deployment
- Veja "Functions" para logs em tempo real

### Logs no n8n

- Cada execução de workflow fica registrada
- Verifique erros em "Executions"

## ⚠️ Troubleshooting

### Imagens não carregam

Verifique se os domínios estão em `next.config.js`:
```javascript
images: {
  domains: ['d26lpennugtm8s.cloudfront.net'],
}
```

### Erro de CORS

Certifique-se que os webhooks n8n têm os headers CORS:
```javascript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}
```

### API OpenAI não responde

- Verifique se tem créditos na OpenAI
- Confirme que a API key está correta no n8n
- Veja os logs de execução no n8n

### Deploy falha na Vercel

- Verifique se todas as dependências estão no package.json
- Confirme que as variáveis de ambiente estão configuradas
- Veja os logs de build na Vercel

## 💰 Custos

### OpenAI API
- ~$0.02 por imagem gerada (DALL-E 2)
- Veja preços atualizados: [openai.com/pricing](https://openai.com/pricing)

### Vercel
- **Hobby Plan**: Grátis
  - 100GB bandwidth/mês
  - Suficiente para começar
- **Pro Plan**: $20/mês
  - Para mais tráfego

### n8n
- **Cloud**: A partir de $20/mês
- **Self-hosted**: Grátis (você hospeda)

## 🔐 Segurança

- ✅ Nunca exponha API keys no frontend
- ✅ Use variáveis de ambiente
- ✅ Valide uploads de imagem
- ✅ Limite tamanho de arquivos (5MB)
- ✅ Rate limiting nos webhooks n8n

## 📈 Próximas Melhorias

- [ ] Salvar histórico de try-ons
- [ ] Compartilhar resultados em redes sociais
- [ ] Comparar múltiplos produtos lado a lado
- [ ] Ajuste fino (ângulo, posição dos óculos)
- [ ] Analytics de produtos mais experimentados
- [ ] Sistema de favoritos

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique a seção Troubleshooting
2. Revise os logs no n8n e Vercel
3. Teste os endpoints individualmente

## 📄 Licença

Proprietário - Modesty Company © 2026

---

Feito com ❤️ para revolucionar a experiência de compra online de óculos!
