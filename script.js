/* ═══════════════════════════════════════════════════════════════════════════
   Burguer Master — comportamento da página.

   Uma fonte de verdade só: ITEMS. O cardápio, a sacola e os destaques do hero
   saem todos daqui, então nome, descrição e preço não têm como divergir entre
   as três leituras da mesma coisa.
   ═══════════════════════════════════════════════════════════════════════════ */

const ITEMS = [
  {
    id: 1,
    name: "Master Clássico",
    category: "Clássicos",
    price: 32.9,
    detail: "Receita clássica",
    description: "Blend de 180g, queijo, alface, tomate e molho Master.",
    image: "images/webp/burger-combo-refri.webp",
  },
  {
    id: 2,
    name: "Cheddar Bacon",
    category: "Clássicos",
    price: 38.5,
    detail: "180g de blend",
    description: "Cheddar cremoso, bacon crocante e cebola caramelizada.",
    image: "images/webp/burger-bacon.webp",
  },
  {
    id: 3,
    name: "Smash Duplo",
    category: "Clássicos",
    price: 41,
    detail: "Duas carnes",
    description: "Dois smashs, queijo duplo, picles e molho especial.",
    image: "images/webp/burger-duplo.webp",
  },
  {
    id: 4,
    name: "Combo Master",
    category: "Especiais",
    price: 46.9,
    detail: "Combo completo",
    description: "Master Clássico, batata crocante e limonada da casa.",
    image: "images/webp/burger-combo-limonada.webp",
  },
  {
    id: 5,
    name: "Picante da Casa",
    category: "Especiais",
    price: 44,
    detail: "Pimenta biquinho",
    description: "Blend, queijo, bacon, pimenta biquinho e maionese picante.",
    image: "images/webp/burger-picante.webp",
  },
  {
    id: 6,
    name: "Veggie de Grão-de-bico",
    category: "Especiais",
    price: 36,
    detail: "Sem carne",
    description: "Burger vegetal, salada fresca e maionese de ervas.",
    image: "images/webp/burger-veggie.webp",
  },
  {
    id: 7,
    name: "Batata Rústica",
    category: "Acompanhamentos",
    price: 19.9,
    detail: "Serve 2",
    description: "Crocante, temperada com páprica e alecrim.",
    image: "images/webp/batata-1.webp",
  },
  {
    id: 8,
    name: "Onion Rings",
    category: "Acompanhamentos",
    price: 22.5,
    detail: "Empanado da casa",
    description: "Anéis de cebola sequinhos com molho barbecue.",
    image: "images/webp/onion-rings.webp",
  },
  {
    id: 9,
    name: "Milkshake de Doce de Leite",
    category: "Sobremesas",
    price: 21,
    detail: "500 ml",
    description: "Cremoso, gelado e finalizado com doce de leite.",
    image: "images/webp/milkshake-1.webp",
  },
  {
    id: 10,
    name: "Limonada do Master",
    category: "Bebidas",
    price: 12,
    detail: "Com hortelã",
    description: "Limão espremido na hora, hortelã e gelo.",
    image: "images/webp/limonada-1.webp",
  },
  {
    id: 11,
    name: "Chopp Artesanal",
    category: "Bebidas",
    price: 16,
    detail: "IPA local",
    description: "Chopp fresco, leve e servido bem gelado.",
    image: "images/webp/chopp.webp",
  },
  {
    id: 12,
    name: "Brownie na Chapa",
    category: "Sobremesas",
    price: 18.9,
    detail: "Com sorvete",
    description: "Brownie aquecido na chapa com sorvete de creme.",
    image: "images/webp/brownie.webp",
  },
];

const CATEGORIES = [
  { label: "Todos", image: "images/webp/cat-todos.webp" },
  { label: "Clássicos", image: "images/webp/cat-classicos.webp" },
  { label: "Especiais", image: "images/webp/cat-especiais.webp" },
  { label: "Acompanhamentos", image: "images/webp/cat-acompanhamentos.webp" },
  { label: "Bebidas", image: "images/webp/cat-bebidas.webp" },
  { label: "Sobremesas", image: "images/webp/cat-sobremesas.webp" },
];

/* ── A sequência do hambúrguer ───────────────────────────────────────────────
   72 quadros de um hambúrguer se abrindo em camadas, desenhados num canvas e
   presos ao scroll. Enquanto o trilho do hero é consumido, a página fica
   parada: só o hambúrguer se move — abre, descansa um instante aberto, fecha.
   Aí o grude solta sozinho e o site rola.

   Duas regras governam o tamanho, e as duas saem de medida, não de palpite:

   1. Fechado, o hambúrguer tem exatamente o tamanho que a foto parada tem na
      mesma caixa. É por isso que a troca foto→canvas não mexe em nada.
   2. Aberto, ele nunca ultrapassa a banda livre entre o cabeçalho e o
      primeiro bloco do hero que divide coluna com ele. A escala de cada
      quadro é derivada da altura daquele quadro — BURGER_BOUNDS abaixo, lida
      do canal alfa dos próprios arquivos —, então o corte não é algo que o
      efeito evite por sorte: é geometricamente impossível. Em tela apertada a
      sequência para num quadro anterior, em vez de encolher o hambúrguer até
      caber.
   ───────────────────────────────────────────────────────────────────────── */

