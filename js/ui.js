/* ============================================================================
   ui.js — Toast, Modal (Κανόνας 2: όχι alert/confirm), Codex, Victory, Level Selector
   ============================================================================ */

/* ---------- TOAST ---------- */
let toastTimer = null;
function showToast(message, type = 'info') {
    const toast = document.getElementById('feedback-toast');
    const icon = document.getElementById('toast-icon');
    const msg = document.getElementById('toast-message');
    if (!toast || !icon || !msg) return;

    const colors = {
        success: { border: 'border-[#4ADE80]', bg: 'bg-[#4ADE80]/15', text: 'text-[#4ADE80]' },
        error:   { border: 'border-[#F87171]', bg: 'bg-[#F87171]/15', text: 'text-[#F87171]' },
        warn:    { border: 'border-[#E5B869]', bg: 'bg-[#E5B869]/15', text: 'text-[#E5B869]' },
        info:    { border: 'border-[#60A5FA]', bg: 'bg-[#60A5FA]/15', text: 'text-[#60A5FA]' }
    };
    const c = colors[type] || colors.info;

    toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] px-5 py-4 rounded-xl shadow-2xl border ${c.border} ${c.bg} ${c.text}`;
    icon.innerHTML = type === 'success'
        ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
        : type === 'error'
        ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'
        : type === 'warn'
        ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>'
        : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    msg.textContent = message;
    toast.classList.remove('hidden');

    // Ξεχωριστή, πάντα παρούσα live region για αξιόπιστη ανακοίνωση από screen readers.
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
        announcer.textContent = '';
        requestAnimationFrame(() => { announcer.textContent = message; });
    }

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 4500);
}

/* ---------- MODAL (Κανόνας 2) ---------- */
let activeModalClose = null;

function showModal({ title, body, confirmText = 'Επιβεβαίωση', cancelText = 'Ακύρωση', onConfirm, danger = false }) {
    if (activeModalClose) activeModalClose(false);
    const existing = document.getElementById('custom-modal');
    if (existing) existing.remove();

    const previousFocus = document.activeElement;
    const backdrop = document.createElement('div');
    backdrop.id = 'custom-modal';
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
        <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <h3 id="modal-title" class="modal-title">${title}</h3>
            <div class="modal-body">${body}</div>
            <div class="modal-actions">
                <button id="modal-cancel" class="btn-ghost-gold px-4 py-2 rounded-lg text-sm">${cancelText}</button>
                <button id="modal-confirm" class="btn-bronze px-4 py-2 rounded-lg text-sm font-semibold">${confirmText}</button>
            </div>
        </div>`;
    document.body.appendChild(backdrop);

    const close = (restoreFocus = true) => {
        document.removeEventListener('keydown', onKeyDown, true);
        backdrop.remove();
        if (activeModalClose === close) activeModalClose = null;
        if (restoreFocus && previousFocus && typeof previousFocus.focus === 'function') {
            try { previousFocus.focus(); } catch (e) {}
        }
    };
    activeModalClose = close;
    const focusable = () => Array.from(backdrop.querySelectorAll('button')).filter(el => !el.disabled);
    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            close();
            return;
        }
        if (e.key === 'Tab') {
            const items = focusable();
            if (!items.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    };
    backdrop.querySelector('#modal-cancel').onclick = () => close();
    backdrop.querySelector('#modal-confirm').onclick = () => { close(false); if (onConfirm) onConfirm(); };
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
    document.addEventListener('keydown', onKeyDown, true);
    backdrop.querySelector('#modal-confirm').focus();
}

/* ---------- CODEX ---------- */
let codexLastFocus = null;

function updateCodexBadge() {
    const badge = document.getElementById('codex-badge');
    if (badge) badge.classList.toggle('hidden', !state.codexUnread);
}

function toggleCodex() {
    playTone('click');
    const drawer = document.getElementById('codex-drawer');
    if (!drawer) return;
    const isOpen = !drawer.classList.contains('hidden');
    if (isOpen) {
        drawer.classList.add('hidden');
        document.body.style.overflow = '';
        if (codexLastFocus && typeof codexLastFocus.focus === 'function') {
            try { codexLastFocus.focus(); } catch (e) {}
        }
        codexLastFocus = null;
    } else {
        codexLastFocus = document.activeElement;
        renderCodex();
        markCodexRead();
        updateCodexBadge();
        drawer.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        const closeBtn = drawer.querySelector('button[aria-label="Κλείσιμο σημειωματαρίου"]');
        if (closeBtn) closeBtn.focus();
    }
}

