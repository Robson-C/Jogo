/* =====================[ TRECHO 1: FUNÇÕES AUXILIARES DE ATAQUE E EXECUÇÃO ]===================== */

// Ataque básico (pode ajustar se quiser mais efeitos visuais/mensagens no futuro)
function ataqueInimigoBasico(enemy, multiplicador = 1) {
    if (!enemy) return;
    const playerDef = getPlayerDefesaAtual();
    let danoBase = Math.max(1, enemy.forca - playerDef);
    danoBase = Math.round(danoBase * multiplicador);
    gameState.vida = Math.max(0, gameState.vida - danoBase);
    addMessage(`${enemy.name} ataca e causa ${danoBase} de dano!`, true, false, "attack");
}

/* =====================[ TRECHO 2: ENEMY_BEHAVIORS_COMUM_CAP1 ]===================== */
const ENEMY_BEHAVIORS_COMUM_CAP1 = {
    "Slime Verde": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy);
            applyPlayerDebuff("veneno", 3, 2);
            addMessage("O Slime Verde expele gosma ácida! Você fica envenenado.");
        }
    },
    "Cogumelo Saltitante": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.7);
            applyPlayerDebuff("agilidade", 3, 2);
            addMessage("O Cogumelo Saltitante lança esporos, reduzindo sua agilidade.");
        }
    },
    "Planta que ri": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 75) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.7);
            // Troca para máscara composta
            applyPlayerDebuff("grilhoes_naturais", 2, 2);
            addMessage("Raízes prendem suas pernas! Força e agilidade reduzidas.");
        }
    },
    "Fada Travessa": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 75) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy);
            applyPlayerDebuff("stun", 1, 1);
            addMessage("A Fada Travessa ataca com energia mística! Você fica atordoado.");
        }
    },
    "Cubo de Gelatina": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.7);
            // Troca para máscara composta
            applyPlayerDebuff("gelatina_pegajosa", 2, 2);
            addMessage("O Cubo de Gelatina gruda em você! Agilidade e defesa reduzidas.");
        }
    },
    "Livro Falante": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.7);
            applyPlayerDebuff("precisao", 1, 2);
            addMessage("O Livro Falante entoa um feitiço! Sua precisão foi reduzida.");
        }
    },
    "Salamandra de Néon": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 75) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            // Debuff já composto, manter como está
            applyPlayerDebuff("chamas", 3, 2);
            addMessage("A Salamandra lança chamas neon! Você começa a queimar.");
        }
    },
    "Olho Vigilante": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            applyPlayerDebuff("precisao", 1, 2);
            addMessage("O Olho Vigilante brilha intensamente! Sua precisão foi reduzida.");
        }
    },
    "Orbe Sombria": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            // Troca para máscara composta
            applyPlayerDebuff("aura_sombria", { sanidade: 5, defesa: 2 }, 2);
            addMessage("O Orbe Sombria envolve você em sombras! Defesa reduzida e sua mente começa a enfraquecer.");
        }
    },
    "Gárgula de Pedra": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 85) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            applyPlayerDebuff("defesa", 4, 2);
            addMessage("A Gárgula de Pedra acerta um golpe brutal! Muita defesa reduzida.");
        }
    }
};
/* =====================[ FIM TRECHO 2 ]===================== */

