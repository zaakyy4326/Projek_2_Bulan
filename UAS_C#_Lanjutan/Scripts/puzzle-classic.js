$(document).ready(function () {
    const GRID_SIZE = 8;
    let board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    let score = 0;
    let displayScore = 0;
    let bestScore = parseInt($('#bestScore').val()) || 0;

    // Combo rules
    let comboCount = 0;
    let placementsSinceClear = 0;

    let availableBlocks = [null, null, null];
    let heldBlock = null;
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);

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
        isMobile = window.innerWidth <= 768;
    }

    // Dessert Bonus Mechanics
    let activeDesserts = {};
    const DESSERT_CONFIG = {
        'Es Krim': { emoji: '🍦', multiplier: 2, turns: 5 },
        'Donat': { emoji: '🍩', multiplier: 2, turns: 5 },
        'Cupcake': { emoji: '🧁', multiplier: 3, turns: 4 },
        'Pancake': { emoji: '🥞', multiplier: 4, turns: 4 },
        'Waffle': { emoji: '🧇', multiplier: 5, turns: 3 },
        'ShortCake': { emoji: '🍰', multiplier: 6, turns: 3 },
        'Birthday Cake': { emoji: '🎂', multiplier: 7, turns: 2 },
        'Pai': { emoji: '🥧', multiplier: 8, turns: 1 }
    };

    const sfxGrab = document.getElementById('sfxGrab');
    const sfxPlace = document.getElementById('sfxPlace');
    const sfxGameOver = document.getElementById('sfxGameOver');

    // BGMs
    const bgmMusic = document.getElementById('bgmMusic');
    const bgms = [$('#bgm1Src').val(), $('#bgm2Src').val()];
    bgmMusic.src = bgms[Math.floor(Math.random() * bgms.length)];
    bgmMusic.volume = 0.3;
    bgmMusic.play().catch(e => console.log("Auto-play blocked"));

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
        const urlBack = $('#urlBack').val();
        Swal.fire({
            title: 'Kembali ke Menu Utama?',
            text: "Skor permainanmu sejauh ini akan tersimpan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#D4A373',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Kembali',
            cancelButtonText: 'Lanjut Main',
            background: '#FFFEF7',
            color: '#7B5B3A',
            scrollbarPadding: false,
            heightAuto: false
        }).then((result) => {
            if (result.isConfirmed) {
                if (score > 0) {
                    $.ajax({
                        url: $('#urlSaveScore').val(),
                        type: 'POST',
                        data: { Mode: 'Classic', Score: score },
                        success: function (res) {
                            if (res && res.achievementUnlocked) {
                                showInGameAchievementNotification(res.achievementName, res.achievementKey);
                                setTimeout(function () {
                                    window.location.href = urlBack;
                                }, 3500);
                            } else {
                                window.location.href = urlBack;
                            }
                        },
                        error: function () {
                            window.location.href = urlBack;
                        }
                    });
                } else {
                    window.location.href = urlBack;
                }
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
                    cell.addClass('filled').css('background-color', board[r][c]);
                    if (activeDesserts[`${r},${c}`]) {
                        let dessert = activeDesserts[`${r},${c}`];
                        let config = DESSERT_CONFIG[dessert.name];
                        if (config) {
                            cell.addClass('dessert-block');
                            cell.html(`<span>${config.emoji}</span><div style="position:absolute; bottom:0; right:2px; font-size:0.6rem; color:white; font-family:sans-serif; text-shadow:1px 1px 0 #000;">${dessert.turnsLeft}</div>`);
                        }
                    } else {
                        cell.removeClass('dessert-block').empty();
                    }
                } else {
                    cell.removeClass('filled clearing hover-valid hover-invalid predict-clear dessert-block').css('background-color', '').empty();
                }
            }
        }
    }

    // INITIALIZE BOARD WITH RANDOM BLOCKS
    function initBoard() {
        const initialBlocksCount = 5 + Math.floor(Math.random() * 4); // 5 to 8 blocks
        const smallShapes = [[[1, 1]], [[1], [1]], [[1, 1], [1, 1]]];
        for (let i = 0; i < initialBlocksCount; i++) {
            let shape = smallShapes[Math.floor(Math.random() * smallShapes.length)];
            let color = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];

            // try to place randomly
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
        renderBoard();
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

            let bestSet = null;
            let fallbackSet = null;
            let maxLinesCleared = -1;
            let maxTotalScore = -1;

            // Deep Evaluation: 50 attempts to find the most satisfying combination of 3 pieces
            for (let attempt = 0; attempt < 50; attempt++) {
                let candidateSet = [];
                for (let i = 0; i < numToSpawn; i++) {
                    candidateSet.push(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
                }

                // Diagonal special event (15% chance to spawn diagonal pieces)
                if (filledCount < 40 && attempt === 0 && Math.random() < 0.15) {
                    const diagShapes = [
                        [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[0, 0, 1], [0, 1, 0], [1, 0, 0]],
                        [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], [[0, 0, 0, 1], [0, 0, 1, 0], [0, 1, 0, 0], [1, 0, 0, 0]]
                    ];
                    let diagCount = Math.random() < 0.5 ? 2 : 3;
                    candidateSet = [];
                    for (let i = 0; i < numToSpawn; i++) {
                        if (i < diagCount) candidateSet.push(diagShapes[Math.floor(Math.random() * diagShapes.length)]);
                        else candidateSet.push(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
                    }
                } else if (filledCount > 35 && attempt > 10) {
                    const smallShapes = [[[1, 1]], [[1], [1]], [[1, 1], [1, 1]], [[1, 1, 1]], [[1], [1], [1]], [[1, 0], [1, 1]]];
                    candidateSet[0] = smallShapes[Math.floor(Math.random() * smallShapes.length)];
                    if (numToSpawn > 1 && attempt > 20) candidateSet[1] = smallShapes[Math.floor(Math.random() * smallShapes.length)];
                } else if (filledCount < 20) {
                    const largeShapes = [
                        [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
                        [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]], [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]], [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]],
                        [[1, 1, 1, 1, 1]], [[1], [1], [1], [1], [1]],
                        [[1, 0, 0], [1, 0, 0], [1, 1, 1]], [[0, 0, 1], [0, 0, 1], [1, 1, 1]], [[1, 1, 1], [1, 0, 0], [1, 0, 0]], [[1, 1, 1], [0, 0, 1], [0, 0, 1]]
                    ];
                    candidateSet[0] = largeShapes[Math.floor(Math.random() * largeShapes.length)];
                    if (Math.random() > 0.4 && numToSpawn > 1) {
                        candidateSet[1] = largeShapes[Math.floor(Math.random() * largeShapes.length)];
                    }
                }

                let currentBoardState = board.map(row => [...row]);
                let totalLinesCleared = 0;
                let totalScore = 0;
                let allPlaceable = true;

                for (let piece of candidateSet) {
                    let bestPieceScore = -1;
                    let bestBoardAfter = null;
                    let pieceLines = 0;

                    for (let r = 0; r < GRID_SIZE; r++) {
                        for (let c = 0; c < GRID_SIZE; c++) {
                            if (canPlaceOnTemp(piece, r, c, currentBoardState)) {
                                let tempBoard = currentBoardState.map(row => [...row]);
                                placeOnTemp(piece, r, c, tempBoard);

                                let linesCleared = 0;
                                let rowsToClear = [];
                                let colsToClear = [];
                                for (let i = 0; i < GRID_SIZE; i++) {
                                    if (tempBoard[i].every(val => val !== 0)) rowsToClear.push(i);
                                    if (tempBoard.every(row => row[i] !== 0)) colsToClear.push(i);
                                }
                                linesCleared = rowsToClear.length + colsToClear.length;

                                if (linesCleared > 0) {
                                    rowsToClear.forEach(rowIdx => {
                                        for (let cc = 0; cc < GRID_SIZE; cc++) tempBoard[rowIdx][cc] = 0;
                                    });
                                    colsToClear.forEach(colIdx => {
                                        for (let rr = 0; rr < GRID_SIZE; rr++) tempBoard[rr][colIdx] = 0;
                                    });
                                }

                                let touching = 0;
                                for (let pr = 0; pr < piece.length; pr++) {
                                    for (let pc = 0; pc < piece[0].length; pc++) {
                                        if (piece[pr][pc]) {
                                            let br = r + pr;
                                            let bc = c + pc;
                                            if (br === 0 || tempBoard[br - 1]?.[bc]) touching++;
                                            if (br === GRID_SIZE - 1 || tempBoard[br + 1]?.[bc]) touching++;
                                            if (bc === 0 || tempBoard[br]?.[bc - 1]) touching++;
                                            if (bc === GRID_SIZE - 1 || tempBoard[br]?.[bc + 1]) touching++;
                                        }
                                    }
                                }

                                let score = linesCleared * 1000 + touching;
                                if (score > bestPieceScore) {
                                    bestPieceScore = score;
                                    bestBoardAfter = tempBoard;
                                    pieceLines = linesCleared;
                                }
                            }
                        }
                    }

                    if (bestPieceScore === -1) {
                        allPlaceable = false;
                        break;
                    } else {
                        totalScore += bestPieceScore;
                        totalLinesCleared += pieceLines;
                        currentBoardState = bestBoardAfter;
                    }
                }

                if (allPlaceable) {
                    if (!fallbackSet) fallbackSet = candidateSet;
                    if (totalLinesCleared > maxLinesCleared || (totalLinesCleared === maxLinesCleared && totalScore > maxTotalScore)) {
                        maxLinesCleared = totalLinesCleared;
                        maxTotalScore = totalScore;
                        bestSet = candidateSet;
                    }
                }
            }

            if (!bestSet) bestSet = fallbackSet;

            let shapesToSpawn = bestSet || [SHAPES[0], SHAPES[0], SHAPES[0]];

            for (let i = 0; i < 3; i++) {
                const randomColor = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
                availableBlocks[i] = { matrix: shapesToSpawn[i], color: randomColor };
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
                            sCell.addClass('filled').css('background-color', color);
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

        sfxGrab.currentTime = 0;
        sfxGrab.play().catch(err => console.log(err));

        heldBlock = { matrix: blockData.matrix, color: blockData.color, index: index };

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

            sfxPlace.currentTime = 0;
            sfxPlace.play().catch(err => console.log(err));

            processBoard();
            spawnBlocks();
        } else {
            // Restore visibility of the option block on invalid drop
            const blockDiv = $(`.block-option[data-index="${heldBlock.index}"]`);
            blockDiv.find('.shape-grid').css('visibility', 'visible');
            blockDiv.removeClass('dragging-active');

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

        sfxGrab.currentTime = 0;
        sfxGrab.play().catch(err => console.log(err));

        heldBlock = { matrix: blockData.matrix, color: blockData.color, index: index };

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
                    sCell.addClass('filled').css('background-color', color);
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
                activeHoverCells[i].removeClass('hover-valid hover-invalid');
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
                }
            }
        }
        score += blocksPlaced;
        placementsSinceClear++;
        renderBoard();

        let floatDelay = showFloatingScore(blocksPlaced, startR, startC, false);
        setTimeout(() => updateScoreDisplay(), floatDelay);
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

            // DESSERT BONUS CALCULATION
            let maxMultiplier = 1;
            let dessertClearedCount = 0;

            let clearedCells = new Set();
            rowsToClear.forEach(r => {
                for (let c = 0; c < GRID_SIZE; c++) clearedCells.add(`${r},${c}`);
            });
            colsToClear.forEach(c => {
                for (let r = 0; r < GRID_SIZE; r++) clearedCells.add(`${r},${c}`);
            });

            clearedCells.forEach(key => {
                if (activeDesserts[key]) {
                    let config = DESSERT_CONFIG[activeDesserts[key].name];
                    if (config && config.multiplier > maxMultiplier) {
                        maxMultiplier = config.multiplier;
                    }
                    dessertClearedCount++;
                    delete activeDesserts[key]; // Remove the cleared dessert
                }
            });

            // Base score for line clear
            let baseClearScore = (linesCleared * 10) + (comboCount * 50);

            // Apply dessert multiplier (only affects line clear base score)
            let finalClearScore = baseClearScore * maxMultiplier;
            score += finalClearScore;

            // Determine where to spawn floating score
            let floatR = rowsToClear.length > 0 ? rowsToClear[0] : (colsToClear.length > 0 ? 3 : 3);
            let floatC = colsToClear.length > 0 ? colsToClear[0] : (rowsToClear.length > 0 ? 3 : 3);
            let floatDelay = showFloatingScore(finalClearScore, floatR, floatC, comboCount > 3);

            setTimeout(() => updateScoreDisplay(), floatDelay);

            // Combo sound cap
            let comboSoundIndex = comboCount > 10 ? 10 : comboCount;
            let comboAudio = document.getElementById('sfxCombo' + comboSoundIndex);
            if (comboAudio) {
                comboAudio.currentTime = 0;
                comboAudio.play().catch(e => console.log(e));
            }

            showComboPopup(comboCount);

            // Screen shake for combos
            if (comboCount > 2) {
                $('.game-container').addClass('gacor-shake');
                setTimeout(() => $('.game-container').removeClass('gacor-shake'), 600);
            }

            // Confetti for combos
            if (comboCount >= 3 && typeof confetti !== 'undefined') {
                confetti({
                    particleCount: 12 + (comboCount * 2),
                    spread: 50,
                    origin: { y: 0.8 },
                    zIndex: 2000
                });
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
                // Clutch Save! When board is >= 75% full OR player rescues an unplaceable block
                praiseTier = 4; praiseText = "Excellent!"; praiseClass = "praise-excellent"; praiseAudioId = "sfxExcellent";
            } else if (linesCleared === 4) {
                praiseTier = 3; praiseText = "Awesome!"; praiseClass = "praise-awesome"; praiseAudioId = "sfxAwesome";
            } else if (linesCleared === 3) {
                praiseTier = 2; praiseText = "Amazing!"; praiseClass = "praise-amazing"; praiseAudioId = "sfxAmazing";
            } else if (linesCleared === 2) {
                praiseTier = 1; praiseText = "Great!"; praiseClass = "praise-great"; praiseAudioId = "sfxGreat";
            }

            if (praiseTier > 0) {
                showPraiseNotification(praiseText, praiseClass, praiseAudioId, praiseTier);
            } else if (dessertClearedCount > 0) {
                // Keep some basic flash if dessert cleared but no praise
                $('.game-container').addClass('gacor-shake gacor-flash');
                setTimeout(() => $('.game-container').removeClass('gacor-shake gacor-flash'), 600);
            }

            // Sweeping animations & Color-Matched Particle Effects
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
                    delete activeDesserts[`${r},${c}`]; // ensure cleanup
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
                    delete activeDesserts[`${r},${c}`]; // ensure cleanup
                }
            });

            // Spawn new desserts if combo >= 5
            if (comboCount >= 5 && Object.keys(activeDesserts).length === 0) {
                spawnDessertBlocks();
            }

            let waitTime = (GRID_SIZE * baseSweepDelay + 0.3) * 1000;

            if (dessertClearedCount > 0) {
                setTimeout(() => playMegaDessertEffect(), waitTime);
            }

            setTimeout(() => {
                $('.cell').css('animation-delay', '').removeClass('sweep-horizontal sweep-vertical rainbow-sweep clearing');
                renderBoard();
            }, waitTime);

        } else {
            // No lines cleared
            if (placementsSinceClear >= 3) {
                comboCount = 0; // Reset combo if 3 placements pass without a clear
                placementsSinceClear = 0;
            }
        }

        // Deduct turns for active desserts at the very end of the turn
        // This ensures if a dessert is cleared on its last turn (1), the player gets the bonus.
        for (let key in activeDesserts) {
            activeDesserts[key].turnsLeft--;
            if (activeDesserts[key].turnsLeft <= 0) {
                delete activeDesserts[key]; // Expirasi (Hangus)
            }
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

        const particleCount = 7;
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

    function spawnDessertBlocks() {
        let filledCells = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (board[r][c] !== 0 && !activeDesserts[`${r},${c}`]) {
                    filledCells.push({ r: r, c: c });
                }
            }
        }

        if (filledCells.length === 0) return;

        // Shuffle and pick up to 3 randomly
        filledCells.sort(() => 0.5 - Math.random());
        let maxSpawn = Math.min(3, filledCells.length);
        let spawnCount = Math.floor(Math.random() * maxSpawn) + 1; // 1 to 3 blocks

        let availableDesserts = window.UnlockedDesserts || ['Es Krim', 'Donat'];

        for (let i = 0; i < spawnCount; i++) {
            let cell = filledCells[i];
            let randomDessertName = availableDesserts[Math.floor(Math.random() * availableDesserts.length)];
            let config = DESSERT_CONFIG[randomDessertName] || DESSERT_CONFIG['Es Krim'];

            activeDesserts[`${cell.r},${cell.c}`] = {
                name: randomDessertName,
                turnsLeft: config.turns
            };
        }
    }

    function playMegaDessertEffect() {
        const availableDesserts = window.UnlockedDesserts || ['Es Krim', 'Donat'];
        const emojiMap = {
            'Es Krim': '🍦', 'Donat': '🍩', 'Cupcake': '🧁', 'Macaron': '🍔', 'Pancake': '🥞', 'Puding': '🍮', 'Waffle': '🧇', 'Croissant': '🥐'
        };

        const container = $('<div id="mega-dessert-container"></div>');
        container.css({
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: 3000, overflow: 'hidden'
        });
        $('#gridBoard').append(container);

        for (let i = 0; i < 40; i++) {
            let name = availableDesserts[Math.floor(Math.random() * availableDesserts.length)];
            let emoji = emojiMap[name] || '🍰';

            let el = $(`<div class="mega-floating-dessert">${emoji}</div>`);
            let left = Math.random() * 100;
            let duration = 0.5 + Math.random() * 0.4;
            let delay = Math.random() * 0.2;
            let size = 1.5 + Math.random() * 1.5;

            el.css({
                position: 'absolute',
                bottom: '-10%',
                left: `${left}%`,
                fontSize: `${size}rem`,
                animation: `megaFloatUp ${duration}s ease-out ${delay}s forwards`,
                opacity: 0,
                textShadow: '0 0 10px rgba(255,255,255,0.8)'
            });
            container.append(el);
        }

        setTimeout(() => container.remove(), 1000);
    }

    function showPraiseNotification(text, cssClass, audioId, tier) {
        const audio = document.getElementById(audioId);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log(e));
        }

        const popup = $(`<div class="praise-popup ${cssClass}">${text}</div>`);
        $('.game-container').append(popup);

        let crystalCount = tier * 3;
        for (let i = 0; i < crystalCount; i++) {
            let delay = Math.random() * 0.5;
            let size = 10 + Math.random() * 20;
            let tx = (Math.random() - 0.5) * 250 + 'px';
            let ty = (Math.random() - 0.5) * 250 + 'px';

            let crystal = $(`<div class="praise-crystal"></div>`);
            crystal.css({
                width: size + 'px',
                height: size + 'px',
                left: '50%',
                top: '50%',
                '--crystal-translate': `translate(${tx}, ${ty})`,
                animationDelay: `${delay}s`
            });
            popup.append(crystal);
        }

        if (tier >= 3) {
            $('.game-container').addClass('gacor-shake gacor-flash');
            setTimeout(() => $('.game-container').removeClass('gacor-shake gacor-flash'), 600);
        }

        if (tier >= 2 && typeof confetti !== 'undefined') {
            confetti({
                particleCount: 15 * tier,
                spread: 50 + (tier * 5),
                origin: { y: 0.5 },
                zIndex: 2000
            });
        }

        setTimeout(() => popup.remove(), 3000);
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
        const targetOffset = targetScoreEl.offset();

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
        displayScore = score;

        if (score > bestScore) {
            if (score > 50 && bestScore > 0 && !window.newBestShown) {
                window.newBestShown = true;

                // Show New Best Score Overlay
                const overlay = $('<div class="new-best-overlay"><div class="new-best-text">👑 NEW HIGH<br>SCORE! 👑</div></div>');
                $('body').append(overlay);
                setTimeout(() => overlay.remove(), 2000);

                const sfxNewBest = document.getElementById('sfxNewBest');
                if (sfxNewBest) {
                    sfxNewBest.currentTime = 0;
                    sfxNewBest.play().catch(e => console.log(e));
                }

                // Animate Display Best Score from 0
                $({ Counter: 0 }).animate({ Counter: score }, {
                    duration: 1500,
                    easing: 'swing',
                    step: function (now) {
                        $('#displayBestScore').text(Math.ceil(now));
                    }
                });
            } else if (!window.newBestShown) {
                // Initial best score update silently if 0
                $('#displayBestScore').text(score);
            } else {
                // Regular update if already surpassed
                $('#displayBestScore').text(score);
            }

            bestScore = score;
            $('#bestScore').val(bestScore);

            // SAVE BACKGROUND IMMEDIATELY
            $.ajax({
                url: $('#urlSaveScore').val(),
                type: 'POST',
                data: { Mode: 'Classic', Score: bestScore },
                success: function (res) {
                    if (res && res.achievementUnlocked) {
                        showInGameAchievementNotification(res.achievementName, res.achievementKey);
                    }
                }
            });
        }
    }

    function checkGameOver() {
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
            bgmMusic.pause();

            let isNewRecord = window.newBestShown; // Flag set when score > bestScore
            let goTitle = isNewRecord ? '🏆 New Record!' : 'Game Over!';
            let sfxToPlay = isNewRecord ? document.getElementById('sfxGameSelesai') : sfxGameOver;

            if (sfxToPlay) {
                sfxToPlay.currentTime = 0;
                sfxToPlay.play().catch(e => console.log(e));
            } else {
                sfxGameOver.play();
            }

            Swal.fire({
                title: goTitle,
                html: `
                    <div style="font-size: 1.2rem; color: #5a412d; margin-bottom: 10px;">
                        Score: <strong style="font-size:2.5rem; color:#ff5c8a;" id="swalScoreCounter">0</strong>
                    </div>
                    <div style="font-size: 1rem; color: #888;">
                        Best Score: <strong>${bestScore}</strong>
                    </div>
                `,
                showDenyButton: true,
                confirmButtonColor: '#ff5c8a',
                denyButtonColor: '#118AB2',
                confirmButtonText: '🔁 Main Lagi',
                denyButtonText: '&#x2630; Kembali',
                background: '#FFFEF7',
                color: '#7B5B3A',
                allowOutsideClick: false,
                scrollbarPadding: false,
                heightAuto: false,
                didOpen: () => {
                    $({ Counter: 0 }).animate({ Counter: score }, {
                        duration: 1500,
                        easing: 'swing',
                        step: function (now) {
                            $('#swalScoreCounter').text(Math.ceil(now));
                        }
                    });
                }
            }).then((result) => {
                $.ajax({
                    url: $('#urlSaveScore').val(),
                    type: 'POST',
                    data: { Mode: 'Classic', Score: score },
                    success: function () {
                        if (result.isConfirmed) {
                            location.reload();
                        } else if (result.isDenied) {
                            window.location.href = $('#urlBack').val();
                        }
                    }
                });
            });
        }
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

    initBoard();
    spawnBlocks();

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
