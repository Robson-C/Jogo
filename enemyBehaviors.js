// enemyBehaviors.js — Define o comportamento especial de cada inimigo durante o combate (habilidades únicas, ataques especiais, buffs/debuffs aplicados), integrado ao motor de combate.

/* =====================[ TRECHO 1: HANDLERS DE COMPORTAMENTO DE INIMIGOS ]===================== */
const ENEMY_BEHAVIORS = {
    "Rato Gigante": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 65) {
            ataqueInimigoBasico(enemy);
        } else {
            let totalDano = 0;
            let esquivas = 0;
            let txt = "O rato gigante realiza duas mordidas rápidas em sequência!";
            for (let i = 0; i < 2; i++) {
                const result = calculateDamage({ ...enemy }, gameState);
                if (result.damage > 0) {
                    gameState.vida = Math.max(0, gameState.vida - result.damage);
                    totalDano += result.damage;
                } else {
                    esquivas++;
                }
            }
            if (totalDano > 0) {
                addMessage(`${txt} Você sofreu ${totalDano} de dano.`, true);
            }
            if (esquivas > 0) {
                addMessage(`Você esquivou de ${esquivas} das mordidas rápidas!`, true);
            }
        }
    },
    "Slime Sombrio": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) {
            ataqueInimigoBasico(enemy);
        } else {
            const result = calculateDamage({ ...enemy }, gameState);
            if (result.damage > 0) {
                gameState.vida = Math.max(0, gameState.vida - result.damage);
                applyPlayerDebuff("agilidade", Math.floor(gameState.agilidade * 0.2), 2);
                addMessage("O slime sombrio lança uma gelatina paralisante, deixando seus movimentos lentos! Sua agilidade foi reduzida por 2 turnos.", true);
                addMessage(`Você sofreu ${result.damage} de dano.`, true);
            } else {
                addMessage("O slime sombrio lançou uma gelatina, mas você esquivou!", true);
            }
        }
    },
    "Morcego das Sombras": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 85) {
            ataqueInimigoBasico(enemy);
        } else {
            const result = calculateDamage({ ...enemy }, gameState);
            if (result.damage > 0) {
                gameState.vida = Math.max(0, gameState.vida - result.damage);
                gameState.stunnedTurns = 1;
                addMessage("O morcego das sombras emite um grito agudo — você fica atordoado! 🌀", true);
                addMessage(`Você sofreu ${result.damage} de dano.`, true);
            } else {
                addMessage("O morcego das sombras tentou gritar, mas você esquivou!", true);
            }
        }
    },
    "Rato-Rei": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) {
            ataqueInimigoBasico(enemy, true);
        } else {
            applyEnemyBuff("forca", 4, 3);
            applyEnemyBuff("defesa", 1, 3);
            addMessage("O Rato-Rei ruge, seu corpo cresce e ele fica mais resistente! (+4 Força, +1 Defesa por 3 turnos)", true);
        }
    },
    "Aranha Cinzenta": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 80) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("agilidade", 4, 2);
            applyPlayerDebuff("defesa", 3, 2);
            gameState.debuffs["teia_pegajosa"] = { turns: 2 };
            addMessage("A Aranha Cinzenta lança uma teia pegajosa! Sua agilidade e defesa foram reduzidas por 2 turnos.", true);
        }
    },
    "Slime Luminoso": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 75) {
            ataqueInimigoBasico(enemy);
        } else {
            if (gameState.debuffs && gameState.debuffs["precisao"]) {
                applyPlayerDebuff("precisao", 0, 3);
                addMessage("O Slime Luminoso intensifica sua luz cegante! A duração do debuff de precisão aumentou.", true);
            } else {
                applyPlayerDebuff("precisao", 0, 3);
                addMessage("O Slime Luminoso libera uma luz cegante! Sua precisão foi reduzida por 3 turnos.", true);
            }
        }
    },
    "Slime Gigante": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) {
            ataqueInimigoBasico(enemy);
        } else {
            const danoBase = Math.floor(enemy.forca * 1.5);
            const dano = Math.max(1, danoBase - getPlayerDefesaAtual());
            gameState.vida = Math.max(0, gameState.vida - dano);
            gameState.stunnedTurns = 1;
            addMessage("O Slime Gigante desaba sobre você com um impacto esmagador! Você ficou atordoado! 🌀", true);
            addMessage(`Você sofreu ${dano} de dano.`, true);
        }
    },
    "Morcego Alfa": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) {
            ataqueInimigoBasico(enemy);
        } else {
            let totalDano = 0;
            let esquivas = 0;
            for (let i = 0; i < 3; i++) {
                const result = calculateDamage({ ...enemy }, gameState);
                if (result.damage > 0) {
                    gameState.vida = Math.max(0, gameState.vida - result.damage);
                    totalDano += result.damage;
                } else {
                    esquivas++;
                }
            }
            addMessage(`O Morcego Alfa executa uma chuva de mordidas! Dano total: ${totalDano}. Esquivas: ${esquivas}.`, true);
        }
    },
    "Aranha Rainha": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 60) {
            ataqueInimigoBasico(enemy);
        } else {
            const result = calculateDamage({ ...enemy }, gameState);
            if (result.damage > 0) {
                gameState.vida = Math.max(0, gameState.vida - result.damage);
                applyPlayerDebuff("forca", 3, 2);
                addMessage("A Aranha Rainha injeta veneno letárgico! Sua força foi reduzida por 2 turnos.", true);
                addMessage(`Você sofreu ${result.damage} de dano.`, true);
            } else {
                addMessage("A Aranha Rainha tentou atacar, mas você esquivou!", true);
            }
        }
    },
    "Gosma Reluzente": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) {
            ataqueInimigoBasico(enemy);
        } else {
            if (enemy.vida < enemy.maxVida / 2) {
                const cura = Math.floor((enemy.maxVida - enemy.vida) * 0.3);
                enemy.vida = Math.min(enemy.maxVida, enemy.vida + cura);
                addMessage(`A Gosma Reluzente regenera parte do seu corpo! Recupera ${cura} de Vida.`, true);
            } else {
                ataqueInimigoBasico(enemy);
            }
        }
    },
    "Horda de Ratos": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 60) {
            ataqueInimigoBasico(enemy);
        } else {
            let totalDano = 0;
            let esquivas = 0;
            for (let i = 0; i < 4; i++) {
                const ataque = { ...enemy, forca: Math.floor(enemy.forca * 0.7) };
                const result = calculateDamage(ataque, gameState);
                if (result.damage > 0) {
                    gameState.vida = Math.max(0, gameState.vida - result.damage);
                    totalDano += result.damage;
                } else {
                    esquivas++;
                }
            }
            addMessage(`A Horda de Ratos avança em enxame! Dano total: ${totalDano}. Esquivas: ${esquivas}.`, true);
        }
    },
    "Slime Abissal": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) {
            ataqueInimigoBasico(enemy);
        } else {
            const result = calculateDamage({ ...enemy }, gameState);
            if (result.damage > 0) {
                gameState.vida = Math.max(0, gameState.vida - result.damage);
                applyPlayerDebuff("defesa", 4, 3);
                addMessage("O Slime Abissal expele uma onda corrosiva! Sua defesa foi reduzida por 3 turnos.", true);
                addMessage(`Você sofreu ${result.damage} de dano.`, true);
            } else {
                addMessage("O Slime Abissal atacou, mas você esquivou!", true);
            }
        }
    },
    "Morcego Vampiro": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 70) {
            ataqueInimigoBasico(enemy);
        } else {
            const result = calculateDamage({ ...enemy }, gameState);
            if (result.damage > 0) {
                gameState.vida = Math.max(0, gameState.vida - result.damage);
                const cura = result.damage * 3;
                enemy.vida = Math.min(enemy.maxVida, enemy.vida + cura);
                addMessage("O Morcego Vampiro morde e suga sua energia vital!", true);
                addMessage(`Você sofreu ${result.damage} de dano. O morcego recuperou ${cura} de Vida.`, true);
            } else {
                addMessage("O Morcego Vampiro tentou morder, mas você esquivou!", true);
            }
        }
    },
    "Aracnídeo Sombrio": function(enemy) {
        const roll = Math.random() * 100;
        if (roll < 60) {
            ataqueInimigoBasico(enemy);
        } else {
            applyPlayerDebuff("veneno", 1, 3);
            addMessage("O Aracnídeo Sombrio injeta um veneno profundo! Você sofrerá dano contínuo por 3 turnos.", true);
        }
    },
    "Coruja Anciã": function(enemy) {
        if (Math.random() < 0.2 && typeof CORUJA_ANCIÃ_PHRASES !== 'undefined') {
            const frase = CORUJA_ANCIÃ_PHRASES[Math.floor(Math.random() * CORUJA_ANCIÃ_PHRASES.length)];
            addMessage(`Coruja Anciã: "${frase}"`, true);
        }
        const roll = Math.random() * 100;
        if (roll < 60) {
            ataqueInimigoBasico(enemy);
        } else if (roll < 80) {
            const result = calculateDamage({ ...enemy }, gameState);
            if (result.damage > 0) {
                gameState.sanity = Math.max(0, gameState.sanity - result.damage);
                addMessage("A Coruja Anciã foca seu olhar hipnótico — sua sanidade é abalada!", true);
                addMessage(`Você perdeu ${result.damage} de sanidade.`, true);
            } else {
                addMessage("Você resiste ao olhar hipnótico da Coruja Anciã!", true);
            }
        } else {
            applyEnemyBuff("agilidade", 8, 4);
            addMessage("A Coruja Anciã alça voo e se move rapidamente pelo campo! Sua agilidade aumentou por 4 turnos.", true);
            updateStatus();
        }
    }
    // Adicione outros inimigos especiais aqui conforme necessário
};

/* =====================[ TRECHO 2: EXPORTAÇÃO GLOBAL ]===================== */
window.ENEMY_BEHAVIORS = ENEMY_BEHAVIORS;

/* =====================[ FIM DO ARQUIVO enemyBehaviors.js ]===================== */