/* =====================[ TRECHO 3: ENEMY_BEHAVIORS_CHEFE_CAP1 ]===================== */
const ENEMY_BEHAVIORS_CHEFE_CAP1 = {
    "Slime Sábio": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            applyPlayerDebuff("gosma_paralisante", 3, 3);
            addMessage("A gosma do Slime Sábio paralisa seu corpo! Defesa e agilidade reduzidas.");
        }
    },
    "Cogumelo Ancestral": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            applyPlayerDebuff("esporos_alucinogenos", { precisao: 3, sanidade: 4 }, 3);
            addMessage("O Cogumelo Ancestral libera esporos tóxicos! Precisão reduzida e você alucina.");
        }
    },
    "Planta Voraz": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            // Troca por máscara composta única, não aplicar buffs simples separados!
            applyEnemyBuff("crescimento_selvagem", { forca: 3, agilidade: 2 }, 3);
            addMessage("A Planta Voraz cresce de forma selvagem! Força e agilidade aumentam drasticamente.");
        }
    },
    "Fada Sombria": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy);
            applyPlayerDebuff("encantamento_noturno", { stun: 1, defesa: 2 }, 2);
            addMessage("A Fada Sombria te envolve em magia sombria! Você fica atordoado e perde defesa.");
        }
    },
    "Cubo de Espinhos": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 1.5);
            applyPlayerDebuff("golpe_perfurante", { sangramento: 5, defesa: 4 }, 2);
            addMessage("O Cubo de Espinhos desfere um golpe perfurante! Muita defesa reduzida, você começa a sangrar.");
        }
    },
    "Livro Proibido": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            applyPlayerDebuff("revelacao_proibida", { sanidade: 10, precisao: 3 }, 3);
            addMessage("O Livro Proibido revela segredos sombrios! Precisão reduzida e você delira.");
        }
    },
    "Salamandra Radiante": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            // Troca por máscara composta única
            applyEnemyBuff("chamas_ardentes", 4, 3);
            addMessage("A Salamandra Radiante fica envolta em chamas ardentes! Agilidade aumenta.");
        }
    },
    "Olho Onisciente": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            applyPlayerDebuff("olhar_penetrante", { defesa: 3, precisao: 2 }, 2);
            addMessage("O Olho Onisciente observa sua alma! Defesa e precisão caem drasticamente.");
        }
    },
    "Orbe Abissal": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 0.8);
            applyPlayerDebuff("vortice_abissal", { sanidade: 5, defesa: 3 }, 3);
            addMessage("O Orbe Abissal envolve sua mente em uma aura sombria! Defesa muito reduzida e sua sanidade é drenada.");
        }
    },
    "Gárgula Ancestral": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            // Troca por máscara composta única
            applyEnemyBuff("endurecimento_ancestral", 4, 3);
            addMessage("A Gárgula Ancestral endurece a pele! Defesa do inimigo aumenta muito.");
        }
    }
};
/* =====================[ FIM TRECHO 3 ]===================== */

/* =====================[ TRECHO 4: ENEMY_BEHAVIORS_COMUM_CAP2 ]===================== */
const ENEMY_BEHAVIORS_COMUM_CAP2 = {
    "Sapo com chifres": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 85) { // 15% especial (quebra defesa é forte)
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy);
            applyPlayerDebuff("defesa", 4, 2);
            addMessage("O Sapo com chifres acerta suas defesas! Sua defesa foi reduzida.");
        }
    },
    "Cobra Alada": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) { // 20% especial (veneno forte)
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy);
            applyPlayerDebuff("veneno", 3, 4);
            addMessage("A Cobra Alada te morde! Você fica envenenado.");
        }
    },
    "Aranha Cinzenta": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) { // 20% especial (duplo debuff)
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy);
            applyPlayerDebuff("teia_pegajosa", 3, 2);
            addMessage("A Aranha Cinzenta te envolve em teias! Defesa e agilidade reduzidas.");
        }
    },
    "Coruja de 3 olhos": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 75) { // 25% especial (precisão e sanidade moderado)
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy);
            applyPlayerDebuff("precisao", 3, 2);
            gameState.sanity = Math.max(0, gameState.sanity - 7);
            addMessage("A Coruja de 3 olhos encara você e você alucina com lembranças dolorosas! Sua precisão foi reduzida.");
        }
    },
    "Lobo de 2 cabeças": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) { // 20% especial (ataque duplo com chance de sangramento)
            ataqueInimigoBasico(enemy);
        } else {
            for (let i = 0; i < 2; i++) {
                ataqueInimigoBasico(enemy, 0.7);
                if (Math.random() < 0.25) {
                    applyPlayerDebuff("sangramento", 4);
                }
            }
            addMessage("O Lobo de 2 cabeças ataca ferozmente duas vezes! Pode causar sangramento.");
        }
    },
    "Rato gigante": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 85) { // 15% especial (sangramento)
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy);
            applyPlayerDebuff("sangramento", 4);
            addMessage("O Rato gigante te morde! Você começa a sangrar.");
        }
    },
    "Morcego de vidro": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) { // 20% especial (precisão e sanidade forte)
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy);
            applyPlayerDebuff("precisao", 5, 1);
            gameState.sanity = Math.max(0, gameState.sanity - 7);
            addMessage("O Morcego de vidro emite um grito agudo! Sua precisão é reduzida.");
        }
    },
    "Aranha Carniceira": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) { // 20% especial (sangramento + veneno)
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy);
            applyPlayerDebuff("veneno_hemorragico", 3, 3);
            addMessage("A Aranha Carniceira injeta um veneno hemorrágico! Você sangra e é envenenado ao mesmo tempo.");
        }
    },
    "Urso de boca gigante": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 85) { // 15% especial (ataque brutal)
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy, 1.3);
            addMessage("O Urso de boca gigante desfere um ataque brutal!");
        }
    },
    "Tatu com garras": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) { // 20% especial (buff de defesa)
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy);
            applyEnemyBuff("defesa", 6, 2);
            addMessage("O Tatu com garras se protege com sua carapaça! Ele ganha defesa extra.");
        }
    }
};
/* =====================[ FIM TRECHO 4 ]===================== */

