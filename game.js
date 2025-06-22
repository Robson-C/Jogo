// Sistema de estado centralizado - Torre da Redenção
const gameState = {
    initialized: false,
    inCombat: false,
    gameEnded: false,
    historyLog: []
};

// Estado do jogador centralizado
export const player = {
    nome: '',
    nivel: 1,
    xp: 0,
    xpParaProximo: 100,
    maxHp: 50,
    hp: 50,
    maxMp: 30,
    mp: 30,
    maxEnergia: 80,
    energia: 80,
    maxSanidade: 50,
    sanidade: 50,
    ataque: 8,
    defesa: 4,
    precisao: 85,
    agilidade: 15,
    dia: 1,
    andar: 1,
    salasExploradas: 0,
    salasParaSubir: 30 + Math.floor(Math.random() * 21),
    pontos: 0,
    descansou: false,
    meditou: false
};

// Estado do inimigo centralizado
export let inimigo = null;

// Histórico unificado
export function addToHistory(message) {
    if (typeof message !== 'string' || message.trim() === '') return;
    
    gameState.historyLog.push(sanitizeInput(message));
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyDiv = document.getElementById('history-panel');
    if (historyDiv) {
        historyDiv.innerHTML = gameState.historyLog.join('<br>');
        historyDiv.scrollTop = historyDiv.scrollHeight;
    }
}

// Sanitização de entrada
function sanitizeInput(input) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = input;
    return tempDiv.innerHTML;
}

// Validação de nome
function validatePlayerName(name) {
    return typeof name === 'string' && name.trim().length > 0 && name.length <= 20;
}

// Inicialização do jogo
export function iniciarJogo() {
    try {
        removeAllEventListeners();
        
        const nome = prompt('Digite seu nome:');
        if (!validatePlayerName(nome)) {
            addToHistory('❌ Nome inválido. Tente novamente.');
            addInitEventListeners();
            return;
        }
        
        player.nome = sanitizeInput(nome.trim());
        gameState.initialized = true;
        gameState.gameEnded = false;
        gameState.historyLog = [];
        
        addToHistory(`🌟 Bem-vindo à Torre da Redenção, ${player.nome}!`);
        addToHistory(`🏗️ Você está no andar ${player.andar}. Explore para encontrar a saída!`);
        
        setupGameInterface();
        updateAllUI();
        
    } catch (error) {
        handleCriticalError(error);
    }
}

// Configurar interface do jogo
function setupGameInterface() {
    const exploreBtn = document.getElementById('explore-button');
    if (exploreBtn) {
        exploreBtn.style.display = 'block';
        exploreBtn.disabled = false;
        exploreBtn.onclick = iniciarExploracao;
    }
    
    // Ocultar botões de inicialização
    const startBtn = document.getElementById('start-button');
    if (startBtn) {
        startBtn.style.display = 'none';
    }
}

// Exploração
export function iniciarExploracao() {
    if (!gameState.initialized || gameState.gameEnded || gameState.inCombat) return;
    
    try {
        if (Math.random() < 0.25) {
            iniciarCombate();
        } else {
            explorarSala();
        }
    } catch (error) {
        handleCriticalError(error);
    }
}

function explorarSala() {
    player.energia -= 10;
    player.sanidade -= 5;
    player.salasExploradas++;
    player.dia++;
    player.pontos++;
    
    verificarEstadosCriticos();
    if (gameState.gameEnded) return;
    
    const chance = Math.random();
    let resultado = `🗓️ Dia ${player.dia}, Andar ${player.andar}: `;
    
    if (chance < 0.45) {
        resultado += "Sala vazia.";
    } else if (chance < 0.85) {
        resultado += "Fonte de cura encontrada!";
        const cura = Math.floor(Math.random() * 10) + 5;
        player.hp = Math.min(player.maxHp, player.hp + cura);
        addToHistory(`💧 Fonte restaura ${cura} HP`);
    } else {
        resultado += "Armadilha ativada!";
        const dano = Math.floor(Math.random() * 15) + 5;
        player.hp = Math.max(0, player.hp - dano);
        addToHistory(`💀 Armadilha causa ${dano} de dano`);
    }
    
    addToHistory(resultado);
    
    // XP por explorar
    const xpGanho = Math.floor(Math.random() * 5) + 2;
    ganharXP(xpGanho);
    
    // Verificar subida de andar
    if (player.salasExploradas >= player.salasParaSubir) {
        subirAndar();
    }
    
    verificarEstadosCriticos();
    updateAllUI();
}

function subirAndar() {
    player.andar++;
    player.salasExploradas = 0;
    player.salasParaSubir = 30 + Math.floor(Math.random() * 21);
    
    addToHistory(`🏗️ Subindo para o andar ${player.andar}!`);
    
    const xpBonus = player.andar * 10;
    ganharXP(xpBonus);
}

