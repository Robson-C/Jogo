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
    salasParaSubir: getRandomRoomsForFloor(),
    pontos: 0,
    descansou: false,
    meditou: false
};

export function getRandomRoomsForFloor() {
    return Math.floor(Math.random() * 21) + 30;
}

export function resetPlayer() {
    Object.assign(player, {
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
        salasParaSubir: getRandomRoomsForFloor(),
        pontos: 0,
        descansou: false,
        meditou: false
    });
}

export function ganharXP(quantidade) {
    if (typeof quantidade !== 'number' || quantidade <= 0) return;
    
    player.xp += quantidade;
    
    // Notificar UI e game sobre XP ganho
    window.dispatchEvent(new CustomEvent('addHistory', { 
        detail: { message: `✨ +${quantidade} XP` }
    }));
    
    while (player.xp >= player.xpParaProximo) {
        subirDeNivel();
    }
    
    window.dispatchEvent(new CustomEvent('uiUpdate'));
}

function subirDeNivel() {
    player.xp -= player.xpParaProximo;
    player.nivel++;
    player.xpParaProximo = Math.floor(player.xpParaProximo * 1.2);
    
    // Status principais (+5 cada)
    player.maxHp += 5;
    player.hp += 5;
    player.maxMp += 5;
    player.mp += 5;
    player.maxEnergia += 5;
    player.energia += 5;
    player.maxSanidade += 5;
    player.sanidade += 5;
    
    // Ataque (+2)
    player.ataque += 2;
    
    // Outros status (+1 cada)
    player.defesa += 1;
    player.precisao += 1;
    player.agilidade += 1;
    
    window.dispatchEvent(new CustomEvent('addHistory', { 
        detail: { message: `🌟 LEVEL UP! Nível ${player.nivel}` }
    }));
    window.dispatchEvent(new CustomEvent('addHistory', { 
        detail: { message: `📈 +5 HP/MP/Energia/Sanidade, +2 Ataque, +1 Defesa/Precisão/Agilidade` }
    }));
}

export function verificarEstadosCriticos() {
    if (player.hp <= 0) {
        window.dispatchEvent(new CustomEvent('gameEnd', { 
            detail: { reason: '💀 Você foi derrotado!' }
        }));
        return true;
    }
    if (player.energia <= 0) {
        window.dispatchEvent(new CustomEvent('gameEnd', { 
            detail: { reason: '💀 Você morreu de exaustão!' }
        }));
        return true;
    }
    if (player.sanidade <= 0) {
        window.dispatchEvent(new CustomEvent('gameEnd', { 
            detail: { reason: '💀 Você enlouqueceu!' }
        }));
        return true;
    }
    return false;
}

// Event listeners
window.addEventListener('gameReset', (e) => {
    resetPlayer();
    if (e.detail && e.detail.playerName) {
        player.nome = e.detail.playerName;
    }
});

window.addEventListener('gameEnd', (e) => {
    if (e.detail && e.detail.reason) {
        // Adicionar stats finais ao histórico
        window.dispatchEvent(new CustomEvent('addHistory', { 
            detail: { message: `🏆 Pontuação final: ${player.pontos}` }
        }));
        window.dispatchEvent(new CustomEvent('addHistory', { 
            detail: { message: `📊 Andar alcançado: ${player.andar}` }
        }));
        window.dispatchEvent(new CustomEvent('addHistory', { 
            detail: { message: '🔄 Recarregue para jogar novamente.' }
        }));
    }
});