const BURGER_FRAME_COUNT = 72;
const BURGER_FRAME_BASE = "images/burger";
const BURGER_FRAME_W = 828;
const BURGER_FRAME_H = 1440;

/* Topo e base do hambúrguer em cada um dos 72 quadros, em pixels do arquivo.
   Medido lendo o alfa de cada WebP (limiar 8) — fora dessa medida o efeito
   viraria adivinhação. Do quadro 73 em diante a fonte original já encosta o
   pão de cima na borda do arquivo, e nenhuma regra de layout conserta um
   corte que veio assado no asset: por isso a sequência termina aqui. */
const BURGER_BOUNDS = [
  323, 1115, 322, 1115, 322, 1116, 321, 1117, 321, 1117, 320, 1119,
  317, 1121, 316, 1121, 315, 1122, 314, 1124, 309, 1128, 309, 1129,
  307, 1130, 305, 1132, 298, 1137, 296, 1138, 295, 1139, 292, 1142,
  283, 1149, 281, 1150, 279, 1151, 275, 1154, 264, 1163, 262, 1165,
  261, 1167, 257, 1170, 245, 1181, 242, 1184, 240, 1186, 237, 1188,
  226, 1198, 222, 1202, 219, 1203, 217, 1205, 205, 1215, 201, 1219,
  199, 1220, 196, 1222, 183, 1232, 179, 1236, 176, 1238, 174, 1240,
  160, 1250, 156, 1253, 151, 1257, 146, 1261, 136, 1268, 131, 1271,
  126, 1275, 122, 1278, 113, 1284, 109, 1288, 103, 1292, 99, 1295,
  91, 1301, 87, 1305, 82, 1309, 78, 1312, 71, 1317, 66, 1320,
  62, 1323, 54, 1329, 50, 1332, 46, 1335, 43, 1339, 35, 1343,
  31, 1345, 28, 1348, 24, 1351, 18, 1356, 15, 1359, 11, 1362,
];

/* A foto parada ocupa 927 dos 1060 px de altura do próprio arquivo. É essa
   fração que o quadro fechado herda para nascer do mesmo tamanho. */
const BURGER_PHOTO_SPAN = 927 / 1060;

/* Largura do hambúrguer fechado, em fração da altura do quadro — serve para
   saber com quais blocos do hero ele divide coluna. */
const BURGER_SUBJECT_W = 785 / BURGER_FRAME_H;

/* Respiro mínimo sob o cabeçalho e sobre o bloco de baixo. */
const BURGER_GUARD_TOP = 22;
const BURGER_GUARD_BOTTOM = 18;

/* Quanto o hambúrguer pode descer para comprar espaço ao abrir. Pouco de
   propósito: acima disto a descida vira deslocamento visível. */
const BURGER_DRIFT = 26;

/* Em vez de encolher sem fim para caber, a sequência para antes. */
const BURGER_MIN_SCALE = 0.8;
const BURGER_MIN_OPEN = 26;

/* O trilho: abre em [0, 0.42], descansa aberto até 0.58, fecha até 1. */
const BURGER_OPEN_END = 0.42;
const BURGER_HOLD_END = 0.58;

const icon = (name) =>
  `<svg class="icon" aria-hidden="true" focusable="false"><use href="#icon-${name}" /></svg>`;

const state = {
  category: "Todos",
  query: "",
  cart: loadCart(),
  couponActive: false,
  pickup: false,
};

const elements = {
  productGrid: document.querySelector("#product-grid"),
  categoryList: document.querySelector("#category-list"),
  resultCount: document.querySelector("#result-count"),
  emptyState: document.querySelector("#empty-state"),
  searchInput: document.querySelector("#search-input"),
  cartDrawer: document.querySelector("#cart-drawer"),
  backdrop: document.querySelector("#drawer-backdrop"),
  cartLines: document.querySelector("#cart-lines"),
  cartEmpty: document.querySelector("#cart-empty"),
  cartCheckout: document.querySelector("#cart-checkout"),
  toast: document.querySelector("#toast"),
};

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/* A sacola sobrevive ao recarregamento, mas nunca derruba a página: modo
   privado, cota cheia ou JSON estragado devolvem uma sacola vazia. */
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("master-cart")) || {};
  } catch {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem("master-cart", JSON.stringify(state.cart));
  } catch {
    /* Sem persistência a sessão continua válida; só não sobrevive ao F5. */
  }
}

function itemById(id) {
  return ITEMS.find((item) => item.id === Number(id));
}

/* Busca e filtro na mesma passada. O campo `detail` entra no texto buscável:
   quem digita "sem carne" ou "500 ml" está procurando por ele. */
function filteredItems() {
  const query = state.query.trim().toLocaleLowerCase("pt-BR");
  return ITEMS.filter((item) => {
    const inCategory = state.category === "Todos" || item.category === state.category;
    const searchable = `${item.name} ${item.category} ${item.detail} ${item.description}`
      .toLocaleLowerCase("pt-BR");
    return inCategory && (!query || searchable.includes(query));
  });
}

