// ============================================================
//  Tetris — Phaser 3 Edition
//  Migración completa del juego vanilla-JS a Phaser 3
// ============================================================

// ── Constantes del juego ─────────────────────────────────────

const SHAPES = [
  // I
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  // J
  [[1,0,0],[1,1,1],[0,0,0]],
  // L
  [[0,0,1],[1,1,1],[0,0,0]],
  // O
  [[1,1],[1,1]],
  // S
  [[0,1,1],[1,1,0],[0,0,0]],
  // T
  [[1,1,1],[0,1,0],[0,0,0]],
  // Z
  [[1,1,0],[0,1,1],[0,0,0]],
];

const SHAPE_COLORS = [
  0x00e5ff, // I – cyan
  0x536dfe, // J – indigo
  0xff9100, // L – orange
  0xffea00, // O – yellow
  0x00e676, // S – green
  0xd500f9, // T – purple
  0xff1744, // Z – red
];

// Colores HTML para los textos de gradiente
const SHAPE_HEX = [
  '#00e5ff', '#536dfe', '#ff9100', '#ffea00',
  '#00e676', '#d500f9', '#ff1744',
];

const BLOCK_SIZE      = 34;
const GRID_COLS       = 10;
const GRID_ROWS       = 20;
const BLOCK_EMPTY     = -1;

const SIDEBAR_GAP     = 16;
const SIDEBAR_W       = 6 * BLOCK_SIZE;

const GRID_PX_W       = GRID_COLS * BLOCK_SIZE;
const GRID_PX_H       = GRID_ROWS * BLOCK_SIZE;

const CANVAS_W        = GRID_PX_W + SIDEBAR_GAP + SIDEBAR_W;
const CANVAS_H        = GRID_PX_H;

const GRAVITY_SPEED   = 1;
const GRAVITY_ACCEL   = 0.00001;
const GRAVITY_THRESH  = 1000;

// ── Configuración de fluidos ──────────────────────────────────
const FLUID_CONFIGS = {
  honey    : { speed: 0.18, name: 'Miel',     icon: '🍯', speedLabel: '×0.18 velocidad', viscosity: 12, bg: 0x231807, grid: 0x5d3b0a, glow: 0xffb21c, deep: 0x6b3f08, mid: 0xb66a0b, shine: 0xffdc72, motion: 0.34, wave: 9, blobs: 5 },
  oil      : { speed: 0.40, name: 'Aceite',   icon: '🛢️', speedLabel: '×0.40 velocidad', viscosity: 30, bg: 0x151407, grid: 0x3f3a12, glow: 0x7a6520, deep: 0x25230c, mid: 0x6f641b, shine: 0xc9bb55, motion: 0.48, wave: 6, blobs: 7 },
  water    : { speed: 1.00, name: 'Agua',     icon: '💧', speedLabel: '×1.0 velocidad',  viscosity: 50, bg: 0x071728, grid: 0x15385d, glow: 0x42a5f5, deep: 0x0b3c68, mid: 0x1976d2, shine: 0x9bd8ff, motion: 1.25, wave: 12, blobs: 10 },
  gasoline : { speed: 1.80, name: 'Gasolina', icon: '⛽', speedLabel: '×1.8 velocidad',  viscosity: 68, bg: 0x221005, grid: 0x5a2a08, glow: 0xff8f00, deep: 0x5f2104, mid: 0xd65a0a, shine: 0xffc06a, motion: 1.45, wave: 10, blobs: 8 },
  alcohol  : { speed: 2.60, name: 'Alcohol',  icon: '🥃', speedLabel: '×2.6 velocidad',  viscosity: 82, bg: 0x05201c, grid: 0x0b5a50, glow: 0x00e5cc, deep: 0x06483f, mid: 0x009688, shine: 0x8dfff1, motion: 1.65, wave: 11, blobs: 9 },
  mercury  : { speed: 4.00, name: 'Mercurio', icon: '🪨', speedLabel: '×4.0 velocidad',  viscosity: 100, bg: 0x171222, grid: 0x4a2c5d, glow: 0xce93d8, deep: 0x2a2036, mid: 0x7e5f90, shine: 0xf2d7ff, motion: 0.75, wave: 5, blobs: 6 },
};

