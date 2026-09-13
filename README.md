# Portfólio · Pedro Alencastro

Portfólio front-end em **React 19 + TypeScript + Vite**. A página é uma timeline
vertical (hero → galeria → stack → sobre → contato) com uma galeria de seis
produtos: cada card abre uma folha de case — problema, decisão técnica e impacto
— com um **preview interativo** que recria a interface real do projeto.

A seção **Sobre** é um histograma de escopo por ano: a altura da coluna é a
contagem de frentes cobertas naquele ano, listadas logo abaixo dela — uma escala
com definição embaixo, não uma nota inventada. As barras crescem na revelação,
em cascata por coluna e de baixo para cima dentro dela.

## Stack

| Camada     | Escolha                                                       |
| ---------- | ------------------------------------------------------------- |
| UI         | React 19 + TypeScript (strict)                                 |
| Build      | Vite 6                                                         |
| Estilo     | CSS com design tokens (tema `Nocturne`), sem framework externo  |
| Tipografia | Inter                                                          |

## Rodando

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc -b + vite build → dist/
npm run preview   # serve o build de produção
```

## Estrutura

```
src/
  App.tsx                 orquestra a página e o estado do case aberto
  components/
    Section.tsx           uma parada da timeline (nó + revelação em scroll)
    Nav.tsx  Hero.tsx  Gallery.tsx  Stack.tsx  Journey.tsx  Contact.tsx
    ProjectCard.tsx  ProjectThumb.tsx
    CaseSheet.tsx         folha de case em portal, com navegação entre projetos
    previews/             uma recriação navegável por projeto + registro id → componente
  data/                   conteúdo dos cases e dos previews, tipado
  hooks/                  ver "Animação" abaixo
  lib/format.ts           moeda pt-BR e composição de classes
  styles/                 tokens + primitivos do design system + seções + movimento
```

### Os previews

`Project.previewKind` decide o que a folha de case monta: `recreation` para as
ferramentas internas (um componente isolado com estado próprio) e `live` para o
que está publicado — aí o site real entra num iframe.

| Projeto             | Preview      | O que dá para fazer                                              |
| ------------------- | ------------ | ---------------------------------------------------------------- |
| N1 App              | recriação    | selecionar um ticket e disparar a triagem assistida               |
| Eixo                | recriação    | trocar de módulo no “Painel de Rodagem”                           |
| **Natal Transfer**  | **ao vivo**  | o site em produção, embutido e navegável                          |
| API Leaner          | recriação    | montar método + endpoint e ver a resposta (405 em POST)           |
| Plataforma Delivery | recriação    | montar o pedido e ver a mensagem de WhatsApp sendo gerada         |
| Gestão & Receitas   | recriação    | produzir uma receita e ver o estoque baixar por insumo            |

Nas recriações os dados são fictícios: as ferramentas de origem são internas ou
privadas. O embed ao vivo trata o cold start do plano gratuito do Render — um
iframe cross-origin não reporta erro de rede para quem embute, então o estado
vem do `onLoad` e de um timer, com link para abrir em nova aba como saída.

### O simulador de dispositivo

O embed ao vivo alterna entre **Web**, **Tablet** e **App**, com transição
animada, e tem botão de tela cheia (Fullscreen API).

O truque é **não** redimensionar o iframe para caber: ele sempre recebe o
viewport lógico do formato escolhido — 1440, 834 ou 390 CSS px — e é
`scale()`-ado para o espaço disponível. Assim o site renderiza o layout
verdadeiro daquele formato, e não um layout intermediário que ninguém veria na
vida real. No modo Web a altura é fluida (largura travada no breakpoint de
desktop, altura preenchendo o palco); Tablet e App mantêm a proporção física.

Dois detalhes que só aparecem construindo:

- A área disponível é medida com `clientWidth/clientHeight`, **não** com
  `getBoundingClientRect()` — a folha de case entra com um `scale(0.985)` e o
  rect sai multiplicado por ele, congelando a medida em 98,5% do real.
- Mede-se a caixa de conteúdo (um filho sem padding), não a caixa externa;
  senão a moldura invade o respiro e é cortada pelo `overflow: hidden`.
- Com um preview em tela cheia, `Esc` e as setas pertencem ao preview: a folha
  de case ignora as teclas enquanto houver `document.fullscreenElement`.

### O explorador de stack

A seção `#stack` cobre 26 tecnologias em 5 frentes (front-end, testes, back-end,
ferramentas, plataformas). As abas usam o mesmo realce deslizante do preview do
Eixo — extraído para `useSlidingIndicator` e compartilhado pelos dois.