function renderCategories() {
  elements.categoryList.innerHTML = CATEGORIES.map((category) => {
    const active = state.category === category.label;
    return `
      <button
        class="category-button${active ? " active" : ""}"
        type="button"
        aria-pressed="${active}"
        data-category="${category.label}"
      >
        <img src="${category.image}" alt="" width="160" height="160" decoding="async" />
        <span>${category.label}</span>
      </button>
    `;
  }).join("");
}

/* Trocar de categoria não recria as imagens: só move o estado ativo. Recriar
   o HTML faria os seis ícones piscarem a cada clique de filtro. */
function syncCategories() {
  elements.categoryList.querySelectorAll("[data-category]").forEach((button) => {
    const active = button.dataset.category === state.category;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function renderProducts() {
  const products = filteredItems();
  elements.resultCount.textContent =
    `${products.length} ${products.length === 1 ? "item" : "itens"} · ${state.category}`;
  elements.emptyState.hidden = products.length > 0;
  elements.productGrid.hidden = products.length === 0;
  elements.productGrid.innerHTML = products.map((item) => `
    <article class="product-item">
      <div class="product-image">
        <img src="${item.image}" alt="${item.name}" width="1512" height="1040" loading="lazy" decoding="async" />
      </div>
      <div class="product-head">
        <h3>${item.name}</h3>
        <p class="product-price">${money.format(item.price)}</p>
      </div>
      <p class="product-description">${item.description}</p>
      <button class="add-button" type="button" data-add="${item.id}">Adicionar</button>
    </article>
  `).join("");
}

/* Todo o dinheiro da sacola sai daqui, num lugar só: a taxa de entrega só
   existe com item e sem retirada, e o cupom incide sobre o subtotal. */
function cartDetails() {
  const lines = Object.entries(state.cart)
    .map(([id, quantity]) => ({ item: itemById(id), quantity }))
    .filter((line) => line.item && line.quantity > 0);
  const count = lines.reduce((total, line) => total + line.quantity, 0);
  const subtotal = lines.reduce((total, line) => total + line.item.price * line.quantity, 0);
  const discount = state.couponActive ? subtotal * 0.2 : 0;
  const fee = count && !state.pickup ? 6.9 : 0;
  return { lines, count, subtotal, discount, fee, total: Math.max(0, subtotal - discount + fee) };
}

function renderCart() {
  const cart = cartDetails();
  document.querySelector("#header-cart-count").textContent = cart.count
    ? `${cart.count} ${cart.count === 1 ? "item" : "itens"}`
    : "Sacola vazia";
  document.querySelector("#header-cart-total").textContent = money.format(cart.subtotal);
  const badge = document.querySelector("#cart-badge");
  badge.textContent = cart.count;
  badge.hidden = cart.count === 0;

  elements.cartEmpty.hidden = cart.count > 0;
  elements.cartCheckout.hidden = cart.count === 0;
  elements.cartLines.hidden = cart.count === 0;
  elements.cartLines.innerHTML = cart.lines.map(({ item, quantity }) => `
    <div class="cart-line">
      <img src="${item.image}" alt="" width="58" height="58" loading="lazy" />
      <div class="cart-line-info">
        <strong>${item.name}</strong>
        <span>${money.format(item.price * quantity)}</span>
      </div>
      <div class="quantity-control" aria-label="Quantidade de ${item.name} na sacola">
        <button type="button" data-cart-minus="${item.id}" aria-label="Remover uma unidade">${icon("minus")}</button>
        <span>${quantity}</span>
        <button type="button" data-cart-plus="${item.id}" aria-label="Adicionar uma unidade">${icon("plus")}</button>
      </div>
    </div>
  `).join("");

  document.querySelector("#cart-subtotal").textContent = money.format(cart.subtotal);
  document.querySelector("#cart-fee").textContent = money.format(cart.fee);
  document.querySelector("#cart-discount").textContent = `− ${money.format(cart.discount)}`;
  document.querySelector("#cart-total").textContent = money.format(cart.total);
  document.querySelector("#discount-row").hidden = !state.couponActive;
}

function changeCartQuantity(id, amount) {
  const next = (state.cart[id] || 0) + amount;
  if (next <= 0) delete state.cart[id];
  else state.cart[id] = next;
  // Sacola vazia zera o cupom: manter 20% de nada só confunde o resumo.
  if (!Object.keys(state.cart).length) state.couponActive = false;
  document.querySelector("#checkout-feedback").textContent = "";
  saveCart();
  renderCart();
}

/* Adicionar acontece em dois lugares (grade e hero) e é sempre a mesma coisa:
   soma um, limpa o aviso do resumo, salva, redesenha e avisa. */
function addToCart(item) {
  state.cart[item.id] = (state.cart[item.id] || 0) + 1;
  const feedback = document.querySelector("#checkout-feedback");
  if (feedback) feedback.textContent = "";
  saveCart();
  renderCart();
  showToast(`${item.name} foi para a sacola`);
}

let toastTimer;
let cartOpener = null;
const backgroundRegions = Array.from(
  document.querySelectorAll("body > header, body > main, body > footer")
);

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  toastTimer = setTimeout(() => {
    elements.toast.hidden = true;
  }, 2200);
}

/* Com a gaveta aberta, o resto da página sai do caminho de verdade: inert
   tira do foco e do clique, aria-hidden tira do leitor de tela. Um só não
   basta — inert ainda não é universal e aria-hidden não trava o Tab. */
function setBackgroundInert(isInert) {
  backgroundRegions.forEach((region) => {
    region.inert = isInert;
    // "true" escrito por extenso: aria-hidden="" é valor inválido e o leitor
    // de tela cai no padrão, ou seja, não esconde nada.
    if (isInert) region.setAttribute("aria-hidden", "true");
    else region.removeAttribute("aria-hidden");
  });
}

function openCart(event) {
  cartOpener = event?.currentTarget instanceof HTMLElement
    ? event.currentTarget
    : document.activeElement;
  setBackgroundInert(true);
  elements.backdrop.hidden = false;
  /* O reflow forçado é o que faz o backdrop transicionar: sem ele o navegador
     vê `hidden` e `.visible` na mesma passada e vai direto ao estado final.
     Vale mais que um requestAnimationFrame porque é síncrono — a classe .open
     é o que diz "a gaveta está aberta" para o Esc, e ela não pode depender de
     um quadro que a aba em segundo plano nunca desenha. */
  void elements.backdrop.offsetWidth;
  elements.backdrop.classList.add("visible");
  elements.cartDrawer.classList.add("open");
  elements.cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
  document.querySelector("[data-cart-close]").focus();
}

function closeCart({ restoreFocus = true } = {}) {
  elements.backdrop.classList.remove("visible");
  elements.cartDrawer.classList.remove("open");
  elements.cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
  setBackgroundInert(false);
  setTimeout(() => {
    elements.backdrop.hidden = true;
  }, 250);
  if (restoreFocus && cartOpener instanceof HTMLElement && cartOpener.isConnected) {
    cartOpener.focus();
  }
  cartOpener = null;
}

/* ── Ligações do cardápio ────────────────────────────────────────────────── */

elements.categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  syncCategories();
  renderProducts();
});

