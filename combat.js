import { inimigo, criarInimigo, updateEnemyPanel, removerInimigo } from './enemy.js';
import { player, verificarEstadosCriticos, ganharXP } from './player.js';
import { updateUIStatus, resetUIOptions } from './ui.js';
import { addToHistory, setInCombat } from './game.js';

export function iniciarCombate() {
    setInCombat(true);
    addToHistory('👹 Um inimigo aparece!');
    criarInimigo();
    document.getElementById('enemy-panel').style.display = 'block';
    setTimeout(() => document.getElementById('enemy-panel').style.opacity = 1, 10);
    configurarBotoesCombate();
}

function configurarBotoesCombate() {
    const optionButtons = document.querySelectorAll('#options-panel button');
    
    optionButtons[0].disabled = false;
    optionButtons[0].textContent = '⚔️ Atacar (-5⚡)';
    optionButtons[0].onclick = atacarInimigo;
    
    optionButtons[1].disabled = false;
    optionButtons[1].textContent = '💊 Curar (-15🟣)';
    optionButtons[1].onclick = curar;
    
    const chance = player.agilidade / (player.agilidade + inimigo.agilidade);
    optionButtons[2].textContent = `🏃 Fugir (${Math.floor(chance * 100)}%)`;
    optionButtons[2].disabled = false;
    optionButtons[2].onclick = fugir;
}

function atacarInimigo() {
    if (player.energia < 5) return addToHistory('⚠️ Sem energia.');
    
    player.energia -= 5;
    const dano = Math.floor(player.ataque * (player.precisao / 100));
    inimigo.hp -= dano;
    addToHistory(`Você ataca: 🩸 -${dano} HP inimigo.`);
    
    updateEnemyPanel();
    updateUIStatus();
    
    if (inimigo.hp <= 0) {
        addToHistory('👑 Inimigo derrotado!');
        const xpGanho = Math.floor(Math.random() * 20) + 10;
        ganharXP(xpGanho);
        finalizarCombate();
    } else {
        inimigoAtaca();
    }
}

function inimigoAtaca() {
    const dano = Math.max(1, Math.floor(inimigo.ataque * (inimigo.precisao / 100)) - player.defesa);
    player.hp -= dano;
    addToHistory(`Inimigo ataca: 🩸 -${dano} HP.`);
    updateUIStatus();
    verificarEstadosCriticos();
}

function curar() {
    if (player.mp < 15) return addToHistory('⚠️ Mana insuficiente.');
    
    player.mp -= 15;
    const cura = 15;
    player.hp = Math.min(player.maxHp, player.hp + cura);
    addToHistory(`💊 Cura: +${cura} HP, -15 MP.`);
    updateUIStatus();
}

function fugir() {
    const chance = player.agilidade / (player.agilidade + inimigo.agilidade);
    if (Math.random() < chance) {
        addToHistory('✅ Você fugiu!');
        finalizarCombate();
    } else {
        addToHistory('❌ Falha na fuga.');
        inimigoAtaca();
    }
}

function finalizarCombate() {
    setInCombat(false);
    removerInimigo();
    resetUIOptions();
}