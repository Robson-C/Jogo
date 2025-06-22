// Objeto de estado centralizado
const gameState = {
    playerName: '',
    currentRoom: '',
    historyLog: [],
    playerStats: {
        xp: 0,
        level: 1,
        vida: 100,
        mana: 50,
        energia: 100,
        sanidade: 100
    }
};

// Atualiza o histórico de mensagens
function updateHistory(message) {
    gameState.historyLog.push(message);
    const historyDiv = document.getElementById('gameHistory');
    historyDiv.innerHTML = gameState.historyLog.join('<br>');
}

// Atualiza o status do jogador
function updateStats() {
    const statsDiv = document.getElementById('playerStats');
    const stats = gameState.playerStats;
    statsDiv.innerHTML = `
        XP: ${stats.xp} | Nível: ${stats.level} | Vida: ${stats.vida} | Mana: ${stats.mana} | Energia: ${stats.energia} | Sanidade: ${stats.sanidade}
    `;
}

// Lógica de entrada na sala inicial
function enterRoom(roomName) {
    gameState.currentRoom = roomName;
    updateHistory(`Você entrou na sala: ${roomName}`);
    updateStats();
}

// Validação básica do nome do jogador
function validatePlayerName(name) {
    return typeof name === 'string' && name.trim().length > 0 && name.length <= 20;
}

// Sanitização de entrada para evitar XSS
function sanitizeInput(input) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = input;
    return tempDiv.innerHTML;
}

// Inicializa o jogo
function startGame() {
    removeEventListeners();
    const playerName = prompt('Digite seu nome:');
    if (validatePlayerName(playerName)) {
        gameState.playerName = sanitizeInput(playerName);
        updateHistory(`Bem-vindo, ${gameState.playerName}!`);
        enterRoom('Sala Inicial');
    } else {
        updateHistory('Nome inválido. Por favor, tente novamente.');
        addEventListeners(); // Permite tentar novamente
    }
}

// Exemplo de ação futura (placeholder)
function nextAction() {
    try {
        updateHistory('Você realizou uma ação.');
    } catch (error) {
        handleCriticalError(error);
    }
}

// Tratamento de erros críticos
function handleCriticalError(error) {
    console.error('Erro crítico:', error);
    const historyDiv = document.getElementById('gameHistory');
    historyDiv.innerHTML = `<p style="color: red;">Ocorreu um erro crítico. Recarregue a página.</p>`;
}

// Adiciona event listeners
function addEventListeners() {
    const startBtn = document.getElementById('startButton');
    const actionBtn = document.getElementById('actionButton');

    if (startBtn) startBtn.addEventListener('click', startGame);
    if (actionBtn) actionBtn.addEventListener('click', nextAction);
}

// Remove event listeners
function removeEventListeners() {
    const startBtn = document.getElementById('startButton');
    const actionBtn = document.getElementById('actionButton');

    if (startBtn) startBtn.removeEventListener('click', startGame);
    if (actionBtn) actionBtn.removeEventListener('click', nextAction);
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    addEventListeners();
});