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
const ENEMY_BEHAVIORS_COMUM_CAP3 = {
    "Globin pequeno": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("truque_sujo", { agilidade: 3, precisao: 3 }, 2);
            addMessage("O Globin pequeno atira areia nos seus olhos! Você fica mais lento e sua mira se perde.");
        }
    },
    "Marionete viva": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("fios_enrolados", { agilidade: 3, energia: 10, stun: 1 }, 2);
            addMessage("Fios presos aos seus membros limitam seus movimentos! Você perde agilidade e energia.");
        }
    },
    "Harpia": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("canto_hipnotico", { sanidade: 8, defesa: 4 }, 2);
            addMessage("O canto da Harpia ecoa na sua mente, abalando sua defesa e sua sanidade.");
        }
    },
    "Esqueleto de armadura": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("reflexo_imortal", { forca: 4 }, 2);
            applyEnemyBuff("buff_defesa_inimigo", 5, 2);
            addMessage("A armadura brilha e seu ataque perde força! O esqueleto se torna mais resistente.");
        }
    },
    "Orc costurado": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("costura_cruel", { sangramento: 4, defesa: 3, agilidade: 3 }, 3);
            addMessage("O Orc costurado abre feridas profundas, fazendo você sangrar e enfraquecendo sua defesa e agilidade.");
        }
    },
    "Anjo de barro": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("terra_perturbadora", { sanidade: 8, energia: 12 }, 2);
            addMessage("Uma onda de energia mágica drena sua energia vital e abala sua mente.");
        }
    },
    "Troll": function(enemy) {
        // Buff passivo: Regeneração Selvagem (aplica no início do combate se não tiver)
        if (!enemy.buffs || !enemy.buffs.regeneracao_selvagem) {
            applyEnemyBuff("regeneracao_selvagem", 5, 999); // 5 HP/turno, até morrer
        }
        const roll = Math.random() * 100;
        if (roll < 75) {
            ataqueInimigoBasico(enemy);
        } else {
            applyEnemyBuff("buff_forca_inimigo", 4, 2);
            addMessage("O Troll entra em fúria, seus músculos se expandem de pura força!");
        }
    },
    "Ogro de Crista": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            applyEnemyBuff("poder_brutal", { buff_forca_inimigo: 4, buff_defesa_inimigo: 6 }, 3);
            addMessage("O Ogro de Crista ruge e sua crista se ilumina! Ele fica mais forte e muito mais resistente.");
        }
    },
    "Minotauro": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) {
            ataqueInimigoBasico(enemy, 1.6); // dano aumentado em 60%
            addMessage("O Minotauro avança em investida brutal, desferindo um golpe devastador!");
            // Depois do golpe, buffa a si mesmo
            applyEnemyBuff("investida_furiosa", { buff_forca_inimigo: 5, buff_precisao_inimigo: 5 }, 3);
        } else {
            ataqueInimigoBasico(enemy);
        }
    },
    "Golem de Aço": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            applyEnemyBuff("buff_defesa_inimigo", 7, 3);
            applyPlayerDebuff("precisao", 4, 2);
            addMessage("A carapaça do Golem brilha e reflete a luz, dificultando sua mira e tornando-o quase impenetrável.");
        }
    }
};
/* =====================[ FIM TRECHO 6 ]===================== */