// ── Configuración de materiales ───────────────────────────────
// density: multiplicador de velocidad de caída
// Un material denso cae más rápido; uno ligero flota o resiste
const MATERIAL_CONFIGS = {
  cork    : {
    density: 0.35, name: 'Corcho',  icon: '🍾', label: 'Flota casi siempre',   color: '#c8a96e', glow: 'rgba(200,169,110,0.35)',
    realDensity: '120–240 kg/m³',
    compare: 'Más ligero que el agua (1000 kg/m³)',
    badge: 'Muy ligero',
    tooltipGlow: 'rgba(200,169,110,0.4)',
    tooltipBar: 'linear-gradient(90deg,#8b6914,#c8a96e)',
    barPct: 6,
    facts: [
      'El corcho flota en casi cualquier líquido. Su estructura celular atrapa millones de burbujas de aire.',
      '¿Sabías? El corcho viene de la corteza del alcornoque. Un árbol puede pelarse cada 9-12 años sin dañarlo.',
      'Los tapones de corcho son tan impermeables que preservan el vino durante siglos. El vino más antiguo sellado con corcho tiene más de 300 años.',
      'El corcho es el material más ligero usado en construcción. Su densidad (≈170 kg/m³) es menor que la de cualquier líquido común.',
    ],
    interactions: [
      { fluid: 'honey',    icon: '🍯', label: 'Miel',     result: 'Flota lentamente',   cls: 'result-float'  },
      { fluid: 'oil',      icon: '🛢️', label: 'Aceite',  result: 'Flota ágil',         cls: 'result-float'  },
      { fluid: 'water',    icon: '💧', label: 'Agua',    result: 'Flota rápido',        cls: 'result-float'  },
      { fluid: 'gasoline', icon: '⛽', label: 'Gasolina', result: 'Flota veloz',          cls: 'result-float'  },
      { fluid: 'alcohol',  icon: '🥃', label: 'Alcohol',  result: 'Cae muy lento',       cls: 'result-slow'   },
      { fluid: 'mercury',  icon: '🪨', label: 'Mercurio', result: 'Cae brutal',           cls: 'result-instant'},
    ],
  },
  wood    : {
    density: 0.60, name: 'Madera',  icon: '🪵', label: 'Ligero · Flota en agua', color: '#a0622d', glow: 'rgba(160,98,45,0.35)',
    realDensity: '400–900 kg/m³',
    compare: 'Menor que el agua → flota',
    badge: 'Ligero',
    tooltipGlow: 'rgba(160,98,45,0.4)',
    tooltipBar: 'linear-gradient(90deg,#5d3a1a,#a0622d)',
    barPct: 15,
    facts: [
      'La madera flota porque su densidad promedio (600 kg/m³) es menor que la del agua. ¡Los barcos de madera navegan por eso!',
      'Un tronco de roble pesa casi el doble que uno de pino. La densidad varía mucho según la especie.',
      'La madera balsa es tan ligera (120 kg/m³) que los Incas la usaban para construir balsas oceánicas.',
      'El ébano es una madera tan densa (1100 kg/m³) que ¡se hunde en el agua! Es una de las pocas maderas que no flotan.',
    ],
    interactions: [
      { fluid: 'honey',    icon: '🍯', label: 'Miel',     result: 'Flota lento',          cls: 'result-float'  },
      { fluid: 'oil',      icon: '🛢️', label: 'Aceite',  result: 'Flota medio',         cls: 'result-float'  },
      { fluid: 'water',    icon: '💧', label: 'Agua',    result: 'Flota estándar',       cls: 'result-float'  },
      { fluid: 'gasoline', icon: '⛽', label: 'Gasolina', result: 'Cae lento',            cls: 'result-slow'   },
      { fluid: 'alcohol',  icon: '🥃', label: 'Alcohol',  result: 'Cae medio',           cls: 'result-medium' },
      { fluid: 'mercury',  icon: '🪨', label: 'Mercurio', result: 'Cae brutal',           cls: 'result-instant'},
    ],
  },
  plastic : {
    density: 0.90, name: 'Plástico',icon: '🧴', label: 'Casi neutro',            color: '#4fc3f7', glow: 'rgba(79,195,247,0.30)',
    realDensity: '800–1100 kg/m³',
    compare: 'Cerca de la densidad del agua',
    badge: 'Neutro',
    tooltipGlow: 'rgba(79,195,247,0.35)',
    tooltipBar: 'linear-gradient(90deg,#0277bd,#4fc3f7)',
    barPct: 23,
    facts: [
      'El plástico puede flotar o hundirse según su tipo. El polietileno (bolsas) flota; el PVC se hunde. ¡Por eso contamina océanos!',
      'Se producen 380 millones de toneladas de plástico al año. Su baja densidad lo hace fácil de transportar pero difícil de recoger del mar.',
      'Una botella de plástico PET tarda 450 años en descomponerse. Su densidad (1380 kg/m³) hace que se hunda lentamente.',
      'El poliestireno expandido (corcho blanco) tiene una densidad de solo 25 kg/m³. ¡Es 98% aire!',
    ],
    interactions: [
      { fluid: 'honey',    icon: '🍯', label: 'Miel',     result: 'Flota lento',          cls: 'result-float'  },
      { fluid: 'oil',      icon: '🛢️', label: 'Aceite',  result: 'Cae muy lento',       cls: 'result-slow'   },
      { fluid: 'water',    icon: '💧', label: 'Agua',    result: 'Cae lento',            cls: 'result-slow'   },
      { fluid: 'gasoline', icon: '⛽', label: 'Gasolina', result: 'Cae medio',            cls: 'result-medium' },
      { fluid: 'alcohol',  icon: '🥃', label: 'Alcohol',  result: 'Cae rápido',          cls: 'result-fast'   },
      { fluid: 'mercury',  icon: '🪨', label: 'Mercurio', result: 'Cae brutal',           cls: 'result-instant'},
    ],
  },
  stone   : {
    density: 1.50, name: 'Piedra',  icon: '🪨', label: 'Denso · Cae rápido',     color: '#90a4ae', glow: 'rgba(144,164,174,0.35)',
    realDensity: '1500–3000 kg/m³',
    compare: '1.5× más densa que el agua',
    badge: 'Denso',
    tooltipGlow: 'rgba(144,164,174,0.4)',
    tooltipBar: 'linear-gradient(90deg,#546e7a,#90a4ae)',
    barPct: 38,
    facts: [
      'La piedra se hunde rápidamente. Los constructores romanos usaban piedra para anclar estructuras submarinas.',
      'El granito (2750 kg/m³) es casi 3 veces más denso que el agua. Sin embargo, la piedra pómez es tan porosa que flota.',
      '¿Sabías? Los egipcios tenían que usar balsas de madera muy anchas para transportar los enormes bloques de piedra caliza por el Nilo.',
      'En el mercurio líquido (13.600 kg/m³), ¡la piedra flota! El mercurio es tan denso que la mayoría de materiales flotan en él.',
    ],
    interactions: [
      { fluid: 'honey',    icon: '🍯', label: 'Miel',     result: 'Cae lento',           cls: 'result-slow'   },
      { fluid: 'oil',      icon: '🛢️', label: 'Aceite',  result: 'Cae medio',           cls: 'result-medium' },
      { fluid: 'water',    icon: '💧', label: 'Agua',    result: 'Cae rápido',          cls: 'result-fast'   },
      { fluid: 'gasoline', icon: '⛽', label: 'Gasolina', result: 'Cae muy rápido',      cls: 'result-fast'   },
      { fluid: 'alcohol',  icon: '🥃', label: 'Alcohol',  result: 'Cae fuerte',          cls: 'result-fast'   },
      { fluid: 'mercury',  icon: '🪨', label: 'Mercurio', result: 'Cae brutal',           cls: 'result-instant'},
    ],
  },
  iron    : {
    density: 2.50, name: 'Hierro',  icon: '⚙️', label: 'Muy denso · Cae fuerte', color: '#78909c', glow: 'rgba(120,144,156,0.4)',
    realDensity: '7874 kg/m³',
    compare: '~7.9× más denso que el agua',
    badge: 'Muy denso',
    tooltipGlow: 'rgba(120,144,156,0.45)',
    tooltipBar: 'linear-gradient(90deg,#37474f,#78909c)',
    barPct: 63,
    facts: [
      'El hierro es tan denso que se usa en lastre de barcos. Curioso: los barcos de acero flotan gracias a su forma hueca, no a su material.',
      'El núcleo de la Tierra es mayormente hierro fundido a 5400°C. Su densidad allí alcanza 13.000 kg/m³.',
      'Una espada de hierro medieval pesaba unos 1.5 kg. Los herreros la forjaban a 1200°C.',
      'El hierro se oxida formando óxido de hierro (herrumbre), que es aún más denso (5250 kg/m³) que el hierro puro.',
    ],
    interactions: [
      { fluid: 'honey',    icon: '🍯', label: 'Miel',     result: 'Cae medio',           cls: 'result-medium' },
      { fluid: 'oil',      icon: '🛢️', label: 'Aceite',  result: 'Cae rápido',          cls: 'result-fast'   },
      { fluid: 'water',    icon: '💧', label: 'Agua',    result: 'Cae fuerte',          cls: 'result-fast'   },
      { fluid: 'gasoline', icon: '⛽', label: 'Gasolina', result: 'Cae muy fuerte',      cls: 'result-fast'   },
      { fluid: 'alcohol',  icon: '🥃', label: 'Alcohol',  result: 'Hundimiento',         cls: 'result-instant'},
      { fluid: 'mercury',  icon: '🪨', label: 'Mercurio', result: 'Hundimiento brutal',   cls: 'result-instant'},
    ],
  },
  lead    : {
    density: 4.00, name: 'Plomo',   icon: '🔩', label: 'Metal puro · Hundimiento brutal', color: '#546e7a', glow: 'rgba(84,110,122,0.5)',
    realDensity: '11 340 kg/m³',
    compare: '11× más denso que el agua',
    badge: 'Ultra denso',
    tooltipGlow: 'rgba(84,110,122,0.5)',
    tooltipBar: 'linear-gradient(90deg,#1c313a,#546e7a)',
    barPct: 100,
    facts: [
      'El plomo es uno de los metales más densos. Se usó durante siglos como peso en redes de pesca. ¡Un cubo de plomo de 10 cm pesa 11 kg!',
      'Los romanos usaban plomo para tuberías de agua (la palabra "plumbería" viene del latín "plumbum" = plomo).',
      'El plomo es tan denso que se usa como blindaje contra radiación. Un delantal de plomo en radiología pesa unos 5 kg.',
      'A pesar de ser tan denso, el plomo es blando: puedes rayarlo con la uña. Es el metal más blando de uso común.',
    ],
    interactions: [
      { fluid: 'honey',    icon: '🍯', label: 'Miel',     result: 'Cae rápido',          cls: 'result-fast'   },
      { fluid: 'oil',      icon: '🛢️', label: 'Aceite',  result: 'Cae fuerte',          cls: 'result-fast'   },
      { fluid: 'water',    icon: '💧', label: 'Agua',    result: 'Hundimiento',         cls: 'result-instant'},
      { fluid: 'gasoline', icon: '⛽', label: 'Gasolina', result: 'Hundimiento rápido',  cls: 'result-instant'},
      { fluid: 'alcohol',  icon: '🥃', label: 'Alcohol',  result: 'Hundimiento brutal',  cls: 'result-instant'},
      { fluid: 'mercury',  icon: '🪨', label: 'Mercurio', result: 'Hundimiento extremo',  cls: 'result-instant'},
    ],
  },
};

