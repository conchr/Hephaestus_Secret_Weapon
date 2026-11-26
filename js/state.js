/* ============================================================================
   state.js — Κεντρική κατάσταση παιχνιδιού + localStorage persistence
   ============================================================================ */
const STORAGE_KEY_PREFIX = 'hephaestus_shield_save_v2_';
const LEGACY_STORAGE_KEY = 'hephaestus_shield_save_v1';
const SAVE_VERSION = 2;
const DIFFICULTY_KEYS = ['kids', 'teens', 'adults'];

const state = {
    currentDifficulty: 'adults',
    currentStageIdx: 0,
    unlockedRings: [false, false, false, false, false],
    hintsUsedCount: 0,
    stageHintsRevealed: [0, 0, 0, 0, 0],
    startTime: null,
    elapsedSeconds: 0,
    timerInterval: null,
    isPlaying: false,
    codexUnread: false,
    // Puzzle state
    astrolabeAngle: 90,
    selectedConstellation: null,
    selectedElder: null,
    seasonMatches: { 0: '', 1: '', 2: '', 3: '' },
    danceOrder: [],
    shieldLayers: ['Χαλκός', 'Χρυσός', 'Κασσίτερος', 'Χαλκός', 'Κασσίτερος'],
    kidsMetalsSelected: { 'Χαλκός': false, 'Χρυσός': false, 'Κασσίτερος': false, 'Σίδηρος': false },
    selectedRimElement: '',
    // Feedback
    attemptCounts: [0, 0, 0, 0, 0],
};

function storageKeyFor(difficulty) {
    return `${STORAGE_KEY_PREFIX}${difficulty}`;
}

function normalizeSave(data) {
    if (!data || typeof data !== 'object' || !DIFFICULTY_KEYS.includes(data.difficulty)) return null;
    const rings = Array.isArray(data.unlockedRings) && data.unlockedRings.length === 5
        ? data.unlockedRings.map(Boolean)
        : [false, false, false, false, false];
    const hints = Array.isArray(data.stageHintsRevealed) && data.stageHintsRevealed.length === 5
        ? data.stageHintsRevealed.map(n => Math.max(0, Math.min(3, Number(n) || 0)))
        : [0, 0, 0, 0, 0];
    const attempts = Array.isArray(data.attemptCounts) && data.attemptCounts.length === 5
        ? data.attemptCounts.map(n => Math.max(0, Number(n) || 0))
        : [0, 0, 0, 0, 0];
    return {
        version: SAVE_VERSION,
        difficulty: data.difficulty,
        stageIdx: Math.max(0, Math.min(4, Number(data.stageIdx) || 0)),
        unlockedRings: rings,
        hintsUsedCount: Math.max(0, Number(data.hintsUsedCount) || 0),
        stageHintsRevealed: hints,
        elapsedSeconds: Math.max(0, Number(data.elapsedSeconds) || 0),
        attemptCounts: attempts,
        codexUnread: !!data.codexUnread,
        puzzle: data.puzzle && typeof data.puzzle === 'object' ? data.puzzle : null,
        savedAt: Number(data.savedAt) || Date.now()
    };
}

function saveProgress() {
    try {
        const snapshot = {
            version: SAVE_VERSION,
            difficulty: state.currentDifficulty,
            stageIdx: state.currentStageIdx,
            unlockedRings: [...state.unlockedRings],
            hintsUsedCount: state.hintsUsedCount,
            stageHintsRevealed: [...state.stageHintsRevealed],
            elapsedSeconds: state.elapsedSeconds,
            attemptCounts: [...state.attemptCounts],
            codexUnread: state.codexUnread,
            puzzle: {
                astrolabeAngle: state.astrolabeAngle,
                selectedConstellation: state.selectedConstellation,
                selectedElder: state.selectedElder,
                seasonMatches: { ...state.seasonMatches },
                danceOrder: state.danceOrder.map(s => ({ id: s.id, text: s.text })),
                shieldLayers: [...state.shieldLayers],
                kidsMetalsSelected: { ...state.kidsMetalsSelected },
                selectedRimElement: state.selectedRimElement
            },
            savedAt: Date.now()
        };
        localStorage.setItem(storageKeyFor(state.currentDifficulty), JSON.stringify(snapshot));
        updateResumeButton();
    } catch (e) { /* localStorage full/blocked — silent */ }
}

function loadProgress(difficulty = null) {
    try {
        if (difficulty) {
            const raw = localStorage.getItem(storageKeyFor(difficulty));
            return raw ? normalizeSave(JSON.parse(raw)) : null;
        }
        let latest = null;
        for (const diff of DIFFICULTY_KEYS) {
            const saved = loadProgress(diff);
            if (saved && (!latest || saved.savedAt > latest.savedAt)) latest = saved;
        }
        return latest;
    } catch (e) { return null; }
}

function migrateLegacySave() {
    let raw = null;
    try { raw = localStorage.getItem(LEGACY_STORAGE_KEY); } catch (e) { return; }
    if (!raw) return;
    try {
        const legacy = normalizeSave(JSON.parse(raw));
        if (legacy) {
            const key = storageKeyFor(legacy.difficulty);
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify({ ...legacy, version: SAVE_VERSION, puzzle: null }));
            }
        }
    } catch (e) { /* corrupted legacy save — ignore */ }
    try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch (e) {}
}

