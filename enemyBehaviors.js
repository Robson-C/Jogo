/* =====================[ TRECHO 1: HANDLERS DE COMPORTAMENTO DE INIMIGOS ]===================== */

// Adaptação: ataqueInimigoBasico agora pode receber um multiplicador de dano (default 1).
function ataqueInimigoBasico(enemy, multiplicador = 1) {
    if (!enemy) return;
    const playerDef = getPlayerDefesaAtual();
    let danoBase = Math.max(1, enemy.forca - playerDef);
    danoBase = Math.round(danoBase * multiplicador);
    gameState.vida = Math.max(0, gameState.vida - danoBase);
    addMessage(`${enemy.name} ataca e causa ${danoBase} de dano!`, true, false, "attack");
}

const ENEMY_BEHAVIORS = {
    // ========= INIMIGOS COMUNS CAP 1 =========
    "Slime Verde": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy); // Dano normal
            applyPlayerDebuff("veneno", 3, 2);
            addMessage("O Slime Verde expele gosma ácida! Você sofre dano e fica envenenado por 2 turnos.", true);
        }
    },
    "Cogumelo Saltitante": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.7); // Dano reduzido (debuff forte)
            applyPlayerDebuff("agilidade", 3, 2);
            addMessage("O Cogumelo Saltitante lança esporos, reduzindo sua agilidade e causando dano.", true);
        }
    },
    "Planta que ri": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 75) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.7);
            applyPlayerDebuff("grilhoes_naturais", 2, 2);
            applyPlayerDebuff("agilidade", 2, 2);
            applyPlayerDebuff("forca", 2, 2);
            addMessage("Raízes prendem suas pernas! Você sofre dano e tem força/agilidade reduzidas.", true);
        }
    },
    "Fada Travessa": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 75) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy);
            applyPlayerDebuff("stun", 1, 1);
            addMessage("A Fada Travessa ataca com energia mística! Você sofre dano e fica atordoado, perdendo o próximo turno.", true);
        }
    },
    "Cubo de Gelatina": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.7);
            applyPlayerDebuff("gelatina_pegajosa", 2, 2);
            applyPlayerDebuff("agilidade", 2, 2);
            applyPlayerDebuff("defesa", 2, 2);
            addMessage("O Cubo de Gelatina gruda em você! Sofre dano e tem agilidade/defesa reduzidas.", true);
        }
    },
    "Livro Falante": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.7);
            applyPlayerDebuff("precisao", 1, 2);
            addMessage("O Livro Falante entoa um feitiço! Você sofre dano e tem precisão reduzida.", true);
        }
    },
    "Salamandra de Néon": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 75) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            applyPlayerDebuff("chama_neon", 0, 2);
            applyPlayerDebuff("agilidade", 2, 2);
            addMessage("A Salamandra lança chamas neon! Você sofre dano, perde agilidade e começa a queimar.", true);
        }
    },
    "Olho Vigilante": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            applyPlayerDebuff("precisao", 1, 2);
            addMessage("O Olho Vigilante brilha intensamente! Você sofre dano e tem precisão reduzida.", true);
        }
    },
    "Orbe Sombria": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            applyPlayerDebuff("aura_sombria", 0, 2);
            applyPlayerDebuff("defesa", 2, 2);
            addMessage("O Orbe Sombria envolve você em sombras! Sofre dano, perde defesa e tem sanidade drenada.", true);
        }
    },
    "Gárgula de Pedra": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 85) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            applyPlayerDebuff("defesa", 4, 2);
            addMessage("A Gárgula de Pedra acerta um golpe brutal! Você sofre dano e perde muita defesa.", true);
        }
    },

    // ========= BOSSES CAP 1 =========
    "Slime Sábio": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            applyPlayerDebuff("gosma_paralisante", 0, 3);
            applyPlayerDebuff("defesa", 3, 3);
            applyPlayerDebuff("agilidade", 3, 3);
            addMessage("A gosma do Slime Sábio paralisa seu corpo! Você sofre dano e fica com defesa/agilidade reduzidas.", true);
        }
    },
    "Cogumelo Ancestral": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            applyPlayerDebuff("esporos_alucinogenos", 0, 3);
            applyPlayerDebuff("precisao", 3, 3);
            applyPlayerDebuff("sanidade", 4, 3);
            addMessage("O Cogumelo Ancestral libera esporos tóxicos! Você sofre dano, perde precisão e sua sanidade é abalada.", true);
        }
    },
    "Planta Voraz": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            // Buff próprio, sem dano
            applyEnemyBuff("crescimento_selvagem", 0, 3);
            applyEnemyBuff("forca", 3, 3);
            applyEnemyBuff("agilidade", 2, 3);
            addMessage("A Planta Voraz cresce de forma selvagem! Seus atributos aumentam drasticamente.", true);
        }
    },
    "Fada Sombria": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy);
            applyPlayerDebuff("encantamento_noturno", 0, 2);
            applyPlayerDebuff("stun", 1, 1);
            applyPlayerDebuff("defesa", 2, 2);
            addMessage("A Fada Sombria te envolve em magia sombria! Você sofre dano, fica atordoado e perde defesa.", true);
        }
    },
    "Cubo de Espinhos": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 1.5); // Perfuração profunda: dano alto
            applyPlayerDebuff("perfuracao_profunda", 0, 2);
            applyPlayerDebuff("defesa", 4, 2);
            if (!gameState.debuffs["perfuracao_profunda"]) gameState.debuffs["perfuracao_profunda"] = { turns: 2 };
            addMessage("O Cubo de Espinhos desfere um golpe perfurante! Sofre muito dano, defesa é reduzida e começa a sangrar!", true);
        }
    },
    "Livro Proibido": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            applyPlayerDebuff("revelacao_proibida", 0, 3);
            applyPlayerDebuff("sanidade", 4, 3);
            applyPlayerDebuff("precisao", 3, 3);
            addMessage("O Livro Proibido revela segredos sombrios! Você sofre dano, sanidade e precisão são drasticamente reduzidas.", true);
        }
    },
    "Salamandra Radiante": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            // Buff próprio, sem dano
            applyEnemyBuff("chamas_ardentes", 0, 3);
            applyEnemyBuff("agilidade", 4, 3);
            addMessage("A Salamandra Radiante fica envolta em chamas ardentes! Sua agilidade aumenta.", true);
        }
    },
    "Olho Onisciente": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            applyPlayerDebuff("olhar_penetrante", 0, 2);
            applyPlayerDebuff("defesa", 3, 2);
            applyPlayerDebuff("precisao", 2, 2);
            addMessage("O Olho Onisciente observa sua alma! Você sofre dano, defesa e precisão caem drasticamente.", true);
        }
    },
    "Orbe Abissal": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            applyPlayerDebuff("vortice_abissal", 0, 2);
            applyPlayerDebuff("sanidade", 3, 2);
            applyPlayerDebuff("defesa", 3, 2);
            addMessage("O Orbe Abissal cria um vórtice mental! Você sofre dano, sanidade e defesa despencam.", true);
        }
    },
    "Gárgula Ancestral": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            // Buff próprio, sem dano
            applyEnemyBuff("endurecimento_ancestral", 0, 3);
            applyEnemyBuff("defesa", 4, 3);
            addMessage("A Gárgula Ancestral endurece a pele! Defesa do inimigo aumenta muito.", true);
        }
    }
};

/* =====================[ TRECHO 2: EXECUÇÃO DO COMPORTAMENTO DO INIMIGO ]===================== */

function executarComportamentoInimigo(enemy) {
    if (!enemy || !ENEMY_BEHAVIORS[enemy.name]) {
        // Fallback: ataque básico
        ataqueInimigoBasico(enemy);
        return;
    }
    ENEMY_BEHAVIORS[enemy.name](enemy);
}

window.ataqueInimigoBasico = ataqueInimigoBasico;
window.executarComportamentoInimigo = executarComportamentoInimigo;
window.ENEMY_BEHAVIORS = ENEMY_BEHAVIORS;

/* =====================[ FIM DO ARQUIVO enemyBehaviors.js ]===================== */