const WORLD_KEYS = ['oil', 'honey', 'water', 'gasoline', 'alcohol', 'mercury'];
const WORLD_PAGE_GLOWS = {
  honey    : { strong: 'rgba(255,178,28,0.34)',   soft: 'rgba(120,74,10,0.28)'   },
  oil      : { strong: 'rgba(122,101,32,0.36)',   soft: 'rgba(55,48,16,0.3)'     },
  water    : { strong: 'rgba(66,165,245,0.38)',   soft: 'rgba(21,101,192,0.28)'  },
  gasoline : { strong: 'rgba(255,143,0,0.38)',    soft: 'rgba(180,80,0,0.28)'    },
  alcohol  : { strong: 'rgba(0,229,204,0.38)',    soft: 'rgba(0,121,107,0.28)'   },
  mercury  : { strong: 'rgba(206,147,216,0.38)',  soft: 'rgba(106,27,154,0.28)'  },
};

let currentFluidSpeed      = GRAVITY_SPEED; // base del fluido
let currentMaterialDensity = MATERIAL_CONFIGS.plastic.density; // multiplicador del material
let currentMaterialKey     = 'plastic';
let currentWorldKey        = 'water';
let currentWorldVisual     = { ...FLUID_CONFIGS.water };
let worldVisualTransition  = null;
let currentMaterialColorVisual = colorStringToNumber(MATERIAL_CONFIGS.plastic.color);
let materialColorTransition = null;
let currentMaterialPulse = 0;

