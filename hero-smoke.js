/* ── Fumaça do hero ───────────────────────────────────────────────────────────
   Porte do react-smoke@1.2.0 (MIT, isoteriksoftware) para three.js puro.

   O site é estático e sem build, então trazer React + @react-three/fiber só
   para o hero triplicaria o peso sem mudar um pixel: o react-smoke é, por
   dentro, um punhado de planos texturizados com MeshLambertMaterial andando
   num loop. O que está aqui é esse mesmo loop — mesma textura padrão, mesma
   geometria, mesmo material, mesmas luzes e a mesma física de partícula, com
   os nomes dos parâmetros preservados para a origem continuar legível.

   Ela vive só dentro da primeira dobra: a camada é filha de .hero, o canvas
   tem o tamanho da seção e o overflow do hero recorta o resto. Nenhuma outra
   seção recebe fumaça.

   Nada disso é carregado até valer a pena — three.js e a textura só descem
   quando há WebGL, o visitante não pediu menos movimento e o hero está à
   vista. Se qualquer etapa falhar, a camada fica vazia e o hero segue igual.
   ─────────────────────────────────────────────────────────────────────────── */
(function heroSmoke() {
  "use strict";

  const THREE_URL =
    "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js";
  const TEXTURE_URL = "hero-smoke-texture.js";

  const layer = document.querySelector("[data-hero-smoke]");
  if (!layer) return;

  const hero = layer.closest(".hero");
  if (!hero || !("IntersectionObserver" in window)) return;

  /* ── Ajuste da cena ────────────────────────────────────────────────────────
     Os comentários marcam onde o valor do react-smoke ficou e onde ele foi
     recalibrado para um hero de produto: menos opacidade, plano menor e giro
     mais lento, porque aqui a fumaça é fundo do hambúrguer, não o assunto.
     ───────────────────────────────────────────────────────────────────────── */
  const CONFIG = {
    // Câmera e luzes: os mesmos números que o <SmokeScene/> monta.
    fov: 60,
    cameraZ: 500,
    far: 6000,

    density: 56, // react-smoke: 50
    densityCompact: 20, // menos partícula em tela pequena
    size: 780, // react-smoke: 1000
    opacity: 0.3, // react-smoke: 0.5
    maxVelocity: [26, 26, 0], // react-smoke: [30, 30, 0]
    velocityResetFactor: 10, // react-smoke: 10

    // Profundidade da faixa: perto o bastante para volume, longe o bastante
    // para nenhum plano virar um borrão de tela cheia.
    zNear: -60,
    zFar: -1000,

    // O react-smoke fixa a caixa em ±800. Aqui ela sai do enquadramento da
    // câmera, senão em tela estreita quase toda partícula nasce fora do corte.
    boundsPadX: 1.05,
    boundsPadY: 1.1,

    enableRotation: true,
    rotation: 0.09, // demo do react-smoke: 0.2

    // O vento do react-smoke fica só com a subida lenta da brasa. O cursor
    // entra por um campo próprio, mais abaixo, para poder decair sozinho.
    enableWind: true,
    windDirection: [0, 1, 0],
    windStrength: [0, 0.004, 0],

    // Cinza, grafite e preto suave. Lista fixa: nada de cor sorteada.
    colors: ["#c8cdd4", "#9aa0a9", "#71777f", "#4e535a", "#31353b"],

    // O âmbar não é tinta de partícula, é luz: uma brasa atrás do hambúrguer
    // que só acende a fumaça que passa perto dela.
    emberColor: "#ff7b26",
    emberPosition: [0, -130, 200], // à frente da faixa, na base do hambúrguer
    emberIntensity: 18000,
    emberDistance: 2000,
    emberDecay: 1.4, // mais macio que o 2 físico: o halo precisa de alcance

    // Sopro do cursor.
    pointerRadius: 0.55, // fração da altura visível no plano da partícula
    pointerPush: 26, // repulsão radial
    pointerDrag: 34, // arrasto na direção do movimento
    pointerSwirl: 0.25, // giro leve em volta do cursor
    pointerIdle: 0.22, // quanto sobra com o cursor parado
    pushDecay: 1.5, // 1/s — o ar volta ao lugar sozinho
    pushMax: 55,
  };

  const DEG = Math.PI / 180;
  const compact = window.matchMedia("(max-width: 820px)").matches;
  const lessMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ── Só carrega se fizer sentido ──────────────────────────────────────── */

  const saveData = (navigator.connection && navigator.connection.saveData) === true;
  if (saveData) return;

  const hasWebGL = (() => {
    try {
      const probe = document.createElement("canvas");
      return !!(probe.getContext("webgl2") || probe.getContext("webgl"));
    } catch (error) {
      return false;
    }
  })();
  if (!hasWebGL) return;

  const idle = window.requestIdleCallback || ((fn) => window.setTimeout(fn, 240));

  let started = false;
  const watcher = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting) || started) return;
    started = true;
    watcher.disconnect();
    idle(() => {
      boot().catch(() => {
        /* Sem fumaça o hero continua inteiro. Não vale um erro no console. */
      });
    });
  });
  watcher.observe(hero);

  /* ── Dependências sob demanda ─────────────────────────────────────────── */

  const loadTexture = () =>
    new Promise((resolve, reject) => {
      if (window.__masterSmokeTexture) {
        resolve(window.__masterSmokeTexture);
        return;
      }
      const tag = document.createElement("script");
      tag.src = TEXTURE_URL;
      tag.onload = () =>
        window.__masterSmokeTexture
          ? resolve(window.__masterSmokeTexture)
          : reject(new Error("textura vazia"));
      tag.onerror = () => reject(new Error("textura não carregou"));
      document.head.appendChild(tag);
    });

  async function boot() {
    const [THREE, textureSrc] = await Promise.all([
      import(/* @vite-ignore */ THREE_URL),
      loadTexture(),
    ]);
    build(THREE, textureSrc);
  }

  /* ── Cena ─────────────────────────────────────────────────────────────── */

  function build(THREE, textureSrc) {
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setClearAlpha(0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1 : 1.6));

    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    layer.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CONFIG.fov, 1, 0.1, CONFIG.far);
    camera.position.z = CONFIG.cameraZ;

    /* O react-smoke usa ambiente 1 + direcional 1, ambas brancas. O Lambert
       do three multiplica a irradiância por 1/pi, então intensidade 1 devolve
       só 32% da cor do material — de propósito, é a unidade física. Aqui a
       soma sobe para ~pi: assim a paleta cinza sai perto do valor nominal,
       que é o que a demo aparenta na tela. */
    scene.add(new THREE.AmbientLight(new THREE.Color("#b0b7c2"), 2.5));
    const key = new THREE.DirectionalLight(new THREE.Color("#e8eef8"), 1);
    key.position.set(-1, 0.5, 1);
    scene.add(key);

    const ember = new THREE.PointLight(
      new THREE.Color(CONFIG.emberColor),
      CONFIG.emberIntensity,
      CONFIG.emberDistance,
      CONFIG.emberDecay
    );
    ember.position.set(...CONFIG.emberPosition);
    scene.add(ember);

    /* Estado do loop, declarado aqui e não junto do resto do loop: o callback
       da textura logo abaixo lê `frame`, e um data URI pode chegar pronto
       ainda dentro do load() — com a declaração lá embaixo isso cai na zona
       morta do let e derruba a cena inteira antes do primeiro quadro. */
    let frame = 0;
    let visible = true;
    let ready = false;

    // O primeiro quadro precisa da textura já decodificada: no caminho de
    // movimento reduzido ele é o único que existe, e um canvas em branco
    // apareceria com o fade e ficaria assim.
    let textureReady = false;
    const texture = new THREE.TextureLoader().load(textureSrc, () => {
      textureReady = true;
      if (!frame) render();
    });
    texture.colorSpace = THREE.SRGBColorSpace;

    /* Geometria e materiais são compartilhados, como no react-smoke: um plano
       para todo mundo e uma cor por material. Os 6x6 segmentos são a única
       diferença — o Lambert calcula luz por vértice, e num quad de quatro
       cantos a brasa vira uma rampa dura em vez de um halo. */
    const geometry = new THREE.PlaneGeometry(CONFIG.size, CONFIG.size, 6, 6);
    const materials = CONFIG.colors.map(
      (hex) =>
        new THREE.MeshLambertMaterial({
          map: texture,
          transparent: true,
          opacity: CONFIG.opacity,
          depthWrite: false,
          color: new THREE.Color(hex),
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        })
    );

    const count = compact ? CONFIG.densityCompact : CONFIG.density;
    const group = new THREE.Group();
    const particles = [];

    for (let i = 0; i < count; i += 1) {
      const mesh = new THREE.Mesh(geometry, materials[i % materials.length]);
      mesh.frustumCulled = false;
      // Escala e espelho por partícula: é uma textura só, e sem isso o mesmo
      // desenho aparece repetido lado a lado.
      const scale = 0.62 + Math.random() * 0.75;
      mesh.scale.set(Math.random() < 0.5 ? -scale : scale, scale, 1);
      mesh.rotation.z = Math.random() * Math.PI * 2;
      mesh.userData.velocity = new THREE.Vector3();
      mesh.userData.push = new THREE.Vector3();
      group.add(mesh);
      particles.push(mesh);
    }
    scene.add(group);

    const bounds = { min: new THREE.Vector3(), max: new THREE.Vector3() };
    const center = new THREE.Vector3();
    const scratch = new THREE.Vector3();

    const tanHalfFov = () => Math.tan((CONFIG.fov / 2) * DEG);

    function measure() {
      const width = layer.clientWidth;
      const height = layer.clientHeight;
      if (!width || !height) return false;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);

      const zMid = (CONFIG.zNear + CONFIG.zFar) / 2;
      const halfH = tanHalfFov() * (camera.position.z - zMid);
      const halfW = halfH * camera.aspect;
      bounds.min.set(-halfW * CONFIG.boundsPadX, -halfH * CONFIG.boundsPadY, CONFIG.zFar);
      bounds.max.set(halfW * CONFIG.boundsPadX, halfH * CONFIG.boundsPadY, CONFIG.zNear);
      center.addVectors(bounds.min, bounds.max).multiplyScalar(0.5);
      return true;
    }

    // Posição e velocidade iniciais: as fórmulas do react-smoke, com a caixa
    // recalculada acima no lugar do ±800 fixo.
    function seed() {
      particles.forEach((mesh) => {
        mesh.position.set(
          Math.random() * (bounds.max.x - bounds.min.x) + bounds.min.x,
          Math.random() * (bounds.max.y - bounds.min.y) + bounds.min.y,
          Math.random() * (bounds.max.z - bounds.min.z) + bounds.min.z
        );
        mesh.userData.velocity.set(
          Math.random() * CONFIG.maxVelocity[0] * 2 - CONFIG.maxVelocity[0],
          Math.random() * CONFIG.maxVelocity[1] * 2 - CONFIG.maxVelocity[1],
          0
        );
        mesh.userData.push.set(0, 0, 0);
      });
    }

    if (!measure()) return;
    seed();

    /* ── Cursor ───────────────────────────────────────────────────────────
       Guardamos o ponteiro em coordenadas normalizadas do hero e a velocidade
       dele suavizada. Tudo o que o cursor faz entra num vetor `push` que
       decai sozinho, então a deriva original do react-smoke continua sendo a
       única coisa que sobra quando a mão para.
       ─────────────────────────────────────────────────────────────────── */
    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      dx: 0,
      dy: 0,
      speed: 0,
      inside: false,
    };

    function onPointerMove(event) {
      const rect = hero.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      pointer.inside = nx >= -1.2 && nx <= 1.2 && ny >= -1.2 && ny <= 1.2;
      if (!pointer.inside) return;
      pointer.targetX = nx;
      pointer.targetY = ny;
    }

    function onPointerLeave() {
      pointer.inside = false;
    }

    /* ── Loop ─────────────────────────────────────────────────────────── */

    const clock = new THREE.Clock();

    function step(mesh, delta, dt60) {
      const velocity = mesh.userData.velocity;
      const push = mesh.userData.push;

      // 1. Vento do react-smoke: a subida lenta da brasa.
      if (CONFIG.enableWind) {
        velocity.x += CONFIG.windDirection[0] * CONFIG.windStrength[0] * dt60;
        velocity.y += CONFIG.windDirection[1] * CONFIG.windStrength[1] * dt60;
      }
      velocity.x = THREE.MathUtils.clamp(
        velocity.x,
        -CONFIG.maxVelocity[0],
        CONFIG.maxVelocity[0]
      );
      velocity.y = THREE.MathUtils.clamp(
        velocity.y,
        -CONFIG.maxVelocity[1],
        CONFIG.maxVelocity[1]
      );
      velocity.z = 0;

      // 2. Sopro do cursor, no plano de profundidade desta partícula: o raio
      // vira sempre a mesma fatia da tela, então a de trás sente um empurrão
      // largo e fraco e a da frente sente um curto e firme.
      push.multiplyScalar(Math.exp(-delta * CONFIG.pushDecay));
      if (pointer.speed > 0.0005 || pointer.inside) {
        const dist = camera.position.z - mesh.position.z;
        const halfH = tanHalfFov() * dist;
        const px = pointer.x * halfH * camera.aspect;
        const py = pointer.y * halfH;
        const dx = mesh.position.x - px;
        const dy = mesh.position.y - py;
        const radius = halfH * CONFIG.pointerRadius;
        const length = Math.hypot(dx, dy);
        if (length < radius) {
          const falloff = (1 - length / radius) ** 2;
          const drive = CONFIG.pointerIdle + (1 - CONFIG.pointerIdle) * pointer.speed;
          const inv = length > 0.001 ? 1 / length : 0;
          const ux = dx * inv;
          const uy = dy * inv;
          const gain = falloff * drive * delta;
          push.x +=
            (ux * CONFIG.pointerPush -
              uy * CONFIG.pointerPush * CONFIG.pointerSwirl +
              pointer.dx * CONFIG.pointerDrag) *
            gain;
          push.y +=
            (uy * CONFIG.pointerPush +
              ux * CONFIG.pointerPush * CONFIG.pointerSwirl +
              pointer.dy * CONFIG.pointerDrag) *
            gain;
        }
      }
      if (push.lengthSq() > CONFIG.pushMax * CONFIG.pushMax) {
        push.setLength(CONFIG.pushMax);
      }

      // 3. Integra.
      mesh.position.x += (velocity.x + push.x) * delta;
      mesh.position.y += (velocity.y + push.y) * delta;

      if (CONFIG.enableRotation) {
        mesh.rotation.z += CONFIG.rotation * delta;
      }

      // 4. Limites: o empurrão de volta ao centro do react-smoke.
      if (
        mesh.position.x < bounds.min.x ||
        mesh.position.x > bounds.max.x ||
        mesh.position.y < bounds.min.y ||
        mesh.position.y > bounds.max.y
      ) {
        scratch.copy(center).sub(mesh.position).setZ(0).normalize();
        velocity.add(scratch.multiplyScalar(CONFIG.velocityResetFactor));
      }
    }

    function render() {
      // Transparência sem depthWrite depende da ordem: o three ordena por
      // distância da câmera a cada frame, então basta desenhar.
      renderer.render(scene, camera);
      if (!ready && textureReady) {
        ready = true;
        layer.classList.add("is-ready");
      }
    }

    function tick() {
      frame = window.requestAnimationFrame(tick);
      const delta = Math.min(clock.getDelta(), 0.05); // aba que volta não pula
      const dt60 = delta * 60;

      pointer.x += (pointer.targetX - pointer.x) * Math.min(1, delta * 6);
      pointer.y += (pointer.targetY - pointer.y) * Math.min(1, delta * 6);
      pointer.dx = pointer.targetX - pointer.x;
      pointer.dy = pointer.targetY - pointer.y;
      pointer.speed = Math.min(1, Math.hypot(pointer.dx, pointer.dy) * 6);

      for (let i = 0; i < particles.length; i += 1) {
        step(particles[i], delta, dt60);
      }
      render();
    }

    function play() {
      if (frame || !visible || lessMotion.matches) return;
      clock.getDelta();
      frame = window.requestAnimationFrame(tick);
    }

    function pause() {
      if (!frame) return;
      window.cancelAnimationFrame(frame);
      frame = 0;
    }

    /* ── Gatilhos ─────────────────────────────────────────────────────── */

    const inView = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      // Fora da primeira dobra não há o que desenhar: o loop para inteiro e a
      // rolagem do resto do site não paga nada por ele.
      if (visible) play();
      else pause();
    });
    inView.observe(hero);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pause();
      else play();
    });

    if ("ResizeObserver" in window) {
      let resizeFrame = 0;
      new ResizeObserver(() => {
        window.cancelAnimationFrame(resizeFrame);
        resizeFrame = window.requestAnimationFrame(() => {
          if (measure() && !frame) render();
        });
      }).observe(layer);
    }

    function applyMotionPreference() {
      if (lessMotion.matches) {
        pause();
        window.removeEventListener("pointermove", onPointerMove);
        hero.removeEventListener("pointerleave", onPointerLeave);
        // Sem movimento, mas não sem atmosfera: um quadro parado e pronto.
        render();
        return;
      }
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      hero.addEventListener("pointerleave", onPointerLeave);
      play();
    }

    if (lessMotion.addEventListener) {
      lessMotion.addEventListener("change", applyMotionPreference);
    }
    applyMotionPreference();
  }
})();
