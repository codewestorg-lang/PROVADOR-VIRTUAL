# 🕶️ Integração na Loja Modesty Company

## Visual da Página

O provador virtual foi desenvolvido com a identidade visual da Modesty Company:

### ✨ Características do Design

- **Cores**: Preto e branco (minimalista e clean)
- **Tipografia**: Uppercase, tracking amplo, bold
- **Estilo**: Streetwear moderno, geometrias retas
- **Bordas**: Sem bordas arredondadas (estilo quadrado)
- **Espaçamento**: Generoso e respirável
- **Botões**: Retangulares com hover effects sutis

### 🎨 Elementos Visuais

1. **Header**: Fixo no topo, logo "MODESTY COMPANY ®" à esquerda
2. **Hero Section**: Título grande "PROVADOR VIRTUAL" com linha divisória
3. **Cards de Produtos**: Grid limpo com hover effects
4. **Call-to-Actions**: Botões pretos com texto branco uppercase
5. **Loading States**: Spinner minimalista preto

---

## 📍 Opções de Integração na Nuvemshop

### OPÇÃO 1: Página Dedicada (RECOMENDADO ⭐)

Esta é a melhor opção para dar destaque ao provador.

#### Criar a Página:

1. No painel admin: **Configurações** → **Páginas** → **Criar página**

2. Configurações da página:
   - **Título**: "Provador Virtual"
   - **URL**: `/provador-virtual`
   - **Visível**: Sim

3. No editor HTML, cole:

```html
<style>
  .modesty-provador-container {
    width: 100%;
    min-height: 100vh;
    margin: 0;
    padding: 0;
  }
  
  .modesty-provador-frame {
    width: 100%;
    min-height: calc(100vh - 60px);
    border: none;
    display: block;
  }
  
  /* Remover padding padrão da página */
  .page-content {
    padding: 0 !important;
    margin: 0 !important;
  }
  
  .container {
    max-width: 100% !important;
    padding: 0 !important;
  }
</style>

<div class="modesty-provador-container">
  <iframe 
    src="https://SEU-PROJETO.vercel.app" 
    class="modesty-provador-frame"
    title="Provador Virtual Modesty Company"
    frameborder="0"
    allow="camera"
  ></iframe>
</div>

<script>
  // Ajustar altura dinamicamente
  window.addEventListener('message', function(e) {
    if (e.data.type === 'resize') {
      document.querySelector('.modesty-provador-frame').style.height = e.data.height + 'px';
    }
  });
</script>
```

#### Adicionar no Menu:

1. **Design** → **Menus** → **Menu Principal**
2. **Adicionar item do menu**:
   - Nome: `PROVADOR VIRTUAL` ou `🕶️ EXPERIMENTAR ONLINE`
   - Link: `/provador-virtual`
   - Posição: Logo após "Óculos Solares"

---

### OPÇÃO 2: Banner na Home

Criar destaque visual na página inicial.

#### Banner Hero:

1. **Design** → **Personalizar** → **Página Inicial**
2. Adicionar **Banner/Carrossel**
3. **Criar imagem** (1920x800px) no Canva:

**Texto sugerido para o banner:**
```
PROVADOR VIRTUAL
EXPERIMENTE ONLINE COM IA
[CLIQUE PARA COMEÇAR]
```

**Estilo visual:**
- Fundo: Preto sólido
- Texto: Branco, uppercase, bold
- Layout: Minimalista, centralizado
- Fonte: Sans-serif moderna

4. **Link do banner**: `https://SEU-PROJETO.vercel.app`
5. Marcar: "Abrir em nova aba"

---

### OPÇÃO 3: Botão Fixo na Página de Óculos

Adicionar botão destacado na categoria de óculos.

1. **Design** → **Editar código do tema**
2. Encontrar arquivo de categoria (ex: `category.tpl` ou `collection.liquid`)
3. Adicionar antes da grid de produtos:

```html
<div style="background: black; color: white; padding: 40px 20px; text-align: center; margin-bottom: 40px;">
  <h2 style="font-size: 24px; font-weight: bold; letter-spacing: 0.2em; margin-bottom: 10px;">
    PROVADOR VIRTUAL
  </h2>
  <p style="font-size: 14px; letter-spacing: 0.1em; margin-bottom: 20px; opacity: 0.8;">
    EXPERIMENTE NOSSOS ÓCULOS COM INTELIGÊNCIA ARTIFICIAL
  </p>
  <a href="https://SEU-PROJETO.vercel.app" 
     target="_blank"
     style="display: inline-block; background: white; color: black; padding: 15px 40px; font-weight: bold; letter-spacing: 0.15em; font-size: 12px; text-decoration: none; transition: all 0.3s;">
    EXPERIMENTAR AGORA
  </a>
</div>
```

---

### OPÇÃO 4: Botão Flutuante (Todas as Páginas)

