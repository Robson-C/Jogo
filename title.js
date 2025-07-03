/* =====================[ title.js — Sistema de Títulos/Jogador, Revisão 2024-07-03 ]===================== */

/* =====================[ TRECHO 1: DICIONÁRIO CENTRAL DE TÍTULOS ]===================== */

const TITLES_INFO = {
    explorador: {
        nome: "Explorador",
        descricao: "Explorou 100 vezes.",
        beneficio: "Explorar custa 5 de stamina a menos.",
        icone: "🧭",
        requisito: (profile) => (profile.totalExploracoes || 0) >= 3
    },
    matador: {
        nome: "Matador",
        descricao: "Derrotou 50 inimigos.",
        beneficio: "+50% atk e def contra chefes.",
        icone: "⚔️",
        requisito: (profile) => (profile.monstersDefeated || 0) >= 50
    },
    louco: {
        nome: "Louco",
        descricao: "Morreu 5 vezes por loucura.",
        beneficio: "+30 sanidade inicial.",
        icone: "🌀",
        requisito: (profile) => (profile.deathsByMadness || 0) >= 5
    },
    pesLigeiros: {
        nome: "Pés Ligeiros",
        descricao: "Esquivou 50 vezes.",
        beneficio: "+10 agilidade.",
        icone: "👟",
        requisito: (profile) => (profile.totalEsquivas || 0) >= 50
    },
    resistente: {
        nome: "Resistente",
        descricao: "Morreu 5 vezes por HP zerado.",
        beneficio: "+30 HP inicial.",
        icone: "🛡️",
        requisito: (profile) => (profile.deathsByHp || 0) >= 5
    },
    maniac: {
        nome: "Maníaco do Combate",
        descricao: "Não fugiu de 5 combates seguidos.",
        beneficio: "Atacar não gasta stamina.",
        icone: "💥",
        requisito: (profile) => (profile.combatesSemFugirSeguidos || 0) >= 5
    },
    oculosSol: {
        nome: "Óculos de Sol",
        descricao: "Foi ofuscado 10 vezes.",
        beneficio: "Imune a ofuscamento.",
        icone: "🕶️",
        requisito: (profile) => (profile.ofuscamentosSofridos || 0) >= 10
    },
    imuneVeneno: {
        nome: "Imune",
        descricao: "Foi envenenado 10 vezes.",
        beneficio: "Imune a veneno.",
        icone: "🧪",
        requisito: (profile) => (profile.venenamentosSofridos || 0) >= 10
    }
};

/* =====================[ TRECHO 2: UTILITÁRIOS DE TÍTULOS (Centralizados) ]===================== */

function getTitulosEquipados() {
    if (!window.playerProfile.titulosEquipados || !Array.isArray(window.playerProfile.titulosEquipados)) {
        window.playerProfile.titulosEquipados = [null, null, null];
    } else if (window.playerProfile.titulosEquipados.length !== 3) {
        while (window.playerProfile.titulosEquipados.length < 3) window.playerProfile.titulosEquipados.push(null);
        if (window.playerProfile.titulosEquipados.length > 3) window.playerProfile.titulosEquipados = window.playerProfile.titulosEquipados.slice(0, 3);
    }
    return window.playerProfile.titulosEquipados;
}

function isTituloEquipado(tid) {
    return getTitulosEquipados().includes(tid);
}

function podeEquiparTitulo(tid) {
    const profile = window.playerProfile;
    return profile.titulosDesbloqueados && profile.titulosDesbloqueados.includes(tid) && !isTituloEquipado(tid);
}

function equiparTitulo(tid) {
    const slots = getTitulosEquipados();
    const idxLivre = slots.indexOf(null);
    if (idxLivre !== -1) {
        slots[idxLivre] = tid;
        renderPainelTitulos();
    } else {
        mostrarAvisoTemporario("Todos os slots de título estão ocupados.");
    }
}

function removerTituloDoSlot(idx) {
    const slots = getTitulosEquipados();
    if (slots[idx]) {
        slots[idx] = null;
        renderPainelTitulos();
    }
}