elements.productGrid.addEventListener("click", (event) => {
  const add = event.target.closest("[data-add]");
  if (!add) return;
  addToCart(itemById(Number(add.dataset.add)));
});

elements.cartLines.addEventListener("click", (event) => {
  const minus = event.target.closest("[data-cart-minus]");
  const plus = event.target.closest("[data-cart-plus]");
  if (minus) changeCartQuantity(Number(minus.dataset.cartMinus), -1);
  if (plus) changeCartQuantity(Number(plus.dataset.cartPlus), 1);
});

/* Enter na busca não recarrega nada: filtra e leva o visitante até o
   resultado, que pode estar a uma dobra de distância. */
document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = elements.searchInput.value;
  renderProducts();
  document.querySelector("#cardapio").scrollIntoView({ behavior: "smooth" });
});

elements.searchInput.addEventListener("input", () => {
  state.query = elements.searchInput.value;
  renderProducts();
});

document.querySelector("#clear-filters").addEventListener("click", () => {
  state.category = "Todos";
  state.query = "";
  elements.searchInput.value = "";
  syncCategories();
  renderProducts();
});

/* ── Ligações da sacola ──────────────────────────────────────────────────── */

document.querySelector("#location-select").addEventListener("change", (event) => {
  const region = event.target.value;
  document.querySelector(".location-copy strong").textContent = region;
  state.pickup = region === "Retirar na loja";
  document.querySelector("#cart-fee-label").textContent = state.pickup ? "Retirada" : "Entrega";
  renderCart();
});

document.querySelectorAll("[data-cart-toggle]")
  .forEach((button) => button.addEventListener("click", openCart));
document.querySelectorAll("[data-cart-close]")
  .forEach((button) => button.addEventListener("click", closeCart));
elements.backdrop.addEventListener("click", closeCart);

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  // A gaveta tem precedência: se as duas estiverem abertas, Esc fecha a de cima.
  if (elements.cartDrawer.classList.contains("open")) {
    closeCart();
    return;
  }
  if (mainNav.classList.contains("open")) {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.focus();
  }
});

/* "Ver cardápio" espera a gaveta terminar de sair antes de rolar: rolar
   embaixo de um painel que ainda cobre a tela não mostra nada. */
document.querySelector("[data-scroll-menu]").addEventListener("click", () => {
  setTimeout(() => {
    const menu = document.querySelector("#cardapio");
    menu.scrollIntoView({ behavior: "smooth" });
    menu.focus({ preventScroll: true });
  }, 260);
});

document.querySelector("#coupon-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const value = document.querySelector("#coupon-input").value.trim().toUpperCase();
  const feedback = document.querySelector("#coupon-feedback");
  state.couponActive = value === "MASTER20";
  feedback.textContent = state.couponActive
    ? "Cupom aplicado ao resumo local: 20% de desconto."
    : "Cupom não aplicado. Confira o código e tente novamente.";
  feedback.classList.toggle("error", !state.couponActive);
  renderCart();
});

/* O site não fecha pedido. O botão existe para dizer isso com todas as
   letras, no resumo e no aviso flutuante — e não para fingir um checkout. */
