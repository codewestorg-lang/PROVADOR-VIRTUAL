# 🚀 Guia Rápido de Setup

## Checklist Completo

### ✅ Parte 1: n8n (Backend)

1. **Importar Workflows**
   - [ ] Abrir n8n
   - [ ] Import → `workflow-buscar-produtos.json`
   - [ ] Import → `workflow-gerar-tryon.json`

2. **Configurar Credenciais Nuvemshop**
   - [ ] Credentials → Add → HTTP Header Auth
   - [ ] Name: `Nuvemshop API`
   - [ ] Header Name: `Authentication`
   - [ ] Header Value: `bearer SEU_TOKEN_NUVEMSHOP`
   - [ ] Onde pegar token: https://www.tiendanube.com/apps/admin

3. **Configurar Credenciais OpenAI**
   - [ ] Credentials → Add → HTTP Header Auth
   - [ ] Name: `OpenAI API`
   - [ ] Header Name: `Authorization`
   - [ ] Header Value: `Bearer sk-proj-XXXXXXX`
   - [ ] Onde pegar key: https://platform.openai.com/api-keys

4. **Ativar e Testar Workflows**
   - [ ] Ativar workflow "Buscar Produtos"
   - [ ] Copiar URL do webhook (ex: `https://n8n.app/webhook/produtos`)
   - [ ] Testar no navegador: deve retornar JSON com produtos
   - [ ] Ativar workflow "Gerar Try-On"
   - [ ] Copiar URL do webhook (ex: `https://n8n.app/webhook/gerar-tryon`)

### ✅ Parte 2: Frontend (Next.js)

5. **Baixar e Preparar Projeto**
   ```bash
   cd provador-virtual
   npm install
   ```

6. **Configurar URLs do n8n**
   - [ ] Copiar `.env.example` para `.env.local`
   - [ ] Colar URL do webhook de produtos
   - [ ] Colar URL do webhook de try-on
   
   ```env
   NEXT_PUBLIC_N8N_PRODUTOS_URL=https://seu-n8n.app/webhook/produtos
   NEXT_PUBLIC_N8N_TRYON_URL=https://seu-n8n.app/webhook/gerar-tryon
   ```

7. **Testar Localmente**
   ```bash
   npm run dev
   ```
   - [ ] Abrir http://localhost:3000
   - [ ] Testar upload de foto
   - [ ] Testar seleção de produto
   - [ ] Verificar geração de try-on

### ✅ Parte 3: Deploy (Vercel)

8. **Preparar Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

9. **Criar Repositório GitHub**
   - [ ] Ir em github.com
   - [ ] New Repository → `provador-virtual`
   - [ ] Copiar comandos e executar:
   ```bash
   git remote add origin https://github.com/SEU_USER/provador-virtual.git
   git push -u origin main
   ```

10. **Deploy na Vercel**
    - [ ] Ir em vercel.com
    - [ ] New Project
    - [ ] Import Git Repository
    - [ ] Selecionar `provador-virtual`
    - [ ] Configure Environment Variables:
      - Nome: `NEXT_PUBLIC_N8N_PRODUTOS_URL`
      - Valor: (colar URL do webhook)
      - Nome: `NEXT_PUBLIC_N8N_TRYON_URL`
      - Valor: (colar URL do webhook)
    - [ ] Deploy!

11. **Testar Produção**
    - [ ] Acessar URL do Vercel (ex: `provador-virtual.vercel.app`)
    - [ ] Fazer upload de foto
    - [ ] Experimentar óculos
    - [ ] Verificar se gerou imagem

### ✅ Parte 4: Integrar na Loja

12. **Adicionar na Nuvemshop**
    
    **Opção A - Página Customizada:**
    - [ ] Ir em Configurações → Páginas
    - [ ] Nova Página → "Provador Virtual"
    - [ ] Adicionar código:
    ```html
    <iframe 
      src="https://SEU-PROJETO.vercel.app" 
      width="100%" 
      height="900px" 
      frameborder="0"
    ></iframe>
    ```
    
    **Opção B - Botão no Menu:**
    - [ ] Configurações → Menus
    - [ ] Adicionar item: "Provador Virtual"
    - [ ] URL: `https://SEU-PROJETO.vercel.app`
    - [ ] Abrir em nova aba: ✅

    **Opção C - Banner na Home:**
    - [ ] Design → Personalizar
    - [ ] Adicionar banner/slide
    - [ ] Link: `https://SEU-PROJETO.vercel.app`

### ✅ Parte 5: Domínio Personalizado (Opcional)

13. **Configurar Subdomínio**
    - [ ] No Vercel: Settings → Domains
    - [ ] Add Domain: `provador.modestycompany.com.br`
    - [ ] Copiar registros DNS fornecidos
    - [ ] No seu provedor de domínio (Registro.br, etc):
      - Adicionar CNAME: `provador` → `cname.vercel-dns.com`
    - [ ] Aguardar propagação (até 48h)
    - [ ] Verificar: `https://provador.modestycompany.com.br`

## 🎯 Resumo dos URLs Necessários

| Origem | O que é | Onde usar |
|--------|---------|-----------|
| n8n webhook produtos | `https://n8n.app/webhook/produtos` | `.env.local` no frontend |
| n8n webhook try-on | `https://n8n.app/webhook/gerar-tryon` | `.env.local` no frontend |
| Vercel deployment | `https://projeto.vercel.app` | Integrar na loja |

## ⚡ Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build de produção (testar antes de deploy)
npm run build

# Rodar build localmente
npm start

# Verificar erros TypeScript
npm run lint

# Deploy via CLI (alternativa ao GitHub)
vercel
vercel --prod
```

## 🔍 Como Testar Cada Parte

### Testar Backend n8n:

**Teste 1 - Buscar Produtos:**
```bash
curl https://seu-n8n.app/webhook/produtos
```
Deve retornar JSON com array de produtos.

**Teste 2 - Gerar Try-On:**
```bash
curl -X POST https://seu-n8n.app/webhook/gerar-tryon \
  -H "Content-Type: application/json" \
  -d '{
    "fotoCliente": "data:image/jpeg;base64,...",
    "produtoId": 123,
    "imagemOculos": "https://..."
  }'
```

### Testar Frontend:

1. Upload de foto → Deve mostrar seleção de produtos
2. Clicar em produto → Deve gerar try-on
3. Ver resultado → Deve mostrar antes/depois
4. Download → Deve baixar imagem

## 🆘 Problemas Comuns

| Problema | Solução |
|----------|---------|
| "Failed to fetch" | Verificar URLs dos webhooks no `.env.local` |
| Produtos não carregam | Testar webhook diretamente no navegador |
| Try-on não gera | Verificar credenciais OpenAI no n8n |
| CORS error | Adicionar headers CORS nos webhooks n8n |
| Deploy falha | Verificar se variáveis ambiente estão configuradas na Vercel |

## 💡 Dicas

1. **Comece pequeno**: Teste local antes de deploy
2. **Use os logs**: Vercel e n8n têm logs detalhados
3. **Teste incrementalmente**: Um passo de cada vez
4. **Guarde as URLs**: Anote todos os endpoints
5. **Backup**: Exporte os workflows n8n regularmente

## ✅ Pronto!

Após completar todos os checkboxes, seu provador virtual estará:
- ✨ Funcionando
- 🚀 No ar
- 🛍️ Integrado à loja
- 📱 Acessível aos clientes

---

**Tempo estimado total**: 1-2 horas

**Dificuldade**: Média (requer conhecimentos básicos de web)

**Suporte**: Revise o README.md completo para mais detalhes!