function checarTitulos(profile) {
    if (!profile) return;
    if (!Array.isArray(profile.titulosDesbloqueados)) profile.titulosDesbloqueados = [];
    Object.keys(TITLES_INFO).forEach(tid => {
        if (!profile.titulosDesbloqueados.includes(tid) && TITLES_INFO[tid].requisito(profile)) {
            profile.titulosDesbloqueados.push(tid);
            if (typeof addMessage === "function") {
                addMessage(`Título conquistado: ${TITLES_INFO[tid].nome}!`, true, true, "levelup");
            }
        }
    });
}

/* =====================[ TRECHO 3: RENDERIZAÇÃO DO PAINEL DE TÍTULOS ]===================== */

function renderPainelTitulos() {
    const profile = window.playerProfile;
    if (!profile || typeof profile !== "object") return;
    if (!profile.titulosDesbloqueados) profile.titulosDesbloqueados = [];
    getTitulosEquipados();

    const painel = document.querySelector("#painelTitulos .painel-conteudo");
    if (!painel) return;

    const unlocked = profile.titulosDesbloqueados;
    const titulosArr = Object.entries(TITLES_INFO);
    const titulosEquipados = profile.titulosEquipados;

    // SLOTS visualmente clicáveis
    let slotsHtml = `<div class="titulo-equip-slots">`;
    for (let i = 0; i < 3; i++) {
        const tid = titulosEquipados[i];
        if (tid && TITLES_INFO[tid]) {
            slotsHtml += `
                <div class="titulo-equip-slot ocupado"
                    data-slot-idx="${i}"
                    tabindex="0"
                    aria-label="Título equipado: ${TITLES_INFO[tid].nome}. Clique para ver/remover"
                    title="Clique para ver/remover"
                >
                    <span class="titulo-icone">${TITLES_INFO[tid].icone}</span>
                </div>
            `;
        } else {
            slotsHtml += `
                <div class="titulo-equip-slot vazio"
                    data-slot-idx="${i}"
                    tabindex="0"
                    aria-label="Slot vazio de título"
                    title="Slot vazio"
                ></div>
            `;
        }
    }
    slotsHtml += `</div>`;

    // GRID de títulos
    let gridHtml = `<div class="titulos-painel-box"><div class="titulos-grid">`;
    titulosArr.forEach(([tid, info], idx) => {
        const desbloqueado = unlocked.includes(tid);
        const equipado = isTituloEquipado(tid);
        gridHtml += `
            <div class="titulo-card${desbloqueado ? ' unlocked' : ' locked'}${equipado ? ' equipado' : ''}"
                data-titulo="${tid}"
                tabindex="0"
                aria-label="${info.nome}: ${info.descricao}. Benefício: ${info.beneficio}${equipado ? ' (Equipado)' : ''}"
                ${equipado ? 'title="Equipado"' : ''}
            >
                <div class="titulo-icone">${info.icone}</div>
            </div>
        `;
    });
    gridHtml += `</div></div>`;

    painel.innerHTML = slotsHtml + gridHtml;

    // Handler para slots (remover)
    painel.querySelectorAll('.titulo-equip-slot.ocupado').forEach(slotEl => {
        slotEl.onclick = () => {
            const idx = Number(slotEl.getAttribute('data-slot-idx'));
            const tid = titulosEquipados[idx];
            if (tid) mostrarPainelInfoTitulo(tid, { slotIdx: idx });
        };
        slotEl.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                const idx = Number(slotEl.getAttribute('data-slot-idx'));
                const tid = titulosEquipados[idx];
                if (tid) mostrarPainelInfoTitulo(tid, { slotIdx: idx });
            }
        };
    });

    // Handler para títulos (info/equipar)
    painel.querySelectorAll('.titulo-card').forEach(cardEl => {
        const tid = cardEl.getAttribute('data-titulo');
        cardEl.onclick = () => mostrarPainelInfoTitulo(tid, { slotIdx: null });
        cardEl.onkeydown = (e) => {
            if ((e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar')) {
                e.preventDefault();
                mostrarPainelInfoTitulo(tid, { slotIdx: null });
            }
        };
    });
}