document.querySelector("#checkout-button").addEventListener("click", () => {
  document.querySelector("#checkout-feedback").textContent =
    "Pedido não enviado. Este é apenas um resumo local; confirme diretamente com a hamburgueria.";
  showToast("Pedido não enviado. Veja a orientação na sacola.");
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("Inscrição não enviada: cadastros online ainda não estão disponíveis.");
});

/* ── Menu da barra estreita ──────────────────────────────────────────────── */

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".header-menu");

menuToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});

mainNav.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  mainNav.querySelectorAll("a").forEach((item) => item.classList.remove("active"));
  link.classList.add("active");
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
});

/* ── Hero: carrossel de destaques ───────────────────────────────────────────
   Os slides saem do próprio ITEMS; só as fotos vivem no HTML, porque a
   primeira delas é o LCP da página e não pode depender do script. */

const heroRoot = document.querySelector(".hero");
const heroPhotos = Array.from(document.querySelectorAll(".hero-photo"));
const heroSlides = heroPhotos.map((photo) => itemById(photo.dataset.heroItem));
const heroInfo = document.querySelector(".hero-info");
const heroPhotosStage = document.querySelector(".hero-photos");
const heroBurgerCanvas = document.querySelector("[data-hero-burger-canvas]");
let heroIndex = 0;
let heroBurgerScrubberSync = null;

function renderHeroControls() {
  document.querySelector("#hero-rail").innerHTML = heroSlides.map((item, index) => `
    <button class="hero-thumb" type="button" data-hero-go="${index}" aria-label="Ver ${item.name}">
      <img src="${heroPhotos[index].dataset.thumb}" alt="" width="300" height="300" loading="lazy" decoding="async" />
    </button>
  `).join("");

  document.querySelector("#hero-bars").innerHTML = heroSlides.map((item, index) => `
    <button class="hero-bar" type="button" data-hero-go="${index}" aria-label="Ir para ${item.name}"><span></span></button>
  `).join("");
}

function setHeroSlide(next, { animate = true } = {}) {
  const total = heroSlides.length;
  heroIndex = ((next % total) + total) % total;
  const item = heroSlides[heroIndex];

  heroPhotos.forEach((photo, index) => {
    const active = index === heroIndex;
    photo.classList.toggle("is-active", active);
    photo.classList.remove("is-entering");
    photo.toggleAttribute("aria-hidden", !active);
  });
  // A sequência só vale no slide 0; trocar de destaque pode desarmar o trilho.
  syncHeroBurgerScrubber();

  document.querySelector("#hero-name").textContent = item.name;
  document.querySelector("#hero-desc").textContent = item.description;
  document.querySelector("#hero-price").textContent = money.format(item.price);
  // O rótulo visível continua "Adicionar à sacola"; o sufixo diz a quem.
  document.querySelector("#hero-add-item").textContent = ` — ${item.name}`;

  heroRoot.querySelectorAll("[data-hero-go]").forEach((button) => {
    const active = Number(button.dataset.heroGo) === heroIndex;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });

  if (!animate) return;
  heroInfo.classList.remove("is-entering");
  void heroInfo.offsetWidth; // sem o reflow o navegador reaproveita a animação anterior
  heroPhotos[heroIndex].classList.add("is-entering");
  heroInfo.classList.add("is-entering");
}

heroRoot.addEventListener("click", (event) => {
  const step = event.target.closest("[data-hero-step]");
  if (step) {
    setHeroSlide(heroIndex + Number(step.dataset.heroStep));
    return;
  }
  const go = event.target.closest("[data-hero-go]");
  if (go) setHeroSlide(Number(go.dataset.heroGo));
});

heroRoot.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  setHeroSlide(heroIndex + (event.key === "ArrowLeft" ? -1 : 1));
});

/* Arrastar no toque. O mouse fica de fora: arrastar com o cursor é seleção de
   texto, e roubar esse gesto quebra uma expectativa antiga do desktop. */
let heroSwipeFrom = null;

heroRoot.addEventListener("pointerdown", (event) => {
  heroSwipeFrom = event.pointerType === "mouse" ? null : event.clientX;
});

heroRoot.addEventListener("pointerup", (event) => {
  if (heroSwipeFrom === null) return;
  const distance = event.clientX - heroSwipeFrom;
  heroSwipeFrom = null;
  if (Math.abs(distance) > 45) setHeroSlide(heroIndex + (distance < 0 ? 1 : -1));
});

heroRoot.addEventListener("pointercancel", () => {
  heroSwipeFrom = null;
});

document.querySelector("#hero-add").addEventListener("click", () => {
  addToCart(heroSlides[heroIndex]);
});

renderHeroControls();
setHeroSlide(0);

/* ── Hero: a sequência presa ao scroll ───────────────────────────────────── */

