// ===== FRASES DE FIM DE CAPÍTULO (Expansível por capítulo) =====
const FRASES_FIM_CAPITULO = {
    1: [
        "Ainda não é hora de lembrar.",
        "Volte para o vazio, aqui não há dor.",
        "Você não pertence à verdade.",
        "O esquecimento é seu abrigo.",
        "Não desperte o que está adormecido.",
        "O vazio é mais seguro do que a verdade.",
        "Por que insistir em lembrar?"
    ],
    2: [
        // Exemplo: frases do capítulo 2 (andares 11–20)
        "O silêncio ecoa ainda mais profundo...",
        "O tempo parece se curvar neste lugar.",
        "Você sente olhos invisíveis te observando.",
        "Aqui, as memórias se desfazem como poeira."
    ],
    // Acrescente capítulos conforme desejar...
};
window.FRASES_FIM_CAPITULO = FRASES_FIM_CAPITULO;

// ===== Tipos e dados do Jogo =====
const ROOM_TYPES = {
    EMPTY: 'vazia',
    WATER: 'com fonte de água',
    TRAP: 'com armadilha',
    MONSTER: 'com monstro',
    BOSS: 'boss'
};

const ENEMIES = [
    // ======== Monstros comuns (ajustados) ========
    { name: "Rato Gigante", hp: 18, maxHp: 18, forca: 5, defesa: 1, precisao: 68, agilidade: 10 },
    { name: "Slime Sombrio", hp: 22, maxHp: 22, forca: 4, defesa: 2, precisao: 62, agilidade: 8 },
    { name: "Aranha Cinzenta", hp: 20, maxHp: 20, forca: 6, defesa: 2, precisao: 70, agilidade: 10 },
    { name: "Slime Luminoso", hp: 20, maxHp: 20, forca: 5, defesa: 2, precisao: 67, agilidade: 10 },
    { name: "Morcego das Sombras", hp: 14, maxHp: 14, forca: 4, defesa: 1, precisao: 74, agilidade: 14 },

    // ===== Mini-bosses/chefes (ordem e status reescalonados) =====
    { name: "Rato-Rei",           hp: 40,  maxHp: 40,  forca: 8,  defesa: 2,  precisao: 70, agilidade: 10 },
    { name: "Gosma Reluzente",    hp: 55,  maxHp: 55,  forca: 10, defesa: 4,  precisao: 72, agilidade: 10 },
    { name: "Aranha Rainha",      hp: 62,  maxHp: 62,  forca: 11, defesa: 5,  precisao: 74, agilidade: 12 },
    { name: "Morcego Alfa",       hp: 56,  maxHp: 56,  forca: 11, defesa: 5,  precisao: 75, agilidade: 14 },
    { name: "Horda de Ratos",     hp: 65,  maxHp: 65,  forca: 12, defesa: 6,  precisao: 77, agilidade: 13 },
    { name: "Slime Gigante",      hp: 75,  maxHp: 75,  forca: 13, defesa: 7,  precisao: 78, agilidade: 11 },
    { name: "Slime Abissal",      hp: 85,  maxHp: 85,  forca: 14, defesa: 8,  precisao: 80, agilidade: 12 },
    { name: "Morcego Vampiro",    hp: 90,  maxHp: 90,  forca: 15, defesa: 8,  precisao: 82, agilidade: 18 },
    { name: "Aracnídeo Sombrio",  hp: 100, maxHp: 100, forca: 16, defesa: 9,  precisao: 84, agilidade: 15 },
    { name: "Coruja Anciã",       hp: 110, maxHp: 110, forca: 17, defesa: 10, precisao: 88, agilidade: 18 }
];

// ===== Pool de inimigos por andar =====
const ENEMY_POOLS = {
    1: [
        { enemy: "Rato Gigante", chance: 60 },
        { enemy: "Slime Sombrio", chance: 40 }
    ],
    2: [
        { enemy: "Rato Gigante", chance: 40 },
        { enemy: "Slime Sombrio", chance: 35 },
        { enemy: "Aranha Cinzenta", chance: 25 }
    ],
    3: [
        { enemy: "Slime Luminoso", chance: 40 },
        { enemy: "Aranha Cinzenta", chance: 30 },
        { enemy: "Slime Sombrio", chance: 30 }
    ],
    4: [
        { enemy: "Slime Luminoso", chance: 40 },
        { enemy: "Aranha Cinzenta", chance: 40 },
        { enemy: "Slime Sombrio", chance: 20 }
    ],
    5: [
        { enemy: "Aranha Cinzenta", chance: 40 },
        { enemy: "Slime Luminoso", chance: 40 },
        { enemy: "Morcego das Sombras", chance: 20 }
    ],
    6: [
        { enemy: "Aranha Cinzenta", chance: 40 },
        { enemy: "Slime Luminoso", chance: 40 },
        { enemy: "Morcego das Sombras", chance: 20 }
    ],
    7: [
        { enemy: "Aranha Cinzenta", chance: 40 },
        { enemy: "Slime Luminoso", chance: 40 },
        { enemy: "Morcego das Sombras", chance: 20 }
    ],
    8: [
        { enemy: "Morcego das Sombras", chance: 40 },
        { enemy: "Aranha Cinzenta", chance: 30 },
        { enemy: "Slime Luminoso", chance: 30 }
    ],
    9: [
        { enemy: "Morcego das Sombras", chance: 40 },
        { enemy: "Aranha Cinzenta", chance: 30 },
        { enemy: "Slime Luminoso", chance: 30 }
    ],
    10: [
        { enemy: "Morcego das Sombras", chance: 40 },
        { enemy: "Aranha Cinzenta", chance: 30 },
        { enemy: "Slime Luminoso", chance: 30 }
    ]
};

