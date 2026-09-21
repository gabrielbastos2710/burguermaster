# Burguer Master

Site de delivery de uma hamburgueria fictícia. HTML, CSS e JavaScript puros —
sem framework, sem build, sem passo de compilação. Uma dependência externa
(three.js, por import dinâmico) e uma fonte (Inter).

## Como abrir

```bash
npx -y serve -l 4173 .
```

ou

```bash
python3 -m http.server 4173
```

Depois, `http://localhost:4173`.

Abrir por `file://` também funciona — a textura da fumaça é um data URI
justamente por isso —, mas o `import()` do three.js exige origem http: sem
servidor o hero fica sem fumaça e o resto continua inteiro.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | Estrutura da página e os sprites SVG da marca e dos ícones |
| `styles.css` | Tokens (tema escuro padrão + tema claro), o hero inteiro, cardápio, sacola, três breakpoints e o bloco de movimento |
| `script.js` | `ITEMS` como fonte única, filtro e busca, sacola, gaveta, carrossel e a sequência do hambúrguer presa ao scroll |
| `hero-smoke.js` | Fumaça WebGL — porte do react-smoke (MIT) para three.js puro, carregada sob demanda |
| `hero-smoke-texture.js` | A textura da fumaça, embutida como data URI |
| `images/webp/` | Fotos, miniaturas, ícones de categoria, placas do salão, promo e logo |
| `images/burger/` | Os 72 quadros do hambúrguer (828×1440, com alfa) |

## As três peças que sustentam o hero

**O trilho.** `.hero-scroll` envolve o hero e um bloco de "combustível" que só
ganha altura com a classe `.is-armed`. Enquanto essa altura é consumida, o hero
fica grudado no topo: a página parece parada e só o hambúrguer se move — abre,
descansa aberto, fecha. Sem script, com `prefers-reduced-motion`, em conexão
medida ou com os quadros no ar, o combustível é zero e o hero é um carrossel de
fotos comum.

**O tamanho sai de medida, não de palpite.** `BURGER_BOUNDS` guarda o topo e a
base do hambúrguer em cada um dos 72 quadros, lidos do canal alfa dos próprios
arquivos. Fechado, ele tem exatamente o tamanho da foto parada na mesma caixa —
é o que torna a troca foto→canvas invisível. Aberto, nunca ultrapassa a banda
livre entre o cabeçalho e o primeiro bloco que divide coluna com ele. Em tela
apertada a sequência para num quadro anterior em vez de encolher.

**O salão respira sem repintar.** Duas cópias da mesma foto do salão, com o
desfoque assado no arquivo em duas profundidades. Só `transform` e `opacity`
animam; os dois ciclos têm períodos primos entre si (26s e 17s), então o laço
nunca se denuncia. Fora da dobra ou com a aba escondida, as duas param.

## Ativos

**A fotografia em `images/` é temporária, de demonstração.** Ela está aqui para
o site rodar, não porque seja definitiva: antes de virar site de verdade,
substitua por fotografia própria mantendo os mesmos nomes de arquivo. Os
caminhos estão todos centralizados em `images/`, então nenhuma linha de código
precisa mudar.

`images/README.md` lista cada arquivo com nome, medida e finalidade, e traz o
script que remede `BURGER_BOUNDS` quando os 72 quadros do hambúrguer forem
trocados — essa medida é o que impede o hambúrguer aberto de ser cortado, então
ela não pode ficar para trás.

A marca é desenho original: o símbolo e o wordmark (sprites SVG dentro do
`index.html`), o `favicon.svg`, o `apple-touch-icon.png` e o
`images/webp/master-logo.webp`.

## Créditos

A fumaça é um porte do [react-smoke](https://github.com/isoteriksoftware/react-smoke)
(MIT) para three.js puro, incluindo a textura padrão da biblioteca.
