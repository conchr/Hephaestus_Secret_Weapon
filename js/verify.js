/* ============================================================================
   verify.js — verifyStage με ανατροφοδότηση λαθών + requestHint
   ============================================================================ */

function requestHint(idx) {
    playTone('click');
    if (state.stageHintsRevealed[idx] < 3) {
        state.stageHintsRevealed[idx]++;
        state.hintsUsedCount++;
        renderStage(idx);
        saveProgress();
    } else {
        showToast('Έχετε ήδη αποκαλύψει και τις 3 διαθέσιμες υποδείξεις για αυτόν τον κύκλο.', 'info');
    }
}

function isAnswerCorrect(idx) {
    const st = getActiveStages()[idx];
    const correct = st.correctAnswer;
    const diff = state.currentDifficulty;

    // Stage 0: constellation
    if (idx === 0) {
        const normalizedDeg = ((state.astrolabeAngle % 360) + 360) % 360;
        if (normalizedDeg !== 0) return { ok: false, reason: 'alignment' };
        return { ok: state.selectedConstellation === correct, reason: 'answer' };
    }

    // Stage 1: elder/trial
    if (idx === 1) {
        return { ok: state.selectedElder === correct, reason: 'answer' };
    }

    // Stage 2: seasons
    if (idx === 2) {
        const keys = ['0', '1', '2', '3'];
        const allFilled = keys.every(k => state.seasonMatches[k] !== '');
        if (!allFilled) return { ok: false, reason: 'incomplete' };
        const ok = keys.every(k => state.seasonMatches[k] === correct[k]);
        return { ok, reason: 'answer' };
    }

    // Stage 3: dance order
    if (idx === 3) {
        const currentIds = state.danceOrder.map(s => s.id);
        const ok = currentIds.length === correct.length && currentIds.every((id, i) => id === correct[i]);
        return { ok, reason: 'answer' };
    }

    // Stage 4: final
    if (idx === 4) {
        if (diff === 'kids') {
            const selected = Object.keys(state.kidsMetalsSelected).filter(m => state.kidsMetalsSelected[m]);
            const expected = correct.metals;
            const metalsOk = selected.length === expected.length && expected.every(m => state.kidsMetalsSelected[m]);
            const rimOk = state.selectedRimElement === correct.rim;
            if (!metalsOk || !rimOk) return { ok: false, reason: 'answer' };
            return { ok: true, reason: 'answer' };
        }
        const layersOk = correct.layers.every((m, i) => state.shieldLayers[i] === m);
        const rimOk = state.selectedRimElement === correct.rim;
        return { ok: layersOk && rimOk, reason: 'answer' };
    }

    return { ok: false, reason: 'unknown' };
}

function verifyStage(idx) {
    const st = getActiveStages()[idx];
    const result = isAnswerCorrect(idx);

    if (result.ok) {
        if (!state.unlockedRings[idx]) {
            state.unlockedRings[idx] = true;
            state.codexUnread = true;
            updateCodexBadge();
            playTone('unlock');
            showToast(`Ο κύκλος «${st.shortTitle}» σφυρηλατήθηκε επιτυχώς.`, 'success');
        } else {
            playTone('click');
            showToast('Ο κύκλος είναι ήδη σφυρηλατημένος — η απάντησή σας παραμένει σωστή.', 'info');
        }
        saveProgress();
        renderCodex();
        // Αν ολοκληρώθηκαν όλα -> victory. Αλλιώς μένουμε στον κύκλο και
        // εμφανίζεται ρητό κουμπί «Επόμενος Κύκλος» (χωρίς βίαιο auto-advance).
        if (state.unlockedRings.every(Boolean)) {
            setTimeout(() => showVictory(), 700);
        } else {
            renderStage(idx);
        }
    } else {
        // Λάθος
        state.attemptCounts[idx] = (state.attemptCounts[idx] || 0) + 1;
        saveProgress();
        playTone('error');
        const container = document.getElementById('stage-container');
        if (container) {
            container.classList.add('shake');
            setTimeout(() => container.classList.remove('shake'), 500);
        }

        let msg = 'Η απάντηση δεν είναι σωστή. ';
        if (result.reason === 'alignment') {
            msg = 'Πρώτα στρίψε τον τροχό! Το κίτρινο βελάκι πρέπει να δείχνει στον ΒΟΡΡΑ ↑.';
        } else if (result.reason === 'incomplete') {
            msg += 'Συμπληρώστε όλες τις επιλογές πριν υποβάλετε.';
        } else {
            msg += st.wrongExplanation || 'Δοκιμάστε ξανά με βάση το ομηρικό κείμενο.';
        }
        showToast(msg, 'error');

        // Αν έφτασε 3 αποτυχίες, αποκάλυψε αυτόματα την 1η υπόδειξη
        if (state.attemptCounts[idx] >= 3 && state.stageHintsRevealed[idx] === 0) {
            state.stageHintsRevealed[idx] = 1;
            state.hintsUsedCount++;
            renderStage(idx);
            setTimeout(() => showToast('Αποκαλύφθηκε αυτόματα η πρώτη υπόδειξη.', 'info'), 400);
        }
    }
}