O layout é **mestre-detalhe**, não uma grade de cards iguais: a lista à esquerda
mostra todos os nomes de uma vez (é o que a leitura rápida quer) e o painel à
direita abre a profundidade de um por vez (é o que a leitura atenta quer). Sem
medidor de proficiência — uma fileira de pontinhos transforma uma habilidade
real num número inventado, sem escala embaixo. **A prova de domínio é o projeto
onde a coisa roda**: cada competência mostra "em N de 6 projetos" e os botões
abrem o case correspondente, ligando a stack de volta à galeria.

Fecha com a formação: Tecnólogo em ADS (Unigranrio, jun/2025) e as 224h de
cursos certificados.

### As capas

A capa de cada card da galeria é o próprio projeto: a captura real, dentro de
uma moldura de navegador, ancorada no topo (cabeçalho e hero de cada site). As
capturas vêm de `src/data/screenshots.ts`, que liga cada arquivo ao seu case —
o mesmo módulo alimenta a vitrine do hero.

Quem ainda não tem captura (Cantina e Natal Transfer) segue com a silhueta do
app desenhada em CSS (cardápio + bolha, trajeto e tarifa). Basta salvar a
captura em `src/assets/Examples` e apontar o `project` dela para a capa trocar.

### O hero

As capturas de `src/assets/Examples` ficam soltas ao lado do título, cada uma
com posição, largura, rotação, escala e profundidade de repouso próprias — uma
composição desenhada, não uma grade. Apontar um card o tira da mesa: ele cresce
para 1,2×, se endireita e inclina acompanhando o cursor, com a sombra ficando
para trás no espaço 3D. Ao soltar, volta pelo mesmo spring.

- **Só `transform` e `opacity`.** O campo posiciona os cards uma vez
  (`left`/`top` em %); daí em diante o Framer Motion (`useMotionValue` →
  `useTransform` → `useSpring`) escreve só transformação e opacidade. Sombra e
  véu de profundidade são camadas que acendem por opacidade — nenhum
  `box-shadow` animado.
- **±12°, não mais**: somada à escala de 1,2×, uma inclinação maior encurta a
  borda de trás a ponto de borrar o texto da captura.
- **O ponteiro é medido no invólucro, que nunca gira.** Medir o card inclinado
  seria um laço: a inclinação muda o retângulo, que muda a inclinação.
- **A pilha só cresce**: o último card apontado fica por cima, como foto
  devolvida à mesa.
- **Toque não simula cursor**: um toque expande o card, tocar fora recolhe.
  **Movimento reduzido**: sem inclinação, só escala e véu.
- **Campo de proximidade**: com o cursor por perto (sem tocar), cada card é
  puxado até 14px na direção dele e vira a face para ele (até 6°), com um
  spring mais mole que o do hover — os vizinhos chegam com inércia. Os da
  frente da pilha reagem mais (paralaxe). Um listener só para o campo, ativo
  só com a vitrine na tela; o ponteiro vai em coordenadas da página e cada
  card mede seu centro pelo layout (`offsetTop`), então nem o scroll nem o
  próprio puxão obrigam a remedir.
- **Reflexo**: no card na mão, um brilho largo corre sob o cursor — pintado
  uma vez, depois só `transform` e `opacity`.
- **Imagens**: o `vite-imagetools` transforma cada PNG (até 1 MB) em quatro
  WebP de 480 a 1440px no build, e o `sizes` pede a largura do card já
  expandido. `loading="lazy"` e `fetchpriority="low"` mantêm o título como
  LCP. Uma captura nova entra só de ser salva na pasta; texto alternativo e
  case vêm de um mapa por nome de arquivo em `src/data/screenshots.ts`.

