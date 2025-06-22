import { player } from './player.js';

export function updateUIStatus() {
    // Barra de XP
    setBar('xp-bar', player.xp, player.xpParaProximo, '#4caf50', `XP: ${player.xp}/${player.xpParaProximo}`);
    
    // Level
    document.getElementById('level').textContent = `Level: ${player.nivel}`;
    
    // Barras de status
    setBar('health-bar', player.hp, player.maxHp, '#f44336', `❤️ HP: ${player.hp}/${player.maxHp}`);
    setBar('mana-bar', player.mp, player.maxMp, '#673ab7', `🟣 MP: ${player.mp}/${player.maxMp}`);
    setBar('energy-bar', player.energia, player.maxEnergia, '#ff9800', `⚡ Energia: ${player.energia}/${player.maxEnergia}`);
    setBar('sanity-bar', player.sanidade, player.maxSanidade, '#00bcd4', `🌌 Sanidade: ${player.sanidade}/${player.maxSanidade}`);
    
    // Stats secundários
    const secondaryStats = document.querySelector('.secondary-stats');
    secondaryStats.innerHTML = `
        <div>⚔️ Ataque: ${player.ataque}</div>
        <div>🛡️ Defesa: ${player.defesa}</div>
        <div>🎯 Precisão: ${player.precisao}%</div>
        <div>💨 Agilidade: ${player.agilidade}</div>
    `;
}

export function updateAllUI() {
    updateUIStatus();
    updateGameInfo();
}

function updateGameInfo() {
    // Atualiza informações adicionais como andar, salas, etc.
    const gameInfo = document.querySelector('.game-info');
    if (gameInfo) {
        gameInfo.innerHTML = `
            <div>🏗️ Andar: ${player.andar}</div>
            <div>🚪 Salas: ${player.salasExploradas}/${player.salasParaSubir}</div>
            <div>📅 Dia: ${player.dia}</div>
            <div>🏆 Pontos: ${player.pontos}</div>
        `;
    }
}

function setBar(id, value, max, color, label) {
    const bar = document.getElementById(id);
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