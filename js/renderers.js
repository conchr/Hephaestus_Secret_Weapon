/* ============================================================================
   renderers.js — renderStage, renderHints, inspectRing, renderShieldPills,
                   renderCodex, updateShieldSVG
   ============================================================================ */

function updateShieldSVG() {
    for (let i = 0; i < 5; i++) {
        const el = document.getElementById(`svg-ring-${i}`);
        if (!el) continue;
        el.classList.remove('locked', 'active', 'unlocked');
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        const st = getActiveStages()[i];
        const ringStatus = state.unlockedRings[i]
            ? 'σφυρηλατημένος'
            : (i === state.currentStageIdx ? 'τρέχων κύκλος' : 'κλειδωμένος');
        el.setAttribute('aria-label', `${st.shortTitle}: ${st.title} — ${ringStatus}`);
        el.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inspectRing(i); }
        };
        if (state.unlockedRings[i]) el.classList.add('unlocked');
        else if (i === state.currentStageIdx) el.classList.add('active');
        else el.classList.add('locked');
    }
    const completed = state.unlockedRings.filter(Boolean).length;
    const hp = document.getElementById('header-progress-text');
    const progressLabel = `${completed} / 5`;
    if (hp && hp.textContent.trim() !== progressLabel) hp.textContent = progressLabel;
    const sl = document.getElementById('shield-status-label');
    if (sl) {
        sl.textContent = completed === 5
            ? 'Πλήρης Σφυρηλάτηση'
            : `Κύκλος ${state.currentStageIdx + 1}/5 · ${completed} ολοκληρωμένοι`;
    }
}

function renderShieldPills() {
    const container = document.getElementById('ring-pills');
    if (!container) return;
    const stages = getActiveStages();
    container.innerHTML = stages.map((st, idx) => {
        const isUnlocked = state.unlockedRings[idx];
        const isCurrent = idx === state.currentStageIdx;
        const isAccessible = isUnlocked || isCurrent || (idx > 0 && state.unlockedRings[idx - 1]);
        let classes = 'py-1.5 px-1 rounded-lg text-[11px] font-medium border text-center transition ';
        if (isUnlocked) classes += 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] cursor-pointer';
        else if (isAccessible) classes += 'bg-[#C84B31]/20 border-[#C84B31] text-[#EFECE6] cursor-pointer';
        else classes += 'bg-[#12100E] border-[#3D352E] text-[#B8AFA1]/50 cursor-not-allowed';
        const status = isUnlocked ? 'σφυρηλατημένος' : isCurrent ? 'τρέχων' : isAccessible ? 'διαθέσιμος' : 'κλειδωμένος';
        return `<button type="button" onclick="selectStageTab(${idx})" class="${classes}" aria-controls="stage-container" aria-label="${st.shortTitle} — ${status}" ${isCurrent ? 'aria-current="step"' : ''}>${st.shortTitle}</button>`;
    }).join('');
}

function selectStageTab(idx) {
    const isAccessible = state.unlockedRings[idx] || idx === state.currentStageIdx || (idx > 0 && state.unlockedRings[idx - 1]);
    if (isAccessible) {
        playTone('click');
        renderStage(idx);
        inspectRing(idx);
    } else {
        showToast('Πρέπει πρώτα να αποκρυπτογραφήσετε τους εσωτερικούς κύκλους με τη σειρά.', 'warn');
    }
}

function inspectRing(idx) {
    const box = document.getElementById('ring-inspector-box');
    if (!box) return;
    const st = getActiveStages()[idx];
    if (!state.unlockedRings[idx] && idx !== state.currentStageIdx) {
        box.innerHTML = `<span class="text-[#B8AFA1] font-semibold block mb-1">Κλειδωμένος Κύκλος (${st.shortTitle}):</span>Απαιτείται πρώτα η αποκρυπτογράφηση των προηγούμενων ομόκεντρων ζωνών.`;
        return;
    }
    box.innerHTML = `
        <span class="text-[#D4AF37] font-semibold block mb-1">${st.title}</span>
        <span class="text-[#CD7F32] block mb-1">Μέταλλα: ${st.metal}</span>
        <p class="text-[#EFECE6]/85">${state.unlockedRings[idx] ? st.loreSummary : 'Υπό διερεύνηση... Λύστε τον γρίφο στα δεξιά για να σφυρηλατήσετε αυτόν τον κύκλο.'}</p>`;
}

function renderHintsHTML(idx) {
    const count = state.stageHintsRevealed[idx];
    if (count === 0) return '';
    const st = getActiveStages()[idx];
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `<div class="p-3 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs text-[#EFECE6]/90">
            <strong class="text-[#D4AF37]">Υπόδειξη ${i + 1}:</strong> ${st.hints[i]}
        </div>`;
    }
    return html;
}

