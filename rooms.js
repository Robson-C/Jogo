import { player, verificarEstadosCriticos, getRandomRoomsForFloor, ganharXP } from './player.js';
import { updateUIStatus, resetUIOptions } from './ui.js';
import { iniciarCombate } from './combat.js';
import { addToHistory } from './game.js';

export function iniciarExploracao() {
    if (player.hp <= 0) return;
    
    if (Math.random() < 0.2) {
        iniciarCombate();
    } else {
        explorarSala();
    }
}

function explorarSala() {
    resetUIOptions();
    player.energia -= 10;
    player.sanidade -= 5;
    player.salasExploradas++;
    
    verificarEstadosCriticos();
    if (player.hp <= 0) return;
    
    player.dia++;
    player.pontos++;
    
    const chance = Math.random();
    let texto = `Dia ${player.dia}, Andar ${player.andar}: `;
    
    if (chance < 0.45) {
        texto += "Sala Vazia.";
    } else if (chance < 0.9) {
        texto += "Sala com Fonte.";
        const cura = Math.floor(Math.random() * 10) + 5;
        player.hp = Math.min(player.maxHp, player.hp + cura);
        addToHistory(`💧 Fonte restaura ${cura} HP`);
    } else {
        texto += "Sala com Armadilha.";
        const dano = Math.floor(Math.random() * 15) + 5;
        player.hp -= dano;
        addToHistory(`⚠️ Armadilha causa ${dano} de dano`);
    }
    
    addToHistory(texto);
    
    // XP por explorar sala
    const xpGanho = Math.floor(Math.random() * 5) + 2;
    ganharXP(xpGanho);
    
    // Verifica se deve subir de andar
    if (player.salasExploradas >= player.salasParaSubir) {
        subirAndar();
    }
    
    updateUIStatus();
}

function subirAndar() {
    player.andar++;
    player.salasExploradas = 0;
    player.salasParaSubir = getRandomRoomsForFloor();
    addToHistory(`🏗️ Subindo para o andar ${player.andar}!`);
    
    // Bonus por subir andar
    const xpBonus = player.andar * 10;
    ganharXP(xpBonus);
}