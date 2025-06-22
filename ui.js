// Validação de elementos DOM
function validateElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Elemento ${id} não encontrado`);
        return null;
    }
    return element;
}

export function updateUIStatus() {
    try {
        // Buscar dados do player via evento
        const playerData = getPlayerData();
        if (!playerData) return;
        
        // Barra de XP
        setBar('xp-bar', playerData.xp, playerData.xpParaProximo, '#4caf50', `XP: ${playerData.xp}/${playerData.xpParaProximo}`);
        
        // Level
        const levelEl = validateElement('level');
        if (levelEl) levelEl.textContent = `Level: ${playerData.nivel}`;
        
        // Barras de status
        setBar('health-bar', playerData.hp, playerData.maxHp, '#f44336', `❤️ HP: ${playerData.hp}/${playerData.maxHp}`);
        setBar('mana-bar', playerData.mp, playerData.maxMp, '#673ab7', `🟣 MP: ${playerData.mp}/${playerData.maxMp}`);
        setBar('energy-bar', playerData.energia, playerData.maxEnergia, '#ff9800', `⚡ Energia: ${playerData.energia}/${playerData.maxEnergia}`);
        setBar('sanity-bar', playerData.sanidade, playerData.maxSanidade, '#00bcd4', `🌌 Sanidade: ${playerData.sanidade}/${playerData.maxSanidade}`);
        
        // Stats secundários
        updateSecondaryStats(playerData);
        
    } catch (error) {
        console.error('Erro ao atualizar UI:', error);
    }
}

function updateSecondaryStats(playerData) {
    const secondaryStats = document.querySelector('.secondary-stats');
    if (secondaryStats) {
        secondaryStats.innerHTML = `
            <div>⚔️ Ataque: ${playerData.ataque}</div>
            <div>🛡️ Defesa: ${playerData.defesa}</div>
            <div>🎯 Precisão: ${playerData.precisao}%</div>
            <div>💨 Agilidade: ${playerData.agilidade}</div>
        `;
    }
}

export function updateAllUI() {
    updateUIStatus();
    updateGameInfo();
}

function updateGameInfo() {
    try {
        const playerData = getPlayerData();
        if (!playerData) return;
        
        const gameInfo = document.querySelector('.game-info');
        if (gameInfo) {
            gameInfo.innerHTML = `
                <div>🏗️ Andar: ${playerData.andar}</div>
                <div>🚪 Salas: ${playerData.salasExploradas}/${playerData.salasParaSubir}</div>
                <div>📅 Dia: ${playerData.dia}</div>
                <div>🏆 Pontos: ${playerData.pontos}</div>
            `;
        }
    } catch (error) {
        console.error('Erro ao atualizar info do jogo:', error);
    }
}

function setBar(id, value, max, color, label) {
    const bar = validateElement(id);
    if (!bar) return;
    
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));
    bar.innerHTML = `
        <div class="bar-container">
            <div class="bar-fill" style="width: ${percentage}%; background-color: ${color};"></div>
        </div>
        ${label}
    `;
}

export function resetUIOptions() {
    const optionButtons = document.querySelectorAll('#options-panel button');
    optionButtons.forEach((btn, index) => {
        if (index < 3) {
            btn.disabled = true;
            btn.textContent = '-';
            btn.onclick = null;
        }
    });
}

// Função para obter dados do player sem importação circular
function getPlayerData() {
    // Solicita dados do player via evento customizado
    const event = new CustomEvent('requestPlayerData');
    let playerData = null;
    
    // Listener temporário para capturar resposta
    const responseHandler = (e) => {
        playerData = e.detail;
        window.removeEventListener('playerDataResponse', responseHandler);
    };
    
    window.addEventListener('playerDataResponse', responseHandler);
    window.dispatchEvent(event);
    
    return playerData;
}

// Event listeners
window.addEventListener('uiUpdate', () => {
    requestAnimationFrame(updateUIStatus);
});

window.addEventListener('uiUpdateAll', () => {
    requestAnimationFrame(updateAllUI);
});

// Responder a solicitações de dados do player
window.addEventListener('requestPlayerData', () => {
    // Importar player apenas quando necessário
    import('./player.js').then(playerModule => {
        window.dispatchEvent(new CustomEvent('playerDataResponse', {
            detail: { ...playerModule.player }
        }));
    }).catch(err => {
        console.error('Erro ao importar player:', err);
        window.dispatchEvent(new CustomEvent('playerDataResponse', {
            detail: null
        }));
    });
});