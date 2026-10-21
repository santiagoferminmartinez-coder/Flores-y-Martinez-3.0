const ambientBtn = document.getElementById('ambientBtn');
const sweetBtn = document.getElementById('sweetBtn');
const trickBtn = document.getElementById('trickBtn');
const screamer = document.getElementById('screamer');
const closeScreamer = document.getElementById('closeScreamer');
const choiceHint = document.getElementById('choiceHint');

let audioContext = null;
let ambientOscillators = [];
let ambientGain = null;
let ambientOn = false;

function getAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      choiceHint.textContent = 'Tu navegador no permite generar sonido. Probá con otro navegador.';
      return null;
    }
    audioContext = new AudioCtx();
  }
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

// Ambiente tenebroso generado por el navegador: no necesita descargar archivos de audio.
function startAmbient() {
  const ctx = getAudioContext();
  if (!ctx) return;
  stopAmbient();
  ambientGain = ctx.createGain();
  ambientGain.gain.value = 0.035;
  ambientGain.connect(ctx.destination);

  const low = ctx.createOscillator();
  low.type = 'sawtooth';
  low.frequency.value = 48;
  const lowGain = ctx.createGain();
  lowGain.gain.value = 0.25;
  low.connect(lowGain).connect(ambientGain);
  low.start();

  const eerie = ctx.createOscillator();
  eerie.type = 'sine';
  eerie.frequency.value = 110;
  const eerieGain = ctx.createGain();
  eerieGain.gain.value = 0.22;
  eerie.connect(eerieGain).connect(ambientGain);
  eerie.start();

  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.13;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 30;
  lfo.connect(lfoGain).connect(eerie.frequency);
  lfo.start();

  ambientOscillators = [low, eerie, lfo];
  ambientOn = true;
  ambientBtn.textContent = '♫ Apagar ambiente';
  ambientBtn.setAttribute('aria-pressed', 'true');
}
function stopAmbient() {
  ambientOscillators.forEach(osc => { try { osc.stop(); } catch (_) {} });
  ambientOscillators = [];
  if (ambientGain) {
    try { ambientGain.disconnect(); } catch (_) {}
    ambientGain = null;
  }
  ambientOn = false;
  if (ambientBtn) {
    ambientBtn.textContent = '♫ Activar ambiente';
    ambientBtn.setAttribute('aria-pressed', 'false');
  }
}
ambientBtn.addEventListener('click', () => ambientOn ? stopAmbient() : startAmbient());

function playScreamSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  // Efecto agudo y breve, sintetizado. El navegador exige una acción del usuario para reproducirlo.
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(0.24, ctx.currentTime + 0.035);
  master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.25);
  master.connect(ctx.destination);

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(950, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.32);
  osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.58);
  osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 1.1);
  osc.connect(master);
  osc.start();
  osc.stop(ctx.currentTime + 1.3);

  // Ruido sintético para dar un efecto áspero de susto.
  const bufferSize = Math.floor(ctx.sampleRate * 0.7);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.11, ctx.currentTime + 0.025);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7);
  noise.connect(noiseGain).connect(ctx.destination);
  noise.start();
}

sweetBtn.addEventListener('click', () => {
  choiceHint.textContent = '🍬 Encontraste dulces… por esta vez, la oscuridad te deja ir.';
  choiceHint.classList.add('sweet-message');
});
trickBtn.addEventListener('click', () => {
  choiceHint.textContent = 'Elegiste el truco. No cierres los ojos.';
  screamer.classList.add('active');
  screamer.setAttribute('aria-hidden', 'false');
  playScreamSound();
});
function dismissScreamer() {
  screamer.classList.remove('active');
  screamer.setAttribute('aria-hidden', 'true');
  choiceHint.textContent = 'Ahora sí… volvé cuando tengas más valor.';
}
closeScreamer.addEventListener('click', dismissScreamer);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && screamer.classList.contains('active')) dismissScreamer();
});
// ===== EFECTO ESPECIAL AL ELEGIR DULCE =====

document.addEventListener("click", function (evento) {
    const boton = evento.target.closest("button, a");

    if (!boton) return;

    // Detecta el botón o enlace que dice DULCE
    if (!boton.textContent.trim().toLowerCase().includes("dulce")) {
        return;
    }

    // Evita repetir la animación si ya está activa
    if (document.querySelector(".dulce-overlay")) return;

    const overlay = document.createElement("div");
    overlay.className = "dulce-overlay";

    const mensaje = document.createElement("div");
    mensaje.className = "dulce-mensaje";
    mensaje.innerHTML = `
        🍬 ¡DULCE O MAGIA! 🎃
        <small>¡La noche te regala una sorpresa!</small>
    `;

    overlay.appendChild(mensaje);
    document.body.appendChild(overlay);

    // Caramelos, calabazas y fantasmitas cayendo
    const emojis = ["🍬", "🍭", "🎃", "👻", "🍫", "🦇", "✨"];

    for (let i = 0; i < 35; i++) {
        const caramelo = document.createElement("span");
        caramelo.className = "dulce-caramelo";
        caramelo.textContent =
            emojis[Math.floor(Math.random() * emojis.length)];

        caramelo.style.left = Math.random() * 100 + "%";
        caramelo.style.animationDuration =
            (2 + Math.random() * 3) + "s";
        caramelo.style.animationDelay =
            (Math.random() * 1.5) + "s";

        overlay.appendChild(caramelo);
    }

    // La animación desaparece y permite seguir usando la página
    setTimeout(() => {
        overlay.remove();
    }, 5500);
});
// ===== AMBIENTE TÉTRICO DE TODA LA PÁGINA =====

const ambiente = document.getElementById("sonidoAmbiente");
const susurros = document.getElementById("sonidoSusurros");
const botonSonido = document.getElementById("botonSonido");

if (ambiente && botonSonido) {
    ambiente.volume = 0.25;

    botonSonido.addEventListener("click", async () => {
        if (ambiente.paused) {
            try {
                await ambiente.play();

                botonSonido.textContent = "🔊 SILENCIAR AMBIENTE";
                botonSonido.setAttribute("aria-pressed", "true");

                if (susurros) {
                    susurros.volume = 0.35;
                    susurros.play().catch(() => {});
                }
            } catch (error) {
                botonSonido.textContent = "⚠️ VOLVER A INTENTAR";
            }
        } else {
            ambiente.pause();

            if (susurros) {
                susurros.pause();
                susurros.currentTime = 0;
            }

            botonSonido.textContent = "🔇 ACTIVAR AMBIENTE";
            botonSonido.setAttribute("aria-pressed", "false");
        }
    });
}