/* =====================[ TRECHO 5: ENEMY_BEHAVIORS_CHEFE_CAP2 ]===================== */
const ENEMY_BEHAVIORS_CHEFE_CAP2 = {
    "Sapo de Marfim": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) { // 30% especial (buff defensivo forte)
            ataqueInimigoBasico(enemy);
        } else {
            applyEnemyBuff("defesa", 6, 3);
            addMessage("Sua pele virou marfim, parece difícil causar dano agora.");
        }
    },
    "Cobra Espectral": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) { // 35% especial (drena mana e cura vida)
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy);
            gameState.mana = Math.max(0, gameState.mana - 15);
            enemy.vida = Math.min(enemy.maxVida, enemy.vida + 15);
            addMessage("A mordida drena sua energia mágica, deixando-o exausto.");
        }
    },
    "Aranha Viúva Sombria": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) { // 35% especial (veneno duradouro, debuff no próprio chefe)
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy);
            applyPlayerDebuff("mordida_adeus", 6, 10);
            if (!enemy._forcaOriginal) enemy._forcaOriginal = enemy.forca;
            const perda = Math.round(enemy._forcaOriginal * 0.3);
            applyEnemyBuff("mordida_adeus", -perda, 10);
            addMessage(
                "Mordida de adeus! A Aranha Viúva Sombria te morde e injeta todo seu veneno mortal.<br>" +
                "Viúva Sombria está enfraquecida por ter injetado todo o veneno."
            );
        }
    },
    "Coruja Vidente": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) { // 30% especial (buff agilidade e precisão)
            ataqueInimigoBasico(enemy);
        } else {
            applyEnemyBuff("visao_futura", { agilidade: 6, precisao: 6 }, 3);
            addMessage("A coruja olha o futuro sabendo todos seus golpes.");
        }
    },
    "Lobo Calamidade": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) { // 35% especial (três ataques, chance sangramento)
            ataqueInimigoBasico(enemy);
        } else {
            for (let i = 0; i < 3; i++) {
                ataqueInimigoBasico(enemy, 0.85);
                if (Math.random() < 0.5) {
                    applyPlayerDebuff("sangramento", 5);
                }
            }
            addMessage("Investida brutal com ataques devastadores e sangramento.");
        }
    },
    "Rato Rei": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) { // 30% especial (buff força e defesa)
            ataqueInimigoBasico(enemy);
        } else {
            applyEnemyBuff("aura_real", { forca: 4, defesa: 3 }, 3);
            addMessage("O Rato Rei irradia poder e aumenta sua força e defesa.");
        }
    },
    "Morcego Prismático": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) { // 35% especial (stun + confusão)
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("eco_sombrio", { stun: 1, agilidade: 3, precisao: 3 }, 3);
            addMessage("O morcego emite um eco sombrio que desorienta e paralisa você.");
        }
    },
    "Aranha da Peste": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) { // 35% especial (veneno + sangramento)
            ataqueInimigoBasico(enemy);
        } else {
            ataqueInimigoBasico(enemy);
            applyPlayerDebuff("veneno_hemorragico", 5, 3);
            addMessage("A Aranha Peste injeta um veneno hemorrágico! Você sangra e é envenenado ao mesmo tempo.");
        }
    },
    "Urso Abissal": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) { // 30% especial (buff força, defesa, debuff agilidade/precisão)
            ataqueInimigoBasico(enemy, 1.4);
        } else {
            applyEnemyBuff("furia_abissal", { forca: 6, defesa: 4, agilidade: -2, precisao: -1 }, 4);
            addMessage("O Urso dá um rugido e entra em fúria, ficando mais forte e resistente, mas menos ágil e preciso.");
        }
    },
    "Tatu Demolidor": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) { // 35% especial (stun, agilidade e força reduzidas)
            ataqueInimigoBasico(enemy, 1.4);
        } else {
            applyPlayerDebuff("pisao_demolidor", { stun: 1, agilidade: 7, forca: 2 }, 3);
            addMessage("O Tatu pisa com força esmagadora, te atordoa e demole o chão deixando difícil estabilidade.");
        }
    }
};
/* =====================[ FIM TRECHO 5 ]===================== */

