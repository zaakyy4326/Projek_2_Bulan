$(document).ready(function () {
    const GRID_SIZE = 8;
    let board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));

    // Caching Layout & DOM Elements
    let boardOffset = null;
    let cellSize = 42;
    let isMobile = false;
    let cellElements = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));

    function cacheLayoutMeasurements() {
        const boardEl = $('#gridBoard');
        if (boardEl.length > 0) {
            boardOffset = boardEl.offset();
        }
        const cellEl = $('.cell').first();
        if (cellEl.length > 0) {
            cellSize = cellEl.outerWidth();
        }
        isMobile = window.innerWidth <= 1024;
    }

    // Parse Adventure Level Data
    let rawData = $("#levelDataJson").val() || '{}';
    let levelObj = JSON.parse(rawData);
    let isBonus = levelObj.IsBonusLevel || false;

    let targets = [];
    let requiredStars = levelObj.StarBlocksCount || 0;

    let levelNum = levelObj.LevelNumber || 1;
    const MENU_ORDER = ['Es Krim', 'Donat', 'Cupcake', 'Pancake', 'Waffle', 'ShortCake', 'Birthday Cake', 'Pai'];
    let allowedCount = 2 + Math.floor((levelNum - 1) / 20); // Level 1-20: 2, 21-40: 3, dll
    allowedCount = Math.min(allowedCount, MENU_ORDER.length);
    let allowedMenus = MENU_ORDER.slice(0, allowedCount);

    // Pseudo-random deterministic generator based on LevelNumber
    function seededRandom(seed) {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    if (!isBonus) {
        try {
            // --- DYNAMIC ALGORITHMIC TARGET GENERATOR ---
            allowedMenus = allowedMenus.sort((a, b) => seededRandom(levelNum + a.charCodeAt(0)) - 0.5);

            let menuCount = 1;
            if (levelNum >= 4) menuCount = 2;
            if (levelNum >= 21) menuCount = 3;
            menuCount = Math.min(menuCount, allowedMenus.length);

            let chosenMenus = allowedMenus.slice(0, menuCount);

            // STICTLY INCREASING TARGET SCALING
            let baseQty = 4 + levelNum;
            targets = chosenMenus.map((m, idx) => ({
                Dessert: m,
                Qty: baseQty + (idx * 2)
            }));

            // Bintang calculation strictly scales up
            requiredStars = Math.min(6, 1 + Math.floor((levelNum - 1) / 3));
            window.StarBlocksCount = requiredStars + 1; // Extra forgiveness
            window.targets = targets; // Save to global for UI

        } catch (e) {
            console.error("Gagal generate target", e);
        }
    }

    let targetsCollected = {};
    targets.forEach(t => targetsCollected[t.Dessert] = 0);

    let starsCollected = 0;
    let pendingTargetAnimations = 0;

    let score = 0;
    let displayScore = 0;
    let bestScore = 0;

    let comboCount = 0;
    let placementsSinceClear = 0;

    let availableBlocks = [null, null, null];
    let heldBlock = null;

    window.updateTargetUI = function () {
        if (isBonus) return;

        let targetPanel = $("#targetPanel");
        if (targetPanel.children().length === 0) {
            let html = "";
            if (window.targets && DESSERT_EMOJIS) {
                window.targets.forEach(function (t) {
                    var emoji = DESSERT_EMOJIS[t.Dessert] || '🍬';
                    html += `<div class='target-item' data-dessert="${t.Dessert}" style='margin-bottom: 0; transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; flex-direction: column; align-items: center;'>
                        <span style='font-size: 30px;'>${emoji}</span>
                        <span class="count-text" style='margin-top: 5px; font-size: 1rem;'>${targetsCollected[t.Dessert]} / ${t.Qty}</span>
                    </div>`;
                });
            }
            if (requiredStars > 0) {
                html += `<div class='target-item' data-dessert="Star" style='margin-bottom: 0; transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; flex-direction: column; align-items: center;'>
                    <i class='fas fa-star' style='font-size: 30px; color: gold;'></i>
                    <span class="count-text" style='margin-top: 5px; font-size: 1rem;'>${starsCollected} / ${requiredStars}</span>
                </div>`;
            }
            targetPanel.html(html);
        } else {
            if (window.targets) {
                window.targets.forEach(function (t) {
                    let item = targetPanel.find(`.target-item[data-dessert="${t.Dessert}"]`);
                    if (item.length) {
                        item.find('.count-text').text(`${targetsCollected[t.Dessert]} / ${t.Qty}`);
                    }
                });
            }
            if (requiredStars > 0) {
                let item = targetPanel.find(`.target-item[data-dessert="Star"]`);
                if (item.length) {
                    item.find('.count-text').text(`${starsCollected} / ${requiredStars}`);
                }
            }
        }
    };

    let isGameOver = false;

    let activeTargetsOnBoard = {}; // Key: "r,c" -> { type: 'Donat' | 'Star' }

    const DESSERT_EMOJIS = {
        'Es Krim': '\uD83C\uDF66',
        'Donat': '\uD83C\uDF69',
        'Cupcake': '\uD83E\uDDC1',
        'Pancake': '\uD83E\uDD5E',
        'Waffle': '\uD83E\uDDC7',
        'ShortCake': '\uD83C\uDF70',
        'Birthday Cake': '\uD83C\uDF82',
        'Pai': '\uD83E\uDD67',
        'Star': '\u2B50'
    };

    const sfxGrab = document.getElementById('sfxGrab');
    const sfxPlace = document.getElementById('sfxPlace');
    const sfxGameOver = document.getElementById('sfxGameOver');

    // Instant Zero-Latency Audio Player
    function playSound(audioElOrId, volume = 1.0) {
        let el = typeof audioElOrId === 'string' ? document.getElementById(audioElOrId) : audioElOrId;
        if (!el) return;
        try {
            el.currentTime = 0;
            if (volume !== undefined) el.volume = volume;
            let p = el.play();
            if (p && p.catch) p.catch(() => {});
        } catch (e) {}
    }

    // Warm up and decode all audio buffers immediately on first interaction
    let audioWarmedUp = false;
    function warmUpAudioBuffers() {
        if (audioWarmedUp) return;
        audioWarmedUp = true;
        const sfxIds = [
            'sfxGrab', 'sfxPlace', 'sfxCollectDessert', 'sfxCollectBintang',
            'sfxGreat', 'sfxAmazing', 'sfxExcellent', 'sfxAwesome', 'sfxFantastic', 'sfxSuperFantastic', 'sfxUnbelievable'
        ];
        for (let i = 1; i <= 10; i++) sfxIds.push('sfxCombo' + i);
        sfxIds.forEach(id => {
            let el = document.getElementById(id);
            if (el) {
                el.preload = 'auto';
                try { el.load(); } catch (err) {}
            }
        });
    }
    $(document).one('click pointerdown touchstart keydown', warmUpAudioBuffers);

    // BGMs
    const bgmMusic = document.getElementById('bgmMusic');
    if ($('#bgm1Src').length) {
        const bgms = [$('#bgm1Src').val(), $('#bgm2Src').val()];
        bgmMusic.src = bgms[Math.floor(Math.random() * bgms.length)];
        bgmMusic.volume = 0.3;
        bgmMusic.play().catch(e => console.log("Auto-play blocked"));
    }

    $('#floating-container').remove();

    $('#musicToggle').click(function () {
        if (bgmMusic.paused) {
            bgmMusic.play();
            $(this).html('&#x1F3B5; Musik: ON');
        } else {
            bgmMusic.pause();
            $(this).html('&#x1F3B5; Musik: OFF');
        }
    });

    $('#btnBackToMenu').click(function (e) {
        e.preventDefault();
        const urlBack = $('#urlBack').val() || "/Puzzle/Adventure";
        Swal.fire({
            title: 'Keluar dari Level?',
            text: "Progress level ini tidak akan tersimpan jika kamu keluar!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#D4A373',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal',
            background: '#FFFEF7',
            color: '#7B5B3A',
            heightAuto: false
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = urlBack;
            }
        });
    });

    const SHAPES = [
        [[1, 1]], [[1, 1, 1]], [[1, 1, 1, 1]], [[1, 1, 1, 1, 1]], // H-Lines
        [[1], [1]], [[1], [1], [1]], [[1], [1], [1], [1]], [[1], [1], [1], [1], [1]], // V-Lines
        [[1, 1], [1, 1]], // 2x2
        [[1, 1, 1], [1, 1, 1]], [[1, 1], [1, 1], [1, 1]], // 3x2 and 2x3
        [[1, 1, 1], [1, 1, 1], [1, 1, 1]], // 3x3
        [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]], [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]], // 4x3 and 3x4
        [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]], // 4x4
        [[1, 0], [1, 1]], [[0, 1], [1, 1]], [[1, 1], [1, 0]], [[1, 1], [0, 1]], // Small L
        [[1, 0, 0], [1, 0, 0], [1, 1, 1]], [[0, 0, 1], [0, 0, 1], [1, 1, 1]], [[1, 1, 1], [1, 0, 0], [1, 0, 0]], [[1, 1, 1], [0, 0, 1], [0, 0, 1]], // Large L
        [[1, 1, 0], [0, 1, 1]], [[0, 1, 1], [1, 1, 0]], // Z and S Horizontal
        [[0, 1], [1, 1], [1, 0]], [[1, 0], [1, 1], [0, 1]], // Z and S Vertical 
        [[1, 1, 1], [0, 1, 0]], [[1, 0], [1, 1], [1, 0]], [[0, 1], [1, 1], [0, 1]], // T shapes (down, right, left)
        [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[0, 0, 1], [0, 1, 0], [1, 0, 0]], // 3-step diagonal
        [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], [[0, 0, 0, 1], [0, 0, 1, 0], [0, 1, 0, 0], [1, 0, 0, 0]] // 4-step diagonal
    ];

    const BLOCK_COLORS = [
        '#E63946', // Ruby Red
        '#F77F00', // Deep Tangerine
        '#FCBF49', // Rich Golden Mango
        '#06D6A0', // Emerald Mint
        '#118AB2', // Ocean Sapphire
        '#073B4C', // Deep Midnight Navy
        '#7209B7', // Royal Amethyst Purple
        '#F72585', // Vivid Berry Pink
        '#3A86FF', // Electric Blue
        '#D00000', // Crimson Cherry
        '#FF6B35', // Sunset Coral
        '#2EC4B6'  // Bright Teal
    ];

    function renderBoard() {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = cellElements[r][c];
                if (board[r][c] !== 0) {
                    if (isBonus) {
                        // Bonus level: No colored block background, purely emoji based on board value
                        cell.addClass('filled dessert-block').css('background-color', 'transparent');
                        let emoji = DESSERT_EMOJIS[board[r][c]] || '🍩';
                        cell.html(`<span style="font-size:30px;">${emoji}</span>`);
                    } else {
                        // Regular level
                        cell.addClass('filled').css('background-color', board[r][c]);
                        if (activeTargetsOnBoard[`${r},${c}`]) {
                            let type = activeTargetsOnBoard[`${r},${c}`].type;
                            cell.addClass('dessert-block');
                            cell.html(`<span style="font-size:24px;">${DESSERT_EMOJIS[type]}</span>`);
                        } else {
                            cell.removeClass('dessert-block').empty();
                        }
                    }
                } else {
                    cell.removeClass('filled clearing hover-valid hover-invalid predict-clear dessert-block').css('background-color', '').empty();
                }
            }
        }
    }

    // INITIALIZE BOARD
    function initBoard() {
        if (isBonus) {
            // Very easy start for Bonus Level
            const initialBlocksCount = 2;
            const smallShapes = [[[1, 1]], [[1], [1]]];
            for (let i = 0; i < initialBlocksCount; i++) {
                let shape = smallShapes[Math.floor(Math.random() * smallShapes.length)];
                // Choose a random dessert type to act as the color/filling from allowedMenus
                let colorOrDessert = allowedMenus[Math.floor(Math.random() * allowedMenus.length)];
                placeRandomly(shape, colorOrDessert);
            }
        } else {
            // Regular Level: Scatter initial target blocks
            // Let's place 4-6 small shapes, and inject Targets and Stars into them
            const initialBlocksCount = 4 + Math.floor(Math.random() * 3);
            const smallShapes = [[[1, 1]], [[1], [1]], [[1, 1], [1, 1]]];
            for (let i = 0; i < initialBlocksCount; i++) {
                let shape = smallShapes[Math.floor(Math.random() * smallShapes.length)];
                let color = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
                placeRandomly(shape, color);
            }

            // Scatter the Required Stars
            let emptyBoardCells = [];
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (board[r][c] !== 0) emptyBoardCells.push({ r, c });
                }
            }
            // Shuffle
            emptyBoardCells.sort(() => Math.random() - 0.5);

            // Place Stars
            let starPlaced = 0;
            while (starPlaced < requiredStars && emptyBoardCells.length > 0) {
                let pos = emptyBoardCells.pop();
                activeTargetsOnBoard[`${pos.r},${pos.c}`] = { type: 'Star' };
                starPlaced++;
            }

            // Place some Target Desserts (half of their requirement)
            targets.forEach(t => {
                let toPlace = Math.ceil(t.Qty / 2);
                for (let i = 0; i < toPlace; i++) {
                    if (emptyBoardCells.length > 0) {
                        let pos = emptyBoardCells.pop();
                        activeTargetsOnBoard[`${pos.r},${pos.c}`] = { type: t.Dessert };
                    }
                }
            });
        }
        renderBoard();
        if (typeof window.updateTargetUI === 'function') {
            window.updateTargetUI();
        }
    }

    // Removed legacy updateUI function

    function placeRandomly(shape, color) {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 50) {
            let r = Math.floor(Math.random() * GRID_SIZE);
            let c = Math.floor(Math.random() * GRID_SIZE);
            if (canPlaceShape(shape, r, c)) {
                placeShapeOnBoardDirectly(shape, color, r, c);
                placed = true;
            }
            attempts++;
        }
    }

    function placeShapeOnBoardDirectly(shape, color, startR, startC) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c] === 1) {
                    board[startR + r][startC + c] = color;
                }
            }
        }
    }

    function countFilledCells() {
        let count = 0;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (board[r][c] !== 0) count++;
            }
        }
        return count;
    }

    function canPlaceOnTemp(shape, startR, startC, tempBoard) {
        const rows = shape.length;
        const cols = shape[0].length;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (shape[r][c] === 1) {
                    const boardR = startR + r;
                    const boardC = startC + c;
                    if (boardR < 0 || boardR >= GRID_SIZE || boardC < 0 || boardC >= GRID_SIZE) return false;
                    if (tempBoard[boardR][boardC] !== 0) return false;
                }
            }
        }
        return true;
    }

    function placeOnTemp(shape, startR, startC, tempBoard) {
        const rows = shape.length;
        const cols = shape[0].length;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (shape[r][c] === 1) {
                    tempBoard[startR + r][startC + c] = 1;
                }
            }
        }
    }

    function spawnBlocks() {
        let hasBlocks = false;
        for (let i = 0; i < 3; i++) {
            if (availableBlocks[i] !== null) {
                hasBlocks = true;
                break;
            }
        }

        if (!hasBlocks) {
            let filledCount = countFilledCells();
            let numToSpawn = 3;

            // Calculate needed targets to guarantee spawns
            let neededTargetsList = [];
            targets.forEach(t => {
                let missing = t.Qty - targetsCollected[t.Dessert];
                for (let k = 0; k < missing; k++) neededTargetsList.push(t.Dessert);
            });

            let guaranteedDesserts = 0;
            if (neededTargetsList.length > 0) {
                if (neededTargetsList.length >= 5) guaranteedDesserts = 3;
                else if (neededTargetsList.length >= 2) guaranteedDesserts = 2;
                else guaranteedDesserts = 1;
            }

            const easyShapes = [[[1]], [[1, 1]], [[1], [1]], [[1, 1], [1, 1]], [[1, 0], [1, 1]], [[0, 1], [1, 1]], [[1, 1], [1, 0]], [[1, 1], [0, 1]], [[1, 1, 1]], [[1], [1], [1]]];
            let bestSet = null;

            // Smart logic: find a set where ALL 3 pieces are individually placeable.
            // Adapt shape difficulty based on how full the board is.
            // Fast & intelligent piece generation (Classic-speed performance, zero CPU recursion)
            for (let attempt = 0; attempt < 20; attempt++) {
                let candidateSet = [];

                if (isBonus) {
                    // Bonus Level Algorithm: 
                    // Give shapes that perfectly fit gaps (1x1 up to 1x5) to make massive satisfying clears!
                    let fits = [];
                    for (let r = 0; r < GRID_SIZE; r++) {
                        let emptyCount = 0;
                        for (let c = 0; c < GRID_SIZE; c++) { if (board[r][c] === 0) emptyCount++; }
                        if (emptyCount > 0 && emptyCount <= 5 && emptyCount !== GRID_SIZE) fits.push([new Array(emptyCount).fill(1)]);
                    }
                    for (let c = 0; c < GRID_SIZE; c++) {
                        let emptyCount = 0;
                        for (let r = 0; r < GRID_SIZE; r++) { if (board[r][c] === 0) emptyCount++; }
                        if (emptyCount > 0 && emptyCount <= 5 && emptyCount !== GRID_SIZE) {
                            let shape = [];
                            for (let i = 0; i < emptyCount; i++) shape.push([1]);
                            fits.push(shape);
                        }
                    }

                    for (let i = 0; i < numToSpawn; i++) {
                        if (filledCount < 20) {
                            // Board is very empty. Give big shapes to quickly fill it up!
                            let bigShapes = [
                                [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
                                [[1, 1, 1, 1]],
                                [[1], [1], [1], [1]],
                                [[1, 1], [1, 1]],
                                [[1, 1, 1], [1, 0, 0], [1, 0, 0]]
                            ];
                            candidateSet.push(bigShapes[Math.floor(Math.random() * bigShapes.length)]);
                        } else if (fits.length > 0 && Math.random() < 0.85) {
                            // Board is getting full. Give perfect fits to clear lines easily!
                            candidateSet.push(fits[Math.floor(Math.random() * fits.length)]);
                        } else {
                            // Fallback to simple pieces
                            let superEasy = [[[1, 1]], [[1], [1]], [[1, 1], [1, 1]], [[1, 1, 1]]];
                            candidateSet.push(superEasy[Math.floor(Math.random() * superEasy.length)]);
                        }
                    }
                } else {
                    for (let i = 0; i < numToSpawn; i++) {
                        if (filledCount > 40 || (filledCount > 30 && attempt > 5)) {
                            candidateSet.push(easyShapes[Math.floor(Math.random() * easyShapes.length)]);
                        } else if (filledCount > 20) {
                            if (i < 2) candidateSet.push(easyShapes[Math.floor(Math.random() * easyShapes.length)]);
                            else candidateSet.push(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
                        } else {
                            candidateSet.push(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
                        }
                    }
                }

                // Fast linear evaluation: check if pieces can be placed on current board
                let placeableCount = 0;
                for (let piece of candidateSet) {
                    if (canPlaceShapeAnywhere(piece)) {
                        placeableCount++;
                    }
                }

                if (placeableCount === numToSpawn) {
                    bestSet = candidateSet;
                    break;
                } else if (placeableCount > 0 && !bestSet) {
                    bestSet = candidateSet; // Keep best candidate so far
                }
            }

            if (!bestSet) {
                // Guaranteed placeable fallback from easy shapes
                let fallback = [];
                for (let i = 0; i < numToSpawn; i++) {
                    let placeableEasy = easyShapes.filter(s => canPlaceShapeAnywhere(s));
                    if (placeableEasy.length > 0) {
                        fallback.push(placeableEasy[Math.floor(Math.random() * placeableEasy.length)]);
                    } else {
                        fallback.push([[1]]);
                    }
                }
                bestSet = fallback;
            }

            // Absolute fallback: give 1x1 blocks if the board is extremely congested
            let shapesToSpawn = bestSet || [[[1]], [[1]], [[1]]];

            // Smart logic: attach desserts to the smallest shapes first, so they are easier to place
            let shapeSizes = shapesToSpawn.map((s, idx) => {
                let size = 0;
                s.forEach(row => row.forEach(val => { size += val; }));
                return { idx: idx, size: size };
            });
            shapeSizes.sort((a, b) => a.size - b.size);

            let dessertIndices = [];
            for (let k = 0; k < guaranteedDesserts; k++) {
                if (k < shapeSizes.length) {
                    dessertIndices.push(shapeSizes[k].idx);
                }
            }

            for (let i = 0; i < 3; i++) {
                if (isBonus) {
                    let randomEmoji = allowedMenus[Math.floor(Math.random() * allowedMenus.length)];

                    if (window.AREA_DESSERT_EMOJI && window.AREA_DESSERT_EMOJI !== "🏁") {
                        let areaDessertName = Object.keys(DESSERT_EMOJIS).find(k => DESSERT_EMOJIS[k] === window.AREA_DESSERT_EMOJI);
                        if (areaDessertName && allowedMenus.includes(areaDessertName)) {
                            // 50% extra probability for the area's main dessert
                            if (Math.random() < 0.5) {
                                randomEmoji = areaDessertName;
                            }
                        }
                    }

                    availableBlocks[i] = { matrix: shapesToSpawn[i], color: randomEmoji };
                } else {
                    let randomColor = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
                    let shape = shapesToSpawn[i];
                    let rows = shape.length;
                    let cols = shape[0].length;
                    let dessertsMatrix = Array(rows).fill().map(() => Array(cols).fill(null));

                    // Count blocks and save coordinates
                    let blocksCount = 0;
                    let blockCoords = [];
                    for (let r = 0; r < rows; r++) {
                        for (let c = 0; c < cols; c++) {
                            if (shape[r][c] === 1) {
                                blocksCount++;
                                blockCoords.push({ r, c });
                            }
                        }
                    }

                    let minDesserts = 0;
                    if (blocksCount === 3) {
                        minDesserts = 1;
                    } else if (blocksCount === 4) {
                        minDesserts = 2;
                    } else if (blocksCount >= 5 && blocksCount <= 8) {
                        minDesserts = 3;
                    } else if (blocksCount >= 9) {
                        minDesserts = Math.max(4, Math.floor(blocksCount / 3));
                    }

                    if (blocksCount <= 2) {
                        // Original logic for small pieces (0 or 1 dessert)
                        let dessertInside = null;
                        if (neededTargetsList.length > 0) {
                            if (dessertIndices.includes(i)) {
                                let randIdx = Math.floor(Math.random() * neededTargetsList.length);
                                dessertInside = neededTargetsList[randIdx];
                                neededTargetsList.splice(randIdx, 1);
                            } else if (Math.random() < 0.5) {
                                let randIdx = Math.floor(Math.random() * neededTargetsList.length);
                                dessertInside = neededTargetsList[randIdx];
                                neededTargetsList.splice(randIdx, 1);
                            }
                        }
                        if (dessertInside) {
                            let centerR = Math.floor(rows / 2);
                            let centerC = Math.floor(cols / 2);
                            if (shape[centerR][centerC] === 1) {
                                dessertsMatrix[centerR][centerC] = dessertInside;
                            } else {
                                if (blockCoords.length > 0) {
                                    dessertsMatrix[blockCoords[0].r][blockCoords[0].c] = dessertInside;
                                }
                            }
                        }
                    } else {
                        // Guaranteed to have at least minDesserts dessert blocks
                        let shuffledCoords = blockCoords.sort(() => Math.random() - 0.5);
                        let coordsToPlace = shuffledCoords.slice(0, minDesserts);

                        coordsToPlace.forEach(pos => {
                            let chosenDessert = null;
                            if (neededTargetsList.length > 0) {
                                let randIdx = Math.floor(Math.random() * neededTargetsList.length);
                                chosenDessert = neededTargetsList[randIdx];
                                neededTargetsList.splice(randIdx, 1);
                            } else {
                                if (targets.length > 0) {
                                    chosenDessert = targets[Math.floor(Math.random() * targets.length)].Dessert;
                                } else {
                                    chosenDessert = allowedMenus[Math.floor(Math.random() * allowedMenus.length)];
                                }
                            }
                            dessertsMatrix[pos.r][pos.c] = chosenDessert;
                        });
                    }

                    // Fallback single dessert property for safety/compatibility
                    let fallbackDessert = null;
                    for (let r = 0; r < rows; r++) {
                        for (let c = 0; c < cols; c++) {
                            if (dessertsMatrix[r][c]) {
                                fallbackDessert = dessertsMatrix[r][c];
                                break;
                            }
                        }
                        if (fallbackDessert) break;
                    }

                    availableBlocks[i] = {
                        matrix: shape,
                        color: randomColor,
                        dessert: fallbackDessert,
                        desserts: dessertsMatrix
                    };
                }
            }
        }

        renderOptions();
        checkGameOver();
    }

    function simulateClearsWithShape(shape) {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (canPlaceShape(shape, r, c)) {
                    let tempBoard = board.map(row => [...row]);
                    for (let sr = 0; sr < shape.length; sr++) {
                        for (let sc = 0; sc < shape[0].length; sc++) {
                            if (shape[sr][sc] === 1) tempBoard[r + sr][c + sc] = 1;
                        }
                    }
                    let clears = 0;
                    for (let i = 0; i < GRID_SIZE; i++) {
                        if (tempBoard[i].every(val => val !== 0)) clears++;
                        let colFull = true;
                        for (let j = 0; j < GRID_SIZE; j++) {
                            if (tempBoard[j][i] === 0) colFull = false;
                        }
                        if (colFull) clears++;
                    }
                    if (clears > 0) return clears;
                }
            }
        }
        return 0;
    }

    function canPlaceShapeAnywhere(shape) {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (canPlaceShape(shape, r, c)) return true;
            }
        }
        return false;
    }

    function getPreviewCellSize(shape) {
        const maxDim = Math.max(shape.length, shape[0].length);
        const isMob = window.innerWidth <= 768;
        if (isMob) {
            if (maxDim >= 5) return 11.5;
            if (maxDim === 4) return 14.5;
            if (maxDim === 3) return 18.5;
            return 22;
        } else {
            if (maxDim >= 5) return 14.5;
            if (maxDim === 4) return 18.5;
            if (maxDim === 3) return 23.5;
            return 28;
        }
    }

    function renderOptions() {
        $('#blocksContainer').empty();
        for (let i = 0; i < 3; i++) {
            const blockData = availableBlocks[i];
            if (blockData) {
                const shape = blockData.matrix;
                const color = blockData.color;

                const blockDiv = $('<div class="block-option"></div>');
                blockDiv.attr('data-index', i);

                const rows = shape.length;
                const cols = shape[0].length;
                const cellSize = getPreviewCellSize(shape);
                const miniGrid = $('<div class="shape-grid"></div>');
                miniGrid.css({
                    'grid-template-columns': `repeat(${cols}, ${cellSize}px)`,
                    'grid-template-rows': `repeat(${rows}, ${cellSize}px)`
                });

                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const sCell = $('<div class="shape-cell"></div>');
                        if (shape[r][c] === 1) {
                            if (isBonus) {
                                sCell.addClass('filled dessert-block').css({
                                    'background-color': 'transparent',
                                    'font-size': '24px',
                                    'display': 'flex',
                                    'justify-content': 'center',
                                    'align-items': 'center'
                                }).html(DESSERT_EMOJIS[color] || color); // In bonus mode, color is the dessert name
                            } else {
                                sCell.addClass('filled').css('background-color', color);
                                // If block has desserts mapped
                                if (blockData.desserts && blockData.desserts[r][c]) {
                                    sCell.addClass('dessert-block');
                                    sCell.html(`<span style="font-size:16px;">${DESSERT_EMOJIS[blockData.desserts[r][c]]}</span>`);
                                } else if (blockData.dessert && r === Math.floor(rows / 2) && c === Math.floor(cols / 2)) {
                                    sCell.addClass('dessert-block');
                                    sCell.html(`<span style="font-size:16px;">${DESSERT_EMOJIS[blockData.dessert]}</span>`);
                                }
                            }
                        }
                        miniGrid.append(sCell);
                    }
                }
                blockDiv.append(miniGrid);
                $('#blocksContainer').append(blockDiv);
            } else {
                $('#blocksContainer').append('<div class="block-option empty"></div>');
            }
        }
    }

    function isMobileLayout() {
        return isMobile;
    }

    let isDragging = false;
    const dragYOffset = -60;

    // Helper to grab a block (shared between mouse and touch)
    function grabBlock(index, startX, startY) {
        const blockData = availableBlocks[index];
        if (!blockData) return;

        if (sfxGrab) {
            sfxGrab.currentTime = 0;
            sfxGrab.play().catch(err => console.log(err));
        }

        heldBlock = {
            matrix: blockData.matrix,
            color: blockData.color,
            index: index,
            dessert: blockData.dessert,
            desserts: blockData.desserts
        };

        // Hide the shape grid inside the clicked block option instead of rendering options immediately.
        // This keeps the option DOM element alive so pointer capture is NOT dropped.
        const blockDiv = $(`.block-option[data-index="${index}"]`);
        blockDiv.find('.shape-grid').css('visibility', 'hidden');
        blockDiv.addClass('dragging-active');

        renderHeldBlock(heldBlock);
        isDragging = true;
        moveHeldBlock(startX, startY + dragYOffset);
    }

    // Helper to drop a block (shared between mouse and touch)
    function dropBlock() {
        isDragging = false;
        const target = heldBlock.snappedTarget;

        if (target && canPlaceShape(heldBlock.matrix, target.r, target.c)) {
            placeShape(heldBlock, target.r, target.c);
            $('#held-block-container').hide();

            // Delete block data and re-render slots now that placement is successful
            availableBlocks[heldBlock.index] = null;
            heldBlock = null;
            clearHover();
            renderOptions();

            if (sfxPlace) {
                sfxPlace.currentTime = 0;
                sfxPlace.play().catch(err => console.log(err));
            }

            processBoard();
            spawnBlocks();
        } else {
            // Restore visibility of the option block on invalid drop
            const blockDiv = $(`.block-option[data-index="${heldBlock.index}"]`);
            blockDiv.find('.shape-grid').css('visibility', 'visible');
            blockDiv.removeClass('dragging-active');

            // Return to container if invalid drop
            availableBlocks[heldBlock.index] = {
                matrix: heldBlock.matrix,
                color: heldBlock.color,
                dessert: heldBlock.dessert,
                desserts: heldBlock.desserts
            };

            $('#held-block-container').hide();
            heldBlock = null;
            clearHover();
        }
    }

    // Tracking active hover & predict cells to avoid touching all 64 cells on mousemove
    let activeHoverCells = [];
    let activePredictCells = [];
    let lastHoverR = null;
    let lastHoverC = null;

    // Helper to update hover target state with dirty-checking
    function updateHoverState(x, y) {
        const exactTarget = getGridPosFromMouse(x, y);
        let bestTarget = null;

        if (exactTarget) {
            if (canPlaceShape(heldBlock.matrix, exactTarget.r, exactTarget.c)) {
                bestTarget = exactTarget;
            } else {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (canPlaceShape(heldBlock.matrix, exactTarget.r + dr, exactTarget.c + dc)) {
                            bestTarget = { r: exactTarget.r + dr, c: exactTarget.c + dc };
                            break;
                        }
                    }
                    if (bestTarget) break;
                }
            }
        }

        const newR = bestTarget ? bestTarget.r : null;
        const newC = bestTarget ? bestTarget.c : null;

        // DIRTY CHECK: If grid coordinates have not changed, skip DOM re-renders!
        if (newR === lastHoverR && newC === lastHoverC) {
            return;
        }

        clearHover();

        if (bestTarget) {
            lastHoverR = newR;
            lastHoverC = newC;
            heldBlock.snappedTarget = bestTarget;
            drawHover(heldBlock.matrix, bestTarget.r, bestTarget.c, true);
            predictLineClears(heldBlock.matrix, bestTarget.r, bestTarget.c);
        } else {
            heldBlock.snappedTarget = null;
        }
    }

    // SINGLE CLICK TO GRAB (No hold) - Desktop Only
    $(document).on('click', '.block-option:not(.empty)', function (e) {
        if (isMobileLayout()) return; // Skip in mobile layout (drag-and-drop active)
        if (heldBlock) return;

        e.stopPropagation();

        const index = parseInt($(this).attr('data-index'));
        const blockData = availableBlocks[index];

        if (sfxGrab) {
            sfxGrab.currentTime = 0;
            sfxGrab.play().catch(err => console.log(err));
        }

        heldBlock = {
            matrix: blockData.matrix,
            color: blockData.color,
            index: index,
            dessert: blockData.dessert,
            desserts: blockData.desserts
        };

        // Hide visually without destroying the DOM slot
        const blockDiv = $(this);
        blockDiv.find('.shape-grid').css('visibility', 'hidden');
        blockDiv.addClass('dragging-active');

        renderHeldBlock(heldBlock);

        // Position it exactly at cursor
        moveHeldBlock(e.pageX, e.pageY);
    });

    function renderHeldBlock(blockData) {
        const hc = $('#held-block-container');
        hc.empty();
        const shape = blockData.matrix;
        const color = blockData.color;

        const rows = shape.length;
        const cols = shape[0].length;

        const hGrid = $('<div class="held-shape-grid"></div>');
        hGrid.css({
            'grid-template-columns': `repeat(${cols}, var(--cell-size, 40px))`,
            'grid-template-rows': `repeat(${rows}, var(--cell-size, 40px))`
        });

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const sCell = $('<div class="held-shape-cell"></div>');
                if (shape[r][c] === 1) {
                    if (isBonus) {
                        sCell.addClass('filled dessert-block').css({
                            'background-color': 'transparent',
                            'font-size': '40px',
                            'display': 'flex',
                            'justify-content': 'center',
                            'align-items': 'center'
                        }).html(DESSERT_EMOJIS[color] || color);
                    } else {
                        sCell.addClass('filled').css('background-color', color);
                        if (blockData.desserts && blockData.desserts[r][c]) {
                            sCell.addClass('dessert-block');
                            sCell.html(`<span style="font-size:32px;">${DESSERT_EMOJIS[blockData.desserts[r][c]]}</span>`);
                        } else if (blockData.dessert && r === Math.floor(rows / 2) && c === Math.floor(cols / 2)) {
                            sCell.addClass('dessert-block');
                            sCell.html(`<span style="font-size:32px;">${DESSERT_EMOJIS[blockData.dessert]}</span>`);
                        }
                    }
                }
                hGrid.append(sCell);
            }
        }
        hc.append(hGrid);
        hc.show();
    }

    function moveHeldBlock(x, y) {
        $('#held-block-container').css({
            left: x + 'px',
            top: y + 'px'
        });
    }

    // Mouse Move listener - Desktop Only / Drag support (Mobile Only)
    $(document).on('mousemove', function (e) {
        if (isMobileLayout()) {
            if (!isDragging || !heldBlock) return;
            moveHeldBlock(e.pageX, e.pageY + dragYOffset);
            updateHoverState(e.pageX, e.pageY + dragYOffset);
            return;
        }

        // Desktop Only
        if (!heldBlock) return;

        moveHeldBlock(e.pageX, e.pageY);
        updateHoverState(e.pageX, e.pageY);
    });

    // SINGLE CLICK TO DROP - Desktop Only
    $(document).on('click', function (e) {
        if (isMobileLayout()) return; // Skip in mobile layout (drag-and-drop active)
        // If clicking on block option, let that handler run
        if ($(e.target).closest('.block-option').length > 0) return;

        if (!heldBlock) return;

        dropBlock();
    });

    // Mobile Drag Grab (Pointerdown - Touchpad/Mouse/Touch on Mobile size)
    $(document).on('pointerdown', '.block-option:not(.empty)', function (e) {
        if (!isMobileLayout()) return; // Skip on desktop size
        if (heldBlock) return;

        // Capture pointer so movement is tracked even outside the option element
        this.setPointerCapture(e.pointerId);

        e.preventDefault();
        e.stopPropagation();

        const index = parseInt($(this).attr('data-index'));
        grabBlock(index, e.pageX, e.pageY);
    });

    // Mobile Drag Move (Pointermove) bound to document for maximum safety
    $(document).on('pointermove', function (e) {
        if (!isMobileLayout() || !isDragging || !heldBlock) return;

        e.preventDefault();
        moveHeldBlock(e.pageX, e.pageY + dragYOffset);
        updateHoverState(e.pageX, e.pageY + dragYOffset);
    });

    // Mobile Drag Drop (Pointerup / Pointercancel) bound to document
    $(document).on('pointerup pointercancel', function (e) {
        if (!isMobileLayout() || !isDragging || !heldBlock) return;

        const activeOption = $(`.block-option[data-index="${heldBlock.index}"]`)[0];
        if (activeOption) {
            try {
                activeOption.releasePointerCapture(e.pointerId);
            } catch (err) { }
        }
        dropBlock();
    });

    function getGridPosFromMouse(mouseX, mouseY) {
        if (!boardOffset) {
            cacheLayoutMeasurements();
        }
        const cellGap = 2;
        const step = cellSize + cellGap;

        const relX = mouseX - boardOffset.left - 10;
        const relY = mouseY - boardOffset.top - 10;

        if (relX < -50 || relX > (GRID_SIZE * step + 50) || relY < -50 || relY > (GRID_SIZE * step + 50)) {
            return null;
        }

        const c = Math.floor(relX / step);
        const r = Math.floor(relY / step);

        if (!heldBlock) return null;
        const rows = heldBlock.matrix.length;
        const cols = heldBlock.matrix[0].length;

        const adjR = r - Math.floor(rows / 2);
        const adjC = c - Math.floor(cols / 2);

        return { r: adjR, c: adjC };
    }

    function canPlaceShape(shape, startR, startC) {
        const rows = shape.length;
        const cols = shape[0].length;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (shape[r][c] === 1) {
                    const boardR = startR + r;
                    const boardC = startC + c;

                    if (boardR < 0 || boardR >= GRID_SIZE || boardC < 0 || boardC >= GRID_SIZE) return false;
                    if (board[boardR][boardC] !== 0) return false;
                }
            }
        }
        return true;
    }

    function canPlaceShapeOnTargetBoard(shape, startR, startC, targetBoard) {
        const rows = shape.length;
        const cols = shape[0].length;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (shape[r][c] === 1) {
                    const boardR = startR + r;
                    const boardC = startC + c;
                    if (boardR < 0 || boardR >= GRID_SIZE || boardC < 0 || boardC >= GRID_SIZE) return false;
                    if (targetBoard[boardR][boardC] !== 0) return false;
                }
            }
        }
        return true;
    }

    function clearHover() {
        if (activeHoverCells.length > 0) {
            for (let i = 0; i < activeHoverCells.length; i++) {
                let cell = activeHoverCells[i];
                cell.removeClass('hover-valid hover-invalid');
                let emoji = cell[0].querySelector('.hover-emoji');
                if (emoji) emoji.remove();
                cell[0].style.opacity = '';
                if (!cell.hasClass('filled')) {
                    cell[0].style.backgroundColor = '';
                }
            }
            activeHoverCells = [];
        }
        if (activePredictCells.length > 0) {
            for (let j = 0; j < activePredictCells.length; j++) {
                activePredictCells[j].removeClass('predict-clear');
            }
            activePredictCells = [];
        }
        lastHoverR = null;
        lastHoverC = null;
    }

    function drawHover(shape, startR, startC, isValid) {
        if (!isValid) return;
        const rows = shape.length;
        const cols = shape[0].length;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (shape[r][c] === 1) {
                    const boardR = startR + r;
                    const boardC = startC + c;
                    if (boardR >= 0 && boardR < GRID_SIZE && boardC >= 0 && boardC < GRID_SIZE) {
                        let cellEl = cellElements[boardR][boardC];
                        cellEl.addClass('hover-valid');
                        activeHoverCells.push(cellEl);

                        // High performance preview without DOM churn
                        if (heldBlock && !cellEl.hasClass('filled')) {
                            if (isBonus) {
                                cellEl[0].style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                            } else {
                                cellEl[0].style.backgroundColor = heldBlock.color;
                                cellEl[0].style.opacity = '0.7';
                            }
                        }
                    }
                }
            }
        }
    }

    function predictLineClears(shape, startR, startC) {
        let tempBoard = board.map(row => [...row]);
        const rows = shape.length;
        const cols = shape[0].length;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (shape[r][c] === 1) {
                    tempBoard[startR + r][startC + c] = 1;
                }
            }
        }

        let rowsToClear = [];
        let colsToClear = [];

        for (let r = 0; r < GRID_SIZE; r++) {
            let full = true;
            for (let c = 0; c < GRID_SIZE; c++) {
                if (tempBoard[r][c] === 0) full = false;
            }
            if (full) rowsToClear.push(r);
        }

        for (let c = 0; c < GRID_SIZE; c++) {
            let full = true;
            for (let r = 0; r < GRID_SIZE; r++) {
                if (tempBoard[r][c] === 0) full = false;
            }
            if (full) colsToClear.push(c);
        }

        rowsToClear.forEach(r => {
            for (let c = 0; c < GRID_SIZE; c++) {
                let cell = cellElements[r][c];
                cell.addClass('predict-clear');
                activePredictCells.push(cell);
            }
        });
        colsToClear.forEach(c => {
            for (let r = 0; r < GRID_SIZE; r++) {
                let cell = cellElements[r][c];
                cell.addClass('predict-clear');
                activePredictCells.push(cell);
            }
        });

        // Set predict color CSS variable
        if (heldBlock) {
            $('#gridBoard').css('--predict-color', heldBlock.color);
        }
    }

    function placeShape(blockData, startR, startC) {
        const shape = blockData.matrix;
        const color = blockData.color;
        const rows = shape.length;
        const cols = shape[0].length;
        let blocksPlaced = 0;

        // Deduct turns for active desserts moved to processBoard

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (shape[r][c] === 1) {
                    board[startR + r][startC + c] = color;
                    blocksPlaced++;
                    if (!isBonus) {
                        if (blockData.desserts && blockData.desserts[r][c]) {
                            activeTargetsOnBoard[`${startR + r},${startC + c}`] = { type: blockData.desserts[r][c] };
                        } else if (blockData.dessert && r === Math.floor(rows / 2) && c === Math.floor(cols / 2)) {
                            activeTargetsOnBoard[`${startR + r},${startC + c}`] = { type: blockData.dessert };
                        }
                    }
                }
            }
        }
        score += blocksPlaced;
        placementsSinceClear++;
        renderBoard();

        if (isBonus) {
            let floatDelay = showFloatingScore(blocksPlaced, startR, startC, false);
            setTimeout(() => updateScoreDisplay(), floatDelay);
        }
    }

    function processBoard() {
        // Check which available blocks are unplaceable BEFORE the line clear
        let unplaceableBefore = [false, false, false];
        for (let i = 0; i < 3; i++) {
            let blockData = availableBlocks[i];
            if (blockData) {
                let canPlace = false;
                for (let r = 0; r < GRID_SIZE; r++) {
                    for (let c = 0; c < GRID_SIZE; c++) {
                        if (canPlaceShape(blockData.matrix, r, c)) { canPlace = true; break; }
                    }
                    if (canPlace) break;
                }
                unplaceableBefore[i] = !canPlace;
            }
        }

        let rowsToClear = [];
        let colsToClear = [];

        for (let r = 0; r < GRID_SIZE; r++) {
            let full = true;
            for (let c = 0; c < GRID_SIZE; c++) {
                if (board[r][c] === 0) full = false;
            }
            if (full) rowsToClear.push(r);
        }

        for (let c = 0; c < GRID_SIZE; c++) {
            let full = true;
            for (let r = 0; r < GRID_SIZE; r++) {
                if (board[r][c] === 0) full = false;
            }
            if (full) colsToClear.push(c);
        }

        if (rowsToClear.length > 0 || colsToClear.length > 0) {
            // Line clear successful!
            placementsSinceClear = 0;
            let linesCleared = rowsToClear.length + colsToClear.length;
            comboCount += linesCleared; // Uncapped combo, jumps by lines cleared

            let dessertClearedCount = 0;
            // TARGET COLLECTION CALCULATION
            let clearedCells = new Set();
            rowsToClear.forEach(r => {
                for (let c = 0; c < GRID_SIZE; c++) clearedCells.add(`${r},${c}`);
            });
            colsToClear.forEach(c => {
                for (let r = 0; r < GRID_SIZE; r++) clearedCells.add(`${r},${c}`);
            });

            // Trigger sound effect if any targets (dessert or star) are cleared this turn
            let targetClearedThisTurn = false;
            clearedCells.forEach(key => {
                if (activeTargetsOnBoard[key]) {
                    let type = activeTargetsOnBoard[key].type;
                    if (type === 'Star' || targetsCollected[type] !== undefined) {
                        targetClearedThisTurn = true;
                    }
                }
            });

            if (targetClearedThisTurn) {
                let sound = document.getElementById('sfxCollectDessert');
                if (sound) {
                    sound.currentTime = 0;
                    sound.play().catch(e => console.log("Play collect sfx blocked", e));
                }
            }

            let targetClearedCount = 0;

            function animateTargetCollection(r, c, type, callback) {
                let cell = cellElements[r][c];
                if (!cell || cell.length === 0) {
                    if (callback) callback();
                    return;
                }

                let rect = cell[0].getBoundingClientRect();
                let emojiHtml = type === 'Star' ? '<i class="fas fa-star" style="color:gold;"></i>' : (DESSERT_EMOJIS[type] || '🍬');

                let flier = $(`<div class="flying-target" style="position:fixed; z-index:9999; font-size:40px; pointer-events:none; left:${rect.left}px; top:${rect.top}px; transform: scale(1); opacity:1; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.5)); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                    ${emojiHtml}
                </div>`);

                $('body').append(flier);

                setTimeout(() => {
                    // Pop out and slightly right
                    flier.css('transform', 'scale(1.5) translate(20px, -20px)');

                    setTimeout(() => {
                        // Find specific target item in target panel
                        let targetItem = $(`.target-item[data-dessert="${type}"]`);
                        let destRect = null;
                        if (targetItem.length) {
                            destRect = targetItem[0].getBoundingClientRect();
                        } else {
                            let targetPanel = $("#targetPanel");
                            if (targetPanel.length) {
                                destRect = targetPanel[0].getBoundingClientRect();
                            }
                        }

                        if (destRect) {
                            flier.css({
                                'transition': 'all 0.6s cubic-bezier(0.5, 0, 0.2, 1)',
                                'left': `${destRect.left + destRect.width / 2 - 20}px`,
                                'top': `${destRect.top + destRect.height / 2 - 20}px`,
                                'transform': 'scale(0.3)',
                                'opacity': '0'
                            });

                            setTimeout(() => {
                                flier.remove();
                                if (targetItem.length) {
                                    targetItem.css('transform', 'scale(1.3)');
                                    setTimeout(() => {
                                        targetItem.css('transform', 'scale(1)');
                                    }, 200);
                                }
                                if (callback) callback();
                            }, 600);
                        } else {
                            flier.fadeOut(400, function () {
                                $(this).remove();
                                if (callback) callback();
                            });
                        }
                    }, 350);
                }, 50);
            }

            clearedCells.forEach(key => {
                if (activeTargetsOnBoard[key]) {
                    let type = activeTargetsOnBoard[key].type;
                    let parts = key.split(',');
                    let cr = parseInt(parts[0]);
                    let cc = parseInt(parts[1]);

                    if (type === 'Star') {
                        targetClearedCount++;
                        pendingTargetAnimations++;
                        animateTargetCollection(cr, cc, type, function () {
                            starsCollected++;
                            if (typeof window.updateTargetUI === 'function') window.updateTargetUI();
                            pendingTargetAnimations--;
                            checkAdventureWin();
                        });
                    } else if (targetsCollected[type] !== undefined) {
                        dessertClearedCount++;
                        targetClearedCount++;
                        pendingTargetAnimations++;
                        animateTargetCollection(cr, cc, type, function () {
                            targetsCollected[type]++;
                            if (typeof window.updateTargetUI === 'function') window.updateTargetUI();
                            pendingTargetAnimations--;
                            checkAdventureWin();
                        });
                    }
                    delete activeTargetsOnBoard[key];
                }
            });

            // Base score for line clear
            let finalClearScore = (linesCleared * 10) + (comboCount * 50);
            score += finalClearScore;

            // Determine where to spawn floating score
            if (isBonus) {
                let floatR = rowsToClear.length > 0 ? rowsToClear[0] : (colsToClear.length > 0 ? 3 : 3);
                let floatC = colsToClear.length > 0 ? colsToClear[0] : (rowsToClear.length > 0 ? 3 : 3);
                let floatDelay = showFloatingScore(finalClearScore, floatR, floatC, comboCount > 3);
                setTimeout(() => updateScoreDisplay(), floatDelay);
            }

            if (typeof window.updateTargetUI === 'function') {
                window.updateTargetUI();
            }

            // Calculate exact remaining cells after clear to check for perfect clear
            let tempBoard = board.map(row => [...row]);
            rowsToClear.forEach(r => { for (let c = 0; c < GRID_SIZE; c++) tempBoard[r][c] = 0; });
            colsToClear.forEach(c => { for (let r = 0; r < GRID_SIZE; r++) tempBoard[r][c] = 0; });
            let remainingAfterClear = 0;
            for (let r = 0; r < GRID_SIZE; r++) for (let c = 0; c < GRID_SIZE; c++) if (tempBoard[r][c] !== 0) remainingAfterClear++;

            let filledCountBeforeClear = 0;
            for (let r = 0; r < GRID_SIZE; r++) for (let c = 0; c < GRID_SIZE; c++) if (board[r][c] !== 0) filledCountBeforeClear++;

            // Check if any previously unplaceable block is now placeable (Rescue Save)
            let rescuedBlock = false;
            if (linesCleared >= 1) {
                for (let i = 0; i < 3; i++) {
                    if (unplaceableBefore[i]) {
                        let blockData = availableBlocks[i];
                        if (blockData) {
                            for (let r = 0; r < GRID_SIZE; r++) {
                                for (let c = 0; c < GRID_SIZE; c++) {
                                    if (canPlaceShapeOnTargetBoard(blockData.matrix, r, c, tempBoard)) {
                                        rescuedBlock = true;
                                        break;
                                    }
                                }
                                if (rescuedBlock) break;
                            }
                        }
                    }
                }
            }

            // Praise Logic
            let praiseTier = 0;
            let praiseText = "";
            let praiseClass = "";
            let praiseAudioId = "";

            let isClutchSave = (filledCountBeforeClear >= 48 && linesCleared >= 1) || rescuedBlock;

            if (remainingAfterClear === 0) {
                praiseTier = 7; praiseText = "Unbelievable!"; praiseClass = "praise-unbelievable"; praiseAudioId = "sfxUnbelievable";
            } else if (linesCleared >= 7) {
                praiseTier = 6; praiseText = "Super Fantastic!"; praiseClass = "praise-super-fantastic"; praiseAudioId = "sfxSuperFantastic";
            } else if (linesCleared === 6) {
                praiseTier = 5; praiseText = "Fantastic!"; praiseClass = "praise-fantastic"; praiseAudioId = "sfxFantastic";
            } else if (linesCleared === 5) {
                praiseTier = 4; praiseText = "Excellent!"; praiseClass = "praise-excellent"; praiseAudioId = "sfxExcellent";
            } else if (isClutchSave) {
                praiseTier = 4; praiseText = "Excellent!"; praiseClass = "praise-excellent"; praiseAudioId = "sfxExcellent";
            } else if (linesCleared === 4) {
                praiseTier = 3; praiseText = "Awesome!"; praiseClass = "praise-awesome"; praiseAudioId = "sfxAwesome";
            } else if (linesCleared === 3) {
                praiseTier = 2; praiseText = "Amazing!"; praiseClass = "praise-amazing"; praiseAudioId = "sfxAmazing";
            } else if (linesCleared === 2) {
                praiseTier = 1; praiseText = "Great!"; praiseClass = "praise-great"; praiseAudioId = "sfxGreat";
            }

            // Audio & Notification Handling: Trigger IMMEDIATELY with zero delay!
            if (praiseTier > 0) {
                showPraiseNotification(praiseText, praiseClass, praiseAudioId, praiseTier);
                let comboSoundIndex = comboCount > 10 ? 10 : comboCount;
                playSound('sfxCombo' + comboSoundIndex, 0.25);
            } else {
                let comboSoundIndex = comboCount > 10 ? 10 : comboCount;
                playSound('sfxCombo' + comboSoundIndex, 1.0);
                if (dessertClearedCount > 0) {
                    $('.game-container').addClass('gacor-shake gacor-flash');
                    setTimeout(() => $('.game-container').removeClass('gacor-shake gacor-flash'), 500);
                }
            }

            showComboPopup(comboCount);

            // Screen shake for combos
            if (comboCount > 2 && praiseTier < 3) {
                $('.game-container').addClass('gacor-shake');
                setTimeout(() => $('.game-container').removeClass('gacor-shake'), 500);
            }

            // Single confetti burst for high combos without praise
            if (praiseTier === 0 && comboCount >= 3 && typeof confetti !== 'undefined') {
                confetti({
                    particleCount: 15 + (comboCount * 2),
                    spread: 50,
                    origin: { y: 0.8 },
                    zIndex: 2000
                });
            }

            // Sweeping animations & Color-Matched Particles
            let baseSweepDelay = 0.05;
            let sweepClass = (linesCleared > 1 && comboCount > 3) ? 'rainbow-sweep' : '';

            // Snapshot exact color of every destroyed cell BEFORE zeroing out!
            let cellColorMap = {};
            rowsToClear.forEach(r => {
                for (let c = 0; c < GRID_SIZE; c++) {
                    let key = `${r},${c}`;
                    if (!cellColorMap[key]) cellColorMap[key] = board[r][c] || '#E63946';
                }
            });
            colsToClear.forEach(c => {
                for (let r = 0; r < GRID_SIZE; r++) {
                    let key = `${r},${c}`;
                    if (!cellColorMap[key]) cellColorMap[key] = board[r][c] || '#E63946';
                }
            });

            rowsToClear.forEach(r => {
                for (let c = 0; c < GRID_SIZE; c++) {
                    const delay = c * baseSweepDelay;
                    const cell = cellElements[r][c];
                    const blockColor = cellColorMap[`${r},${c}`];
                    cell.css({ 'animation-delay': `${delay}s`, 'background-color': blockColor }).addClass(`sweep-horizontal ${sweepClass}`);
                    setTimeout(() => spawnBlockDestroyParticles(cell, blockColor), delay * 1000);
                    board[r][c] = 0;
                }
            });
            colsToClear.forEach(c => {
                for (let r = 0; r < GRID_SIZE; r++) {
                    const delay = r * baseSweepDelay;
                    const cell = cellElements[r][c];
                    const blockColor = cellColorMap[`${r},${c}`];
                    cell.css({ 'animation-delay': `${delay}s`, 'background-color': blockColor }).addClass(`sweep-vertical ${sweepClass}`);
                    setTimeout(() => spawnBlockDestroyParticles(cell, blockColor), delay * 1000);
                    board[r][c] = 0;
                }
            });

            let waitTime = (GRID_SIZE * baseSweepDelay + 0.3) * 1000;

            // if (linesCleared > 0) {
            //     spawnDessertExplosion();
            // }

            setTimeout(() => {
                $('.cell').css('animation-delay', '').removeClass('sweep-horizontal sweep-vertical rainbow-sweep clearing');
                renderBoard();
                if (targetClearedCount === 0 || isBonus) {
                    checkAdventureWin();
                }
            }, waitTime);

        } else {
            // No lines cleared
            if (placementsSinceClear >= 3) {
                comboCount = 0; // Reset combo if 3 placements pass without a clear
                placementsSinceClear = 0;
            }
            checkAdventureWin();
        }
    }

    // Efek partikel pecahan blok yang warnanya persis mengikuti warna blok yang dihancurkan
    function spawnBlockDestroyParticles(cellEl, color) {
        if (!cellEl || !color || color === 'transparent' || color === 0) return;
        const domEl = cellEl[0] || cellEl;
        if (!domEl || !domEl.getBoundingClientRect) return;
        const rect = domEl.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const particleCount = 3;
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 18 + Math.random() * 30;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;
            const size = 5 + Math.random() * 6;

            const p = $('<div class="block-destroy-particle"></div>').css({
                position: 'fixed',
                left: centerX + 'px',
                top: centerY + 'px',
                width: size + 'px',
                height: size + 'px',
                backgroundColor: color,
                borderRadius: '3px',
                zIndex: 9999,
                pointerEvents: 'none',
                boxShadow: `0 0 8px ${color}, inset 1px 1px 2px rgba(255,255,255,0.8)`,
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
                opacity: 1
            });
            $('body').append(p);
            requestAnimationFrame(() => {
                p.css({
                    transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.15) rotate(${Math.random() * 180}deg)`,
                    opacity: 0
                });
            });
            setTimeout(() => p.remove(), 400);
        }
    }

    function showComboPopup(combo) {
        if (combo < 2) return;

        let glowClass = 'combo-glow-low';
        if (combo >= 3) glowClass = 'combo-glow-mid';
        if (combo >= 5) glowClass = 'combo-glow-high';
        if (combo >= 8) glowClass = 'combo-glow-ultra';

        const popup = $(`<div class="combo-popup ${glowClass}">COMBO x${combo}!</div>`);
        $('#gridBoard').append(popup);
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }

    function checkAdventureWin() {
        if (isGameOver) return;
        if (pendingTargetAnimations > 0) return;
        if (isBonus) {
            if (score >= levelObj.TargetScore) {
                isGameOver = true;
                endAdventure(0, true); // Bonus level win (0 stars)
            }
        } else {
            let allTargetsMet = targets.every(t => targetsCollected[t.Dessert] >= t.Qty);
            if (allTargetsMet) {
                isGameOver = true;
                let earnedStars = (starsCollected >= requiredStars) ? 3 : 2;
                endAdventure(earnedStars, false);
            }
        }
    }

    function checkGameOver() {
        if (isGameOver) return;
        let canPlaceAny = false;

        for (let i = 0; i < 3; i++) {
            let blockData = availableBlocks[i];
            if (blockData) {
                let shape = blockData.matrix;
                for (let r = 0; r < GRID_SIZE; r++) {
                    for (let c = 0; c < GRID_SIZE; c++) {
                        if (canPlaceShape(shape, r, c)) {
                            canPlaceAny = true;
                            break;
                        }
                    }
                    if (canPlaceAny) break;
                }
            }
            if (canPlaceAny) break;
        }

        if (!canPlaceAny && availableBlocks.some(b => b !== null)) {
            isGameOver = true;
            bgmMusic.pause();

            if (isBonus) {
                // If bonus and board is full but score not reached, fail.
                endAdventure(0, false);
            } else {
                let totalTargetQty = targets.reduce((sum, t) => sum + t.Qty, 0);
                let totalCollected = targets.reduce((sum, t) => sum + Math.min(targetsCollected[t.Dessert], t.Qty), 0);
                let halfTargetsMet = (totalTargetQty > 0) && (totalCollected >= Math.floor(totalTargetQty / 2));
                let halfStarsMet = (requiredStars > 0) && (starsCollected >= Math.ceil(requiredStars / 2));

                if (halfTargetsMet || halfStarsMet) {
                    endAdventure(1, false); // Survival!
                } else {
                    endAdventure(0, false); // Fail
                }
            }
        }
    }

    function endAdventure(stars, isBonusWin = false) {
        let isWin = stars > 0 || isBonusWin;
        let title = isWin ? 'Level Selesai!' : 'Misi Gagal!';
        if (isWin && sfxGameOver) {
            // we should ideally play a win sfx, but sfxGameOver for fail
            const winSfx = document.getElementById('sfxGameSelesai');
            if (winSfx) winSfx.play().catch(e => console.log(e));
        } else if (!isWin) {
            if (sfxGameOver) sfxGameOver.play().catch(e => console.log(e));
        }

        let resultText = isWin ? "Luar biasa!" : "Papan penuh! Coba lagi!";
        if (isBonus && isWin) resultText = "Bonus Level Selesai!";

        let swalHtml = `
            <div style="font-size: 1.2rem; color: #5a412d; margin-bottom: 10px;">
                ${resultText}
            </div>
            <div id="swal-target-summary" style="display:flex; justify-content:center; gap:20px; font-size:2rem; margin-top:20px; min-height:80px;">
                <!-- targets appended here -->
            </div>
            <div id="swal-star-summary" style="display:flex; justify-content:center; gap:10px; font-size:3rem; margin-top:10px; margin-bottom:10px; padding: 20px 0; color:#e0e0e0;">
                <i class="far fa-star" id="star-1" style="transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></i>
                <i class="far fa-star" id="star-2" style="transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></i>
                <i class="far fa-star" id="star-3" style="transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></i>
            </div>
        `;

        Swal.fire({
            title: title,
            html: swalHtml,
            showDenyButton: true,
            confirmButtonColor: '#ff5c8a',
            denyButtonColor: '#118AB2',
            confirmButtonText: isWin ? 'Lanjut' : 'Coba Lagi',
            denyButtonText: 'Kembali',
            background: '#FFFEF7',
            color: '#7B5B3A',
            allowOutsideClick: false,
            heightAuto: false,
            didOpen: () => {
                let summaryContainer = $('#swal-target-summary');
                let delay = 0;

                if (isBonus) {
                    $('#swal-star-summary').hide();
                    let scoreEl = $(`<div style="display:flex; flex-direction:column; align-items:center; opacity:0; transform:scale(0.5); transition:all 0.4s;">
                        <div style="font-size:1.2rem; margin-bottom:5px;">SCORE</div>
                        <div style="font-size:2.5rem; font-weight:bold; color:#d4af37;" class="count-anim">0</div>
                    </div>`);
                    summaryContainer.append(scoreEl);
                    setTimeout(() => {
                        scoreEl.css({ opacity: 1, transform: 'scale(1)' });
                        let current = 0;
                        let step = Math.ceil(score / 30); // finish in 30 ticks
                        let countInterval = setInterval(() => {
                            current += step;
                            if (current >= score) {
                                current = score;
                                clearInterval(countInterval);
                            }
                            scoreEl.find('.count-anim').text(current);
                        }, 30);
                    }, delay);
                } else {
                    // Regular targets
                    targets.forEach(t => {
                        let emoji = DESSERT_EMOJIS[t.Dessert] || '🍬';
                        let targetVal = targetsCollected[t.Dessert] || 0;
                        let targetEl = $(`<div style="display:flex; flex-direction:column; align-items:center; opacity:0; transform:scale(0.5); transition:all 0.4s;">
                            <div style="font-size:2.5rem;">${emoji}</div>
                            <div style="font-size:1.8rem; font-weight:bold; color:#d4af37;" class="count-anim">0</div>
                        </div>`);
                        summaryContainer.append(targetEl);
                        setTimeout(() => {
                            targetEl.css({ opacity: 1, transform: 'scale(1)' });
                            let current = 0;
                            if (targetVal > 0) {
                                let countInterval = setInterval(() => {
                                    current++;
                                    targetEl.find('.count-anim').text(current);
                                    if (current >= targetVal) clearInterval(countInterval);
                                }, 100);
                            }
                        }, delay);
                        delay += 400;
                    });

                    // Stars Animation
                    let starDelay = delay + 500;
                    setTimeout(() => {
                        let currentStar = 1;
                        if (stars > 0) {
                            let sfxStar = document.getElementById('sfxTarget'); // Reuse target sound for star
                            let starInterval = setInterval(() => {
                                let starIcon = $(`#star-${currentStar}`);
                                starIcon.removeClass('far').addClass('fas').css({
                                    'color': 'gold',
                                    'transform': 'scale(1.5)',
                                    'text-shadow': '0 0 10px rgba(255, 215, 0, 0.8)'
                                });

                                if (sfxStar) {
                                    sfxStar.currentTime = 0;
                                    sfxStar.play().catch(e => { });
                                }

                                setTimeout(() => {
                                    starIcon.css('transform', 'scale(1)');
                                }, 300);

                                currentStar++;
                                if (currentStar > stars) clearInterval(starInterval);
                            }, 500);
                        }
                    }, starDelay);
                }
            }
        }).then((result) => {
            if (isWin) {
                // SAVE ADVENTURE PROGRESS
                $.ajax({
                    url: $('#urlSaveScore').val(),
                    type: 'POST',
                    data: {
                        Mode: 'Adventure',
                        LevelId: levelObj.LevelId,
                        Stars: isBonusWin ? 0 : stars,
                        Score: score,
                        IsCompleted: isWin
                    },
                    success: function (res) {
                        if (res && res.achievementUnlocked) {
                            showInGameAchievementNotification(res.achievementName, res.achievementKey);
                            setTimeout(function () {
                                if (result.isConfirmed) {
                                    let nextUrl = $('#urlNextLevel').val();
                                    window.location.href = nextUrl ? nextUrl : ($('#urlBack').val() || '/Puzzle/Adventure');
                                } else {
                                    window.location.href = $('#urlBack').val() || '/Puzzle/Adventure';
                                }
                            }, 3500);
                        } else {
                            if (result.isConfirmed) {
                                let nextUrl = $('#urlNextLevel').val();
                                window.location.href = nextUrl ? nextUrl : ($('#urlBack').val() || '/Puzzle/Adventure');
                            } else {
                                window.location.href = $('#urlBack').val() || '/Puzzle/Adventure';
                            }
                        }
                    },
                    error: function () {
                        if (result.isConfirmed) {
                            let nextUrl = $('#urlNextLevel').val();
                            window.location.href = nextUrl ? nextUrl : ($('#urlBack').val() || '/Puzzle/Adventure');
                        } else {
                            window.location.href = $('#urlBack').val() || '/Puzzle/Adventure';
                        }
                    }
                });
            } else {
                if (result.isConfirmed) {
                    location.reload();
                } else {
                    window.location.href = $('#urlBack').val() || '/Puzzle/Adventure';
                }
            }
        });
    }

    function showPraiseNotification(text, cssClass, audioId, tier) {
        // Remove existing praise popup immediately so it never stacks or delays
        $('.praise-popup').remove();

        // Play praise sound effect instantly!
        playSound(audioId, 1.0);

        const popup = $(`<div class="praise-popup ${cssClass}">${text}</div>`);
        $('.game-container').append(popup);

        if (tier >= 3) {
            $('.game-container').addClass('gacor-shake gacor-flash');
            setTimeout(() => $('.game-container').removeClass('gacor-shake gacor-flash'), 500);
        }

        if (tier >= 2 && typeof confetti !== 'undefined') {
            confetti({
                particleCount: 15 * tier,
                spread: 50 + (tier * 5),
                origin: { y: 0.5 },
                zIndex: 2000
            });
        }

        // Snappy auto-remove matching CSS animation (1200ms instead of 3000ms)
        setTimeout(() => popup.remove(), 1200);
    }

    function showFloatingScore(amount, r, c, isFast) {
        const cell = cellElements[r][c];
        if (!cell || cell.length === 0) return 0;

        const offset = cell.offset();
        const floatEl = $(`<div class="floating-score">+${amount}</div>`);

        floatEl.css({
            left: offset.left + 15,
            top: offset.top - 10
        });
        $('body').append(floatEl);

        const targetScoreEl = $('#currentScore');
        const targetOffset = targetScoreEl.offset() || { left: 0, top: 0 };

        const duration = isFast ? 300 : 700;

        setTimeout(() => {
            floatEl.css({
                transform: `translate(${targetOffset.left - offset.left}px, ${targetOffset.top - offset.top}px) scale(0.5)`,
                opacity: 0,
                transitionDuration: `${duration}ms`
            });
        }, 20);

        setTimeout(() => {
            floatEl.remove();
        }, duration + 50);

        return duration;
    }

    function updateScoreDisplay() {
        if (!isBonus) return; // In non-bonus, we might not display score, but if we do, update it.
        let currentDisplayed = parseInt($('#currentScore').text()) || 0;
        $({ Counter: currentDisplayed }).stop(true, false).animate({ Counter: score }, {
            duration: 800,
            easing: 'swing',
            step: function (now) {
                $('#currentScore').text(Math.ceil(now));
            },
            complete: function () {
                $('#currentScore').text(score);
            }
        });
    }

    $('#gridBoard').empty();
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            $('#gridBoard').append(`<div class="cell" data-r="${r}" data-c="${c}"></div>`);
        }
    }

    // Populate cellElements cache and initialize dimensions
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            cellElements[r][c] = $(`.cell[data-r="${r}"][data-c="${c}"]`);
        }
    }
    cacheLayoutMeasurements();

    $(window).on('resize', function () {
        cacheLayoutMeasurements();
    });

    function showTargetSplash() {
        if (isBonus) {
            // Append pulse animation style if not exists
            if ($("#bonusPulseStyle").length === 0) {
                $("head").append(`<style id="bonusPulseStyle">
                    @keyframes bonusPulse {
                        0% { transform: scale(1); }
                        100% { transform: scale(1.06); }
                    }
                </style>`);
            }

            let splashHtml = `
                <div class="splash-bonus-container">
                    <div class="splash-bonus-title">Dessert Menyerang!</div>
                    <div class="splash-bonus-subtitle">TARGET SCORE</div>
                    <div id="bonusTargetScoreCount" class="splash-bonus-count">0</div>
                </div>
            `;

            let overlay = $(`<div id="targetSplashOverlay" class="splash-overlay">
                <div id="targetSplashBox" class="splash-box-boss">
                    ${splashHtml}
                </div>
            </div>`);

            $('body').append(overlay);

            setTimeout(() => {
                $("#targetSplashBox").css({ 'transform': 'scale(1)', 'opacity': '1' });

                // Start live counter counting up
                let targetVal = levelObj.TargetScore || 1000;
                let duration = 1200; // ms
                let startTime = null;

                function animateCount(timestamp) {
                    if (!startTime) startTime = timestamp;
                    let progress = timestamp - startTime;
                    let current = Math.min(Math.round((progress / duration) * targetVal), targetVal);
                    $("#bonusTargetScoreCount").text(current);
                    if (progress < duration) {
                        requestAnimationFrame(animateCount);
                    } else {
                        $("#bonusTargetScoreCount").text(targetVal);
                    }
                }
                requestAnimationFrame(animateCount);
            }, 100);

            // Wait until 2400ms (1200ms count + 1200ms pause) then fly away
            setTimeout(() => {
                let targetScoreEl = $("#currentScore");
                if (targetScoreEl.length && targetScoreEl.is(":visible")) {
                    let rect = targetScoreEl[0].getBoundingClientRect();
                    let splashBox = $("#targetSplashBox")[0].getBoundingClientRect();

                    let moveX = rect.left + (rect.width / 2) - (splashBox.left + (splashBox.width / 2));
                    let moveY = rect.top + (rect.height / 2) - (splashBox.top + (splashBox.height / 2));

                    $("#targetSplashOverlay").css('background', 'transparent');
                    $("#targetSplashBox").css({
                        'transition': 'all 0.8s cubic-bezier(0.5, 0, 0.2, 1)',
                        'transform': `translate(${moveX}px, ${moveY}px) scale(0.1)`,
                        'opacity': '0'
                    });

                    setTimeout(() => {
                        $("#targetSplashOverlay").remove();
                    }, 800);
                } else {
                    $("#targetSplashOverlay").fadeOut(500, function () { $(this).remove(); });
                }
            }, 2400);

            return;
        }

        if (!window.targets) return;
        let splashHtml = "";
        window.targets.forEach(function (t) {
            var emoji = DESSERT_EMOJIS[t.Dessert] || '🍬';
            splashHtml += `<div class="splash-item"><span class="splash-emoji">${emoji}</span><span class="splash-qty">${t.Qty}</span></div>`;
        });
        if (requiredStars > 0) {
            splashHtml += `<div class="splash-item"><i class="fas fa-star splash-star-icon"></i><span class="splash-qty">${requiredStars}</span></div>`;
        }

        let overlay = $(`<div id="targetSplashOverlay" class="splash-overlay">
            <div id="targetSplashBox" class="splash-box-normal">
                ${splashHtml}
            </div>
        </div>`);

        $('body').append(overlay);

        setTimeout(() => {
            $("#targetSplashBox").css({ 'transform': 'scale(1)', 'opacity': '1' });
        }, 50);

        setTimeout(() => {
            let targetPanel = $("#targetPanel");
            if (targetPanel.length) {
                let rect = targetPanel[0].getBoundingClientRect();
                let splashBox = $("#targetSplashBox")[0].getBoundingClientRect();

                let moveX = rect.left + (rect.width / 2) - (splashBox.left + (splashBox.width / 2));
                let moveY = rect.top + (rect.height / 2) - (splashBox.top + (splashBox.height / 2));

                $("#targetSplashOverlay").css('background', 'transparent');
                $("#targetSplashBox").css({
                    'transition': 'all 0.8s cubic-bezier(0.5, 0, 0.2, 1)',
                    'transform': `translate(${moveX}px, ${moveY}px) scale(0.2)`,
                    'opacity': '0'
                });

                setTimeout(() => {
                    $("#targetSplashOverlay").remove();
                }, 800);
            } else {
                $("#targetSplashOverlay").fadeOut(500, function () { $(this).remove(); });
            }
        }, 1800);
    }

    initBoard();
    spawnBlocks();
    showTargetSplash();

    function showInGameAchievementNotification(name, key) {
        var audio = document.getElementById("sfxNewBest");
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("Audio play failed:", e));
        }

        var emoji = "🏆";
        switch (key) {
            case "ChefMagang": emoji = "🧑‍🍳"; break;
            case "MasterPastry": emoji = "👑"; break;
            case "SoClose": emoji = "⚡"; break;
            case "PlayTime": emoji = "🕰️"; break;
            case "BintangKejora": emoji = "⭐"; break;
            case "DewaDessert": emoji = "🏁"; break;
            case "RajaBlok": emoji = "🧱"; break;
        }

        var banner = $(`
            <div id="achievementNotificationBanner" style="position:fixed; top:-120px; left:50%; transform:translateX(-50%); width:320px; background:linear-gradient(135deg, #FF9999, #FF5C8A); border:4px solid #FFFFFF; border-radius:24px; padding:12px 20px; display:flex; align-items:center; gap:12px; z-index:999999; box-shadow:0 12px 30px rgba(255, 92, 138, 0.4); font-family:'Fredoka', sans-serif; color:white; transition:all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div style="font-size:2.2rem; background:rgba(255,255,255,0.25); width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.1); flex-shrink:0;">
                    ${emoji}
                </div>
                <div style="text-align:left;">
                    <div style="font-size:0.7rem; font-weight:bold; letter-spacing:0.8px; text-transform:uppercase; color:#FAEDCD;">LENCANA TERBUKA! 🏆</div>
                    <div style="font-size:1.05rem; font-weight:bold; color:white; margin-top:2px; text-shadow:0 1px 2px rgba(0,0,0,0.1); line-height:1.2;">${name.replace(/[^a-zA-Z0-9\s]/g, '').trim()}</div>
                </div>
            </div>
        `);

        $('body').append(banner);

        setTimeout(function() {
            banner.css('top', '24px');
        }, 100);

        setTimeout(function() {
            banner.css('top', '-150px');
            setTimeout(function() {
                banner.remove();
            }, 600);
        }, 4500);
    }

    // --- GLOBAL PAGE LOADER (WITH SAFE DISMISSAL) ---
    $(window).on('beforeunload', function () {
        if ($('#global-page-loader').length === 0) {
            $('body').append('<div id="global-page-loader"><div class="loader-spinner"></div><div class="loader-text">Loading... 🍰</div></div>');
        }
        $('#global-page-loader').css('display', 'flex');
        setTimeout(function() {
            $('#global-page-loader').hide();
        }, 2200);
    });

    window.addEventListener('pageshow', function () {
        $('#global-page-loader').hide();
    });
});
