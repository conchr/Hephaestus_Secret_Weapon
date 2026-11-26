/* ============================================================================
   puzzles.js — Renderers γρίφων + handlers (όλα τα stages, όλα τα επίπεδα)
   ============================================================================ */

function getActiveStages() {
    if (state.currentDifficulty === 'kids') return CURRICULUM_KIDS;
    if (state.currentDifficulty === 'teens') return CURRICULUM_TEENS;
    return CURRICULUM_ADULTS;
}

function renderPuzzleHTML(idx) {
    /* ---------- STAGE 0: ASTROLABE ---------- */
    if (idx === 0) {
        const constellations = [
            { id: 'pleiades', name: 'Οι Πλειάδες (Το σμήνος της Άνοιξης)' },
            { id: 'hyades', name: 'Οι Υάδες (Τα αστέρια των βροχών)' },
            { id: 'orion', name: 'Ο Ορίων (Ο ουράνιος κυνηγός)' },
            { id: 'ursa', name: 'Η Άρκτος / Άμαξα (Ο βόρειος αστερισμός)' }
        ];
        const normalizedDeg = ((state.astrolabeAngle % 360) + 360) % 360;
        const isAligned = normalizedDeg === 0;

        return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-center bg-[#12100E] p-4 rounded-xl border border-[#D4AF37]/20">
            <div class="flex flex-col items-center">
                <svg viewBox="0 0 320 340" class="w-full max-w-[340px] h-auto" role="img" aria-label="Ουράνιος αστρολάβος με βέλος Βορρά">
                    <defs>
                        <filter id="text-shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.9"/>
                        </filter>
                    </defs>
                    <!-- Σταθερό βέλος Βορρά (δείχνει πάντα ψηλά) -->
                    <polygon points="160,8 150,32 170,32" fill="#D4AF37" filter="url(#text-shadow)"/>
                    <text x="160" y="48" text-anchor="middle" fill="#D4AF37" font-size="13" font-family="Literata" font-weight="bold" filter="url(#text-shadow)">ΒΟΡΡΑΣ ↑</text>
                    
                    <circle cx="160" cy="180" r="152" fill="#16293D" stroke="#D4AF37" stroke-width="3"/>
                    <text x="160" y="204" text-anchor="middle" fill="#9CC4E4" font-size="11" font-family="Literata" font-weight="bold" filter="url(#text-shadow)">ΩΚΕΑΝΟΣ (ΔΥΣΗ)</text>
                    <text x="160" y="322" text-anchor="middle" fill="#9CC4E4" font-size="11" font-family="Literata" font-weight="bold" filter="url(#text-shadow)">ΩΚΕΑΝΟΣ (ΔΥΣΗ)</text>
                    <circle cx="160" cy="180" r="126" fill="#0F111A" stroke="#5A8BB0" stroke-width="1"/>
                    
                    <!-- Δείκτης που περιστρέφεται (δείχνει πού βρίσκεται η Άρκτος) -->
                    <g id="celestial-wheel" style="transform: rotate(${state.astrolabeAngle}deg); transform-origin: 160px 180px;">
                        <!-- Κίτρινο βέλος στην κορυφή του τροχού (δείχνει τη θέση της Άρκτου) -->
                        <polygon points="160,58 152,74 168,74" fill="#FFF8DC" stroke="#8A6617" stroke-width="1"/>
                        <line x1="160" y1="74" x2="160" y2="90" stroke="#FFF8DC" stroke-width="2"/>
                        
                        <line x1="160" y1="58" x2="160" y2="302" stroke="#D4AF37" stroke-opacity="0.3" stroke-dasharray="4 4"/>
                        <line x1="58" y1="180" x2="262" y2="180" stroke="#D4AF37" stroke-opacity="0.3" stroke-dasharray="4 4"/>
                        <circle cx="160" cy="180" r="36" fill="rgba(212,175,55,0.14)" stroke="#D4AF37" stroke-dasharray="2 2"/>
                        <text x="160" y="170" text-anchor="middle" fill="#D4AF37" font-size="11" font-weight="bold" filter="url(#text-shadow)">ΑΡΚΤΟΣ</text>
                        <circle cx="150" cy="185" r="2.5" fill="#FFF"/>
                        <circle cx="160" cy="187" r="2.5" fill="#FFF"/>
                        <circle cx="170" cy="183" r="2.5" fill="#FFF"/>
                        <text x="160" y="78" text-anchor="middle" fill="#E88D7A" font-size="12" font-weight="bold" filter="url(#text-shadow)">ΟΡΙΩΝ</text>
                        <text x="250" y="184" text-anchor="middle" fill="#B8AFA1" font-size="11" font-weight="bold" filter="url(#text-shadow)">ΠΛΕΙΑΔΕΣ</text>
                        <text x="70" y="184" text-anchor="middle" fill="#B8AFA1" font-size="11" font-weight="bold" filter="url(#text-shadow)">ΥΑΔΕΣ</text>
                        <text x="160" y="292" text-anchor="middle" fill="#E5C76B" font-size="11" font-weight="bold" filter="url(#text-shadow)">ΗΛΙΟΣ &amp; ΣΕΛΗΝΗ</text>
                    </g>
                </svg>
                <div class="flex items-center gap-2 mt-3">
                    <button onclick="rotateAstrolabe(-45)" class="btn-ghost-gold px-3 py-1 rounded text-xs" aria-label="Περιστροφή αριστερά 45 μοίρες">↺ Στρίψε αριστερά</button>
                    <span class="text-xs font-mono ${isAligned ? 'text-[#4ADE80] font-bold' : 'text-[#D4AF37]'} px-2" aria-live="polite">
                        ${isAligned ? '✓ Έτοιμο!' : `Γωνία: ${normalizedDeg}°`}
                    </span>
                    <button onclick="rotateAstrolabe(45)" class="btn-ghost-gold px-3 py-1 rounded text-xs" aria-label="Περιστροφή δεξιά 45 μοίρες">↻ Στρίψε δεξιά</button>
                </div>
                ${isAligned 
                    ? '<div class="mt-2 w-full p-2 rounded-lg bg-[#4ADE80]/15 border border-[#4ADE80] text-[#4ADE80] text-xs font-semibold text-center">✓ Το βελάκι κοιτάει τον Βορρά! Τώρα διάλεξε τον σωστό αστερισμό.</div>'
                    : '<div class="mt-2 w-full p-2 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#E5C76B] text-xs text-center">Πάτα τα κουμπιά μέχρι το <strong>κίτρινο βελάκι</strong> να κοιτάξει προς το <strong>ΒΟΡΡΑΣ ↑</strong>.</div>'}
            </div>
            <div class="space-y-2.5">
                <p class="text-xs text-[#EFECE6]/85 mb-2 leading-relaxed">
                    ${state.currentDifficulty === 'kids'
                        ? '<strong>Πώς παίζω:</strong><br>1. Πάτα τα κουμπιά για να στρίψεις τον τροχό.<br>2. Σταμάτα όταν το κίτρινο βελάκι δείχνει στον Βορρά (↑).<br>3. Διάλεξε τον αστερισμό που δεν βουτά ποτέ στη θάλασσα:'
                        : '<strong>Βήμα 1:</strong> Στρίψτε τον τροχό ώστε το κίτρινο βελάκι να δείχνει στον <strong>ΒΟΡΡΑ ↑</strong>.<br><strong>Βήμα 2:</strong> Επιλέξτε τον αστερισμό που <strong>δεν λούζεται ποτέ</strong> στον Ωκεανό:'}
                </p>
                ${constellations.map(c => `
                    <button onclick="selectConstellation('${c.id}')" class="w-full text-left p-3 rounded-lg border text-xs sm:text-sm transition ${state.selectedConstellation === c.id ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#FFF]' : 'bg-[#1E1A16] border-[#3D352E] text-[#B8AFA1] hover:border-[#D4AF37]/50'}">
                        ${c.name}
                    </button>
                `).join('')}
            </div>
        </div>`;
    }

    /* ---------- STAGE 1: TRIAL ---------- */
    if (idx === 1) {
        if (state.currentDifficulty === 'kids') {
            const choices = [
                { id: 'kids_wrong1', title: 'Επιλογή Α: Έπαθλο για τον πιο δυνατό πολεμιστή', desc: 'Τα δύο τάλαντα χρυσού θα δοθούν σε όποιον νικήσει σε μονομαχία έξω από την πόλη.' },
                { id: 'kids_correct', title: 'Επιλογή Β: Αμοιβή για τον πιο δίκαιο δικαστή', desc: 'Τα δύο τάλαντα χρυσού θα δοθούν σε εκείνον τον σοφό γέροντα που θα προτείνει την πιο δίκαιη και ειρηνική λύση μπροστά στον λαό.' },
                { id: 'kids_wrong2', title: 'Επιλογή Γ: Φόρος για το χτίσιμο νέων τειχών', desc: 'Ο χρυσός ανήκει στους στρατιώτες για να αγοράσουν νέα δόρατα και περικεφαλαίες.' }
            ];
            return `<div class="space-y-3">${choices.map(ch => `
                <div onclick="selectElder('${ch.id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectElder('${ch.id}');}" class="p-4 rounded-xl border cursor-pointer transition ${state.selectedElder === ch.id ? 'bg-[#D4AF37]/15 border-[#D4AF37]' : 'bg-[#12100E] border-[#3D352E] hover:border-[#D4AF37]/50'}">
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-cinzel font-bold text-sm text-[#D4AF37]">${ch.title}</span>
                        <span class="w-4 h-4 rounded-full border flex items-center justify-center ${state.selectedElder === ch.id ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#B8AFA1]'}"></span>
                    </div>
                    <p class="font-serif-narrative text-xs sm:text-sm text-[#EFECE6]/90 leading-relaxed">${ch.desc}</p>
                </div>`).join('')}</div>`;
        }
        if (state.currentDifficulty === 'teens') {
            const elders = [
                { id: 'teen_w1', name: "Γέροντας Α' (Θρασυμήδης)", verdict: '«Αφού διαφωνούν για το αν πληρώθηκε η ποινή, ας μονομαχήσουν έξω από τα τείχη ώστε να κρίνει η δύναμη των όπλων.»' },
                { id: 'teen_correct', name: "Γέροντας Β' (Αλκίνοος)", verdict: '«Ας παρουσιαστούν ενώπιον του λαού οι μάρτυρες της πληρωμής· αν αποδειχθεί ότι δόθηκε η ποινή (η αποζημίωση), η διαφορά λήγει ειρηνικά, αλλιώς να καταβληθεί αμέσως παρουσία όλων.»' },
                { id: 'teen_w2', name: "Γέροντας Γ' (Ευρύμαχος)", verdict: '«Να εξοριστεί ο κατηγορούμενος χωρίς να ακούσουμε μάρτυρες, για να τελειώνει γρήγορα η φασαρία στην αγορά.»' }
            ];
            return `<div class="space-y-3">${elders.map(el => `
                <div onclick="selectElder('${el.id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectElder('${el.id}');}" class="p-4 rounded-xl border cursor-pointer transition ${state.selectedElder === el.id ? 'bg-[#D4AF37]/15 border-[#D4AF37]' : 'bg-[#12100E] border-[#3D352E] hover:border-[#D4AF37]/50'}">
                    <div class="flex items-center justify-between mb-1.5">
                        <span class="font-cinzel font-bold text-sm text-[#D4AF37]">${el.name}</span>
                        <span class="w-4 h-4 rounded-full border flex items-center justify-center ${state.selectedElder === el.id ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#B8AFA1]'}"></span>
                    </div>
                    <p class="font-serif-narrative text-xs sm:text-sm text-[#EFECE6]/90 leading-relaxed">${el.verdict}</p>
                </div>`).join('')}</div>`;
        }
        const elders = [
            { id: 'elder1', name: "Γέροντας Α' (Θρασυμήδης)", verdict: '«Αφού υπάρχει αμφιβολία για το αν πληρώθηκε η ποινή, ας λύσουν τη διαφορά με μονομαχία έξω από τα τείχη, ώστε να αποφασίσουν οι θεοί.»' },
            { id: 'elder2', name: "Γέροντας Β' (Ευρύμαχος)", verdict: '«Να εξοριστεί αμέσως ο κατηγορούμενος χωρίς να εξεταστεί αν όντως κατέβαλε τον χρυσό, ώστε να ησυχάσει το πλήθος στην αγορά.»' },
            { id: 'elder3', name: "Γέροντας Γ' (Αλκίνοος)", verdict: '«Ας παρουσιαστούν ενώπιον του ίστορος (εγγυητή) και του λαού οι μάρτυρες της συναλλαγής· αν αποδειχθεί η καταβολή της ποινής, η οικογένεια οφείλει να την αποδεχθεί ειρηνικά, αλλιώς να αποδοθεί διπλάσιο βάρος χρυσού.»' },
            { id: 'elder4', name: "Γέροντας Δ' (Δημόδοκος)", verdict: '«Τα δύο τάλαντα χρυσού ανήκουν στους κήρυκες· ας μοιραστούν τον χρυσό οι άρχοντες και ας αφήσουν τους συγγενείς να εκδικηθούν όπως ορίζει το παλιό έθιμο του αίματος.»' }
        ];
        return `<div class="space-y-3">${elders.map(el => `
            <div onclick="selectElder('${el.id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectElder('${el.id}');}" class="p-4 rounded-xl border cursor-pointer transition ${state.selectedElder === el.id ? 'bg-[#D4AF37]/15 border-[#D4AF37]' : 'bg-[#12100E] border-[#3D352E] hover:border-[#D4AF37]/50'}">
                <div class="flex items-center justify-between mb-1.5">
                    <span class="font-cinzel font-bold text-sm text-[#D4AF37]">${el.name}</span>
                    <span class="w-4 h-4 rounded-full border flex items-center justify-center ${state.selectedElder === el.id ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#B8AFA1]'}"></span>
                </div>
                <p class="font-serif-narrative text-xs sm:text-sm text-[#EFECE6]/90 leading-relaxed">${el.verdict}</p>
            </div>`).join('')}</div>`;
    }

    /* ---------- STAGE 2: SEASONS ---------- */
    if (idx === 2) {
        const scenes = [
            { id: 0, title: '1. Το Όργωμα (Άνοιξη)' },
            { id: 1, title: '2. Ο Θερισμός (Καλοκαίρι)' },
            { id: 2, title: '3. Ο Τρύγος (Φθινόπωρο)' },
            { id: 3, title: '4. Η Βοσκή του Κοπαδιού (Χειμώνας)' }
        ];
        const options = state.currentDifficulty === 'kids'
            ? [
                { val: '', label: '-- Διαλέξτε χρώμα μετάλλου & εικόνα --' },
                { val: 'A', label: 'Λευκός κασσίτερος (φράχτης) & το τραγούδι του Λίνου' },
                { val: 'B', label: 'Χρυσό χώμα που μαυρίζει & κύπελλον με γλυκό κρασί' },
                { val: 'C', label: 'Δίχρωμα βόδια από χρυσό και κασσίτερο στο λιβάδι' },
                { val: 'D', label: 'Λαμπερά χρυσά στάχυα με τον βασιλιά να χαμογελά' }
              ]
            : [
                { val: '', label: '-- Επιλέξτε ομηρικό & μεταλλουργικό στοιχείο --' },
                { val: 'A', label: 'Τραγούδι του «Λίνου» με φόρμιγγα & φράχτης από λευκό κασσίτερο' },
                { val: 'B', label: 'Χρυσό χώμα που μαυρίζει τεχνητά & προσφορά κρασιού σε «κύπελλον»' },
                { val: 'C', label: 'Βόδια σφυρηλατημένα από χρυσό και κασσίτερο, με δύο λιοντάρια' },
                { val: 'D', label: 'Βασιλιάς που στέκει σιωπηλός με το «σκήπτρο» γεμάτος χαρά για τη σοδειά' }
              ];
        return `<div class="space-y-3 bg-[#12100E] p-4 rounded-xl border border-[#D4AF37]/20">
            ${scenes.map(sc => `
                <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2.5 rounded-lg bg-[#1E1A16] border border-[#3D352E]">
                    <label for="season-${sc.id}" class="sm:col-span-5 text-xs sm:text-sm font-semibold text-[#E5C76B]">${sc.title}</label>
                    <select id="season-${sc.id}" onchange="updateSeasonMatch(${sc.id}, this.value)" class="sm:col-span-7 bg-[#12100E] text-[#EFECE6] text-xs p-2.5 rounded-lg border border-[#D4AF37]/30 focus:outline-none focus:border-[#D4AF37]">
                        ${options.map(opt => `<option value="${opt.val}" ${state.seasonMatches[sc.id] === opt.val ? 'selected' : ''}>${opt.label}</option>`).join('')}
                    </select>
                </div>`).join('')}
        </div>`;
    }

    /* ---------- STAGE 3: DANCE ---------- */
    if (idx === 3) {
        return `<div class="space-y-2.5 bg-[#12100E] p-4 rounded-xl border border-[#D4AF37]/20">
            <p class="text-xs text-[#B8AFA1] mb-2">Χρησιμοποιήστε τα βέλη (▲ / ▼) για να βάλετε τα ${state.danceOrder.length} στάδια του χορού στη σωστή σειρά από πάνω προς τα κάτω:</p>
            ${state.danceOrder.map((step, i) => `
                <div class="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#1E1A16] border border-[#D4AF37]/25">
                    <div class="flex items-start gap-3">
                        <span class="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] font-cinzel font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">${i + 1}</span>
                        <span class="text-xs sm:text-sm text-[#EFECE6]/90 leading-relaxed">${step.text}</span>
                    </div>
                    <div class="flex flex-col gap-1 shrink-0">
                        <button onclick="moveDanceStep(${i}, -1)" ${i === 0 ? 'disabled' : ''} class="px-2 py-0.5 rounded bg-[#27221D] text-xs text-[#D4AF37] disabled:opacity-25 hover:bg-[#D4AF37]/20" aria-label="Μετακίνηση πάνω">▲</button>
                        <button onclick="moveDanceStep(${i}, 1)" ${i === state.danceOrder.length - 1 ? 'disabled' : ''} class="px-2 py-0.5 rounded bg-[#27221D] text-xs text-[#D4AF37] disabled:opacity-25 hover:bg-[#D4AF37]/20" aria-label="Μετακίνηση κάτω">▼</button>
                    </div>
                </div>`).join('')}
        </div>`;
    }

    /* ---------- STAGE 4: FINAL SYNTHESIS ---------- */
    if (idx === 4) {
        if (state.currentDifficulty === 'kids') {
            const metalsList = ['Χαλκός', 'Χρυσός', 'Κασσίτερος', 'Σίδηρος'];
            return `<div class="space-y-4 bg-[#12100E] p-4 rounded-xl border border-[#D4AF37]/20">
                <div>
                    <span class="text-xs font-semibold text-[#D4AF37] block mb-2">Α. Επιλέξτε τα 3 μέταλλα που χρησιμοποίησε ο Ήφαιστος για τις πτύχες της ασπίδας (προσοχή, ένα περισσεύει!):</span>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        ${metalsList.map(m => `
                            <button onclick="toggleKidsMetal('${m}')" class="p-3 rounded-lg border text-xs font-semibold transition ${state.kidsMetalsSelected[m] ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white' : 'bg-[#1E1A16] border-[#3D352E] text-[#B8AFA1]'}">
                                ${state.kidsMetalsSelected[m] ? '✓ ' : ''}${m}
                            </button>`).join('')}
                    </div>
                </div>
                <div class="pt-3 border-t border-[#D4AF37]/15">
                    <span class="text-xs font-semibold text-[#D4AF37] block mb-2">Β. Ποιο μεγάλο ποτάμι έβαλε ο θεός γύρω-γύρω στην εξωτερική άντυγα (στεφάνη);</span>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        ${['Τον Ποταμό Ωκεανό', 'Τον Όλυμπο', 'Τον Ποταμό Σκάμανδρο'].map(opt => `
                            <button onclick="selectRim('${opt}')" class="p-2.5 rounded-lg border text-xs font-medium transition ${state.selectedRimElement === opt ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white' : 'bg-[#1E1A16] border-[#3D352E] text-[#B8AFA1]'}">
                                ${opt}
                            </button>`).join('')}
                    </div>
                </div>
            </div>`;
        }

        const layerDescriptions = [
            'Πτυχή 1 (Εξωτερική επιφάνεια — δέχεται πρώτη το χτύπημα):',
            'Πτυχή 2 (Δεύτερο εξωτερικό στρώμα):',
            'Πτυχή 3 (Κεντρικός πυρήνας — σταματά το δόρυ του Αινεία):',
            'Πτυχή 4 (Πρώτο εσωτερικό στρώμα):',
            'Πτυχή 5 (Εσώτατη επιφάνεια — προς τον βραχίονα του Αχιλλέα):'
        ];
        const metalOptions = ['Χαλκός', 'Χρυσός', 'Κασσίτερος', 'Σίδηρος', 'Άργυρος'];
        return `<div class="space-y-4 bg-[#12100E] p-4 rounded-xl border border-[#D4AF37]/20">
            <div>
                <span class="text-xs font-semibold text-[#D4AF37] block mb-2">Α. Διαστρωμάτωση των 5 Μεταλλικών Πτυχών (από έξω προς τα μέσα):</span>
                <div class="space-y-2">
                    ${state.shieldLayers.map((metal, i) => `
                        <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-[#1E1A16] border border-[#3D352E]">
                            <label for="layer-${i}" class="text-xs text-[#EFECE6]/90 flex-1 min-w-[200px]">${layerDescriptions[i]}</label>
                            <select id="layer-${i}" onchange="updateShieldLayer(${i}, this.value)" class="bg-[#12100E] text-[#EFECE6] text-xs p-2 rounded-lg border border-[#D4AF37]/30 focus:outline-none focus:border-[#D4AF37]">
                                ${metalOptions.map(m => `<option value="${m}" ${metal === m ? 'selected' : ''}>${m}</option>`).join('')}
                            </select>
                        </div>`).join('')}
                </div>
            </div>
            <div class="pt-3 border-t border-[#D4AF37]/15">
                <span class="text-xs font-semibold text-[#D4AF37] block mb-2">Β. Ποιο στοιχείο σφραγίζει την εξωτερική άντυγα της ασπίδας;</span>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    ${['Τον Ποταμό Ωκεανό', 'Τον Όλυμπο', 'Τον Ποταμό Σκάμανδρο'].map(opt => `
                        <button onclick="selectRim('${opt}')" class="p-2.5 rounded-lg border text-xs font-medium transition ${state.selectedRimElement === opt ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white' : 'bg-[#1E1A16] border-[#3D352E] text-[#B8AFA1]'}">
                            ${opt}
                        </button>`).join('')}
                </div>
            </div>
        </div>`;
    }

    return '<p class="text-sm text-[#B8AFA1]">Άγνωστο στάδιο.</p>';
}

/* ---------- PUZZLE HANDLERS ---------- */
function rotateAstrolabe(delta) {
    playTone('click');
    state.astrolabeAngle = (state.astrolabeAngle + delta) % 360;
    renderStage(state.currentStageIdx);
}
function selectConstellation(id) { playTone('click'); state.selectedConstellation = id; renderStage(state.currentStageIdx); }
function selectElder(id) { playTone('click'); state.selectedElder = id; renderStage(state.currentStageIdx); }
function updateSeasonMatch(id, val) { state.seasonMatches[id] = val; saveProgress(); }
function updateShieldLayer(i, val) { state.shieldLayers[i] = val; saveProgress(); }
function toggleKidsMetal(m) { playTone('click'); state.kidsMetalsSelected[m] = !state.kidsMetalsSelected[m]; renderStage(state.currentStageIdx); }
function selectRim(opt) { playTone('click'); state.selectedRimElement = opt; renderStage(state.currentStageIdx); }
function moveDanceStep(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= state.danceOrder.length) return;
    playTone('click');
    [state.danceOrder[i], state.danceOrder[j]] = [state.danceOrder[j], state.danceOrder[i]];
    renderStage(state.currentStageIdx);
}