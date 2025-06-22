export function iniciarExploracao() {
    requestPlayerData((playerData) => {
        if (!playerData || playerData.hp <= 0) return;
        
        if (Math.random() < 0.2) {
            // Importar combat dinamicamente para evitar dependência circular
            import('./combat.js').then(combatModule => {
                combatModule.iniciarCombate();
            }).catch(err => {
                console.error('Erro ao carregar combat:', err);
                explorarSala();
            });
        } else {
            explorarSala();
        }
    });
}

function explorarSala() {
    requestPlayerData((playerData) => {
        if (!playerData) return;
        
        // Reset UI options
        window.dispatchEvent(new CustomEvent('resetUIOptions'));
        
        // Modificar stats do player
        window.dispatchEvent(new CustomEvent('modifyPlayer', { 
            detail: { property: 'energia', value: playerData.energia - 10 } 
        }));
        window.dispatchEvent(new CustomEvent('modifyPlayer', { 
            detail: { property: 'sanidade', value: playerData.sanidade - 5 } 
        }));
        window.dispatchEvent(new CustomEvent('modifyPlayer', { 
            detail: { property: 'salasExploradas', value: playerData.salasExploradas + 1 } 
        }));
        window.dispatchEvent(new CustomEvent('modifyPlayer', { 
            detail: { property: 'dia', value: playerData.dia + 1 } 
        }));
        window.dispatchEvent(new CustomEvent('modifyPlayer', { 
            detail: { property: 'pontos', value: playerData.pontos + 1 } 
        }));
        
        // Verificar estados críticos
        window.dispatchEvent(new CustomEvent('checkCriticalStates'));
        
        // Processar evento da sala
        const chance = Math.random();
        let texto = `Dia ${playerData.dia + 1}, Andar ${playerData.andar}: `;
        
        if (chance < 0.45) {
            texto += "Sala Vazia.";
        } else if (chance < 0.9) {
            texto += "Sala com Fonte.";
            const cura = Math.floor(Math.random() * 10) + 5;
            const novoHP = Math.min(playerData.maxHp, playerData.hp + cura);
            window.dispatchEvent(new CustomEvent('modifyPlayer', { 
                detail: { property: 'hp', value: novoHP } 
            }));
            window.dispatchEvent(new CustomEvent('addHistory', { 
                detail: { message: `💧 Fonte restaura ${cura} HP` } 
            }));
        } else {
            texto += "Sala com Armadilha.";
            const dano = Math.floor(Math.random() * 15) + 5;
            window.dispatchEvent(new CustomEvent('modifyPlayer', { 
                detail: { property: 'hp', value: playerData.hp - dano } 
            }));
            window.dispatchEvent(new CustomEvent('addHistory', { 
                detail: { message: `⚠️ Armadilha causa ${dano} de dano` } 
            }));
        }
        
        window.dispatchEvent(new CustomEvent('addHistory', { detail: { message: texto } }));
        
        // XP por explorar sala
        const xpGanho = Math.floor(Math.random() * 5) + 2;
        window.dispatchEvent(new CustomEvent('gainXP', { detail: { amount: xpGanho } }));
        
        // Verificar se deve subir de andar
        if (playerData.salasExploradas + 1 >= playerData.salasParaSubir) {
            subirAndar(playerData);
        }
    });
}

function subirAndar(playerData) {
    window.dispatchEvent(new CustomEvent('modifyPlayer', { 
        detail: { property: 'andar', value: playerData.andar + 1 } 
    }));
    window.dispatchEvent(new CustomEvent('modifyPlayer', { 
        detail: { property: 'salasExploradas', value: 0 } 
    }));
    
    // Gerar novas salas necessárias
    const novasSalas = Math.floor(Math.random() * 21) + 30;
    window.dispatchEvent(new CustomEvent('modifyPlayer', { 
        detail: { property: 'salasParaSubir', value: novasSalas } 
    }));
    
    window.dispatchEvent(new CustomEvent('addHistory', { 
        detail: { message: `🏗️ Subindo para o andar ${playerData.andar + 1}!` } 
    }));
    
    // Bonus por subir andar
    const xpBonus = (playerData.andar + 1) * 10;
    window.dispatchEvent(new CustomEvent('gainXP', { detail: { amount: xpBonus } }));
}

function requestPlayerData(callback) {
    const handler = (e) => {
        callback(e.detail);
        window.removeEventListener('playerDataResponse', handler);
    };
    
    window.addEventListener('playerDataResponse', handler);
    window.dispatchEvent(new CustomEvent('requestPlayerData'));
}

// Event listeners
window.addEventListener('startExploration', () => {
    iniciarExploracao();
});