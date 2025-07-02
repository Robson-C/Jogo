/* =====================[ title.js — Sistema de Títulos/Jogador ]===================== */

/**
 * Dicionário central de títulos do jogo.
 * Adicione novos títulos facilmente neste objeto.
 * Cada requisito é uma função que recebe o gameState.
 */
const TITLES_INFO = {
    explorador: {
        nome: "Explorador",
        descricao: "Explorou 100 vezes.",
        beneficio: "Explorar custa 5 de stamina a menos.",
        icone: "🧭",
        requisito: (gameState) => (gameState.totalExploracoes || 0) >= 10
    },
    matador: {
        nome: "Matador",
        descricao: "Derrotou 50 inimigos.",
        beneficio: "+50% atk e def contra chefes.",
        icone: "⚔️",
        requisito: (gameState) => (gameState.monstersDefeated || 0) >= 50
    },
    louco: {
        nome: "Louco",
        descricao: "Morreu 5 vezes por loucura.",
        beneficio: "+30 sanidade inicial.",
        icone: "🌀",
        requisito: (gameState) => (gameState.deathsByMadness || 0) >= 5
    },
    pesLigeiros: {
        nome: "Pés Ligeiros",
        descricao: "Esquivou 50 vezes.",
        beneficio: "+10 agilidade.",
        icone: "👟",
        requisito: (gameState) => (gameState.totalEsquivas || 0) >= 50
    },
    resistente: {
        nome: "Resistente",
        descricao: "Morreu 5 vezes por HP zerado.",
        beneficio: "+30 HP inicial.",
        icone: "🛡️",
        requisito: (gameState) => (gameState.deathsByHp || 0) >= 5
    },
    maniac: {
        nome: "Maníaco do Combate",
        descricao: "Não fugiu de 5 combates seguidos.",
        beneficio: "Atacar não gasta stamina.",
        icone: "💥",
        requisito: (gameState) => (gameState.combatesSemFugirSeguidos || 0) >= 5
    },
    oculosSol: {
        nome: "Óculos de Sol",
        descricao: "Foi ofuscado 10 vezes.",
        beneficio: "Imune a ofuscamento.",
        icone: "🕶️",
        requisito: (gameState) => (gameState.ofuscamentosSofridos || 0) >= 10
    },
    imuneVeneno: {
        nome: "Imune",
        descricao: "Foi envenenado 10 vezes.",
        beneficio: "Imune a veneno.",
        icone: "🧪",
        requisito: (gameState) => (gameState.venenamentosSofridos || 0) >= 10
    }
    // Adicione mais títulos conforme desejar...
};

/**
 * Checa e desbloqueia novos títulos conforme progresso do jogador.
 * Deve ser chamada após eventos relevantes (exploração, combate, etc).
 */
function checarTitulos(gameState) {
    if (!gameState) return;
    if (!Array.isArray(gameState.titulosDesbloqueados)) gameState.titulosDesbloqueados = [];
    Object.keys(TITLES_INFO).forEach(tid => {
        if (!gameState.titulosDesbloqueados.includes(tid) && TITLES_INFO[tid].requisito(gameState)) {
            gameState.titulosDesbloqueados.push(tid);
            if (typeof addMessage === "function") {
                addMessage(`Título conquistado: ${TITLES_INFO[tid].nome}!`, true, true, "levelup");
            }
        }
    });
}

/* =====================[ FUNÇÃO DE RENDERIZAÇÃO DO PAINEL DE TÍTULOS ]===================== */

