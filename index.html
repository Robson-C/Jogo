/**
 * GAME.JS - CONTROLADOR PRINCIPAL
 * 
 * Responsabilidades:
 * - Estado global do jogo (initialized, inCombat, gameEnded)
 * - Sistema de histórico unificado
 * - Inicialização e finalização do jogo
 * - Gerenciamento de eventos principais
 * - Coordenação entre módulos
 * 
 * ARQUIVOS E SUAS FUNÇÕES:
 * 
 * player.js - ESTADO E LÓGICA DO JOGADOR
 * - Objeto player com todos os stats
 * - Sistema de XP e level up
 * - Verificações de morte/game over
 * - Reset do jogador
 * 
 * ui.js - INTERFACE E ATUALIZAÇÕES VISUAIS
 * - Atualização de todas as barras de status
 * - Rendering dos stats do jogador
 * - Rendering dos stats do inimigo
 * - Animações de interface
 * 
 * rooms.js - SISTEMA DE EXPLORAÇÃO
 * - Lógica de exploração de salas
 * - Eventos aleatórios (fontes, armadilhas, salas vazias)
 * - Sistema de subida de andar
 * - Controle de progresso por salas
 * 
 * enemy.js - CRIAÇÃO E LÓGICA DE INIMIGOS
 * - Objeto inimigo e suas propriedades
 * - Criação de inimigos escalados por andar
 * - Remoção de inimigos (morte/fuga)
 * - Stats balanceados por dificuldade
 * 
 * combat.js - SISTEMA DE COMBATE COMPLETO
 * - Inicialização do combate
 * - Ações do jogador (atacar, curar, fugir)
 * - Ações do inimigo
 * - Finalização do combate
 * - Configuração dos botões de combate
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
        // Importações dinâmicas para evitar dependências circulares
        import('./player.js').then(playerModule => {
            import('./ui.js').then(uiModule => {
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
                
                // Reset do jogador
                playerModule.resetPlayer();
                playerModule.player.nome = sanitizeInput(nome.trim());
                
                // Mensagens iniciais
                addToHistory(`🌟 Bem-vindo à Torre da Redenção, ${playerModule.player.nome}!`);
                addToHistory(`🏗️ Você está no andar ${playerModule.player.andar}. Explore para encontrar a saída!`);
                
                // Configurar interface
                setupGameInterface();
                uiModule.updateAllUI();
            });
        });
        
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
            import('./rooms.js').then(roomsModule => {
                roomsModule.iniciarExploracao();
            });
        };
    }
    
    if (startBtn) {
        startBtn.style.display = 'none';
    }
}

// Finalização do jogo
export function finalizarJogo(motivo) {
    gameState.gameEnded = true;
    gameState.inCombat = false;
    
    import('./player.js').then(playerModule => {
        addToHistory(motivo);
        addToHistory(`🏆 Pontuação final: ${playerModule.player.pontos}`);
        addToHistory(`📊 Andar alcançado: ${playerModule.player.andar}`);
        addToHistory('🔄 Recarregue para jogar novamente.');
        
        // Desabilitar controles
        const exploreBtn = document.getElementById('explore-button');
        if (exploreBtn) exploreBtn.disabled = true;
        
        resetarBotoesCombate();
    });
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
    gameState.inCombat = value;
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
        exploreBtn.removeEventListener('click', () => {});
    }
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