#### Código para Scripts Externos:

1. **Configurações** → **Scripts externos** → **Script do rodapé**
2. Cole este código:

```html
<!-- Botão Flutuante Provador Virtual - Modesty Style -->
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap');
  
  .modesty-btn-float {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 999999;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .modesty-btn-float a {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #000000;
    color: #FFFFFF;
    padding: 16px 28px;
    text-decoration: none;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  .modesty-btn-float a:hover {
    background: #1a1a1a;
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  }
  
  .modesty-btn-float .icon {
    font-size: 20px;
    line-height: 1;
  }
  
  @media (max-width: 768px) {
    .modesty-btn-float {
      bottom: 20px;
      right: 20px;
    }
    
    .modesty-btn-float a {
      padding: 14px 24px;
      font-size: 10px;
    }
  }
  
  /* Animação de entrada */
  @keyframes slideInRight {
    from {
      transform: translateX(100px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .modesty-btn-float {
    animation: slideInRight 0.5s ease-out 0.5s both;
  }
</style>

<div class="modesty-btn-float">
  <a href="https://SEU-PROJETO.vercel.app" 
     target="_blank"
     onclick="if(typeof gtag !== 'undefined') { gtag('event', 'click', {'event_category': 'provador_virtual', 'event_label': 'botao_flutuante'}); }">
    <span class="icon">🕶️</span>
    <span>Provador Virtual</span>
  </a>
</div>
```

---

### OPÇÃO 5: Modal/Popup

Para experiência totalmente integrada dentro da loja.

```html
<!-- MODAL PROVADOR VIRTUAL - MODESTY STYLE -->
<style>
  .modesty-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    z-index: 999999;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s;
  }
  
  .modesty-modal.active {
    display: flex;
  }
  
  .modesty-modal-content {
    background: #FFFFFF;
    width: 95%;
    max-width: 1400px;
    height: 90vh;
    position: relative;
    animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .modesty-modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: #000000;
    color: #FFFFFF;
    border: none;
    width: 50px;
    height: 50px;
    font-size: 24px;
    cursor: pointer;
    z-index: 1;
    font-weight: 300;
    transition: all 0.3s;
  }
  
  .modesty-modal-close:hover {
    background: #333333;
    transform: rotate(90deg);
  }
  
  .modesty-modal-frame {
    width: 100%;
    height: 100%;
    border: none;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      transform: translateY(50px);
      opacity: 0;
    }
    to { 
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>

<div id="modestyModalProvador" class="modesty-modal">
  <div class="modesty-modal-content">
    <button class="modesty-modal-close" onclick="fecharModalProvadorModesty()">×</button>
    <iframe 
      id="modestyFrameProvador"
      class="modesty-modal-frame"
      src="" 
      title="Provador Virtual Modesty Company"
    ></iframe>
  </div>
</div>

<script>
  function abrirModalProvadorModesty() {
    const modal = document.getElementById('modestyModalProvador');
    const frame = document.getElementById('modestyFrameProvador');
    
    if (!frame.src) {
      frame.src = 'https://SEU-PROJETO.vercel.app';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (typeof gtag !== 'undefined') {
      gtag('event', 'open', {
        'event_category': 'provador_virtual',
        'event_label': 'modal'
      });
    }
  }
  
  function fecharModalProvadorModesty() {
    const modal = document.getElementById('modestyModalProvador');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
  
  // Fechar com ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      fecharModalProvadorModesty();
    }
  });
  
  // Fechar clicando fora
  document.getElementById('modestyModalProvador').addEventListener('click', function(e) {
    if (e.target === this) {
      fecharModalProvadorModesty();
    }
  });
</script>

<!-- Para abrir o modal, use em qualquer botão: -->
<!-- <button onclick="abrirModalProvadorModesty()">PROVADOR VIRTUAL</button> -->
```

---

## 🎯 Recomendação Final

**Combine as opções para máximo impacto:**

1. ✅ **Página dedicada** (link no menu principal)
2. ✅ **Banner na home** (chamar atenção)
3. ✅ **Botão flutuante** (acesso rápido em todas as páginas)

Essa combinação garante que seus clientes sempre encontrem o provador virtual, aumentando conversão e reduzindo devolução de óculos!

---

## 📱 Teste de Responsividade

O provador foi otimizado para:
- ✅ Desktop (1920px+)
- ✅ Laptop (1366px)
- ✅ Tablet (768px)
- ✅ Mobile (375px+)

---

## 🔗 Próximos Passos

1. Deploy no Vercel (veja SETUP.md)
2. Copiar URL do projeto
3. Substituir `https://SEU-PROJETO.vercel.app` nos códigos acima
4. Implementar as integrações escolhidas
5. Testar em diferentes dispositivos
6. Monitorar analytics

---

**Dúvidas?** Revise o README.md completo ou SETUP.md para instruções detalhadas!
