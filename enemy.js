let inimigo = null;

export function criarInimigo() {
    requestPlayerData((playerData) => {
        if (!playerData) return;
        
        const escala = playerData.andar;
        inimigo = {
            hp: 30 + (escala * 5),
            maxHp: 30 + (escala * 5),
            ataque: 6 + (escala * 2),
            agilidade: 10 + escala,
            precisao: 80 + (escala * 2)
        };
        updateEnemyPanel();
    });
}

export function updateEnemyPanel() {
    if (!inimigo) return;
    
    const hpBar = document.getElementById('enemy-hp-bar');
    const secStats = document.getElementById('enemy-secondary-stats');
    
    if (hpBar) {
        const hpPercent = (inimigo.hp / inimigo.maxHp) * 100;
        hpBar.innerHTML = `
            <div class="bar-container">
                <div class="bar-fill" style="width: ${hpPercent}%; background-color: #f44336;"></div>
            </div>
            HP: ${inimigo.hp}/${inimigo.maxHp}
        `;
    }
    
    if (secStats) {
        requestPlayerData((playerData) => {
            secStats.innerHTML = `
                <div>⚔️ Ataque: ${inimigo.ataque}</div>
                <div>💨 Agilidade: ${inimigo.agilidade}</div>
                <div>🎯 Precisão: ${inimigo.precisao}%</div>
                <div>🌟 Andar: ${playerData ? playerData.andar : 1}</div>
            `;
        });
    }
}

export function removerInimigo() {
    inimigo = null;
    const panel = document.getElementById('enemy-panel');
    if (panel) {
        panel.style.opacity = '0';
        setTimeout(() => {
            if (panel) panel.style.display = 'none';
        }, 300);
    }
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
window.addEventListener('createEnemy', () => {
    criarInimigo();
});

window.addEventListener('removeEnemy', () => {
    removerInimigo();
});

window.addEventListener('damageEnemy', (e) => {
    if (inimigo && e.detail && typeof e.detail.damage === 'number') {
        inimigo.hp = Math.max(0, inimigo.hp - e.detail.damage);
        updateEnemyPanel();
    }
});

window.addEventListener('requestEnemyData', () => {
    window.dispatchEvent(new CustomEvent('enemyDataResponse', {
        detail: inimigo ? { ...inimigo } : null
    }));
});