import { iniciarExploracao } from './rooms.js';
import { updateUIStatus } from './ui.js';
import { resetPlayer } from './player.js';

const exploreButton = document.getElementById('explore-button');

function iniciarJogo() {
    resetPlayer();
    updateUIStatus();
    exploreButton.textContent = '🔎 Explorar';
    exploreButton.onclick = iniciarExploracao;
}

export function finalizarJogo(mensagem) {
    addToHistory(mensagem);
    forcarGameOver();
}

function forcarGameOver() {
    const optionButtons = document.querySelectorAll('#options-panel button');
    optionButtons.forEach(btn => {
        btn.disabled = true;
        btn.onclick = null;
    });
    
    exploreButton.textContent = '🔁 Jogar Novamente';
    exploreButton.disabled = false;
    exploreButton.onclick = () => {
        location.reload();
    };
}

export function addToHistory(text) {
    const historyPanel = document.getElementById('history-panel');
    const newParagraph = document.createElement('p');
    newParagraph.textContent = text;
    historyPanel.appendChild(newParagraph);
    historyPanel.scrollTop = historyPanel.scrollHeight;
}

iniciarJogo();
// Registra o service worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('SW registrado com sucesso:', registration.scope);
        
        // Verifica atualizações a cada 60 segundos
        setInterval(() => {
          registration.update();
        }, 60000);
      })
      .catch(error => {
        console.log('Falha no registro do SW:', error);
      });
  });
}
// Adiciona botão para forçar atualização
navigator.serviceWorker.ready.then(registration => {
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed') {
        if (confirm('Nova versão disponível! Atualizar agora?')) {
          window.location.reload();
        }
      }
    });
  });
});