function initHeroBurgerSequence() {
  const track = document.querySelector("[data-hero-scroll]");
  const fuel = track && track.querySelector(".hero-scroll-fuel");
  const header = document.querySelector(".site-header");
  if (!heroRoot || !heroPhotosStage || !heroBurgerCanvas || !track || !fuel) return;

  const ctx = heroBurgerCanvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(pointer: coarse)");

  /* Os blocos do hero que podem estar embaixo do hambúrguer. Na tela larga a
     ficha fica à esquerda e quem limita é o rodapé do carrossel; empilhado, é
     a ficha. Por isso o teste é de coluna, não uma lista fixa. */
  const obstacles = [
    heroInfo,
    heroRoot.querySelector(".hero-aside"),
    heroRoot.querySelector(".hero-foot"),
  ].filter(Boolean);

  const frames = new Array(BURGER_FRAME_COUNT);
  let ready = false;
  let armed = false;
  let pendingArm = false;
  let geometry = null;
  let targetOpen = 0;
  let currentOpen = 0;
  let paintedIndex = -1;
  let paintedScale = 0;
  let paintedGround = "";
  let rafId = 0;
  let layoutRaf = 0;

  const spanOf = (i) => (BURGER_BOUNDS[i * 2 + 1] - BURGER_BOUNDS[i * 2]) / BURGER_FRAME_H;
  const midOf = (i) => (BURGER_BOUNDS[i * 2 + 1] + BURGER_BOUNDS[i * 2]) / 2 / BURGER_FRAME_H;
  const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
  const between = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n);

  /* Desaceleração simétrica nas duas pontas. É ela que tira o bico da virada
     no alto do trilho: a abertura chega ao topo já parada, e a volta começa
     do mesmo jeito. */
  const ease = (n) => 0.5 - Math.cos(Math.PI * clamp01(n)) / 2;

  const pinTop = () => (header ? Math.round(header.getBoundingClientRect().height) : 0);

  /* ── Geometria ───────────────────────────────────────────────────────────
     Tudo aqui é relativo ao topo do hero, que é justamente o que não muda
     enquanto ele está grudado — a medida vale em qualquer ponto do trilho. */
  function measure() {
    const stage = heroPhotosStage.getBoundingClientRect();
    const hero = heroRoot.getBoundingClientRect();
    if (!stage.height || !hero.height) return null;

    // Escala do quadro fechado: a altura que a foto parada ocupa na caixa.
    const scaleClosed = (stage.height * BURGER_PHOTO_SPAN) / spanOf(0);
    const closedCenter = stage.top + stage.height / 2 - hero.top;

    const half = (BURGER_SUBJECT_W * scaleClosed) / 2;
    const middle = stage.left + stage.width / 2;
    const columnLeft = middle - half;
    const columnRight = middle + half;

    /* O fundo da banda: o primeiro obstáculo que divide coluna com o
       hambúrguer, ou o pé do hero, ou o pé da janela — o que vier antes. */
    let bandBottom = Math.min(hero.height, window.innerHeight - pinTop());
    obstacles.forEach((el) => {
      const r = el.getBoundingClientRect();
      const top = r.top - hero.top;
      if (!r.height || r.right <= columnLeft || r.left >= columnRight) return;
      if (top > closedCenter && top < bandBottom) bandBottom = top;
    });
    bandBottom -= BURGER_GUARD_BOTTOM;
    const bandTop = BURGER_GUARD_TOP;
    if (bandBottom - bandTop < 200) return null;

    // O centro pode descer um pouco para comprar espaço, mas só até o DRIFT.
    const openCenter = between(
      (bandTop + bandBottom) / 2,
      closedCenter - BURGER_DRIFT,
      closedCenter + BURGER_DRIFT
    );
    const openRoom = 2 * Math.min(openCenter - bandTop, bandBottom - openCenter);

    /* Até onde vale a pena abrir: o último quadro que ainda cabe sem que o
       hambúrguer tenha de encolher além de BURGER_MIN_SCALE. */
    let maxIndex = 0;
    for (let i = BURGER_FRAME_COUNT - 1; i > 0; i -= 1) {
      if (openRoom / spanOf(i) >= scaleClosed * BURGER_MIN_SCALE) {
        maxIndex = i;
        break;
      }
    }

    return {
      scaleClosed,
      closedCenter,
      openCenter,
      bandTop,
      bandBottom,
      maxIndex,
      width: Math.ceil((scaleClosed * BURGER_FRAME_W) / BURGER_FRAME_H) + 2,
      height: Math.ceil(bandBottom - bandTop),
      shift: (bandTop + bandBottom) / 2 - closedCenter,
      dpr: Math.min(2, window.devicePixelRatio || 1),
    };
  }

  function applyBox() {
    const g = geometry;
    if (!g) return;
    heroBurgerCanvas.style.setProperty("--burger-box-w", `${g.width}px`);
    heroBurgerCanvas.style.setProperty("--burger-box-h", `${g.height}px`);
    heroBurgerCanvas.style.setProperty("--burger-box-shift", `${Math.round(g.shift)}px`);
    const w = Math.round(g.width * g.dpr);
    const h = Math.round(g.height * g.dpr);
    // Mexer em width/height limpa o buffer: só quando a medida mudou mesmo.
    if (heroBurgerCanvas.width !== w) heroBurgerCanvas.width = w;
    if (heroBurgerCanvas.height !== h) heroBurgerCanvas.height = h;
  }

  /* A sequência vale a tentativa? A resposta precisa sair antes dos quadros,
     porque é ela que define a altura do palco — decidir depois faria a página
     pular no meio da leitura. */
  function attempting() {
    const conn = navigator.connection;
    if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ""))) return false;
    return !reduceMotion.matches;
  }

  function applyTrack() {
    track.style.setProperty("--hero-pin-top", `${pinTop()}px`);
    track.classList.toggle("is-staged", attempting());
    /* No toque cada centímetro de trilho custa um gesto inteiro, então lá o
       percurso é bem mais curto que no scroll de mesa. */
    const stride = coarsePointer.matches ? 1.05 : 1.45;
    const travel = Math.round(between(heroRoot.offsetHeight * stride, 520, 1200));
    track.style.setProperty("--burger-track", `${travel}px`);
  }

  /* ── Desenho ─────────────────────────────────────────────────────────────
     A escala sai da altura do próprio quadro contra o espaço que sobra na
     altura em que ele será desenhado. Fechado dá o tamanho da foto; só quando
     a pilha fica alta demais para a banda é que ela começa a compensar. */
  function paint(open) {
    const g = geometry;
    if (!g) return;
    const index = Math.round(open * g.maxIndex);
    const image = frames[index];
    if (!image) return;

    /* Duas casas bastam: cada mudança do valor obriga o navegador a refazer o
       filtro, e a olho nu 0,01 de sombra não existe. */
    const ground = (1 - open * 0.7).toFixed(2);
    if (ground !== paintedGround) {
      heroBurgerCanvas.style.setProperty("--burger-ground", ground);
      paintedGround = ground;
    }

    const center = g.closedCenter + (g.openCenter - g.closedCenter) * open;
    const room = 2 * Math.min(center - g.bandTop, g.bandBottom - center);
    const scale = Math.min(g.scaleClosed, room / spanOf(index));
    // Mesmo quadro e mesma escala: não há o que repintar.
    if (index === paintedIndex && Math.abs(scale - paintedScale) < 0.25) return;

    const drawW = (scale * BURGER_FRAME_W) / BURGER_FRAME_H;
    const dx = (g.width - drawW) / 2;
    const dy = center - g.bandTop - midOf(index) * scale;

    ctx.clearRect(0, 0, heroBurgerCanvas.width, heroBurgerCanvas.height);
    ctx.drawImage(image, dx * g.dpr, dy * g.dpr, drawW * g.dpr, scale * g.dpr);
    paintedIndex = index;
    paintedScale = scale;
  }

  function tick() {
    rafId = 0;
    const distance = targetOpen - currentOpen;
    /* Um resto de inércia: a roda do mouse entrega saltos, não uma rampa. */
    if (Math.abs(distance) < 0.0015) currentOpen = targetOpen;
    else currentOpen += distance * 0.22;
    paint(currentOpen);
    if (currentOpen !== targetOpen) rafId = requestAnimationFrame(tick);
  }

  function nudge() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function trackProgress() {
    const travel = track.offsetHeight - heroRoot.offsetHeight;
    if (travel <= 0) return 0;
    return clamp01((pinTop() - track.getBoundingClientRect().top) / travel);
  }

  function openness(t) {
    if (t <= BURGER_OPEN_END) return ease(t / BURGER_OPEN_END);
    if (t < BURGER_HOLD_END) return 1;
    return ease((1 - t) / (1 - BURGER_HOLD_END));
  }

  function sync() {
    if (!armed) return;
    targetOpen = openness(trackProgress());
    nudge();
  }

  const pinStart = () => track.getBoundingClientRect().top + window.scrollY - pinTop();

  function eligible() {
    return ready && !reduceMotion.matches && heroIndex === 0
      && !!geometry && geometry.maxIndex >= BURGER_MIN_OPEN;
  }

  /* Armar e desarmar mexe na altura do documento. Fazer isso com o hero já
     preso empurraria a página sob o dedo do visitante, então o trilho só
     muda com ele na origem — e como o hero fica imóvel durante todo o
     percurso, voltar à origem antes de desarmar não move nada na tela. */
  function setArmed(next) {
    if (next === armed) return;
    const start = pinStart();
    if (next) {
      if (window.scrollY > start + 1) {
        pendingArm = true;
        return;
      }
    } else if (window.scrollY > start) {
      window.scrollTo(0, start);
    }
    pendingArm = false;
    armed = next;
    track.classList.toggle("is-armed", next);
    heroPhotosStage.classList.toggle("has-burger-scrubber", next);
    heroBurgerCanvas.classList.toggle("is-active", next);
    if (next) {
      targetOpen = 0;
      currentOpen = 0;
      paintedIndex = -1;
      sync();
    } else {
      /* Fecha enquanto sai de cena, em vez de sumir aberto. */
      targetOpen = 0;
      nudge();
    }
  }

  function relayout() {
    geometry = measure();
    applyBox();
    applyTrack();
    paintedIndex = -1;
    if (armed && !eligible()) setArmed(false);
    else if (!armed && eligible()) setArmed(true);
    if (armed) sync();
    else paint(0);
  }

  function onScroll() {
    if (pendingArm && eligible()) setArmed(true);
    sync();
  }

  function onResize() {
    if (layoutRaf) return;
    layoutRaf = requestAnimationFrame(() => {
      layoutRaf = 0;
      relayout();
    });
  }

  function loadFrames() {
    /* Os 72 quadros pesam mais que o resto da página somada. Em conexão
       medida ou lenta a sequência simplesmente não existe, e o hero continua
       sendo o carrossel de fotos que sempre foi. */
    if (!attempting()) return;

    const loadOne = (i) => new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        frames[i] = image;
        resolve();
      };
      image.onerror = reject;
      image.src = `${BURGER_FRAME_BASE}/f_${String(i + 1).padStart(3, "0")}.webp`;
    });

    // Seis frentes em paralelo: o suficiente para saturar a conexão sem
    // estourar o limite de requisições simultâneas do navegador.
    let next = 0;
    let failed = false;
    const worker = () => {
      if (failed || next >= BURGER_FRAME_COUNT) return Promise.resolve();
      return loadOne(next++).then(worker, () => {
        failed = true;
      });
    };

    Promise.all(Array.from({ length: 6 }, worker)).then(() => {
      // Sequência incompleta é pior que sequência nenhuma: abandona inteira.
      if (failed) return;
      ready = true;
      relayout();
    });
  }

  relayout();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);
  reduceMotion.addEventListener("change", relayout);
  coarsePointer.addEventListener("change", relayout);

  /* Depois do load: os quadros não disputam banda com o LCP do hero. */
  if (document.readyState === "complete") loadFrames();
  else window.addEventListener("load", loadFrames, { once: true });

  heroBurgerScrubberSync = relayout;
}