// Sistema de XP e Level
export function ganharXP(quantidade) {
    if (quantidade <= 0) return;
    
    player.xp += quantidade;
    addToHistory(`✨ +${quantidade} XP`);
    
    while (player.xp >= player.xpParaProximo) {
        subirDeNivel();
    }
}

function subirDeNivel() {
    player.xp -= player.xpParaProximo;
    player.nivel++;
    player.xpParaProximo = Math.floor(player.xpParaProximo * 1.2);
    
    // Aumentos de status
    player.maxHp += 5;
    player.hp += 5;
    player.maxMp += 5;
    player.mp += 5;
    player.maxEnergia += 5;
    player.energia += 5;
    player.maxSanidade += 5;
    player.sanidade += 5;
    player.ataque += 2;
    player.defesa += 1;
    player.precisao += 1;
    player.agilidade += 1;
    
    addToHistory(`🌟 LEVEL UP! Nível ${player.nivel}`);
    addToHistory(`📈 Todos os status aumentaram!`);
}

// Combate
export function iniciarCombate() {
    if (gameState.inCombat) return;
    
    gameState.inCombat = true;
    criarInimigo();
    addToHistory('👹 Um inimigo aparece!');
    
    mostrarPainelInimigo();
    configurarBotoesCombate();
    updateAllUI();
}

function criarInimigo() {
    const escala = player.andar;
    inimigo = {
        hp: 30 + (escala * 5),
        maxHp: 30 + (escala * 5),
        ataque: 6 + (escala * 2),
        agilidade: 10 + escala,
        precisao: 80 + (escala * 2)
    };
}

function mostrarPainelInimigo() {
    const panel = document.getElementById('enemy-panel');
    if (panel) {
        panel.style.display = 'block';
        setTimeout(() => panel.style.opacity = '1', 10);
    }
}

function configurarBotoesCombate() {
    const buttons = document.querySelectorAll('#options-panel button');
    
    if (buttons[0]) {
        buttons[0].disabled = false;
        buttons[0].textContent = '⚔️ Atacar (-5⚡)';
        buttons[0].onclick = atacarInimigo;
    }
    
    if (buttons[1]) {
        buttons[1].disabled = false;
        buttons[1].textContent = '💊 Curar (-15🟣)';
        buttons[1].onclick = curarJogador;
    }
    
    if (buttons[2]) {
        const chanceSuccesso = Math.floor((player.agilidade / (player.agilidade + inimigo.agilidade)) * 100);
        buttons[2].disabled = false;
        buttons[2].textContent = `🏃 Fugir (${chanceSuccesso}%)`;
        buttons[2].onclick = tentarFugir;
    }
}

export function atacarInimigo() {
    if (!gameState.inCombat || player.energia < 5) {
        if (player.energia < 5) addToHistory('⚠️ Energia insuficiente!');
        return;
    }
    
    player.energia -= 5;
    const dano = Math.floor(player.ataque * (player.precisao / 100));
    inimigo.hp = Math.max(0, inimigo.hp - dano);
    
    addToHistory(`⚔️ Você ataca! Dano: ${dano}`);
    
    if (inimigo.hp <= 0) {
        const xpGanho = Math.floor(Math.random() * 20) + 10;
        addToHistory('👑 Inimigo derrotado!');
        ganharXP(xpGanho);
        finalizarCombate();
    } else {
        inimigoAtaca();
    }
    
    updateAllUI();
}

export function curarJogador() {
    if (!gameState.inCombat || player.mp < 15) {
        if (player.mp < 15) addToHistory('⚠️ Mana insuficiente!');
        return;
    }
    
    player.mp -= 15;
    const cura = 15;
    player.hp = Math.min(player.maxHp, player.hp + cura);
    
    addToHistory(`💊 Você se cura! +${cura} HP`);
    inimigoAtaca();
    updateAllUI();
}

export function tentarFugir() {
    if (!gameState.inCombat) return;
    
    const chance = player.agilidade / (player.agilidade + inimigo.agilidade);
    
    if (Math.random() < chance) {
        addToHistory('✅ Você conseguiu fugir!');
        finalizarCombate();
    } else {
        addToHistory('❌ Falha na fuga!');
        inimigoAtaca();
    }
    
    updateAllUI();
}

function inimigoAtaca() {
    const dano = Math.max(1, Math.floor(inimigo.ataque * (inimigo.precisao / 100)) - player.defesa);
    player.hp = Math.max(0, player.hp - dano);
    
    addToHistory(`👹 Inimigo ataca! Dano: ${dano}`);
    verificarEstadosCriticos();
}

function finalizarCombate() {
    gameState.inCombat = false;
    inimigo = null;
    
    const panel = document.getElementById('enemy-panel');
    if (panel) {
        panel.style.opacity = '0';
        setTimeout(() => panel.style.display = 'none', 300);
    }
    
    resetarBotoesCombate();
}

function resetarBotoesCombate() {
    const buttons = document.querySelectorAll('#options-panel button');
    buttons.forEach((btn, index) => {
        if (index < 3) {
            btn.disabled = true;
            btn.textContent = '-';
            btn.onclick = null;
        }
    });
}