## Animação

A regra é uma só: **o React alimenta números, o CSS desenha.** Nada que roda a
60fps passa pelo estado do componente.

| Hook                     | O que faz                                                                 |
| ------------------------ | ------------------------------------------------------------------------- |
| `useSpineProgress`       | preenche a linha da timeline escrevendo `height` num rAF, sem re-render    |
| `useScrollProgress`      | progresso de leitura → `--progress` na barra da nav (`scaleX`)             |
| `usePointerSpotlight`    | posição do ponteiro → `--px/--py` e `--tilt-x/--tilt-y`, num rAF           |
| `useReveal`              | `IntersectionObserver` → classe `is-visible` na seção                      |
| `useCountUp`             | anima o número de impacto do case (só quando o número lidera a frase)      |
| `useSlidingIndicator`    | mede o item ativo e devolve sua caixa para um realce único deslizar até ele |
| `useMagnetic`            | CTAs puxados na direção do ponteiro → `--mag-x/--mag-y`                    |
| `useViewTransition`      | envolve a troca de case numa View Transition (com `flushSync`)             |
| `usePrefersReducedMotion`| fonte única de verdade para desligar os efeitos escritos por script        |
| `useBodyScrollLock`      | trava o scroll enquanto a folha está aberta                                |

Do lado do CSS (`src/styles/motion.css`):

- **`@property`** tipando `--ring-angle` como `<angle>` — sem isso o navegador
  não interpola e o anel cônico animado não gira.
- **Anel cônico** em duas camadas de fundo (`padding-box` + `border-box`), sem
  pseudo-elemento.
- **Cascata de entrada** em duas famílias: `.stagger` (transição disparada pela
  revelação em scroll) e `.rise-in` (animação disparada pela montagem — a folha
  de case usa `key` do React para replayar). O atraso sai de `--stagger`,
  atribuído por `:nth-child()`.
- **`:has()`** — apontar um card faz os vizinhos recuarem.
- **Spotlight + tilt 3D** no card, pintados por `radial-gradient` e `rotateX/Y`
  lendo as custom properties.
- **`text-wrap: balance` / `pretty`** nos títulos e parágrafos.
- **Grão de filme** gerado por `feTurbulence` num data URI — textura sem baixar
  imagem nenhuma.
- **Aurora** fixa que segue o ponteiro pela viewport, em `z-index: -1` para ficar
  acima do fundo e abaixo do texto.
- **Tipografia cinética**: cada linha do título sobe de trás de uma máscara
  (`overflow: hidden` com `padding-bottom`/`margin-bottom` negativo devolvendo
  espaço para as descidas).
- **`animation-timeline: view()`** apaga e desloca o hero conforme ele sai da
  viewport — scroll-driven puro, sem listener nem rAF, fora da main thread.
- **View Transitions** nomeando `.sheet__panel`, para o navegador animar só o
  painel ao trocar de case em vez da página inteira.
- Um `@media (prefers-reduced-motion: reduce)` desliga tudo isso.

O indicador das abas do preview do Eixo é um único elemento que desliza: um
`useLayoutEffect` mede a aba ativa (com `ResizeObserver` para quando as abas
quebram de linha) e o CSS interpola `transform`/`width`.

## Decisões

- **Sem biblioteca de UI.** O visual vem de tokens CSS (`src/styles/tokens.css`)
  e de um punhado de primitivos (`.btn`, `.tag`, `.card`, `.dialog`).
- **Acessibilidade.** Cards são `<button>` de verdade (teclado nativo); a folha
  de case é `role="dialog"` com foco gerenciado, armadilha de `Tab`, `Esc` para
  fechar, `←`/`→` para navegar entre cases e foco devolvido ao card de origem.
- **Responsivo.** Os previews colapsam para uma coluna abaixo de 760px; a página
  foi verificada de 320px a 1920px sem overflow horizontal.

## Contato

[LinkedIn](https://www.linkedin.com/in/alencastrp/) · [GitHub](https://github.com/alencastrop)