function renderPainelTitulos(gameState) {
    if (!gameState || typeof gameState !== "object") {
        gameState = { titulosDesbloqueados: [] };
    }
    if (!gameState.titulosDesbloqueados) gameState.titulosDesbloqueados = [];
    const painel = document.querySelector("#painelTitulos .painel-conteudo");
    if (!painel) return;

    const unlocked = gameState.titulosDesbloqueados;
    const titulosArr = Object.entries(TITLES_INFO);

    let html = '<div class="titulos-grid">';
    titulosArr.forEach(([tid, info], idx) => {
        const desbloqueado = unlocked.includes(tid);
        html += `
            <div class="titulo-card${desbloqueado ? ' unlocked' : ' locked'}"
                data-titulo="${tid}"
                tabindex="0"
                aria-label="${info.nome}: ${info.descricao}. Benefício: ${info.beneficio}"
            >
                <div class="titulo-icone">${info.icone}</div>
            </div>
        `;
        if ((idx + 1) % 4 === 0) html += '<div class="grid-break"></div>';
    });
    html += '</div>';
    painel.innerHTML = html;

    // Tooltips estilo buff
    initTituloTooltipHandlers();
}
/* =====================[ FIM DO TRECHO ]===================== */
/* =====================[ FUNÇÃO DE TOOLTIP DOS TÍTULOS ]===================== */

function initTituloTooltipHandlers() {
    document.querySelectorAll('.titulo-tooltip').forEach(tip => tip.remove());

    document.querySelectorAll('.titulo-card').forEach(el => {
        const tid = el.getAttribute('data-titulo');
        const info = TITLES_INFO[tid];
        if (!info) return;
        const desbloqueado = (window.gameState && window.gameState.titulosDesbloqueados) ? window.gameState.titulosDesbloqueados.includes(tid) : false;
        function buildTooltipHtml() {
            return `
                <div class="titulo-tooltip-inner">
                    <div class="titulo-tooltip-title">${info.nome}</div>
                    <div class="titulo-tooltip-desc">${info.descricao}</div>
                    <div class="titulo-tooltip-beneficio"><b>Benefício:</b> ${info.beneficio}</div>
                    ${!desbloqueado ? '<div class="titulo-tooltip-lock">Ainda não desbloqueado</div>' : ''}
                </div>
            `;
        }
        // Mouse hover (desktop)
        el.onmouseenter = e => {
            if (window.matchMedia("(hover: hover)").matches) {
                const tip = document.createElement('div');
                tip.className = 'titulo-tooltip';
                tip.innerHTML = buildTooltipHtml();
                document.body.appendChild(tip);
                const rect = el.getBoundingClientRect();
                tip.style.left = `${rect.left + window.scrollX}px`;
                tip.style.top = `${rect.bottom + window.scrollY + 6}px`;
            }
        };
        el.onmouseleave = () => {
            document.querySelectorAll('.titulo-tooltip').forEach(tip => tip.remove());
        };
        // Mobile/click
        el.onclick = e => {
            if (!window.matchMedia("(hover: hover)").matches) {
                document.querySelectorAll('.titulo-tooltip').forEach(tip => tip.remove());
                const tip = document.createElement('div');
                tip.className = 'titulo-tooltip';
                tip.innerHTML = buildTooltipHtml();
                document.body.appendChild(tip);
                const rect = el.getBoundingClientRect();
                tip.style.left = `${rect.left + window.scrollX}px`;
                tip.style.top = `${rect.bottom + window.scrollY + 8}px`;
                e.stopPropagation();
                const closeTip = () => {
                    tip.remove();
                    document.body.removeEventListener('click', closeTip, true);
                };
                setTimeout(() => {
                    document.body.addEventListener('click', closeTip, true);
                }, 20);
            }
        };
        // Acessibilidade
        el.onfocus = e => {
            document.querySelectorAll('.titulo-tooltip').forEach(tip => tip.remove());
            const tip = document.createElement('div');
            tip.className = 'titulo-tooltip';
            tip.innerHTML = buildTooltipHtml();
            document.body.appendChild(tip);
            const rect = el.getBoundingClientRect();
            tip.style.left = `${rect.left + window.scrollX}px`;
            tip.style.top = `${rect.bottom + window.scrollY + 8}px`;
            e.stopPropagation();
            const closeTip = () => {
                tip.remove();
                el.removeEventListener('blur', closeTip, true);
            };
            setTimeout(() => {
                el.addEventListener('blur', closeTip, true);
            }, 20);
        };
    });
}

/* =====================[ FIM DO TRECHO ]===================== */