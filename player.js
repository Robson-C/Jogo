import { updateUIStatus } from './ui.js';
import { finalizarJogo, addToHistory } from './game.js';

export const player = {
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
    player.xp += quantidade;
    addToHistory(`✨ +${quantidade} XP`);
    
    while (player.xp >= player.xpParaProximo) {
        subirDeNivel();
    }
    
    updateUIStatus();
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
    
    addToHistory(`🌟 LEVEL UP! Nível ${player.nivel}`);
    addToHistory(`📈 +5 HP/MP/Energia/Sanidade, +2 Ataque, +1 Defesa/Precisão/Agilidade`);
}

export function verificarEstadosCriticos() {
    if (player.hp <= 0) finalizarJogo('💀 Você foi derrotado!');
    if (player.energia <= 0) finalizarJogo('💀 Você morreu de exaustão!');
    if (player.sanidade <= 0) finalizarJogo('💀 Você enlouqueceu!');
}