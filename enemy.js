import { addToHistory } from './game.js';
import { player } from './player.js';

export let inimigo = null;

export function criarInimigo() {
    const escala = player.andar;
    inimigo = {
        hp: 30 + (escala * 5),
        maxHp: 30 + (escala * 5),
        ataque: 6 + (escala * 2),
        agilidade: 10 + escala,
        precisao: 80 + (escala * 2)
    };
    updateEnemyPanel();
}

export function updateEnemyPanel() {
    const hpPercent = (inimigo.hp / inimigo.maxHp) * 100;
    const hpBar = document.getElementById('enemy-hp-bar');
    const secStats = document.getElementById('enemy-secondary-stats');
    
    hpBar.innerHTML = `
        <div class="bar-container">
            <div class="bar-fill" style="width: ${hpPercent}%; background-color: #f44336;"></div>
        </div>
        HP: ${inimigo.hp}/${inimigo.maxHp}
    `;
    
    secStats.innerHTML = `
        <div>⚔️ Ataque: ${inimigo.ataque}</div>
        <div>💨 Agilidade: ${inimigo.agilidade}</div>
        <div>🎯 Precisão: ${inimigo.precisao}%</div>
        <div>🌟 Andar: ${player.andar}</div>
    `;
}

export function removerInimigo() {
    inimigo = null;
    const panel = document.getElementById('enemy-panel');
    panel.style.opacity = 0;
    setTimeout(() => panel.style.display = 'none', 300);
}