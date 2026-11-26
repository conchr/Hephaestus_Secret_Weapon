/* ============================================================================
   audio.js — Web Audio Synthesizer για ήχους σφυρηλάτησης
   ============================================================================ */
let audioEnabled = true;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
    }
}

function playTone(type) {
    if (!audioEnabled) return;
    try {
        initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;

        if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(now); osc.stop(now + 0.08);
        } else if (type === 'error') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(110, now + 0.22);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(now); osc.stop(now + 0.25);
        } else if (type === 'unlock') {
            const freqs = [440, 659.25, 880];
            freqs.forEach((f, idx) => {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.type = 'sine';
                o.frequency.setValueAtTime(f, now + idx * 0.09);
                g.gain.setValueAtTime(0.09, now + idx * 0.09);
                g.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 1.1);
                o.connect(g); g.connect(audioCtx.destination);
                o.start(now + idx * 0.09); o.stop(now + idx * 0.09 + 1.1);
            });
        }
    } catch (e) { /* silent */ }
}

function toggleAudio() {
    audioEnabled = !audioEnabled;
    document.getElementById('sound-icon-on').classList.toggle('hidden', !audioEnabled);
    document.getElementById('sound-icon-off').classList.toggle('hidden', audioEnabled);
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) btn.setAttribute('aria-pressed', String(audioEnabled));
    if (audioEnabled) playTone('click');
}