/* =====================[ TRECHO 7: ENEMY_BEHAVIORS_CHEFE_CAP3 ]===================== */
const ENEMY_BEHAVIORS_CHEFE_CAP3 = {
    "Globin Sanguinário": function(enemy) {
        if (!enemy._specialUsed && enemy.vida <= enemy.maxVida / 2) {
            enemy._specialUsed = true;
            applyEnemyBuff("poder_brutal", { buff_forca_inimigo: 8, buff_defesa_inimigo: 10 }, 4);
            addMessage("O Globin Sanguinário entra em frenesi, seu corpo brilha com pura fúria!", true);
            return;
        }
        const roll = Math.random() * 100;
        if (roll < 30) {
            applyPlayerDebuff("costura_cruel", { sangramento: 7, defesa: 4, agilidade: 4 }, 3);
            addMessage("O Globin Sanguinário abre cortes profundos, drenando seu sangue e agilidade!");
        } else {
            ataqueInimigoBasico(enemy);
        }
    },

    "Marionete Possessa": function(enemy) {
        if (!enemy._specialUsed && enemy.vida <= enemy.maxVida / 2) {
            enemy._specialUsed = true;
            applyPlayerDebuff("costura_cruel", { sangramento: 7, agilidade: 5, defesa: 5 }, 4);
            addMessage("A Marionete Possessa transpassa seus fios pela carne, causando sangramento profundo!", true);
            return;
        }
        const roll = Math.random() * 100;
        if (roll < 30) {
            applyPlayerDebuff("fios_enrolados", { agilidade: 4, energia: 20, stun: 1 }, 3);
            addMessage("Fios amaldiçoados drenam sua energia e prendem seus membros, dificultando qualquer reação!");
        } else {
            ataqueInimigoBasico(enemy);
        }
    },

    "Harpia Tempestuosa": function(enemy) {
        if (!enemy._specialUsed && enemy.vida <= enemy.maxVida / 2) {
            enemy._specialUsed = true;
            applyPlayerDebuff("eco_sombrio", { stun: 2, agilidade: 6, precisao: 7 }, 4);
            addMessage("Uma onda sonora distorce seus sentidos, te paralisando!", true);
            return;
        }
        const roll = Math.random() * 100;
        if (roll < 30) {
            applyPlayerDebuff("canto_hipnotico", { sanidade: 12, defesa: 6 }, 3);
            addMessage("O canto da Harpia ecoa, perturbando sua mente e defesa!");
        } else {
            ataqueInimigoBasico(enemy);
        }
    },

    "Esqueleto Imortal": function(enemy) {
        if (!enemy._specialUsed && enemy.vida <= enemy.maxVida / 2) {
            enemy._specialUsed = true;
            applyEnemyBuff("regeneracao_selvagem", 15, 3);
            addMessage("O Esqueleto Imortal se reconstitui com magia negra!", true);
            return;
        }
        const roll = Math.random() * 100;
        if (roll < 30) {
            applyPlayerDebuff("reflexo_imortal", { forca: 7 }, 3);
            applyEnemyBuff("buff_defesa_inimigo", 10, 3);
            addMessage("O Esqueleto reflete seus golpes, tornando-se quase invulnerável!");
        } else {
            ataqueInimigoBasico(enemy);
        }
    },

    "Orc Abominável": function(enemy) {
        if (!enemy._specialUsed && enemy.vida <= enemy.maxVida / 2) {
            enemy._specialUsed = true;
            applyPlayerDebuff("mordida_adeus", 8, 6);
            addMessage("O corte do Orc Abominável injeta toxinas letais de sua arma em seu corpo!", true);
            return;
        }
        const roll = Math.random() * 100;
        if (roll < 30) {
            applyPlayerDebuff("costura_cruel", { sangramento: 8, defesa: 6, agilidade: 5 }, 3);
            addMessage("O Orc Abominável desfere cortes venenosos com sua lâmina, fazendo o sangue escorrer!");
        } else {
            ataqueInimigoBasico(enemy);
        }
    },

    "Anjo Maculado": function(enemy) {
        if (!enemy._specialUsed && enemy.vida <= enemy.maxVida / 2) {
            enemy._specialUsed = true;
            applyPlayerDebuff("revelacao_proibida", { sanidade: 10, precisao: 7 }, 5);
            addMessage("Visões proibidas invadem sua mente, bagunçando sua percepção!", true);
            return;
        }
        const roll = Math.random() * 100;
        if (roll < 30) {
            applyPlayerDebuff("terra_perturbadora", { sanidade: 16, energia: 22 }, 3);
            addMessage("O Anjo Maculado suga sua sanidade e energia com um olhar vazio!");
        } else {
            ataqueInimigoBasico(enemy);
        }
    },

    "Troll Voraz": function(enemy) {
        if (!enemy._specialUsed && enemy.vida <= enemy.maxVida / 2) {
            enemy._specialUsed = true;
            applyEnemyBuff("buff_forca_inimigo", 10, 5);
            applyEnemyBuff("buff_defesa_inimigo", 10, 5);
            addMessage("O Troll Voraz entra em fúria, seus músculos e sua pele endurecem monstruosamente!", true);
            return;
        }
        const roll = Math.random() * 100;
        if (roll < 30) {
            if (!enemy.buffs) enemy.buffs = {};
            if (enemy.buffs.regeneracao_selvagem && enemy.buffs.regeneracao_selvagem.turns > 0) {
                enemy.buffs.regeneracao_selvagem.turns += 4;
            } else {
                applyEnemyBuff("regeneracao_selvagem", 12, 4);
            }
            addMessage("O Troll se regenera rapidamente, suas feridas se fecham diante dos seus olhos!");
        } else {
            ataqueInimigoBasico(enemy);
        }
    },

    "Ogro Brutal": function(enemy) {
        if (!enemy._specialUsed && enemy.vida <= enemy.maxVida / 2) {
            enemy._specialUsed = true;
            applyPlayerDebuff("golpe_perfurante", { sangramento: 9, defesa: 9 }, 4);
            addMessage("Um golpe profundo faz seu sangue jorrar e suas defesas caírem!", true);
            return;
        }
        const roll = Math.random() * 100;
        if (roll < 30) {
            applyEnemyBuff("poder_brutal", { buff_forca_inimigo: 10, buff_defesa_inimigo: 12 }, 4);
            addMessage("O Ogro brutaliza seu corpo, tornando-se quase invencível!");
        } else {
            ataqueInimigoBasico(enemy);
        }
    },

    "Minotauro Labiríntico": function(enemy) {
        if (!enemy._specialUsed && enemy.vida <= enemy.maxVida / 2) {
            enemy._specialUsed = true;
            applyPlayerDebuff("labirinto_mental", { sanidade: 15, agilidade: 8, precisao: 8 }, 4);
            addMessage("O Minotauro faz você se perder na própria mente!", true);
            return;
        }
        const roll = Math.random() * 100;
        if (roll < 30) {
            applyEnemyBuff("investida_furiosa", { buff_forca_inimigo: 10, buff_precisao_inimigo: 10 }, 4);
            addMessage("O Minotauro prepara uma investida devastadora!");
        } else {
            ataqueInimigoBasico(enemy);
        }
    },

    "Golem Colossal": function(enemy) {
        if (!enemy._specialUsed && enemy.vida <= enemy.maxVida / 2) {
            enemy._specialUsed = true;
            applyPlayerDebuff("stun", 2, 2);
            applyPlayerDebuff("defesa", 12, 4);
            addMessage("O Golem esmaga você no chão, impossibilitando reação e quebrando sua guarda!", true);
            return;
        }
        const roll = Math.random() * 100;
        if (roll < 30) {
            applyEnemyBuff("endurecimento_ancestral", 18, 4);
            addMessage("O Golem Colossal se torna praticamente indestrutível!");
        } else {
            ataqueInimigoBasico(enemy);
        }
    }
};
/* =====================[ FIM TRECHO 7 ]===================== */

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
