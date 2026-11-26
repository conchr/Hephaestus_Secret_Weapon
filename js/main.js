/* ============================================================================
   main.js — DIFFICULTY_META, startGame, init
   ============================================================================ */
const DIFFICULTY_META = {
    kids:   { id: 'kids',   badge: 'Μαθητευόμενοι (10–13)', fullTitle: 'Επίπεδο Ι: Μαθητευόμενοι του Ηφαίστου (10–13 ετών)', rankSuccess: 'Αριστούχος Μαθητευόμενος του Ηφαίστου', rankGood: 'Εξερευνητής της Ομηρικής Ασπίδας' },
    teens:  { id: 'teens',  badge: 'Ερευνητές (14–18)',    fullTitle: 'Επίπεδο ΙΙ: Ερευνητές του Ομήρου (14–18 ετών)',      rankSuccess: 'Διακεκριμένος Ερευνητής του Ομήρου',       rankGood: 'Μελετητής της Αρχαίας Μεταλλουργίας' },
    adults: { id: 'adults', badge: 'Μύστες (Ενήλικες)',     fullTitle: 'Επίπεδο ΙΙΙ: Μύστες του Εργαστηρίου (Ενήλικες)',      rankSuccess: 'Κορυφαίος Ομηριστής & Μεταλλουργός',      rankGood: 'Αρχιτεχνίτης της Ηφαιστότευκτης Ασπίδας' }
};

function startGame(difficultyKey = 'adults', savedData = null) {
    state.currentDifficulty = difficultyKey;
    playTone('unlock');
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('victory-screen').classList.add('hidden');
    document.getElementById('game-workspace').classList.remove('hidden');
    document.getElementById('change-level-btn').classList.remove('hidden');

    const meta = DIFFICULTY_META[state.currentDifficulty];
    document.getElementById('header-level-label').textContent = meta.badge;
    document.getElementById('header-subtitle').textContent = meta.fullTitle;

    resetStateValues();
    state.isPlaying = true;

    if (savedData) {
        state.currentStageIdx = Math.max(0, Math.min(4, Number(savedData.stageIdx) || 0));
        state.unlockedRings = Array.isArray(savedData.unlockedRings) && savedData.unlockedRings.length === 5
            ? savedData.unlockedRings.map(Boolean)
            : [false, false, false, false, false];
        state.hintsUsedCount = Math.max(0, Number(savedData.hintsUsedCount) || 0);
        state.stageHintsRevealed = Array.isArray(savedData.stageHintsRevealed) && savedData.stageHintsRevealed.length === 5
            ? savedData.stageHintsRevealed.map(n => Math.max(0, Math.min(3, Number(n) || 0)))
            : [0, 0, 0, 0, 0];
        state.elapsedSeconds = Math.max(0, Number(savedData.elapsedSeconds) || 0);
        state.attemptCounts = Array.isArray(savedData.attemptCounts) && savedData.attemptCounts.length === 5
            ? savedData.attemptCounts.map(n => Math.max(0, Number(n) || 0))
            : [0, 0, 0, 0, 0];
        state.codexUnread = !!savedData.codexUnread;
        restorePuzzleState(savedData.puzzle);
    }

    clearInterval(state.timerInterval);
    state.startTime = Date.now() - (state.elapsedSeconds * 1000);
    state.timerInterval = setInterval(() => {
        state.elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
    }, 1000);

    // Αν το save είχε ήδη ολοκληρωθεί (π.χ. έκλεισε το tab στο 700ms του victory),
    // δείξε απευθείας την οθόνη ολοκλήρωσης.
    if (savedData && state.unlockedRings.every(Boolean)) {
        showVictory();
        return;
    }

    // Άνοιξε το πρώτο μη-ολοκληρωμένο stage
    const startIdx = savedData ? state.currentStageIdx : 0;

    updateShieldSVG();
    renderShieldPills();
    renderCodex();
    updateCodexBadge();
    renderStage(startIdx);
    saveProgress();
}

function init() {
    migrateLegacySave();
    updateResumeButton();
    updateCodexBadge();
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const drawer = document.getElementById('codex-drawer');
            if (drawer && !drawer.classList.contains('hidden')) toggleCodex();
        }
    });
    window.addEventListener('pagehide', flushProgress);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flushProgress();
    });
}

document.addEventListener('DOMContentLoaded', init);