/* =====================[ TRECHO 6: ENEMY_BEHAVIORS_COMUM_CAP3 ]===================== */
// Ainda não implementado, pronto para expansão!

/* =====================[ TRECHO 7: ENEMY_BEHAVIORS_CHEFE_CAP3 ]===================== */
// Ainda não implementado, pronto para expansão!

/* =====================[ TRECHO 8: ENEMY_BEHAVIORS_COMUM_CAP4 ]===================== */
// Ainda não implementado, pronto para expansão!

/* =====================[ TRECHO 9: ENEMY_BEHAVIORS_CHEFE_CAP4 ]===================== */
// Ainda não implementado, pronto para expansão!

/* =====================[ TRECHO 10: ENEMY_BEHAVIORS_COMUM_CAP5 ]===================== */
// Ainda não implementado, pronto para expansão!

/* =====================[ TRECHO 11: ENEMY_BEHAVIORS_CHEFE_CAP5 ]===================== */
// Ainda não implementado, pronto para expansão!

/* =====================[ TRECHO 12: AGREGAÇÃO FINAL DOS CAPÍTULOS ]===================== */

const ENEMY_BEHAVIORS = Object.assign(
    {},
    ENEMY_BEHAVIORS_COMUM_CAP1,
    ENEMY_BEHAVIORS_CHEFE_CAP1,
    ENEMY_BEHAVIORS_COMUM_CAP2
    // Acrescente aqui os demais trechos conforme for implementando!
);

/* =====================[ TRECHO 13: EXECUÇÃO DO COMPORTAMENTO DO INIMIGO ]===================== */

function executarComportamentoInimigo(enemy) {
    if (!enemy || !ENEMY_BEHAVIORS[enemy.name]) {
        ataqueInimigoBasico(enemy);
        return;
    }
    ENEMY_BEHAVIORS[enemy.name](enemy);
}

window.ataqueInimigoBasico = ataqueInimigoBasico;
window.executarComportamentoInimigo = executarComportamentoInimigo;
window.ENEMY_BEHAVIORS = ENEMY_BEHAVIORS;
window.ENEMY_BEHAVIORS_COMUM_CAP1 = ENEMY_BEHAVIORS_COMUM_CAP1;
window.ENEMY_BEHAVIORS_CHEFE_CAP1 = ENEMY_BEHAVIORS_CHEFE_CAP1;
window.ENEMY_BEHAVIORS_COMUM_CAP2 = ENEMY_BEHAVIORS_COMUM_CAP2;

/* =====================[ FIM DO ARQUIVO enemyBehaviors.js ]===================== */