function colorStringToNumber(color) {
  return parseInt(color.replace('#', ''), 16);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(a, b, t) {
  const ar = (a >> 16) & 255;
  const ag = (a >> 8) & 255;
  const ab = a & 255;
  const br = (b >> 16) & 255;
  const bg = (b >> 8) & 255;
  const bb = b & 255;
  return (
    (Math.round(lerp(ar, br, t)) << 16) |
    (Math.round(lerp(ag, bg, t)) << 8) |
    Math.round(lerp(ab, bb, t))
  );
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function beginWorldVisualTransition(worldKey) {
  const target = FLUID_CONFIGS[worldKey];
  if (!target) return;
  const sameWorld =
    currentWorldVisual.bg === target.bg &&
    currentWorldVisual.grid === target.grid &&
    currentWorldVisual.glow === target.glow;
  if (sameWorld && !worldVisualTransition) return;

  worldVisualTransition = {
    elapsed: 0,
    duration: 1400,
    start: { ...currentWorldVisual },
    target: { ...target },
  };
}

function updateWorldVisualTransition(dt) {
  if (!worldVisualTransition) return;
  const tx = worldVisualTransition;
  tx.elapsed += dt;
  const t = easeInOut(Math.min(tx.elapsed / tx.duration, 1));
  const numericKeys = ['bg', 'grid', 'glow', 'deep', 'mid', 'shine'];
  const motionKeys = ['motion', 'wave', 'blobs'];

  for (const key of numericKeys) {
    currentWorldVisual[key] = lerpColor(tx.start[key], tx.target[key], t);
  }
  for (const key of motionKeys) {
    currentWorldVisual[key] = lerp(tx.start[key], tx.target[key], t);
  }

  if (t >= 1) {
    currentWorldVisual = { ...tx.target };
    worldVisualTransition = null;
  }
}

function beginMaterialVisualTransition(matKey) {
  const target = MATERIAL_CONFIGS[matKey];
  if (!target) return;
  materialColorTransition = {
    elapsed: 0,
    duration: 520,
    start: currentMaterialColorVisual,
    target: colorStringToNumber(target.color),
  };
  currentMaterialPulse = 1;
}

function updateMaterialVisualTransition(dt) {
  if (materialColorTransition) {
    const tx = materialColorTransition;
    tx.elapsed += dt;
    const t = easeInOut(Math.min(tx.elapsed / tx.duration, 1));
    currentMaterialColorVisual = lerpColor(tx.start, tx.target, t);
    if (t >= 1) {
      currentMaterialColorVisual = tx.target;
      materialColorTransition = null;
    }
  }
  currentMaterialPulse = Math.max(0, currentMaterialPulse - dt / 650);
}

// Velocidad efectiva = fluido × material
function getEffectiveSpeed() {
  return currentFluidSpeed * currentMaterialDensity;
}

function getCurrentBlockColor() {
  return currentMaterialColorVisual;
}

function getCurrentWorldStyle() {
  return currentWorldVisual;
}
const MAX_DT          = 100;

const INPUT_REPEAT_THRESHOLD = 400;
const INPUT_REPEAT_INTERVAL  = 50;

const INPUT_STATE_INITIAL   = 0;
const INPUT_STATE_CHARGING  = 1;
const INPUT_STATE_REPEATING = 2;

function getVisualFallOffset(state) {
  if (!state || !state.currentPiece || state.isGameOver) return 0;
  const { grid, currentPiece } = state;
  const { shape, position: pos } = currentPiece;
  if (!canGridFitShape(grid, shape, pos.x, pos.y + 1)) return 0;
  return Math.min(state.gravity.progress / GRAVITY_THRESH, 0.98);
}

// ── Lógica pura del juego (sin dependencia de Phaser) ─────────

function getRandomIndex(n) { return Math.floor(Math.random() * n); }
function getRandomShapeId() { return getRandomIndex(SHAPES.length); }

function makeEmptyGrid() {
  return Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(BLOCK_EMPTY));
}

function createCurrentPiece(shapeId) {
  const shape = SHAPES[shapeId];
  return {
    shapeId,
    shape: shape.map(r => [...r]),
    position: {
      x: getRandomIndex(GRID_COLS - shape[0].length + 1),
      y: 0,
    },
  };
}

function getInitialState() {
  const initialShapeId = getRandomShapeId();
  return {
    isGameOver : false,
    score      : 0,
    lines      : 0,
    level      : 1,
    gravity    : { progress: 0, speed: getEffectiveSpeed() },
    currentPiece: createCurrentPiece(initialShapeId),
    nextShapeId : getRandomShapeId(),
    grid        : makeEmptyGrid(),
  };
}

function canGridFitShape(grid, shape, sx, sy) {
  return shape.every((row, i) =>
    row.every((solid, j) => {
      if (!solid) return true;
      const gy = sy + i, gx = sx + j;
      if (gy >= grid.length)    return false;
      if (gx < 0 || gx >= grid[0].length) return false;
      return grid[gy][gx] === BLOCK_EMPTY;
    })
  );
}

function moveCurrentPiece(grid, piece, dx, dy) {
  const { shape, position: pos } = piece;
  const ok = canGridFitShape(grid, shape, pos.x + dx, pos.y + dy);
  if (ok) { pos.x += dx; pos.y += dy; }
  return ok;
}

function attachToGrid(grid, piece) {
  const { shapeId, shape, position: pos } = piece;
  shape.forEach((row, i) =>
    row.forEach((v, j) => { if (v) grid[pos.y + i][pos.x + j] = shapeId; })
  );
}

function clearCompleteLines(grid) {
  let cleared = 0;
  for (let i = grid.length - 1; i >= 0; i--) {
    if (grid[i].every(c => c !== BLOCK_EMPTY)) {
      cleared++;
    } else if (cleared > 0) {
      grid[i + cleared] = [...grid[i]];
    }
  }
  for (let i = 0; i < cleared; i++) grid[i].fill(BLOCK_EMPTY);
  return cleared;
}

function calcScore(lines) {
  return [0, 100, 300, 500, 800][Math.min(lines, 4)];
}

function handleLanding(state) {
  attachToGrid(state.grid, state.currentPiece);
  const cleared = clearCompleteLines(state.grid);
  state.lines  += cleared;
  state.score  += calcScore(cleared);
  state.level   = 1 + Math.floor(state.lines / 10);

  const next = createCurrentPiece(state.nextShapeId);
  if (canGridFitShape(state.grid, next.shape, next.position.x, next.position.y)) {
    state.currentPiece = next;
    state.nextShapeId  = getRandomShapeId();
  } else {
    state.isGameOver = true;
  }

  return cleared;
}

function moveDown(state) {
  state.gravity.progress = 0;
  const moved = moveCurrentPiece(state.grid, state.currentPiece, 0, 1);
  let cleared = 0;
  if (!moved) cleared = handleLanding(state);
  return { moved, cleared };
}

function rotate(shape) {
  return Array.from({ length: shape[0].length }, (_, i) =>
    Array.from({ length: shape.length }, (_, j) => shape[shape.length - 1 - j][i])
  );
}

function rotateCurrentPiece(grid, piece) {
  const ns = rotate(piece.shape);
  if (canGridFitShape(grid, ns, piece.position.x, piece.position.y))
    piece.shape = ns;
}

function resetGameState(state) {
  const fresh = getInitialState();
  // Preservar la velocidad efectiva (fluido × material)
  fresh.gravity.speed = getEffectiveSpeed();
  Object.assign(state, fresh);
}

function handleInputState(inp, dt) {
  if (!inp) return false;
  inp.timer += dt;
  switch (inp.state) {
    case INPUT_STATE_INITIAL:
      inp.state = INPUT_STATE_CHARGING;
      return true;
    case INPUT_STATE_CHARGING:
      if (inp.timer >= INPUT_REPEAT_THRESHOLD) { inp.state = INPUT_STATE_REPEATING; inp.timer = 0; }
      return false;
    case INPUT_STATE_REPEATING:
      const ok = inp.timer >= INPUT_REPEAT_INTERVAL;
      if (ok) inp.timer = 0;
      return ok;
  }
}

function updateGravity(state, dt) {
  // Level speeds up gravity
  const speedMult = 1 + (state.level - 1) * 0.15;
  state.gravity.speed += GRAVITY_ACCEL * dt;
  state.gravity.progress += state.gravity.speed * speedMult * dt;
  if (state.gravity.progress >= GRAVITY_THRESH) return moveDown(state);
  return null;
}

// ── Escena Principal de Phaser ─────────────────────────────────

class TetrisScene extends Phaser.Scene {
  constructor() { super({ key: 'TetrisScene' }); }

  // ── Preload ──────────────────────────────────────────────────
  preload() {
    // Nada que precargar — todo dibujado con gráficos de Phaser
  }

  // ── Create ───────────────────────────────────────────────────
  create() {
    this.gameState  = getInitialState();
    this.inputs     = {};
    this.particles  = []; // efectos de línea limpiada
    this.flashAlpha = 0;  // destello al limpiar línea

    this._buildGraphicsLayers();
    this._setupKeyboard();
    this._buildUI();
  }

  // ── Capas gráficas ────────────────────────────────────────────
  _buildGraphicsLayers() {
    // Fondo del área de juego
    this.bgGraphics   = this.add.graphics();
    // Tablero (celdas)
    this.gridGraphics = this.add.graphics();
    // Pieza fantasma (ghost)
    this.ghostGraphics = this.add.graphics();
    // Pieza actual
    this.pieceGraphics = this.add.graphics();
    // Efectos (partículas, flash)
    this.fxGraphics    = this.add.graphics();
    // Transición de mundo sobre todo el tablero + sidebar
    this.worldTransitionGraphics = this.add.graphics();
    // Overlay de game-over
    this.overlayGraphics = this.add.graphics();
  }

  // ── Teclado ───────────────────────────────────────────────────
  _setupKeyboard() {
    const kb = this.input.keyboard;

    const keyMap = {
      moveLeft:  [Phaser.Input.Keyboard.KeyCodes.LEFT,  Phaser.Input.Keyboard.KeyCodes.A],
      moveRight: [Phaser.Input.Keyboard.KeyCodes.RIGHT, Phaser.Input.Keyboard.KeyCodes.D],
      moveDown:  [Phaser.Input.Keyboard.KeyCodes.DOWN,  Phaser.Input.Keyboard.KeyCodes.S],
      rotate:    [Phaser.Input.Keyboard.KeyCodes.UP,    Phaser.Input.Keyboard.KeyCodes.W],
      hardDrop:  [Phaser.Input.Keyboard.KeyCodes.SPACE],
      restart:   [Phaser.Input.Keyboard.KeyCodes.R],
    };

    this.keys = {};
    for (const [action, codes] of Object.entries(keyMap)) {
      this.keys[action] = codes.map(c => kb.addKey(c));
    }

    // Configurar listeners para seguimiento de estado
    for (const [action, keyObjs] of Object.entries(this.keys)) {
      for (const key of keyObjs) {
        key.on('down', () => {
          if (!this.inputs[action]) {
            this.inputs[action] = { state: INPUT_STATE_INITIAL, timer: 0 };
          }
        });
        key.on('up', () => { delete this.inputs[action]; });
      }
    }
  }

  // ── UI (textos estáticos y dinámicos) ─────────────────────────
  _buildUI() {
    const sx = GRID_PX_W + SIDEBAR_GAP + 10;

    // ── Fondo lateral glassmorphism ──
    this.sidebarBg = this.add.graphics();
    this._drawSidebarBg();

    const textStyle = {
      fontFamily : 'Outfit, sans-serif',
      fontSize   : '13px',
      color      : '#8888aa',
      fontStyle  : 'normal',
    };
    const valStyle = {
      fontFamily : 'Outfit, sans-serif',
      fontSize   : '22px',
      color      : '#ffffff',
      fontStyle  : 'bold',
    };
    const labelBig = {
      fontFamily : 'Outfit, sans-serif',
      fontSize   : '11px',
      color      : '#7777aa',
      letterSpacing: 3,
    };

    // SCORE
    this.add.text(sx, 22, 'SCORE', labelBig);
    this.scoreText = this.add.text(sx, 38, '0000000', valStyle);

    // LINES
    this.add.text(sx, 82, 'LINES', labelBig);
    this.linesText = this.add.text(sx, 98, '000', valStyle);

    // LEVEL
    this.add.text(sx, 142, 'LEVEL', labelBig);
    this.levelText = this.add.text(sx, 158, '1', valStyle);

    // NEXT
    this.add.text(sx, 210, 'NEXT', labelBig);

    // Controles (abajo)
    const ctrlStyle = { fontFamily: 'Outfit', fontSize: '10px', color: '#555577', wordWrap: { width: SIDEBAR_W - 20 } };
    this.add.text(sx, CANVAS_H - 110,
      '← → Mover\n↑  Rotar\n↓  Bajar\nSPACE Hard drop\nR  Reiniciar', ctrlStyle);
  }

  _drawSidebarBg() {
    const g = this.sidebarBg;
    const world = getCurrentWorldStyle();
    g.clear();
    const x = GRID_PX_W + SIDEBAR_GAP;
    // fondo semitransparente con tinte del mundo activo
    g.fillStyle(world.bg, 0.82);
    g.fillRoundedRect(x, 0, SIDEBAR_W, CANVAS_H, 12);
    g.fillStyle(world.glow, 0.08);
    g.fillRoundedRect(x, 0, SIDEBAR_W, CANVAS_H, 12);
    // borde sutil
    g.lineStyle(1, world.glow, 0.58);
    g.strokeRoundedRect(x, 0, SIDEBAR_W, CANVAS_H, 12);
  }

  // ── Update principal ──────────────────────────────────────────
  update(time, delta) {
    const dt    = Math.min(delta, MAX_DT);
    const state = this.gameState;

    updateWorldVisualTransition(dt);
    updateMaterialVisualTransition(dt);

    if (state.isGameOver) {
      this._handleGameOverInput();
      this._renderAll();
      return;
    }

    // Actualizar inputs
    this._processInputs(dt);
    // Gravedad
    const gravResult = updateGravity(state, dt);
    if (gravResult && gravResult.cleared > 0) this._triggerLineFX(gravResult.cleared);

    // Actualizar partículas
    this._updateParticles(dt);

    // Renderizar
    this._renderAll();
  }

  _handleGameOverInput() {
    let doRestart = false;
    for (const key of (this.keys.restart || [])) {
      if (Phaser.Input.Keyboard.JustDown(key)) {
        doRestart = true;
        break;
      }
    }
    
    // También reiniciar con click izquierdo
    if (this.input.activePointer.leftButtonDown() || this.input.activePointer.justDown) {
      doRestart = true;
    }

    if (doRestart) {
      resetGameState(this.gameState);
      this.particles = [];
      this.flashAlpha = 0;
      // Ocultar textos del overlay de game-over
      if (this._goTexts) {
        this._goTitle.setVisible(false);
        this._goSub.setVisible(false);
        this._goRestart.setVisible(false);
      }
      return;
    }
  }

  // ── Procesado de inputs ───────────────────────────────────────
  _processInputs(dt) {
    const state = this.gameState;
    const isActive = (action) => {
      // Sincronizar estado de tecla presionada
      const anyDown = (this.keys[action] || []).some(k => k.isDown);
      if (!anyDown) { delete this.inputs[action]; return false; }
      return handleInputState(this.inputs[action], dt);
    };

    if (isActive('moveLeft'))  moveCurrentPiece(state.grid, state.currentPiece, -1, 0);
    if (isActive('moveRight')) moveCurrentPiece(state.grid, state.currentPiece,  1, 0);
    if (isActive('rotate'))    rotateCurrentPiece(state.grid, state.currentPiece);

    if (isActive('moveDown')) {
      const r = moveDown(state);
      if (r && r.cleared > 0) this._triggerLineFX(r.cleared);
    }

    if (isActive('hardDrop')) {
      let r;
      do { r = moveDown(state); } while (r && r.moved);
      if (r && r.cleared > 0) this._triggerLineFX(r.cleared);
    }
  }

  // ── Efectos de línea limpiada ─────────────────────────────────
  _triggerLineFX(count) {
    this.flashAlpha = 0.6;
    // Partículas dispersas
    for (let k = 0; k < count * 20; k++) {
      this.particles.push({
        x  : Math.random() * GRID_PX_W,
        y  : Math.random() * GRID_PX_H,
        vx : (Math.random() - 0.5) * 4,
        vy : (Math.random() - 2.5) * 3,
        life: 600 + Math.random() * 400,
        maxLife: 600 + Math.random() * 400,
        color: getCurrentBlockColor(),
        size: 3 + Math.random() * 4,
      });
    }
  }

  _updateParticles(dt) {
    this.flashAlpha = Math.max(0, this.flashAlpha - dt * 0.004);
    this.particles = this.particles.filter(p => {
      p.life -= dt;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      return p.life > 0;
    });
  }

  // ── Render ────────────────────────────────────────────────────
  _renderAll() {
    this._drawBackground();
    this._drawSidebarBg();
    this._drawGrid();
    this._drawGhost();
    this._drawCurrentPiece();
    this._drawFX();
    this._drawSidebar();
    this._drawWorldTransition();
    if (this.gameState.isGameOver) this._drawGameOver();
    else this.overlayGraphics.clear();
  }

  // Fondo tablero con gradiente simulado
  _drawBackground() {
    const g = this.bgGraphics;
    const world = getCurrentWorldStyle();
    g.clear();
    g.fillStyle(world.bg, 1);
    g.fillRect(0, 0, GRID_PX_W, GRID_PX_H);

    this._drawLiquidAnimation(g, world);

    g.lineStyle(2, world.glow, 0.55);
    g.strokeRect(1, 1, GRID_PX_W - 2, GRID_PX_H - 2);
  }

  _drawLiquidAnimation(g, world) {
    const t = this.time.now * 0.001 * world.motion;

    g.fillStyle(world.glow, 0.08);
    g.fillRect(0, 0, GRID_PX_W, GRID_PX_H);

    this._drawLiquidBand(g, world.deep, 0.30, GRID_PX_H * 0.28, world.wave * 0.65, t, 0.8);
    this._drawLiquidBand(g, world.mid, 0.18, GRID_PX_H * 0.46, world.wave, -t * 0.75, 1.25);
    this._drawLiquidBand(g, world.glow, 0.12, GRID_PX_H * 0.66, world.wave * 0.8, t * 1.2, 1.7);

    for (let i = 0; i < world.blobs; i++) {
      const drift = t * (18 + i * 2.5);
      const x = ((i * 73 + drift * 12) % (GRID_PX_W + 90)) - 45;
      const y = 44 + ((i * 97 + Math.sin(t + i) * 28) % (GRID_PX_H - 120));
      const sx = 26 + (i % 4) * 13;
      const sy = 8 + (i % 3) * 5;
      const alpha = currentWorldKey === 'water' ? 0.12 : 0.09;

      g.fillStyle(world.shine, alpha);
      g.fillEllipse(x, y, sx, sy);
      g.lineStyle(1, world.shine, alpha * 0.9);
      g.strokeEllipse(x + 2, y - 1, sx * 0.72, sy * 0.62);
    }

    for (let i = 0; i < 7; i++) {
      const x = (i * 57 + Math.sin(t * 1.3 + i) * 14) % GRID_PX_W;
      const y = (i * 89 - (t * 34 + i * 11) % GRID_PX_H + GRID_PX_H) % GRID_PX_H;
      const r = 2 + (i % 3);
      g.fillStyle(world.shine, currentWorldKey === 'oil' ? 0.06 : 0.1);
      g.fillCircle(x, y, r);
    }
  }

  _drawLiquidBand(g, color, alpha, baseY, amp, phase, lengthMult) {
    const points = [{ x: 0, y: GRID_PX_H }];

    for (let x = 0; x <= GRID_PX_W; x += 14) {
      const y =
        baseY +
        Math.sin((x * 0.022 * lengthMult) + phase) * amp +
        Math.sin((x * 0.047) - phase * 0.7) * (amp * 0.34);
      points.push({ x, y });
    }

    points.push({ x: GRID_PX_W, y: GRID_PX_H });
    g.fillStyle(color, alpha);
    g.fillPoints(points, true);

    g.lineStyle(1, color, alpha + 0.08);
    for (let i = 1; i < points.length - 2; i++) {
      const a = points[i];
      const b = points[i + 1];
      g.lineBetween(a.x, a.y, b.x, b.y);
    }
  }

  _drawGrid() {
    const g = this.gridGraphics;
    g.clear();
    const { grid } = this.gameState;

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[0].length; j++) {
        const id = grid[i][j];
        if (id === BLOCK_EMPTY) continue;
        this._drawBlock(g, j, i, getCurrentBlockColor());
      }
    }
  }

  // Pieza fantasma (ghost)
  _drawGhost() {
    const g = this.ghostGraphics;
    g.clear();
    const { grid, currentPiece } = this.gameState;
    const { shape, position: pos } = currentPiece;

    // Bajar la pieza fantasma
    let ghostY = pos.y;
    while (canGridFitShape(grid, shape, pos.x, ghostY + 1)) ghostY++;
    if (ghostY === pos.y) return; // ya tocó fondo

    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[0].length; j++) {
        if (!shape[i][j]) continue;
        const px = (pos.x + j) * BLOCK_SIZE;
        const py = (ghostY + i) * BLOCK_SIZE;
        g.fillStyle(getCurrentBlockColor(), 0.12);
        g.fillRoundedRect(px + 5, py + 5, BLOCK_SIZE - 10, BLOCK_SIZE - 10, 7);
        g.lineStyle(1, getCurrentBlockColor(), 0.28);
        g.strokeRoundedRect(px + 5, py + 5, BLOCK_SIZE - 10, BLOCK_SIZE - 10, 7);
      }
    }
  }

  _drawCurrentPiece() {
    const g = this.pieceGraphics;
    g.clear();
    const { currentPiece } = this.gameState;
    const { shape, position: pos } = currentPiece;
    const fallOffset = getVisualFallOffset(this.gameState);
    const world = getCurrentWorldStyle();
    const t = this.time.now * 0.001 * world.motion;
    const fluidSway = Math.sin(t * 2.2 + pos.y * 0.35) * Math.min(2.2, 0.55 + world.motion * 0.8);

    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[0].length; j++) {
        if (shape[i][j]) {
          const px = (pos.x + j) * BLOCK_SIZE + fluidSway;
          const py = (pos.y + i + fallOffset) * BLOCK_SIZE;
          this._drawBlockAt(g, px, py, getCurrentBlockColor(), true);
        }
      }
    }
  }

  _drawBlock(g, col, row, color, glow = false) {
    this._drawBlockAt(g, col * BLOCK_SIZE, row * BLOCK_SIZE, color, glow);
  }

  // Dibuja cada modulo como un objeto suavizado dentro del fluido.
  _drawBlockAt(g, x, y, color, glow = false) {
    const pad = 1;
    const s = BLOCK_SIZE - pad * 2;

    g.fillStyle(0x000000, 0.18);
    g.fillRoundedRect(x + pad + 1, y + pad + 2, s, s, 6);

    g.fillStyle(color, 1);
    g.fillRoundedRect(x + pad, y + pad, s, s, 5);

    g.fillStyle(0xffffff, 0.16);
    g.fillRoundedRect(x + pad + 4, y + pad + 4, s - 8, Math.floor(s * 0.22), 5);

    if (glow) {
      const world = getCurrentWorldStyle();
      g.lineStyle(1, world.shine, 0.38);
      g.strokeRoundedRect(x + pad, y + pad, s, s, 5);
    }

    if (currentMaterialPulse > 0) {
      g.fillStyle(0xffffff, currentMaterialPulse * 0.12);
      g.fillRoundedRect(x + pad + 1, y + pad + 1, s - 2, s - 2, 5);
      g.lineStyle(2, color, currentMaterialPulse * 0.75);
      g.strokeRoundedRect(x + pad, y + pad, s, s, 5);
    }
  }

  // Efectos de partículas y flash
  _drawFX() {
    const g = this.fxGraphics;
    g.clear();

    if (this.flashAlpha > 0) {
      g.fillStyle(0xffffff, this.flashAlpha * 0.15);
      g.fillRect(0, 0, GRID_PX_W, GRID_PX_H);
    }

    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      g.fillStyle(p.color, alpha);
      g.fillRect(p.x, p.y, p.size * alpha, p.size * alpha);
    }
  }

  _drawWorldTransition() {
    const g = this.worldTransitionGraphics;
    g.clear();
    if (!worldVisualTransition) return;

    const tx = worldVisualTransition;
    const raw = Math.min(tx.elapsed / tx.duration, 1);
    const sweep = easeInOut(raw);
    const target = tx.target;
    const waveX = lerp(-CANVAS_W * 0.18, CANVAS_W * 1.18, sweep);
    const fillAlpha = raw < 0.7 ? 0.32 : lerp(0.32, 0, (raw - 0.7) / 0.3);
    const rimAlpha = raw < 0.75 ? 0.72 : lerp(0.72, 0, (raw - 0.75) / 0.25);

    const points = [{ x: -40, y: 0 }, { x: waveX, y: 0 }];
    for (let y = 0; y <= CANVAS_H; y += 18) {
      const wobble =
        Math.sin(y * 0.035 + this.time.now * 0.006 * target.motion) * (18 + target.wave) +
        Math.sin(y * 0.011 - this.time.now * 0.003) * 14;
      points.push({ x: waveX + wobble, y });
    }
    points.push({ x: -40, y: CANVAS_H }, { x: -40, y: 0 });

    g.fillStyle(target.mid, fillAlpha);
    g.fillPoints(points, true);

    g.lineStyle(4, target.shine, rimAlpha);
    for (let i = 1; i < points.length - 2; i++) {
      const a = points[i];
      const b = points[i + 1];
      g.lineBetween(a.x, a.y, b.x, b.y);
    }

    for (let i = 0; i < 14; i++) {
      const y = (i * 53 + this.time.now * 0.08 * target.motion) % CANVAS_H;
      const x = waveX - 42 + Math.sin(i + this.time.now * 0.004) * 35;
      const s = 14 + (i % 4) * 8;
      g.fillStyle(target.shine, rimAlpha * 0.16);
      g.fillEllipse(x, y, s * 1.8, s * 0.5);
    }
  }

  // Barra lateral: next piece + stats
  _drawSidebar() {
    // Actualizar textos dinámicos
    const s = this.gameState;
    this.scoreText.setText(String(s.score).padStart(7, '0'));
    this.linesText.setText(String(s.lines).padStart(3, '0'));
    this.levelText.setText(String(s.level));

    // Dibujar next piece preview
    this._drawNextPiece();
  }

  _drawNextPiece() {
    // Limpiar prev next piece gfx si existe
    if (this._nextGfx) this._nextGfx.clear();
    else this._nextGfx = this.add.graphics();

    const g = this._nextGfx;
    const { nextShapeId } = this.gameState;
    const world = getCurrentWorldStyle();
    const shape = SHAPES[nextShapeId];
    const color = getCurrentBlockColor();

    const previewX = GRID_PX_W + SIDEBAR_GAP + 10;
    const previewY = 230;
    const cellSize = 22;

    // Fondo caja preview
    g.fillStyle(world.bg, 0.78);
    g.fillRoundedRect(previewX - 4, previewY - 4, (SIDEBAR_W - 14), 4 * cellSize + 12, 8);
    g.fillStyle(world.glow, 0.06);
    g.fillRoundedRect(previewX - 4, previewY - 4, (SIDEBAR_W - 14), 4 * cellSize + 12, 8);
    g.lineStyle(1, world.glow, 0.46);
    g.strokeRoundedRect(previewX - 4, previewY - 4, (SIDEBAR_W - 14), 4 * cellSize + 12, 8);

    // Centrar la pieza dentro del preview
    const offX = Math.floor((4 - shape[0].length) / 2);
    const offY = Math.floor((4 - shape.length) / 2);

    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[0].length; j++) {
        if (!shape[i][j]) continue;
        const px = previewX + (j + offX) * cellSize;
        const py = previewY + (i + offY) * cellSize;
        // Bloque mini
        g.fillStyle(0x000000, 0.4);
        g.fillRect(px, py, cellSize - 1, cellSize - 1);
        g.fillStyle(color, 1);
        g.fillRect(px + 1, py + 1, cellSize - 3, cellSize - 3);
        g.fillStyle(0xffffff, 0.2);
        g.fillRect(px + 1, py + 1, cellSize - 3, Math.floor((cellSize - 3) * 0.3));
      }
    }
  }

  // Game Over overlay
  _drawGameOver() {
    const g = this.overlayGraphics;
    g.clear();

    // Fondo semiopaco
    g.fillStyle(0x000000, 0.72);
    g.fillRect(0, 0, GRID_PX_W, GRID_PX_H);

    // Panel central glassmorphism
    const pw = 280, ph = 160;
    const px = (GRID_PX_W - pw) / 2;
    const py = (GRID_PX_H - ph) / 2;
    g.fillStyle(0x1a1a3a, 0.95);
    g.fillRoundedRect(px, py, pw, ph, 16);
    g.lineStyle(1.5, 0x6a11cb, 0.8);
    g.strokeRoundedRect(px, py, pw, ph, 16);

    // Textos (renderizados con drawText sobre el overlay)
    if (!this._goTexts) {
      this._goTitle = this.add.text(GRID_PX_W / 2, CANVAS_H / 2 - 36, 'GAME OVER', {
        fontFamily: 'Outfit', fontSize: '30px', color: '#ff4488', fontStyle: 'bold',
      }).setOrigin(0.5, 0.5);
      this._goSub = this.add.text(GRID_PX_W / 2, CANVAS_H / 2 + 10, '', {
        fontFamily: 'Outfit', fontSize: '14px', color: '#aaaacc',
      }).setOrigin(0.5, 0.5);
      this._goRestart = this.add.text(GRID_PX_W / 2, CANVAS_H / 2 + 46, 'Presiona R o Click para reiniciar', {
        fontFamily: 'Outfit', fontSize: '13px', color: '#6655ff',
      }).setOrigin(0.5, 0.5);
      this._goTexts = true;
    }

    // Animación pulsante en el texto restart
    const pulse = 0.8 + 0.2 * Math.sin(this.time.now * 0.004);
    this._goRestart.setAlpha(pulse);
    this._goSub.setText(`Puntuación: ${String(this.gameState.score).padStart(7,'0')}`);

    // Mostrar/ocultar según game over
    this._goTitle.setVisible(true);
    this._goSub.setVisible(true);
    this._goRestart.setVisible(true);
  }
}