function renderStage(idx) {
    state.currentStageIdx = idx;
    updateShieldSVG();
    renderShieldPills();
    inspectRing(idx);

    const st = getActiveStages()[idx];
    const container = document.getElementById('stage-container');
    if (!container) return;
    const isSolved = state.unlockedRings[idx];

    container.innerHTML = `
    <div class="relic-card rounded-2xl p-6 sm:p-8 fade-in">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#D4AF37]/20 pb-4 mb-5">
            <div>
                <span class="text-xs font-cinzel tracking-widest text-[#CD7F32] uppercase block mb-1">${st.subtitle}</span>
                <h2 class="font-cinzel text-xl sm:text-2xl font-bold text-[#EFECE6]" tabindex="-1">${st.title}</h2>
            </div>
            <span class="px-3 py-1 rounded-full text-xs border ${isSolved ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' : 'bg-[#27221D] border-[#D4AF37]/30 text-[#B8AFA1]'}">
                ${isSolved ? '✓ Σφυρηλατήθηκε' : st.metal}
            </span>
        </div>

        <div class="mb-5">
            <div class="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-2 flex items-center gap-2">
                <span>Ομηρικό Τεκμήριο (Ιλιάδα, Ραψωδία Σ)</span>
            </div>
            <blockquote class="font-serif-narrative italic text-sm sm:text-base text-[#EFECE6] bg-[#12100E] p-4 sm:p-5 rounded-xl border-l-4 border-[#D4AF37] leading-relaxed">
                ${st.excerpt}
            </blockquote>
        </div>

        <div class="mb-6 bg-[#27221D]/70 p-4 rounded-xl border border-[#D4AF37]/15 text-xs sm:text-sm text-[#EFECE6]/90 leading-relaxed">
            <span class="font-semibold text-[#E5C76B] block mb-1">Ιστορικό &amp; Μεταλλουργικό Πλαίσιο:</span>
            ${st.contextNote}
        </div>

        <div class="border-t border-[#D4AF37]/20 pt-5">
            <h3 class="font-cinzel text-base sm:text-lg font-bold text-[#D4AF37] mb-2">Δοκιμασία Αποκρυπτογράφησης</h3>
            <p class="text-xs sm:text-sm text-[#B8AFA1] mb-5 leading-relaxed">${st.puzzleInstruction}</p>

            <div id="puzzle-interactive-area" class="mb-6">${renderPuzzleHTML(idx)}</div>

            <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#D4AF37]/15">
                <button onclick="requestHint(${idx})" class="btn-ghost-gold px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                    <span>Υπόδειξη (${state.stageHintsRevealed[idx]}/3)</span>
                </button>
                ${isSolved
                    ? (state.unlockedRings.some(v => !v)
                        ? `<button onclick="goToNextStage(${idx})" class="btn-bronze px-6 py-2.5 rounded-xl font-cinzel font-bold text-sm tracking-wide">Επόμενος Κύκλος →</button>`
                        : `<span class="px-4 py-2.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-sm font-semibold">✓ Όλοι οι κύκλοι ολοκληρώθηκαν</span>`)
                    : `<button onclick="verifyStage(${idx})" class="btn-bronze px-6 py-2.5 rounded-xl font-cinzel font-bold text-sm tracking-wide">Σφυρηλάτηση Κύκλου</button>`}
            </div>

            <div id="hints-display-area" class="mt-4 space-y-2">${renderHintsHTML(idx)}</div>
        </div>
    </div>`;

    // Autosave σε κάθε αλλαγή που περνά από renderStage (πλοήγηση, γρίφος, υπόδειξη).
    saveProgress();
}

function goToNextStage(idx) {
    let next = idx + 1;
    while (next < 5 && state.unlockedRings[next]) next++;
    if (next >= 5) {
        const firstUnsolved = state.unlockedRings.findIndex(v => !v);
        if (firstUnsolved === -1) return;
        next = firstUnsolved;
    }
    playTone('click');
    renderStage(next);
    const container = document.getElementById('stage-container');
    if (container) {
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        container.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        const heading = container.querySelector('h2');
        if (heading) heading.focus({ preventScroll: true });
    }
}

function renderCodex() {
    const container = document.getElementById('codex-entries');
    if (!container) return;
    const stages = getActiveStages();
    container.innerHTML = stages.map((st, idx) => {
        const unlocked = state.unlockedRings[idx];
        return `<div class="p-4 rounded-xl border ${unlocked ? 'bg-[#12100E] border-[#D4AF37]/40' : 'bg-[#12100E]/50 border-[#3D352E] opacity-60'}">
            <div class="flex items-center justify-between mb-1.5">
                <span class="font-cinzel text-sm font-bold text-[#D4AF37]">${st.codexEntry.title}</span>
                <span class="text-[10px] ${unlocked ? 'text-[#4ADE80]' : 'text-[#B8AFA1]'}">${unlocked ? '✓ Διαθέσιμο' : 'Κλειδωμένο'}</span>
            </div>
            <p class="text-xs text-[#EFECE6]/85 leading-relaxed">${unlocked ? st.codexEntry.body : 'Σφυρηλατήστε τον κύκλο για να ξεκλειδώσετε αυτή την καταχώριση.'}</p>
        </div>`;
    }).join('');
}