/* ---------- LEVEL SELECTOR ---------- */
function openLevelSelector() {
    playTone('click');
    if (state.isPlaying) flushProgress();
    state.isPlaying = false;
    clearInterval(state.timerInterval);
    document.getElementById('game-workspace').classList.add('hidden');
    document.getElementById('victory-screen').classList.add('hidden');
    document.getElementById('change-level-btn').classList.add('hidden');
    document.getElementById('header-subtitle').textContent = 'Αρχαιολογική & Φιλολογική Αναζήτηση στην Ιλιάδα (Ραψωδία Σ)';
    document.getElementById('header-level-label').textContent = 'Επίπεδο';
    document.getElementById('intro-screen').classList.remove('hidden');
    updateResumeButton();
}

/* ---------- RESET (με custom modal, Κανόνας 2) ---------- */
function resetGame() {
    showModal({
        title: 'Επανεκκίνηση Έρευνας',
        body: 'Η τρέχουσα πρόοδος θα χαθεί. Θέλετε να ξεκινήσετε ξανά το ίδιο επίπεδο;',
        confirmText: 'Επανεκκίνηση',
        cancelText: 'Ακύρωση',
        onConfirm: () => { clearProgress(); startGame(state.currentDifficulty); }
    });
}

/* ---------- VICTORY ---------- */
function showVictory() {
    // Υπολόγισε τον ακριβή χρόνο πριν σταματήσει το interval, ώστε να μη χάνονται
    // τα δευτερόλεπτα από την τελευταία ανανέωση του timer.
    if (state.startTime) {
        state.elapsedSeconds = Math.max(state.elapsedSeconds, Math.floor((Date.now() - state.startTime) / 1000));
    }
    clearInterval(state.timerInterval);
    state.isPlaying = false;
    document.getElementById('game-workspace').classList.add('hidden');
    document.getElementById('victory-screen').classList.remove('hidden');

    const mm = String(Math.floor(state.elapsedSeconds / 60)).padStart(2, '0');
    const ss = String(state.elapsedSeconds % 60).padStart(2, '0');
    document.getElementById('stat-time').textContent = `${mm}:${ss}`;
    document.getElementById('stat-hints').textContent = state.hintsUsedCount;

    const meta = DIFFICULTY_META[state.currentDifficulty];
    const rank = state.hintsUsedCount <= 1 ? meta.rankSuccess : meta.rankGood;
    document.getElementById('stat-rank').textContent = rank;

    const stages = getActiveStages();
    const list = document.getElementById('victory-summary-list');
    list.innerHTML = stages.map(st => `
        <div class="flex items-start gap-2">
            <span class="text-[#D4AF37] mt-0.5">◆</span>
            <div><strong class="text-[#D4AF37]">${st.shortTitle}:</strong> ${st.loreSummary}</div>
        </div>`).join('');

    // Σβήσε το save αφού ολοκληρώθηκε
    clearProgress();
    // Κράτησε το header στο 5/5 της ολοκληρωμένης βαθμίδας.
    updateShieldSVG();
}

function printCertificate() {
    playTone('click');
    window.print();
}

function copyCertificateSummary() {
    const meta = DIFFICULTY_META[state.currentDifficulty];
    const mm = String(Math.floor(state.elapsedSeconds / 60)).padStart(2, '0');
    const ss = String(state.elapsedSeconds % 60).padStart(2, '0');
    const stages = getActiveStages();
    const lines = [
        'ΑΡΧΑΙΟΛΟΓΙΚΟ ΠΙΣΤΟΠΟΙΗΤΙΚΟ ΕΡΕΥΝΑΣ',
        'Το Κρυμμένο Όπλο του Ήφαιστου — Η Ασπίδα του Αχιλλέα',
        `Βαθμίδα: ${meta.fullTitle}`,
        `Χρόνος: ${mm}:${ss}`,
        `Υποδείξεις: ${state.hintsUsedCount}`,
        '',
        'ΣΥΝΟΨΗ ΤΩΝ 5 ΚΥΚΛΩΝ:',
        ...stages.map(st => `- ${st.shortTitle}: ${st.loreSummary}`),
        '',
        'Βασισμένο στην Ιλιάδα του Ομήρου (Σ 478–608, Υ 268–272)'
    ];
    const text = lines.join('\n');

    const finish = () => {
        const btn = document.getElementById('copy-btn-text');
        if (btn) {
            const old = btn.textContent;
            btn.textContent = 'Αντιγράφηκε!';
            setTimeout(() => { btn.textContent = old; }, 2000);
        }
        showToast('Το πιστοποιητικό αντιγράφηκε στο πρόχειρο.', 'success');
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(finish).catch(() => fallbackCopy(text, finish));
    } else {
        fallbackCopy(text, finish);
    }
}

function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); cb(); }
    catch (e) { showToast('Η αντιγραφή δεν υποστηρίζεται από τον browser.', 'error'); }
    document.body.removeChild(ta);
}