const MINI_BOSSES_BY_FLOOR = {
    1: "Rato-Rei",
    2: "Gosma Reluzente",
    3: "Aranha Rainha",
    4: "Morcego Alfa",
    5: "Horda de Ratos",
    6: "Slime Gigante",
    7: "Slime Abissal",
    8: "Morcego Vampiro",
    9: "Aracnídeo Sombrio",
    10: "Coruja Anciã"
};

// ===== Mensagens Especiais por Andar (salas vazias) =====
const memories = {
    1: "O silêncio é esmagador, mas não incomoda… por quê?",
    2: "Você sente que deveria lembrar de algo, mas não consegue.",
    3: "Tudo aqui parece artificial, como um sonho esquecido.",
    4: "Há uma ausência reconfortante no vazio, como se algo ruim estivesse longe demais para te alcançar.",
    5: "Memórias borradas deslizam por entre seus dedos.",
    6: "Nada é real, exceto o vazio à sua volta.",
    7: "Você não sente medo, mas não sabe se isso é bom ou ruim.",
    8: "Os corredores mudam de lugar, como se não quisessem ser encontrados.",
    9: "Você busca uma saída, mas não se lembra do que deixou para trás.",
    10: "Imagens desfocadas de um volante, uma voz familiar… tudo some antes que você alcance."
};

// ===== Elementos DOM =====
const DOM_ELEMENTS = {
    status: document.getElementById('status'),
    options: document.getElementById('options'),
    fullHistory: document.getElementById('fullHistory'),
    gameContainer: document.querySelector('.game-container'),
    menuInicial: document.getElementById('menuInicial'),
    btnIniciarJogo: document.getElementById('btnIniciarJogo'),
    btnTitulos: document.getElementById('btnTitulos'),
    btnConquistas: document.getElementById('btnConquistas'),
    btnLore: document.getElementById('btnLore'),
    painelTitulos: document.getElementById('painelTitulos'),
    painelConquistas: document.getElementById('painelConquistas'),
    painelLore: document.getElementById('painelLore'),
    btnsVoltarMenu: document.getElementsByClassName('btn-voltar-menu')
};

// ===== Estado inicial centralizado =====
const INITIAL_GAME_STATE = {
    name: 'Você',
    currentFloor: 1,
    roomsExploredOnFloor: 0,
    roomsToNextFloor: getRandomRoomsToNextFloor(),
    bossPending: false,
    bossEncounterCounter: 0,
    bossRespawnThreshold: null,
    day: 1,
    xp: 0,
    nextLevel: 100,
    level: 1,
    hp: 50,
    maxHp: 50,
    mp: 30,
    maxMp: 30,
    stamina: 80,
    maxStamina: 80,
    sanity: 50,
    maxSanity: 50,
    forca: 8,
    defesa: 4,
    precisao: 85,
    agilidade: 15,
    currentRoom: ROOM_TYPES.EMPTY,
    currentEnemy: null,
    gameOver: false,
    inCombat: false,
    skipStaminaCost: false,
    skipSanityCost: false,
    messageHistory: [],
    isGainingDayPoints: true,
    visitedRooms: [],
    monstersDefeated: 0,
    descansouNaSala: false,
    meditouNaSala: false,
};

// ===== Estado principal do jogo (mutável) =====
const gameState = { ...INITIAL_GAME_STATE };

// ===== Utilitário: Quantas salas para o próximo andar =====
function getRandomRoomsToNextFloor() {
    return Math.floor(Math.random() * (45 - 30 + 1)) + 30;
}

// ======= Fluxo de inicialização refatorado =======

function initGame() {
    esconderTodosMenus();
    mostrarJogo();
    resetGameState();
    limparHistoricoMensagens();
    mensagemInicioJogo();
    updateStatus();
    presentOptions();
}