// ── Configuración y arranque de Phaser ─────────────────────────

const config = {
  type          : Phaser.AUTO,
  width         : CANVAS_W,
  height        : CANVAS_H,
  backgroundColor: '#0d0d1a',
  parent        : 'game-container',
  scene         : TetrisScene,
  antialias     : true,
  roundPixels   : false,
};

const game = new Phaser.Game(config);

// ── Panel de fluidos: conectar botones al juego ─────────────────
(function initFluidPanel() {
  const buttons = document.querySelectorAll('.fluid-btn');

  // Elementos del display activo
  const activeIcon  = document.getElementById('fluid-active-icon');
  const activeName  = document.getElementById('fluid-active-name');
  const activeSpeed = document.getElementById('fluid-active-speed');
  const viscFill    = document.getElementById('fluid-viscosity-fill');

  // Gradientes del medidor de viscosidad por fluido
  const viscGradients = {
    honey    : 'linear-gradient(90deg, #b8860b, #ffd700)',
    oil      : 'linear-gradient(90deg, #3a2e0a, #7a6520)',
    water    : 'linear-gradient(90deg, #1565c0, #42a5f5)',
    gasoline : 'linear-gradient(90deg, #e65100, #ff8f00)',
    alcohol  : 'linear-gradient(90deg, #00796b, #00e5cc)',
    mercury  : 'linear-gradient(90deg, #6a1b9a, #ce93d8)',
  };

  // Función auxiliar para aplicar al motor de juego
  function pushSpeedToGame() {
    const scene = game.scene.getScene('TetrisScene');
    if (scene && scene.gameState) {
      scene.gameState.gravity.speed = getEffectiveSpeed();
    }
  }

  function applyFluid(fluidKey) {
    const cfg = FLUID_CONFIGS[fluidKey];
    if (!cfg) return;

    currentWorldKey = fluidKey;
    currentFluidSpeed = cfg.speed;
    beginWorldVisualTransition(fluidKey);
    pushSpeedToGame();

    const glow = WORLD_PAGE_GLOWS[fluidKey];
    if (glow) {
      document.documentElement.style.setProperty('--world-glow-strong', glow.strong);
      document.documentElement.style.setProperty('--world-glow-soft', glow.soft);
    }

    // Clases activas
    buttons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById('btn-' + fluidKey);
    if (activeBtn) activeBtn.classList.add('active');

    // Display inferior
    if (activeIcon)  activeIcon.textContent  = cfg.icon;
    if (activeName)  activeName.textContent  = cfg.name;
    if (activeSpeed) activeSpeed.textContent = cfg.speedLabel;
    if (viscFill) {
      viscFill.style.width      = cfg.viscosity + '%';
      viscFill.style.background = viscGradients[fluidKey] || '#555';
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => applyFluid(btn.getAttribute('data-fluid')));
  });

  // Exponer para que el panel de materiales también pueda llamar a pushSpeedToGame
  window._tetrisPushSpeed = pushSpeedToGame;
  window._tetrisApplyFluid = applyFluid;
  applyFluid(currentWorldKey);
})();