/* =====================[ TRECHO 4: PAINEL/MODAL DE INFO DE TÍTULO (AÇÃO) ]===================== */

function mostrarPainelInfoTitulo(tid, context = {}) {
    // Remove qualquer painel/modal anterior
    document.querySelectorAll('.painel-titulo-info').forEach(p => p.remove());

    const profile = window.playerProfile;
    const info = TITLES_INFO[tid];
    const desbloqueado = profile.titulosDesbloqueados && profile.titulosDesbloqueados.includes(tid);
    const equipado = isTituloEquipado(tid);
    const slotIdx = context.slotIdx; // se veio de um slot, índice do slot, senão null

    let html = `
        <div class="painel-titulo-info-inner">
            <div class="painel-titulo-info-icone">${info.icone}</div>
            <div class="painel-titulo-info-nome">${info.nome}${equipado ? ' <span style="color:#59dd70;">(Equipado)</span>' : ''}</div>
            <div class="painel-titulo-info-desc">${info.descricao}</div>
            <div class="painel-titulo-info-bonus"><b>Benefício:</b> ${info.beneficio}</div>
    `;

    if (!desbloqueado) {
        html += `<div class="painel-titulo-info-lock">Ainda não desbloqueado.</div>`;
    } else if (equipado && typeof slotIdx === "number") {
        html += `<button class="btn-remover-titulo" data-slot="${slotIdx}">Remover do Slot</button>`;
    } else if (desbloqueado && !equipado) {
        html += `<button class="btn-equipar-titulo" data-titulo="${tid}">Equipar</button>`;
    } else if (equipado) {
        html += `<div class="painel-titulo-info-ja-equipado">Já equipado em outro slot.</div>`;
    }

    html += `<button class="btn-fechar-titulo-info">Fechar</button></div>`;

    const modal = document.createElement('div');
    modal.className = 'painel-titulo-info';
    modal.setAttribute('role', 'dialog');
    modal.innerHTML = html;
    document.body.appendChild(modal);

    // Centro na tela (responsivo)
    setTimeout(() => {
        modal.focus && modal.focus();
    }, 30);

    // Handler: Equipar
    const btnEquipar = modal.querySelector('.btn-equipar-titulo');
    if (btnEquipar) {
        btnEquipar.onclick = () => {
            equiparTitulo(tid);
            modal.remove();
        };
    }

    // Handler: Remover
    const btnRemover = modal.querySelector('.btn-remover-titulo');
    if (btnRemover) {
        btnRemover.onclick = () => {
            removerTituloDoSlot(Number(btnRemover.getAttribute('data-slot')));
            modal.remove();
        };
    }

    // Handler: Fechar
    const btnFechar = modal.querySelector('.btn-fechar-titulo-info');
    if (btnFechar) {
        btnFechar.onclick = () => modal.remove();
    }
    modal.onclick = (e) => e.stopPropagation();
    setTimeout(() => {
        document.body.addEventListener('click', () => modal.remove(), { once: true });
    }, 50);
}

/* =====================[ TRECHO 5: AVISO TEMPORÁRIO ]===================== */

function mostrarAvisoTemporario(msg) {
    // Remove qualquer aviso anterior
    document.querySelectorAll('.painel-titulo-aviso').forEach(a => a.remove());
    const aviso = document.createElement('div');
    aviso.className = 'painel-titulo-aviso';
    aviso.innerHTML = `<div>${msg}</div>`;
    document.body.appendChild(aviso);
    setTimeout(() => { aviso.remove(); }, 2000);
}

/* =====================[ EXPORTS GLOBAIS PARA DEBUG/INTEGRAÇÃO ]===================== */
window.getTitulosEquipados = getTitulosEquipados;
window.isTituloEquipado = isTituloEquipado;
window.equiparTitulo = equiparTitulo;
window.removerTituloDoSlot = removerTituloDoSlot;
window.checarTitulos = checarTitulos;
window.renderPainelTitulos = renderPainelTitulos;
window.mostrarPainelInfoTitulo = mostrarPainelInfoTitulo;

/* =====================[ FIM DO ARQUIVO title.js ]===================== */