function mostrarJogo() {
    if (DOM_ELEMENTS.gameContainer) {
        DOM_ELEMENTS.gameContainer.style.display = "";
    }
}

function resetGameState() {
    // Usa JSON para garantir que não compartilha referência de arrays/objetos internos
    Object.assign(gameState, JSON.parse(JSON.stringify(INITIAL_GAME_STATE)), {
        roomsToNextFloor: getRandomRoomsToNextFloor()
    });
}

function limparHistoricoMensagens() {
    DOM_ELEMENTS.fullHistory.innerHTML = '';
}

function mensagemInicioJogo() {
    addMessage('Você acorda no início da torre, uma sala vazia e silenciosa...');
}

// ======== MENU: Exibir/Esconder ========
function esconderTodosMenus() {
    if (DOM_ELEMENTS.menuInicial) DOM_ELEMENTS.menuInicial.style.display = "none";
    if (DOM_ELEMENTS.painelTitulos) DOM_ELEMENTS.painelTitulos.style.display = "none";
    if (DOM_ELEMENTS.painelConquistas) DOM_ELEMENTS.painelConquistas.style.display = "none";
    if (DOM_ELEMENTS.painelLore) DOM_ELEMENTS.painelLore.style.display = "none";
}

function mostrarMenuPrincipal() {
    esconderTodosMenus();
    if (DOM_ELEMENTS.menuInicial) DOM_ELEMENTS.menuInicial.style.display = "";
    if (DOM_ELEMENTS.gameContainer) DOM_ELEMENTS.gameContainer.style.display = "none";
}

function mostrarPainel(painel) {
    esconderTodosMenus();
    if (painel) painel.style.display = "";
}

// ===== Modularização dos eventos dos botões do menu =====
function configurarBotaoIniciarJogo() {
    if (DOM_ELEMENTS.btnIniciarJogo) {
        DOM_ELEMENTS.btnIniciarJogo.onclick = function() {
            initGame();
        };
    }
}
function configurarBotaoTitulos() {
    if (DOM_ELEMENTS.btnTitulos) {
        DOM_ELEMENTS.btnTitulos.onclick = function() {
            mostrarPainel(DOM_ELEMENTS.painelTitulos);
        };
    }
}
function configurarBotaoConquistas() {
    if (DOM_ELEMENTS.btnConquistas) {
        DOM_ELEMENTS.btnConquistas.onclick = function() {
            mostrarPainel(DOM_ELEMENTS.painelConquistas);
        };
    }
}
function configurarBotaoLore() {
    if (DOM_ELEMENTS.btnLore) {
        DOM_ELEMENTS.btnLore.onclick = function() {
            mostrarPainel(DOM_ELEMENTS.painelLore);
        };
    }
}
function configurarBotoesVoltarMenu() {
    if (DOM_ELEMENTS.btnsVoltarMenu) {
        Array.from(DOM_ELEMENTS.btnsVoltarMenu).forEach(function(btn) {
            btn.onclick = function() {
                mostrarMenuPrincipal();
            };
        });
    }
}
function configurarBotoesMenus() {
    configurarBotaoIniciarJogo();
    configurarBotaoTitulos();
    configurarBotaoConquistas();
    configurarBotaoLore();
    configurarBotoesVoltarMenu();
}

// ===== Evento de carregamento e controle do menu =====
window.addEventListener('DOMContentLoaded', function() {
    mostrarMenuPrincipal();
    configurarBotoesMenus();
});
// === BLOQUEIO DE ORIENTAÇÃO MOBILE ===
(function() {
    // Só em telas pequenas (mobile/tablet)
    function isMobilePortraitNeeded() {
        return window.matchMedia("(max-width: 800px)").matches;
    }
    const modal = document.getElementById('orientationLockModal');
    function checkOrientation() {
        // 'window.orientation' é depreciado, use width/height e screen.orientation
        let landscape;
        if (window.screen && window.screen.orientation) {
            landscape = window.screen.orientation.type.startsWith("landscape");
        } else {
            landscape = window.innerWidth > window.innerHeight;
        }
        if (isMobilePortraitNeeded() && landscape) {
            modal.classList.add("visible");
            modal.style.display = "flex";
            // Evita scrollar, clicar, etc
            document.body.style.overflow = "hidden";
        } else {
            modal.classList.remove("visible");
            modal.style.display = "none";
            document.body.style.overflow = "";
        }
    }
    // Escuta mudança de rotação/tamanho
    window.addEventListener("orientationchange", checkOrientation, { passive: true });
    window.addEventListener("resize", checkOrientation, { passive: true });
    document.addEventListener("DOMContentLoaded", checkOrientation, { passive: true });
    // Rodar na inicialização também
    setTimeout(checkOrientation, 100);
})();