// ── Sección de mundos: elegir el fluido del escenario ───────────
(function initWorldsSection() {
  const worldTitle = document.getElementById('world-title');
  const worldCards = document.querySelectorAll('.world-card');
  const worldActiveIcon = document.getElementById('world-active-icon');
  const worldActiveName = document.getElementById('world-active-name');
  const worldActiveSpeed = document.getElementById('world-active-speed');

  function enterWorld(worldKey) {
    const cfg = FLUID_CONFIGS[worldKey];
    if (!cfg || !WORLD_KEYS.includes(worldKey)) return;

    if (window._tetrisApplyFluid) window._tetrisApplyFluid(worldKey);

    worldCards.forEach(card => card.classList.remove('active'));
    const activeCard = document.querySelector(`.world-card[data-world="${worldKey}"]`);
    if (activeCard) {
      activeCard.classList.add('active');
      // Animación de pulso al seleccionar
      activeCard.classList.add('world-just-selected');
      setTimeout(() => activeCard.classList.remove('world-just-selected'), 460);
    }
    if (worldTitle) worldTitle.textContent = `Mundo de ${cfg.name}`;

    // Actualizar world-active-display
    if (worldActiveIcon) worldActiveIcon.textContent = cfg.icon;
    if (worldActiveName) worldActiveName.textContent = cfg.name;
    if (worldActiveSpeed) worldActiveSpeed.textContent = cfg.speedLabel;
  }

  worldCards.forEach(card => {
    card.addEventListener('click', () => enterWorld(card.getAttribute('data-world')));
  });

  enterWorld(currentWorldKey);
})();