function clearProgress() {
    try {
        localStorage.removeItem(storageKeyFor(state.currentDifficulty));
        localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (e) {}
    updateResumeButton();
}

function hasSavedProgress() {
    return loadProgress() !== null;
}

function markCodexRead() {
    state.codexUnread = false;
    if (state.isPlaying) saveProgress();
    try {
        for (const diff of DIFFICULTY_KEYS) {
            const saved = loadProgress(diff);
            if (saved && saved.codexUnread) {
                saved.codexUnread = false;
                localStorage.setItem(storageKeyFor(diff), JSON.stringify(saved));
            }
        }
    } catch (e) {}
    if (!state.isPlaying) updateResumeButton();
}

function hasMeaningfulProgress(saved) {
    if (!saved) return false;
    const done = saved.unlockedRings.filter(Boolean).length;
    if (done > 0 || saved.stageIdx > 0 || saved.elapsedSeconds > 0 || saved.hintsUsedCount > 0) return true;

    const puzzle = saved.puzzle;
    if (!puzzle) return false;
    const defaultAngle = saved.difficulty === 'kids' ? 45 : 90;
    if (puzzle.astrolabeAngle !== undefined && Number(puzzle.astrolabeAngle) !== defaultAngle) return true;
    if (puzzle.selectedConstellation || puzzle.selectedElder || puzzle.selectedRimElement) return true;
    if (puzzle.seasonMatches && Object.values(puzzle.seasonMatches).some(Boolean)) return true;
    if (puzzle.kidsMetalsSelected && Object.values(puzzle.kidsMetalsSelected).some(Boolean)) return true;
    const defaultLayers = ['Χαλκός', 'Χρυσός', 'Κασσίτερος', 'Χαλκός', 'Κασσίτερος'];
    if (Array.isArray(puzzle.shieldLayers) && puzzle.shieldLayers.some((metal, i) => metal !== defaultLayers[i])) return true;
    return false;
}

function updateResumeButton() {
    const btn = document.getElementById('resume-btn');
    const progressText = document.getElementById('header-progress-text');
    const victoryScreen = document.getElementById('victory-screen');
    const onVictory = !!victoryScreen && !victoryScreen.classList.contains('hidden');
    // Όσο παίζουμε, η πρόοδος στο header αφορά αποκλειστικά την τρέχουσα βαθμίδα.
    if (state.isPlaying) {
        const currentLabel = `${state.unlockedRings.filter(Boolean).length} / 5`;
        if (progressText && progressText.textContent.trim() !== currentLabel) progressText.textContent = currentLabel;
        if (btn) btn.classList.add('hidden');
        return;
    }
    const saved = loadProgress();
    const done = saved ? saved.unlockedRings.filter(Boolean).length : 0;
    const savedLabel = `${done} / 5`;
    if (!onVictory && progressText && progressText.textContent.trim() !== savedLabel) progressText.textContent = savedLabel;
    if (!btn) return;
    if (!saved || !hasMeaningfulProgress(saved)) {
        btn.classList.add('hidden');
        return;
    }
    if (done >= 5) {
        btn.textContent = '▶ Ολοκλήρωση';
        btn.title = 'Προβολή της οθόνης ολοκλήρωσης';
        btn.classList.remove('hidden');
        return;
    }
    const meta = (typeof DIFFICULTY_META !== 'undefined') ? DIFFICULTY_META[saved.difficulty] : null;
    btn.textContent = `▶ Συνέχιση (${done}/5)`;
    btn.title = meta ? `Συνέχιση: ${meta.fullTitle}` : 'Συνέχιση αποθηκευμένης προόδου';
    btn.classList.remove('hidden');
}

function flushProgress() {
    if (!state.isPlaying) return;
    if (state.startTime) {
        state.elapsedSeconds = Math.max(state.elapsedSeconds, Math.floor((Date.now() - state.startTime) / 1000));
    }
    saveProgress();
}

function resumeGame() {
    const saved = loadProgress();
    if (!saved) {
        showToast('Δεν βρέθηκε αποθηκευμένη πρόοδος για συνέχιση.', 'info');
        updateResumeButton();
        return;
    }
    startGame(saved.difficulty, saved);
}

function resetStateValues() {
    state.currentStageIdx = 0;
    state.unlockedRings = [false, false, false, false, false];
    state.hintsUsedCount = 0;
    state.stageHintsRevealed = [0, 0, 0, 0, 0];
    state.attemptCounts = [0, 0, 0, 0, 0];
    // Το χρονόμετρο πρέπει να μηδενίζεται σε κάθε νέο παιχνίδι.
    state.elapsedSeconds = 0;
    state.startTime = null;
    state.isPlaying = false;
    state.codexUnread = false;
    state.astrolabeAngle = state.currentDifficulty === 'kids' ? 45 : 90;
    state.selectedConstellation = null;
    state.selectedElder = null;
    state.seasonMatches = { 0: '', 1: '', 2: '', 3: '' };
    state.shieldLayers = ['Χαλκός', 'Χρυσός', 'Κασσίτερος', 'Χαλκός', 'Κασσίτερος'];
    state.kidsMetalsSelected = { 'Χαλκός': false, 'Χρυσός': false, 'Κασσίτερος': false, 'Σίδηρος': false };
    state.selectedRimElement = '';
    initDanceOrderForDifficulty(state.currentDifficulty);
}

function restorePuzzleState(puzzle) {
    if (!puzzle || typeof puzzle !== 'object') return;
    if (puzzle.astrolabeAngle !== undefined && Number.isFinite(Number(puzzle.astrolabeAngle))) {
        state.astrolabeAngle = Number(puzzle.astrolabeAngle);
    }
    if (typeof puzzle.selectedConstellation === 'string') {
        state.selectedConstellation = puzzle.selectedConstellation;
    }
    if (typeof puzzle.selectedElder === 'string') {
        state.selectedElder = puzzle.selectedElder;
    }
    if (puzzle.seasonMatches && typeof puzzle.seasonMatches === 'object') {
        for (const key of ['0', '1', '2', '3']) {
            if (typeof puzzle.seasonMatches[key] === 'string') {
                state.seasonMatches[key] = puzzle.seasonMatches[key];
            }
        }
    }
    if (Array.isArray(puzzle.danceOrder) && puzzle.danceOrder.length === state.danceOrder.length) {
        const byId = new Map(state.danceOrder.map(step => [step.id, step]));
        const restored = puzzle.danceOrder
            .filter(step => step && typeof step.id === 'string')
            .map(step => byId.get(step.id))
            .filter(Boolean);
        if (restored.length === state.danceOrder.length) state.danceOrder = restored;
    }
    if (Array.isArray(puzzle.shieldLayers) && puzzle.shieldLayers.length === 5) {
        state.shieldLayers = puzzle.shieldLayers.map(v => typeof v === 'string' ? v : 'Χαλκός');
    }
    if (puzzle.kidsMetalsSelected && typeof puzzle.kidsMetalsSelected === 'object') {
        for (const metal of ['Χαλκός', 'Χρυσός', 'Κασσίτερος', 'Σίδηρος']) {
            state.kidsMetalsSelected[metal] = !!puzzle.kidsMetalsSelected[metal];
        }
    }
    if (typeof puzzle.selectedRimElement === 'string') {
        state.selectedRimElement = puzzle.selectedRimElement;
    }
}

function initDanceOrderForDifficulty(diff) {
    if (diff === 'kids') {
        state.danceOrder = [
            { id: 'b', text: 'Όλοι πιάνονται από τον καρπό και τρέχουν γρήγορα σε έναν τέλειο κύκλο, σαν τον τροχό του αγγειοπλάστη.' },
            { id: 'a', text: 'Ο Ήφαιστος σμιλεύει τον χορό της Κνωσού, όπως τον έφτιαξε ο Δαίδαλος για την Αριάδνη.' },
            { id: 'c', text: 'Ο κύκλος ανοίγει σε δύο αντικριστές σειρές, ενώ δύο ακροβάτες κάνουν τούμπες στο κέντρο.' }
        ];
    } else if (diff === 'teens') {
        state.danceOrder = [
            { id: 'c', text: 'Κυκλική περιστροφή των χορευτών με ταχύτητα και αρμονία όμοια με τον τροχό του κεραμέα (αγγειοπλάστη).' },
            { id: 'a', text: 'Σχεδιασμός του χορού κατά το πρότυπο εκείνου που έφτιαξε ο Δαίδαλος στην πλατιά Κνωσό για την Αριάδνη.' },
            { id: 'd', text: 'Διάλυση του κύκλου σε δύο αντικριστές σειρές που τρέχουν η μία προς την άλλη, με δύο ακροβάτες στο κέντρο.' },
            { id: 'b', text: 'Νέοι με χρυσές μάχαιρες σε ασημένιους τελαμώνες και παρθένες με λεπτές λινές οθόνες πιάνονται από τον καρπό.' }
        ];
    } else {
        state.danceOrder = [
            { id: 'c', text: 'Κυκλική περιστροφή «επί καρπώ» με ταχύτητα και συμμετρία όμοια με τον τροχό του κεραμέως.' },
            { id: 'a', text: 'Αρχιτεκτονική σύλληψη κατά το μινωικό πρότυπο του Δαιδάλου στην πλατιά Κνωσό για την καλλιπλόκαμη Αριάδνη.' },
            { id: 'e', text: 'Συγκέντρωση πλήθους θεατών γύρω από τον ιερό χορό και είσοδος δύο «κυβιστητήρων» (ακροβατών) στο κέντρο.' },
            { id: 'b', text: 'Νέοι με χρυσές μάχαιρες σε ασημένιους τελαμώνες και παρθένες με ελαιωμένες λινές οθόνες παρατάσσονται.' },
            { id: 'd', text: 'Μετάβαση από τον κλειστό κύκλο σε δύο αντικριστές σειρές («στίχας») που εφορμούν ρυθμικά η μία προς την άλλη.' }
        ];
    }
}