function syncHeroBurgerScrubber() {
  if (typeof heroBurgerScrubberSync === "function") {
    heroBurgerScrubberSync();
  }
}

initHeroBurgerSequence();

renderCategories();
renderProducts();
renderCart();

/* ── Movimento ────────────────────────────────────────────────────────────────
   As entradas só ligam quando há JS e o visitante não pediu menos movimento.
   Sem isso, nada é escondido: a página nasce visível.
   ───────────────────────────────────────────────────────────────────────── */
(function motion() {
  const root = document.documentElement;
  const wantsLess = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (wantsLess.matches || !("IntersectionObserver" in window)) return;

  root.classList.add("js-motion");

  // Três tratamentos distintos: subir, assentar, aparecer. Nem toda seção
  // entra do mesmo jeito, e o rodapé não entra.
  const ENTRANCES = [
    [".menu-section .section-heading", "rise", 0],
    [".craft-copy", "rise", 0],
    [".craft-list li", "rise", 80],
    [".promo-card", "settle", 0],
    [".visit-grid > *", "fade", 90],
  ];

  const seen = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        seen.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  ENTRANCES.forEach(([selector, kind, step]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.dataset.enter = kind;
      // O atraso trava no quinto item: uma cascata longa vira espera.
      if (step) {
        element.style.setProperty("--enter-delay", `${Math.min(index, 4) * step}ms`);
      }
      seen.observe(element);
    });
  });

  function revealEverything() {
    root.classList.remove("js-motion");
    document.querySelectorAll("[data-enter]").forEach((el) => el.classList.add("is-in"));
  }

  // Se o visitante mudar a preferência no meio da sessão, devolve tudo.
  wantsLess.addEventListener("change", (event) => {
    if (event.matches) revealEverything();
  });

  // Disjuntor: se o observer não entregou nada que já estava à vista, ele não
  // está funcionando. Melhor perder a animação do que esconder a página.
  window.addEventListener("load", () => {
    setTimeout(() => {
      const targets = Array.from(document.querySelectorAll("[data-enter]"));
      const onScreen = targets.filter((el) => {
        const box = el.getBoundingClientRect();
        return box.top < window.innerHeight && box.bottom > 0;
      });
      if (onScreen.length && onScreen.every((el) => !el.classList.contains("is-in"))) {
        revealEverything();
      }
    }, 1200);
  });
})();

