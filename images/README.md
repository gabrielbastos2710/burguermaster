# Ativos

Só `webp/master-logo.webp` está versionado — é desenho original, junto com o
`favicon.svg` e o `apple-touch-icon.png` da raiz. O resto desta pasta é
fotografia de produto, e cada projeto traz a sua: os arquivos abaixo ficam fora
do repositório de propósito.

Os caminhos estão todos centralizados aqui. Gerando os arquivos com estes
nomes e medidas, nenhuma linha de código precisa mudar.

## `webp/`

| Arquivo | Medida | O que é |
|---|---|---|
| `hero-cheddar-bacon.webp` | 1000×1060 | Foto do destaque 1, com fundo transparente |
| `hero-cheddar-bacon-640.webp` | 640×678 | A mesma, para telas estreitas (`srcset` 640w) |
| `hero-smash-duplo.webp` | 1000×1060 | Destaque 2 |
| `hero-smash-duplo-640.webp` | 640×678 | Destaque 2, 640w |
| `hero-picante.webp` | 1000×1060 | Destaque 3 |
| `hero-picante-640.webp` | 640×678 | Destaque 3, 640w |
| `thumb-cheddar-bacon.webp` | 300×300 | Miniatura do trilho do hero |
| `thumb-smash-duplo.webp` | 300×300 | Miniatura |
| `thumb-picante.webp` | 300×300 | Miniatura |
| `cat-todos.webp` | 160×160 | Ícone de categoria (recortado em círculo pelo CSS) |
| `cat-classicos.webp` | 160×160 | Ícone de categoria |
| `cat-especiais.webp` | 160×160 | Ícone de categoria |
| `cat-acompanhamentos.webp` | 160×160 | Ícone de categoria |
| `cat-bebidas.webp` | 160×160 | Ícone de categoria |
| `cat-sobremesas.webp` | 160×160 | Ícone de categoria |
| `burger-combo-refri.webp` | 1512×1040 | Master Clássico |
| `burger-bacon.webp` | 1512×1040 | Cheddar Bacon |
| `burger-duplo.webp` | 1512×1040 | Smash Duplo |
| `burger-combo-limonada.webp` | 1512×1040 | Combo Master |
| `burger-picante.webp` | 1512×1040 | Picante da Casa |
| `burger-veggie.webp` | 1512×1040 | Veggie de Grão-de-bico |
| `batata-1.webp` | 1512×1040 | Batata Rústica |
| `onion-rings.webp` | 1512×1040 | Onion Rings |
| `milkshake-1.webp` | 1512×1040 | Milkshake de Doce de Leite |
| `limonada-1.webp` | 1512×1040 | Limonada do Master |
| `chopp.webp` | 1512×1040 | Chopp Artesanal |
| `brownie.webp` | 1512×1040 | Brownie na Chapa |
| `promo-master-red.webp` | 1916×821 | Faixa da promoção |
| `hero-room-deep.webp` | 280px de largura | Salão ao fundo, desfoque profundo |
| `hero-room-soft.webp` | 420px de largura | O mesmo salão, desfoque leve |

As duas placas do salão são **a mesma foto** em duas profundidades de Gaussian.
O desfoque vai assado no arquivo, não no filtro do browser: gere em ~1670px de
largura, aplique o blur e só então reduza para 280 e 420px — depois de borrada
não sobra detalhe que justifique pixel. É a mistura entre as duas que respira
no hero, e por isso elas precisam estar alinhadas ao pixel.

## `burger/`

`f_001.webp` … `f_072.webp`, 828×1440, com canal alfa — o hambúrguer se abrindo
em camadas, um quadro por arquivo.

Ao trocar os quadros, **remeça `BURGER_BOUNDS`** em `script.js`: são 72 pares
(topo, base) em pixels do arquivo, lidos do canal alfa. É dessa medida que sai
a escala de cada quadro, e é ela que torna o corte do hambúrguer
geometricamente impossível em vez de uma coincidência feliz. O script abaixo
regenera o array (precisa de `npm i sharp`):

```js
const sharp = require("sharp");
const N = 72, ALPHA_MIN = 8;
(async () => {
  const pares = [];
  for (let i = 1; i <= N; i += 1) {
    const arquivo = `images/burger/f_${String(i).padStart(3, "0")}.webp`;
    const { data, info } = await sharp(arquivo)
      .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let topo = -1, base = -1;
    for (let y = 0; y < info.height; y += 1) {
      const linha = y * info.width * info.channels;
      for (let x = 0; x < info.width; x += 1) {
        if (data[linha + x * info.channels + info.channels - 1] >= ALPHA_MIN) {
          if (topo < 0) topo = y;
          base = y;
          break;
        }
      }
    }
    pares.push(`${topo}, ${base}`);
  }
  console.log(pares.join(", "));
})();
```

Se os quadros novos tiverem outra medida, ajuste também `BURGER_FRAME_W`,
`BURGER_FRAME_H` e `BURGER_PHOTO_SPAN` — este último é a fração da altura do
arquivo da foto parada que o hambúrguer ocupa, e é o que faz o quadro fechado
nascer do mesmo tamanho da foto.