// Verificações de estado
export function verificarEstadosCriticos() {
    if (gameState.gameEnded) return;
    
    if (player.hp <= 0) {
        finalizarJogo('💀 Você foi derrotado!');
    } else if (player.energia <= 0) {
        finalizarJogo('😵 Você morreu de exaustão!');
    } else if (player.sanidade <= 0) {
        finalizarJogo('🤯 Você enlouqueceu!');
    }
}

export function finalizarJogo(motivo) {
    gameState.gameEnded = true;
    gameState.inCombat = false;
    
    addToHistory(motivo);
    addToHistory(`🏆 Pontuação final: ${player.pontos}`);
    addToHistory(`📊 Andar alcançado: ${player.andar}`);
    addToHistory('🔄 Recarregue para jogar novamente.');
    
    // Desabilitar controles
    const exploreBtn = document.getElementById('explore-button');
    if (exploreBtn) exploreBtn.disabled = true;
    
    resetarBotoesCombate();
}

// Atualização de UI
export function updateAllUI() {
    updatePlayerStats();
    updateEnemyStats();
}

function updatePlayerStats() {
    // Atualizar XP
    setProgressBar('xp-bar', player.xp, player.xpParaProximo, '#4caf50', `XP: ${player.xp}/${player.xpParaProximo}`);
    
    // Atualizar level
    const levelEl = document.getElementById('level');
    if (levelEl) levelEl.textContent = `Level: ${player.nivel}`;
    
    // Atualizar barras de status
    setProgressBar('health-bar', player.hp, player.maxHp, '#f44336', `❤️ HP: ${player.hp}/${player.maxHp}`);
    setProgressBar('mana-bar', player.mp, player.maxMp, '#673ab7', `🟣 MP: ${player.mp}/${player.maxMp}`);
    setProgressBar('energy-bar', player.energia, player.maxEnergia, '#ff9800', `⚡ Energia: ${player.energia}/${player.maxEnergia}`);
    setProgressBar('sanity-bar', player.sanidade, player.maxSanidade, '#00bcd4', `🌌 Sanidade: ${player.sanidade}/${player.maxSanidade}`);
    
    // Atualizar stats secundários
    const secondaryStats = document.querySelector('.secondary-stats');
    if (secondaryStats) {
        secondaryStats.innerHTML = `
            <div>⚔️ Ataque: ${player.ataque}</div>
            <div>🛡️ Defesa: ${player.defesa}</div>
            <div>🎯 Precisão: ${player.precisao}%</div>
            <div>💨 Agilidade: ${player.agilidade}</div>
        `;
    }
}

function updateEnemyStats() {
    if (!inimigo || !gameState.inCombat) return;
    
    const hpPercent = (inimigo.hp / inimigo.maxHp) * 100;
    const hpBar = document.getElementById('enemy-hp-bar');
    const secStats = document.getElementById('enemy-secondary-stats');
    
    if (hpBar) {
        hpBar.innerHTML = `
            <div class="bar-container">
                <div class="bar-fill" style="width: ${hpPercent}%; background-color: #f44336;"></div>
            </div>
            HP: ${inimigo.hp}/${inimigo.maxHp}
        `;
    }
    
    if (secStats) {
        secStats.innerHTML = `
            <div>⚔️ Ataque: ${inimigo.ataque}</div>
            <div>💨 Agilidade: ${inimigo.agilidade}</div>
            <div>🎯 Precisão: ${inimigo.precisao}%</div>
            <div>🌟 Andar: ${player.andar}</div>
        `;
    }
}

function setProgressBar(id, current, max, color, label) {
    const element = document.getElementById(id);
    if (!element) return;
    
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    element.innerHTML = `
        <div class="bar-container">
            <div class="bar-fill" style="width: ${percentage}%; background-color: ${color};"></div>
        </div>
        ${label}
    `;
}

// Gerenciamento de eventos
function addInitEventListeners() {
    removeAllEventListeners();
    
    const startBtn = document.getElementById('start-button');
    if (startBtn) {
        startBtn.addEventListener('click', iniciarJogo);
    }
}

function removeAllEventListeners() {
    const startBtn = document.getElementById('start-button');
    const exploreBtn = document.getElementById('explore-button');
    
    if (startBtn) {
        startBtn.removeEventListener('click', iniciarJogo);
    }
    
    if (exploreBtn) {
        exploreBtn.removeEventListener('click', iniciarExploracao);
    }
}

// Tratamento de erros
function handleCriticalError(error) {
    console.error('Erro crítico:', error);
    addToHistory('💥 Erro crítico! Recarregue a página.');
    gameState.gameEnded = true;
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    try {
        addInitEventListeners();
        addToHistory('🏰 Torre da Redenção carregada!');
        addToHistory('👆 Clique em "Iniciar" para começar.');
    } catch (error) {
        handleCriticalError(error);
    }
});