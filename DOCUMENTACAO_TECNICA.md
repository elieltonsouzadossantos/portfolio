# Documentação Técnica — Portfólio Elidavy

**Projeto:** `elieltonsouzadossantos/portfolio`
**URL de produção:** [elieltonsouzadossantos.github.io/portfolio](https://elieltonsouzadossantos.github.io/portfolio/)
**Responsável técnico:** Elielton Santos
**Versão do documento:** 1.0 · Setembro de 2026

Site-portfólio institucional — arquitetura, design system, funcionalidades e histórico de decisões.

---

## Sumário

1. [Visão geral do projeto](#1-visão-geral-do-projeto)
2. [Arquitetura de arquivos e pipeline de build](#2-arquitetura-de-arquivos-e-pipeline-de-build)
3. [Sistema de design (design tokens)](#3-sistema-de-design-design-tokens)
4. [Estrutura de seções da página](#4-estrutura-de-seções-da-página)
5. [Sistema de animação de partículas](#5-sistema-de-animação-de-partículas)
6. [Interações e demais scripts](#6-interações-e-demais-scripts)
7. [SEO, favicon e metadados de compartilhamento social](#7-seo-favicon-e-metadados-de-compartilhamento-social)
8. [Registro de decisões técnicas](#8-registro-de-decisões-técnicas)
9. [Manutenção e recomendações futuras](#9-manutenção-e-recomendações-futuras)

---

## 1. Visão geral do projeto

O site é o portfólio profissional de Elielton Santos, publicado sob a marca ELIDAVY, e cumpre dois papéis: (1) vitrine comercial para captar clientes de desenvolvimento web (sites e catálogos para negócio local) e (2) vitrine técnica de análise de dados, mostrando um estudo de caso real em Power BI. A página é construída inteiramente em HTML, CSS e JavaScript puro (vanilla) — sem framework, sem bundler e sem dependências de build além de um script Python interno de sincronização (ver seção 2).

O site está hospedado gratuitamente no GitHub Pages, publicado a partir deste repositório, e é atualizado por upload manual de arquivos pela interface web do GitHub.

### 1.1 Objetivos de negócio refletidos no código

- **Conversão rápida:** botão de WhatsApp fixo ("fab") sempre visível e link direto "Falar comigo" no cabeçalho, para reduzir o número de cliques até o contato.
- **Prova social:** seção de depoimentos reproduzindo, com autorização, uma conversa real de WhatsApp com uma cliente (Andreia).
- **Credibilidade técnica:** seção "Por que a Elidavy" (FAQ) e seção de dados com um estudo de caso real de Power BI, reforçando o duplo posicionamento — desenvolvimento de software e análise de dados.
- **Compartilhamento:** botão nativo de compartilhar (Web Share API) e metadados Open Graph, para que o link, ao ser enviado no WhatsApp, gere um cartão de prévia rico em vez de aparecer como texto puro.

---

## 2. Arquitetura de arquivos e pipeline de build

O projeto usa um modelo de "fonte única + geração derivada": todo o conteúdo é editado em um único arquivo canônico, e um script Python regenera automaticamente os arquivos que efetivamente são publicados. Isso evita o erro clássico de editar duas cópias de um mesmo site e elas ficarem dessincronizadas.

### 2.1 O arquivo canônico

`elielton-portfolio.html` é a única fonte de verdade do projeto. Não é um HTML completo — é um fragmento contendo a tag `<title>`, o bloco `<style>` inteiro e todo o conteúdo do `<body>`. Ele nunca é publicado diretamente; serve apenas de entrada para o script de build.

### 2.2 O script de sincronização — `sync_build.py`

Ao ser executado, o script lê o arquivo canônico com expressões regulares (extrai o título, o CSS e o corpo) e gera três artefatos:

| Arquivo gerado | Finalidade | Particularidade |
|---|---|---|
| `index.html` (raiz do projeto) | Espelho autônomo, usado para pré-visualização local e testes — abre sozinho em qualquer navegador. | Imagens embutidas em Base64 dentro do próprio HTML (nenhum arquivo externo necessário). |
| `site-build/index.html` | HTML que efetivamente é publicado no GitHub Pages. | Imagens trocadas para caminhos relativos (`images/profile.jpg`, `images/logo.png`, `images/catalog-preview.jpg`) e folha de estilo externa. |
| `site-build/style.css` | CSS extraído do bloco `<style>` do arquivo canônico. | Carregado via `<link rel="stylesheet">` no `site-build/index.html`. |

O script também injeta, nos dois HTMLs gerados, o favicon e o conjunto completo de meta tags de Open Graph / Twitter Card (ver seção 7), evitando que esses blocos precisem ser mantidos manualmente em três lugares diferentes.

**Por que trocar as imagens de Base64 por arquivos externos no site-build?**

- **Peso de página:** embutir fotos e logo como Base64 aumenta o tamanho do HTML em ~30–40%, pois a codificação Base64 é cerca de 33% maior que o binário original.
- **Cache do navegador:** como arquivos separados, o navegador do visitante armazena as imagens em cache entre visitas; embutidas no HTML, elas seriam rebaixadas a cada carregamento de página.
- **Compatibilidade com o fluxo de upload manual no GitHub:** trocar uma imagem no site publicado é feito subindo um novo arquivo binário em `images/`, sem precisar re-gerar todo o HTML.

### 2.3 Fluxo de trabalho (do ajuste à publicação)

```
1. Editar o conteúdo/estilo em elielton-portfolio.html (arquivo canônico).
2. Rodar `python sync_build.py` — regenera index.html e site-build/.
3. Pré-visualizar localmente e validar o resultado (capturas de tela / navegador).
4. Aprovação do responsável do projeto antes de qualquer publicação.
5. Enviar os arquivos de site-build/ (e imagens novas, se houver) para o
   repositório GitHub via upload manual pela interface web.
6. Verificar o site publicado (elieltonsouzadossantos.github.io/portfolio)
   com o cache do navegador ignorado, para confirmar que a versão nova
   está realmente no ar.
```

### 2.4 Publicação — GitHub Pages

O site é servido estaticamente pelo GitHub Pages a partir deste repositório. Não há etapa de build no servidor: os arquivos de `site-build/` (`index.html`, `style.css` e a pasta `images/`) são exatamente os arquivos que o navegador do visitante recebe. Substituir uma imagem binária (foto, logo) não pode ser feito pelo editor de texto do GitHub — é necessário usar **"Add file → Upload files"**, que reconhece o mesmo nome de arquivo e o substitui.

---

## 3. Sistema de design (design tokens)

Toda a identidade visual do site é controlada por variáveis CSS (custom properties) declaradas uma única vez em `:root`, no topo da folha de estilo. Alterar uma cor no sistema inteiro é, na prática, trocar um único valor hexadecimal.

### 3.1 Paleta de cores

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#050505` | Fundo geral da página (preto quase absoluto). |
| `--surface` | `#101010` | Fundo de cartões e blocos elevados (ex.: mockup do case, dashboard Power BI). |
| `--surface-2` | `#1a1a1a` | Fundo de elementos ainda mais elevados dentro de um cartão. |
| `--paper` | `#ffffff` | Cor de texto principal sobre o fundo escuro. |
| `--paper-dim` | `#b4b4b4` | Texto secundário / de apoio. |
| `--paper-faint` | `#6b7280` | Texto terciário — legendas, rótulos discretos. |
| `--data` | `#14b8a6` | Cor de destaque ("teal") — usada em ícones, gráficos e nos elementos ligados à área de Dados. |
| `--data-light` | `#2dd4bf` | Variante clara do destaque — hover, brilho, partículas. |
| `--data-dark` | `#0d9488` | Variante escura do destaque — bordas, estados pressionados. |
| `--line` | `rgba(255,255,255,.10)` | Linhas divisórias padrão entre seções. |
| `--line-strong` | `rgba(255,255,255,.20)` | Linhas de maior contraste (bordas de cartão em foco). |
| `--line-faint` | `rgba(255,255,255,.05)` | Linhas quase imperceptíveis, para separações sutis. |

O tom "teal" (`#14b8a6` e variações) é o único acento de cor usado propositalmente em todo o site — reservado para a área de Dados/Power BI e para elementos de ação (links, ícone do WhatsApp, partículas), o que o mantém legível como um sinal de "isto é clicável" ou "isto é dado".

### 3.2 Tipografia

| Família | Papel | Onde é usada |
|---|---|---|
| Inter | Texto de interface (UI) | Corpo de texto, navegação, botões, rótulos — pesos 400 a 700. |
| Playfair Display | Display / marca | Glifo "e" da marca e alvo da animação de partículas (peso 800). |
| Cormorant Garamond | Serifada de apoio | Fallback estético da Playfair Display em elementos de marca. |

As três famílias são carregadas de uma vez via `@import` do Google Fonts no topo do CSS. Os títulos (`h1`–`h3`) usam `text-wrap: balance`, para que o navegador distribua as palavras de forma equilibrada entre linhas em vez de deixar uma última linha "órfã" com uma palavra só.

### 3.3 Layout

- Container central `.wrap` com largura máxima de 1180px e padding lateral de 40px — reutilizado em todas as seções para manter o conteúdo alinhado.
- Cada seção segue o mesmo padrão de cabeçalho: título (`h2`) + numeração/rótulo em mono à direita (ex.: "01 — sobre", "05 — power bi"), o que dá ao visitante uma noção implícita de progressão dentro da página.
- Breakpoints responsivos em 760px (colapso principal para layout de uma coluna) e 400px (ajustes finos para telas muito estreitas).

---

## 4. Estrutura de seções da página

A página é uma landing page de rolagem única (single page), dividida em blocos `<section>` identificados por âncora, na seguinte ordem:

| # | Seção (id) | Conteúdo e função |
|---|---|---|
| — | `nav` + `menu-panel` | Cabeçalho fixo: botão hambúrguer, marca "ELIDAVY" e botão "Falar comigo". O menu (Projetos / Dados / Contato) abre como painel deslizante. |
| — | `particle-section` / `hero` | Canvas animado com o glifo "e" formado por partículas (ver seção 5), título de impacto, subtítulo e dois CTAs ("Ver projetos" / "Falar comigo"), cartão de identidade (nome, especialidade, localização) e tira de estatísticas (5 negócios atendidos, 139 mil+ linhas modeladas, 12 decisões documentadas em ADR). |
| 01 | `sobre` | Texto de apresentação profissional — quem é, o que entrega, e o compromisso de documentar decisões técnicas. |
| 02 | `servicos` | Comparativo em duas colunas: trilha "Desenvolvimento" (sites/catálogos) vs. trilha "Dados" (dashboards e Power BI), cada uma com lista de entregáveis. |
| 03 | `porque` | FAQ em acordeão nativo (`<details>`/`<summary>`), 5 perguntas focadas em objeção de venda (por que contratar um engenheiro e não só alguém que programa, suporte pós-entrega, etc.). |
| 04 | `projetos` | Estudo de caso principal (Catálogo Andreia Patéis — CMS Decap + Netlify) com mockup de navegador e grade de 4 benefícios, seguido de uma grade de 4 mini-projetos (hamburgueria, loja de camisetas, barbearia, eletricista). |
| 05 | `dados` | Estudo de caso de Power BI: painel de pedidos/entregas com KPIs (OTIF, ONTIME, INFULL, tempo de ciclo), gráfico SVG de tendência do indicador OTIF e quebras por motivo de ocorrência e por filial. |
| 06 | `habilidades` | Duas colunas de "chips": ferramentas de Desenvolvimento (HTML/CSS/JS, Git, Netlify, Decap CMS, ADR) e de Dados (Power BI, DAX, Power Query, SQL, Excel). |
| 07 | `feedback` | Depoimento em formato de bolha de conversa do WhatsApp (print real da cliente Andreia, com autorização), reestilizado na paleta do site, mais um convite para novos clientes enviarem feedback. |
| — | `contato` | Lista de contato (WhatsApp, e-mail, LinkedIn, cidade-base). |
| — | `footer` | Marca d'água tipográfica "ELIDAVY" em segundo plano, coluna de marca + tagline, credenciais (formação, área de atuação), copyright e crédito "Desenvolvido por ELIDAVY TECH" com link para o Instagram. |
| — | `fab-stack` | Dois botões flutuantes fixos no canto da tela: compartilhar (Web Share API) e ir direto ao WhatsApp. |

---

## 5. Sistema de animação de partículas

O efeito visual de abertura do site — um "e" formado por partículas que nunca param de se mover — é inteiramente feito à mão em Canvas 2D e JavaScript vanilla, sem nenhuma biblioteca gráfica externa. É o componente mais elaborado do projeto e passou por três iterações de intensidade antes da versão aprovada.

### 5.1 Como o alvo ("e") é construído

- Um `<canvas>` invisível (fora da tela) desenha o caractere "e" com a fonte Playfair Display, peso 800, no tamanho do container visível.
- O script varre essa imagem pixel a pixel (a cada 2px) e guarda as coordenadas de todo pixel com opacidade (canal alfa) acima de um limiar — ou seja, todo pixel que faz parte do desenho da letra.
- Cada ponto encontrado gera duas partículas (uma exatamente no ponto, outra levemente deslocada ao redor), o que dá densidade suficiente para o "e" ficar legível mesmo sendo feito de pontos soltos.

### 5.2 Por que a animação parava — e como foi resolvido

Na primeira versão, cada partícula se movia (por interpolação, "ease") até seu ponto-alvo fixo e, ao chegar, sua velocidade tendia a zero — o efeito visual era o de a letra "se montar" e então congelar. A correção não foi aumentar a velocidade, e sim fazer o próprio alvo de cada partícula "vagar" continuamente ao redor do ponto original, para que a partícula nunca pare de perseguir algo.

**Implementação — o alvo "vagante" (wobble)**

Cada partícula recebe, na inicialização, uma fase aleatória e duas frequências de oscilação independentes. A cada quadro de animação, a posição-alvo real é recalculada somando duas ondas senoidais sobrepostas (um padrão do tipo Lissajous) ao ponto-alvo fixo original:

```js
wx = tx + sin(t·wobbleSpeed + phase)·wobbleAmp
        + sin(t·wobbleSpeed2 + phase2)·wobbleAmp·0.65
wy = ty + cos(t·wobbleSpeed·0.85 + phase)·wobbleAmp
        + cos(t·wobbleSpeed2·1.15 + phase2)·wobbleAmp·0.65
// a partícula sempre "persegue" (wx, wy), nunca (tx, ty) direto
p.x += (wx - p.x) * p.speed
p.y += (wy - p.y) * p.speed
```

Duas frequências por partícula (em vez de uma) evitam que o movimento pareça uma órbita circular mecânica — o resultado lido pelo olho é orgânico, como uma névoa viva, não um giro uniforme. Esse é o parâmetro que foi calibrado por três versões ("sutil", "médio", "nebulosa") até o cliente aprovar a mais intensa:

| Parâmetro | Versão aprovada ("nebulosa") | Efeito |
|---|---|---|
| `wobbleAmp` | aleatório entre 7 e 17px | Amplitude do desvio — quanto a partícula se afasta do ponto original. |
| `wobbleSpeed` | aleatório entre 0,7 e 1,8 | Velocidade da primeira onda de oscilação. |
| `wobbleSpeed2` | aleatório entre 1,3 e 3,6 | Velocidade da segunda onda (harmônico), com peso 0,65 sobre a amplitude. |

### 5.3 Robustez

- Respeita `prefers-reduced-motion`: usuários que pedem menos movimento ao sistema operacional recebem o "e" estático, sem nenhuma partícula animada.
- `ResizeObserver` reconstrói o alvo sempre que o tamanho do container muda (ex.: rotação do celular), com debounce via `requestAnimationFrame` para não recalcular a cada pixel do redimensionamento.
- `document.fonts.ready` dispara uma reconstrução do alvo assim que a fonte Playfair Display termina de carregar — evita que o "e" seja desenhado com a fonte de fallback do sistema por uma fração de segundo.
- Correção de robustez: a primeira chamada do laço de animação passa a usar `requestAnimationFrame(animate)` em vez de `animate()` direto, garantindo que o primeiro quadro sempre receba um timestamp real (evita `NaN` no cálculo do tempo).

### 5.4 Contexto de mercado: como a Asimov Academy faz o efeito equivalente

Durante o desenvolvimento, o site da Asimov Academy foi usado como referência de "nuvem de partículas sempre em movimento". A investigação técnica (inspeção de DOM e de rede) mostrou que o efeito deles não é feito à mão: é gerado por uma ferramenta paga de terceiros, a Unicorn Studio (WebGL), identificada pelo atributo `data-us-project` no HTML deles. Foi também constatado que a Asimov usa uma imagem estática como alternativa ("fallback") em telas de celular, para não pesar o carregamento em conexões móveis — o que valida a escolha, já feita no site da Elidavy, de manter o efeito em Canvas 2D leve, sem dependência de WebGL.

---

## 6. Interações e demais scripts

### 6.1 Menu hambúrguer

Um único bloco de JavaScript alterna a classe `.open` do painel de menu ao clicar no botão hambúrguer, atualiza o atributo `aria-expanded` para acessibilidade, e fecha automaticamente o painel sempre que um dos links internos é clicado.

### 6.2 Botão de compartilhar

Ao clicar no botão flutuante de compartilhar, o script tenta primeiro a Web Share API nativa do navegador (`navigator.share`) e, se ela não existir (ex.: navegador desktop sem suporte), cai para copiar o link para a área de transferência e mostrar um aviso ("Link copiado!") por 2,2 segundos.

**Correção aplicada:** originalmente o compartilhamento enviava título, descrição e URL juntos (`navigator.share({title, text, url})`). No WhatsApp isso fazia o app publicar duas mensagens separadas — o cartão de prévia gerado automaticamente a partir da URL e, embaixo, uma segunda mensagem de texto puro repetindo título/descrição. A correção foi enviar apenas a URL; o WhatsApp já busca título, descrição e imagem das meta tags Open Graph da própria página (seção 7), então nada de informação é perdido — apenas a duplicidade é eliminada.

---

## 7. SEO, favicon e metadados de compartilhamento social

### 7.1 Título e favicon

O `<title>` da página é "Elidavy" — o nome da marca, sem sufixo descritivo, para reforçar reconhecimento de marca na aba do navegador. O favicon reaproveita a mesma imagem PNG usada como marca no rodapé (o quadrado preto com o "e"), evitando manter dois ativos visuais de marca separados.

### 7.2 Open Graph / Twitter Card

O `<head>` inclui um conjunto completo de meta tags para que qualquer app de mensagem ou rede social gere um cartão de prévia rico ao colar o link do site, em vez de mostrar apenas texto:

```
og:type · og:title · og:description · og:image · og:url
twitter:card = summary_large_image
twitter:title · twitter:description · twitter:image
```

A imagem usada em `og:image` é um arquivo dedicado (`og-image.png`), desenhado especificamente para esse cartão — apenas a marca e o nome ELIDAVY, sem repetir o título/descrição que o próprio WhatsApp já exibe embaixo do cartão.

**Por que PNG e não JPEG**

A primeira versão da `og-image` foi salva em JPEG e apresentou um defeito real de compressão: um leve halo/"ringing" visível ao redor do texto branco sobre fundo escuro — artefato típico da compressão JPEG em bordas de alto contraste. A correção foi trocar para PNG, que usa compressão sem perdas e preserva bordas nítidas de texto e logotipo perfeitamente.

---

## 8. Registro de decisões técnicas

Resumo, em formato de registro de decisão (no espírito do que a própria página promete ao cliente — "documentando cada decisão técnica"), das mudanças mais recentes aplicadas ao projeto, com o problema identificado e a solução escolhida.

| Decisão | Problema / motivação | Solução aplicada |
|---|---|---|
| Favicon + título da aba | Aba do navegador usava o ícone e o título padrão, sem identidade de marca. | Favicon com a marca "e" já existente; título simplificado para "Elidavy". |
| Metadados Open Graph + og-image | Link do site, ao ser compartilhado (ex.: WhatsApp), aparecia como texto puro, sem prévia visual. | Meta tags OG/Twitter completas + imagem dedicada (PNG) desenhada só com marca e wordmark. |
| Payload do botão de compartilhar | WhatsApp publicava duas mensagens (cartão + texto duplicado) por causa de `title`/`text` no payload. | `navigator.share()` passou a enviar somente `{url}`; título/descrição vêm da própria Open Graph. |
| Centralização do rodapé no mobile | Bloco de marca do rodapé ficava colado à esquerda da tela em telas de celular. | Regra específica de media query (`max-width:760px`) centralizando o `footer-grid` apenas no mobile. |
| Tamanho do cabeçalho (hambúrguer/marca) | Ícone, marca e "ELIDAVY" pareciam pequenos frente a referência de mercado (Asimov Academy). | Aumento medido por comparação de pixels; ajuste moderado de tamanho (40px/17px) combinado com peso de fonte maior (700), validado sem sobreposição em 320/360/375/390/1280px. |
| Animação de partículas contínua | Efeito de partículas formava o "e" e então parava de se mover. | Alvo de cada partícula passou a oscilar continuamente (wobble de duas frequências); intensidade "nebulosa" aprovada após 3 opções testadas. |
| Seção de depoimentos | Seção "Feedback dos clientes" existia no layout mas estava vazia. | Depoimento real da cliente Andreia, reproduzido como bolha de conversa do WhatsApp reestilizada na paleta do site. |

---

## 9. Manutenção e recomendações futuras

### 9.1 Como adicionar um novo projeto ou depoimento

1. Editar apenas `elielton-portfolio.html` (nunca os arquivos dentro de `site-build/` diretamente — eles são sobrescritos a cada geração).
2. Rodar `sync_build.py`.
3. Testar localmente abrindo o `index.html` gerado na raiz do projeto.
4. Só então subir os arquivos atualizados de `site-build/` (e imagens novas em `site-build/images/`, se houver) para o repositório no GitHub.

### 9.2 Pontos de atenção

- Imagens binárias (fotos, logo) não podem ser editadas pelo editor de texto do GitHub — sempre usar "Add file → Upload files" para substituição.
- Após qualquer publicação, verificar o site ao vivo ignorando o cache do navegador (recarregamento forçado), pois o GitHub Pages e os navegadores tendem a manter versões antigas em cache por um tempo.
- Se o site vier a ganhar muitos novos depoimentos ou projetos, vale considerar extrair essas listas para um arquivo de dados separado (ex.: JSON) lido pelo script de build, em vez de continuar crescendo o HTML manualmente.

### 9.3 Ideias para evolução

- Formulário de contato direto na página (hoje o contato depende inteiramente de links externos para WhatsApp/e-mail).
- Página ou seção dedicada por projeto, com mais detalhes técnicos de cada entrega (hoje concentrados no case da Andreia).
- Métricas de acesso (ex.: um contador de visitas simples), já que o site não possui hoje nenhuma forma de analytics.
