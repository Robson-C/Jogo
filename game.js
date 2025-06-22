/**
 * GAME.JS - CONTROLADOR PRINCIPAL
 * 
 * Responsabilidades:
 * - Estado global do jogo (initialized, inCombat, gameEnded)
 * - Sistema de histórico unificado
 * - Inicialização e finalização do jogo
 * - Gerenciamento de eventos principais
 * - Coordenação entre módulos
 */

// Estado global do jogo
const gameState = {
    initialized: false,
    inCombat: false,
    gameEnded: false,
    historyLog: []
};

// Sistema de histórico unificado
export function addToHistory(message) {
    if (typeof message !== 'string' || message.trim() === '') return;
    
    gameState.historyLog.push(sanitizeInput(message));
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyDiv = document.getElementById('history-panel');
    if (historyDiv) {
        historyDiv.innerHTML = gameState.historyLog.join('<br>');
        // Otimização: só scroll se necessário
        if (historyDiv.scrollHeight > historyDiv.clientHeight) {
            historyDiv.scrollTop = historyDiv.scrollHeight;
        }
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

// Validação de elementos DOM
function validateDOMElements() {
    const requiredElements = [
        'history-panel',
        'explore-button', 
        'start-button',
        'options-panel',
        'enemy-panel'
    ];
    
    for (const id of requiredElements) {
        if (!document.getElementById(id)) {
            throw new Error(`Elemento DOM necessário não encontrado: ${id}`);
        }
    }
}

// Inicialização do jogo
export function iniciarJogo() {
    try {
        validateDOMElements();
        
        const nome = prompt('Digite seu nome:');
        if (!validatePlayerName(nome)) {
            addToHistory('❌ Nome inválido. Tente novamente.');
            return;
        }
        
        // Reset do estado do jogo
        gameState.initialized = true;
        gameState.inCombat = false;
        gameState.gameEnded = false;
        gameState.historyLog = [];
        
        // Notificar outros módulos para reset
        window.dispatchEvent(new CustomEvent('gameReset', { 
            detail: { playerName: sanitizeInput(nome.trim()) }
        }));
        
        // Mensagens iniciais
        addToHistory(`🌟 Bem-vindo à Torre da Redenção, ${sanitizeInput(nome.trim())}!`);
        addToHistory('🏗️ Você está no andar 1. Explore para encontrar a saída!');
        
        // Configurar interface
        setupGameInterface();
        
        // Notificar UI para atualizar
        window.dispatchEvent(new CustomEvent('uiUpdate'));
        
    } catch (error) {
        handleCriticalError(error);
    }
}

// Configurar interface do jogo
function setupGameInterface() {
    const exploreBtn = document.getElementById('explore-button');
    const startBtn = document.getElementById('start-button');
    
    if (exploreBtn) {
        exploreBtn.style.display = 'block';
        exploreBtn.disabled = false;
        exploreBtn.onclick = () => {
            window.dispatchEvent(new CustomEvent('startExploration'));
        };
    }
    
    if (startBtn) {
        startBtn.style.display = 'none';
    }
}

// Finalização do jogo
export function finalizarJogo(motivo) {
    if (gameState.gameEnded) return; // Previne múltiplas chamadas
    
    gameState.gameEnded = true;
    gameState.inCombat = false;
    
    addToHistory(motivo);
    
    // Notificar outros módulos sobre fim do jogo
    window.dispatchEvent(new CustomEvent('gameEnd'));
    
    // Desabilitar controles
    const exploreBtn = document.getElementById('explore-button');
    if (exploreBtn) exploreBtn.disabled = true;
    
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

// Getters para estado do jogo (para outros módulos)
export function isGameInitialized() {
    return gameState.initialized;
}

export function isInCombat() {
    return gameState.inCombat;
}

export function isGameEnded() {
    return gameState.gameEnded;
}

export function setInCombat(value) {
    gameState.inCombat = Boolean(value);
}

// Tratamento de erros
function handleCriticalError(error) {
    console.error('Erro crítico:', error);
    addToHistory('💥 Erro crítico! Recarregue a página.');
    gameState.gameEnded = true;
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
        exploreBtn.onclick = null;
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    try {
        validateDOMElements();
        addInitEventListeners();
        addToHistory('🏰 Torre da Redenção carregada!');
        addToHistory('👆 Clique em "Iniciar" para começar.');
    } catch (error) {
        handleCriticalError(error);
    }
});