// ── Panel de materiales: conectar botones al juego ──────────────
(function initMaterialPanel() {
  const matButtons = document.querySelectorAll('.mat-btn');

  const matIconEl   = document.getElementById('mat-active-icon');
  const matNameEl   = document.getElementById('mat-active-name');
  const matLabelEl  = document.getElementById('mat-active-label');
  const matSpeedEl  = document.getElementById('mat-combined-speed');
  const matFill     = document.getElementById('mat-density-fill');

  function updateCombinedDisplay() {
    const eff = getEffectiveSpeed();
    if (matSpeedEl) matSpeedEl.textContent = '×' + eff.toFixed(2) + ' vel. combinada';
  }

  function applyMaterial(matKey) {
    const cfg = MATERIAL_CONFIGS[matKey];
    if (!cfg) return;

    currentMaterialKey = matKey;
    currentMaterialDensity = cfg.density;
    beginMaterialVisualTransition(matKey);

    // Aplicar al juego
    if (window._tetrisPushSpeed) window._tetrisPushSpeed();

    // Clases activas
    matButtons.forEach(b => b.classList.remove('active', 'is-changing'));
    const activeBtn = document.getElementById('mat-' + matKey);
    if (activeBtn) {
      activeBtn.classList.add('active', 'is-changing');
      window.setTimeout(() => activeBtn.classList.remove('is-changing'), 520);

      // Pop del emoji
      const iconEl = activeBtn.querySelector('.mat-icon');
      if (iconEl) {
        iconEl.style.animation = 'none';
        void iconEl.offsetWidth; // force reflow
        iconEl.style.animation = 'matPop 0.35s cubic-bezier(0.34,1.56,0.64,1)';
      }

      // Re-trigger ring animation
      const ringEl = activeBtn.querySelector('.mat-select-ring');
      if (ringEl) {
        ringEl.style.animation = 'none';
        void ringEl.offsetWidth;
        ringEl.style.animation = 'ringExpand 0.42s cubic-bezier(0.34,1.3,0.64,1) forwards';
      }
    }

    // Display
    if (matIconEl) {
      matIconEl.textContent = cfg.icon;
      matIconEl.style.animation = 'none';
      void matIconEl.offsetWidth;
      matIconEl.style.animation = 'matPop 0.35s cubic-bezier(0.34,1.56,0.64,1)';
    }
    if (matNameEl)  matNameEl.textContent  = cfg.name;
    if (matLabelEl) matLabelEl.textContent = cfg.label;
    if (matFill) {
      const pct = Math.round((cfg.density / 4.0) * 100);
      matFill.style.width      = pct + '%';
      matFill.style.background = `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`;
    }
    updateCombinedDisplay();
  }

  matButtons.forEach(btn => {
    btn.addEventListener('click', () => applyMaterial(btn.getAttribute('data-mat')));
  });

  // Inicializar con plástico (densidad ~1.0, neutro)
  applyMaterial('plastic');
})();