/* O salão ao fundo do hero respira só enquanto está à vista. Fora da primeira
   dobra, ou com a aba em segundo plano, as duas camadas param: uma página que
   ninguém está vendo não tem por que compor quadro. */
(function heroRoom() {
  const room = document.querySelector(".hero-room");
  if (!room) return;

  document.addEventListener("visibilitychange", () => {
    room.classList.toggle("is-hidden", document.hidden);
  });

  if (!("IntersectionObserver" in window)) return;

  new IntersectionObserver(
    ([entry]) => room.classList.toggle("is-still", !entry.isIntersecting),
    { threshold: 0 }
  ).observe(room.closest(".hero") || room);
})();

/* Ao adicionar: confirma no botão e pulsa a sacola, que é para onde o item foi. */
(function addFeedback() {
  const badge = document.querySelector("#cart-badge");

  function acknowledge(button) {
    if (button) {
      button.classList.add("is-added");
      setTimeout(() => button.classList.remove("is-added"), 900);
    }
    if (!badge) return;
    badge.classList.remove("is-bumped");
    void badge.offsetWidth; // reinicia a animação em cliques seguidos
    badge.classList.add("is-bumped");
  }

  const grid = document.querySelector("#product-grid");
  if (grid) {
    grid.addEventListener("click", (event) => {
      const add = event.target.closest("[data-add]");
      if (add) acknowledge(add);
    });
  }

  const heroAdd = document.querySelector("#hero-add");
  if (heroAdd) heroAdd.addEventListener("click", () => acknowledge(heroAdd));
})();