// ── Tooltip educativo de densidad (materiales) ───────────────────
(function initDensityTooltip() {
  const tooltip    = document.getElementById('density-tooltip');
  if (!tooltip) return;

  const dtIcon     = document.getElementById('dt-icon');
  const dtName     = document.getElementById('dt-name');
  const dtBadge    = document.getElementById('dt-density-badge');
  const dtDensity  = document.getElementById('dt-density');
  const dtCompare  = document.getElementById('dt-compare');
  const dtBar      = document.getElementById('dt-density-bar');
  const dtFact     = document.getElementById('dt-fact');
  const dtCounter  = document.getElementById('dt-fact-counter');
  const dtPrev     = document.getElementById('dt-prev');
  const dtNext     = document.getElementById('dt-next');
  const dtInterList = document.getElementById('dt-interaction-list');

  let currentTarget = null;
  let hideTimer     = null;
  let currentFacts  = [];
  let factIndex     = 0;

  function renderFact() {
    if (!currentFacts.length) return;
    dtFact.textContent = '💡 ' + currentFacts[factIndex];
    dtCounter.textContent = (factIndex + 1) + '/' + currentFacts.length;
  }

  dtPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    factIndex = (factIndex - 1 + currentFacts.length) % currentFacts.length;
    renderFact();
  });

  dtNext.addEventListener('click', (e) => {
    e.stopPropagation();
    factIndex = (factIndex + 1) % currentFacts.length;
    renderFact();
  });

  function showTooltip(btn, matKey) {
    const cfg = MATERIAL_CONFIGS[matKey];
    if (!cfg) return;
    if (currentTarget === btn) { clearTimeout(hideTimer); return; }
    currentTarget = btn;
    clearTimeout(hideTimer);

    // Rellenar datos
    dtIcon.textContent       = cfg.icon;
    dtName.textContent       = cfg.name;
    dtBadge.textContent      = cfg.badge || '';
    dtBadge.style.background = cfg.glow;
    dtDensity.textContent    = cfg.realDensity;
    dtCompare.textContent    = cfg.compare;
    dtBar.style.width        = cfg.barPct + '%';
    dtBar.style.background   = cfg.tooltipBar;
    tooltip.style.setProperty('--tooltip-glow', cfg.tooltipGlow);
    tooltip.style.setProperty('--tooltip-bar',  cfg.tooltipBar);

    // Carrusel de datos
    currentFacts = cfg.facts || [cfg.fact || ''];
    factIndex = 0;
    renderFact();

    // Tabla de interacciones
    dtInterList.innerHTML = '';
    if (cfg.interactions) {
      cfg.interactions.forEach(inter => {
        const row = document.createElement('div');
        row.className = 'dt-interact-row';
        row.innerHTML = `<span class="dt-interact-icon">${inter.icon}</span><span class="dt-interact-label">${inter.label}</span><span class="dt-interact-result ${inter.cls}">${inter.result}</span>`;
        dtInterList.appendChild(row);
      });
    }

    // Posición: hacia el panel de materiales, sin invadir el tablero.
    const rect = btn.getBoundingClientRect();
    const tW   = 264;
    const vw = window.innerWidth;
    let left = Math.min(vw - tW - 8, rect.right + 14);
    if (left < rect.left) left = Math.max(rect.left, vw - tW - 8);
    let top  = rect.top  + window.scrollY;

    const vh = window.innerHeight;
    if (top + 380 > vh + window.scrollY) top = Math.max(8, vh + window.scrollY - 390);

    tooltip.style.left = left + 'px';
    tooltip.style.top  = top  + 'px';
    tooltip.classList.add('visible');
  }

  function hideTooltip() {
    hideTimer = setTimeout(() => {
      tooltip.classList.remove('visible');
      currentTarget = null;
    }, 180);
  }

  // Añadir listeners a cada mat-btn
  document.querySelectorAll('.mat-btn').forEach(btn => {
    const matKey = btn.getAttribute('data-mat');

    btn.addEventListener('mouseenter', () => showTooltip(btn, matKey));
    btn.addEventListener('mouseleave', hideTooltip);
    btn.addEventListener('focus',      () => showTooltip(btn, matKey));
    btn.addEventListener('blur',       hideTooltip);
    btn.addEventListener('click', () => {
      showTooltip(btn, matKey);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => tooltip.classList.remove('visible'), 3200);
    });
  });

  tooltip.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  tooltip.addEventListener('mouseleave', hideTooltip);
})();

// ── Tooltip educativo de mundo (fluidos) ────────────────────────
(function initWorldTooltip() {
  const tooltip = document.getElementById('world-tooltip');
  if (!tooltip) return;

  const wtIcon     = document.getElementById('wt-icon');
  const wtName     = document.getElementById('wt-name');
  const wtBadge    = document.getElementById('wt-speed-badge');
  const wtViscosity = document.getElementById('wt-viscosity');
  const wtSpeed    = document.getElementById('wt-speed');
  const wtFact     = document.getElementById('wt-fact');
  const wtMatList  = document.getElementById('wt-mat-list');

  // Datos educativos de cada fluido
  const FLUID_EDUCATION = {
    honey:    { viscLabel: 'Muy alta', fact: '🍯 La miel es 10.000 veces más viscosa que el agua. Las abejas la producen a partir del néctar de flores y tarda hasta 3 semanas en madurar.' },
    oil:      { viscLabel: 'Alta', fact: '🛢️ El aceite mineral tiene una viscosidad 50-100 veces mayor que el agua. Se usa como lubricante porque forma una película protectora entre superficies metálicas.' },
    water:    { viscLabel: 'Normal', fact: '💧 El agua es el líquido de referencia para medir densidad y viscosidad. A 4°C alcanza su máxima densidad: exactamente 1000 kg/m³.' },
    gasoline: { viscLabel: 'Baja', fact: '⛽ La gasolina es menos densa que el agua (720 kg/m³), por eso flota sobre ella. Un litro de gasolina pesa solo 720 gramos.' },
    alcohol:  { viscLabel: 'Muy baja', fact: '🥃 El alcohol etílico tiene una densidad de 789 kg/m³. Es miscible con agua en cualquier proporción, pero su menor densidad hace que las mezclas sean más ligeras.' },
    mercury:  { viscLabel: 'Extrema', fact: '🪨 El mercurio es el único metal líquido a temperatura ambiente. Con 13.534 kg/m³, ¡una bola de hierro flota en él como si fuera corcho!' },
  };

  let hideTimer = null;

  function showWorldTooltip(btn, worldKey) {
    const cfg = FLUID_CONFIGS[worldKey];
    const edu = FLUID_EDUCATION[worldKey];
    if (!cfg || !edu) return;
    clearTimeout(hideTimer);

    wtIcon.textContent    = cfg.icon;
    wtName.textContent    = cfg.name;
    wtBadge.textContent   = cfg.speedLabel;
    wtViscosity.textContent = edu.viscLabel;
    wtSpeed.textContent   = cfg.speedLabel;
    wtFact.textContent    = edu.fact;

    // Efecto sobre cada material
    wtMatList.innerHTML = '';
    Object.entries(MATERIAL_CONFIGS).forEach(([key, mat]) => {
      const speed = '×' + (cfg.speed * mat.density).toFixed(2) + ' vel.';
      const div = document.createElement('div');
      div.className = 'wt-mat-row';
      div.innerHTML = `<span class="wt-mat-icon">${mat.icon}</span><span class="wt-mat-name">${mat.name}</span><span class="wt-mat-speed">${speed}</span>`;
      wtMatList.appendChild(div);
    });

    // Posición: dentro de la columna de mundos, para no tapar el tablero.
    const rect = btn.getBoundingClientRect();
    let left = Math.max(8, rect.left);
    let top  = rect.bottom + window.scrollY + 8;
    const vh = window.innerHeight;
    if (top + 420 > vh + window.scrollY) top = Math.max(8, vh + window.scrollY - 430);
    tooltip.style.left = left + 'px';
    tooltip.style.top  = top  + 'px';
    tooltip.classList.add('visible');
  }

  function hideTooltip() {
    hideTimer = setTimeout(() => tooltip.classList.remove('visible'), 200);
  }

  document.querySelectorAll('.world-card').forEach(btn => {
    const worldKey = btn.getAttribute('data-world');
    btn.addEventListener('mouseenter', () => showWorldTooltip(btn, worldKey));
    btn.addEventListener('mouseleave', hideTooltip);
    btn.addEventListener('click', () => {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => tooltip.classList.remove('visible'), 2500);
    });
  });

  tooltip.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  tooltip.addEventListener('mouseleave', hideTooltip);
})();
