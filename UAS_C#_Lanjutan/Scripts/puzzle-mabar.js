/* Scripts/puzzle-mabar.js - 1v1 Mabar Battle Arena Engine */
$(document).ready(function () {
    const GRID_SIZE = 8;
    let board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    let myScore = 0;
    let opponentScore = 0;

    const roomId = parseInt($('#mabarRoomId').val()) || 0;
    const currentUserId = parseInt($('#currentUserId').val()) || 0;
    const isHost = $('#isHostUser').val() === 'true';
    const targetScore = parseInt($('#targetScoreVal').val()) || 1000;
    const initialTimeLimit = parseInt($('#timeLimitVal').val()) || 180;
    const urlBack = $('#urlBackToMenu').val() || '/Puzzle';

    let currentRoomStatus = $('#initialRoomStatus').val() || 'Waiting';
    let isMatchStarted = (currentRoomStatus === 'Playing');
    let isMatchFinished = (currentRoomStatus === 'Finished');

    // Combo system
    let comboCount = 0;
    let placementsSinceClear = 0;

    // Available pieces
    let availableBlocks = [null, null, null];
    let heldBlock = null;
    let isDragging = false;
    let dragYOffset = -60;

    // Board layout caching
    let boardOffset = null;
    let cellSize = 42;
    let cellElements = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));

    // Audio elements
    const sfxGrab = document.getElementById('sfxGrab');
    const sfxPlace = document.getElementById('sfxPlace');
    const sfxGameOver = document.getElementById('sfxGameOver');
    const sfxGameSelesai = document.getElementById('sfxGameSelesai');
    const sfxStartGame = document.getElementById('sfxStartGame');
    const mabarBgm = document.getElementById('mabarBgm');

    // Bold, Solid, Saturated Block Colors
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

    const SHAPES = [
        [[1, 1]], [[1, 1, 1]], [[1, 1, 1, 1]], [[1, 1, 1, 1, 1]], // H-Lines
        [[1], [1]], [[1], [1], [1]], [[1], [1], [1], [1]], [[1], [1], [1], [1], [1]], // V-Lines
        [[1, 1], [1, 1]], // 2x2
        [[1, 1, 1], [1, 1, 1]], [[1, 1], [1, 1], [1, 1]], // 3x2 and 2x3
        [[1, 1, 1], [1, 1, 1], [1, 1, 1]], // 3x3
        [[1, 0], [1, 1]], [[0, 1], [1, 1]], [[1, 1], [1, 0]], [[1, 1], [0, 1]], // Small L
        [[1, 0, 0], [1, 0, 0], [1, 1, 1]], [[0, 0, 1], [0, 0, 1], [1, 1, 1]], // Large L
        [[1, 1, 1], [1, 0, 0], [1, 0, 0]], [[1, 1, 1], [0, 0, 1], [0, 0, 1]],
        [[1, 1, 0], [0, 1, 1]], [[0, 1, 1], [1, 1, 0]], // Z and S Horizontal
        [[0, 1], [1, 1], [1, 0]], [[1, 0], [1, 1], [0, 1]], // Z and S Vertical 
        [[1, 1, 1], [0, 1, 0]], [[1, 0], [1, 1], [1, 0]], [[0, 1], [1, 1], [0, 1]] // T shapes
    ];

    // Build Board Grid DOM
    function initBoardDOM() {
        const boardEl = $('#mabarBoard');
        boardEl.empty();
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = $(`<div class="mabar-cell" data-r="${r}" data-c="${c}"></div>`);
                boardEl.append(cell);
                cellElements[r][c] = cell;
            }
        }
        cacheLayoutMeasurements();
    }

    function cacheLayoutMeasurements() {
        const boardEl = $('#mabarBoard');
        if (boardEl.length > 0) {
            boardOffset = boardEl.offset();
        }
        const cellEl = $('.mabar-cell').first();
        if (cellEl.length > 0) {
            cellSize = cellEl.outerWidth();
        }
    }

    $(window).on('resize', cacheLayoutMeasurements);

    function renderBoard() {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = cellElements[r][c];
                if (board[r][c] !== 0) {
                    cell.addClass('filled').css('background-color', board[r][c]);
                } else {
                    cell.removeClass('filled clearing hover-valid predict-clear sweep-horizontal sweep-vertical')
                        .css('background-color', '');
                }
            }
        }
    }

    // Spawn 3 playable pieces
    function spawnBlocks() {
        let hasRemaining = availableBlocks.some(b => b !== null);
        if (hasRemaining) return;

        for (let i = 0; i < 3; i++) {
            const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            const color = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
            availableBlocks[i] = { matrix: shape, color: color };
            renderOptionSlot(i);
        }

        checkBoardLockStatus();
    }

    function getMabarPreviewCellSize(shape) {
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

    function renderOptionSlot(index) {
        const slotEl = $(`.mabar-block-option[data-index="${index}"]`);
        slotEl.empty().removeClass('empty');

        const blockData = availableBlocks[index];
        if (!blockData) {
            slotEl.addClass('empty');
            return;
        }

        const grid = $('<div class="mabar-shape-grid"></div>');
        const shape = blockData.matrix;
        const color = blockData.color;
        const cellSize = getMabarPreviewCellSize(shape);

        grid.css({
            'grid-template-columns': `repeat(${shape[0].length}, ${cellSize}px)`,
            'grid-template-rows': `repeat(${shape.length}, ${cellSize}px)`
        });

        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                const cell = $('<div class="mabar-shape-cell"></div>');
                if (shape[r][c] === 1) {
                    cell.addClass('filled').css('background-color', color);
                }
                grid.append(cell);
            }
        }
        slotEl.append(grid);
    }

    // Check if player has NO valid moves left
    function checkBoardLockStatus() {
        if (!isMatchStarted || isMatchFinished) return;

        let hasValidMove = false;
        for (let i = 0; i < 3; i++) {
            const blockData = availableBlocks[i];
            if (blockData) {
                for (let r = 0; r < GRID_SIZE; r++) {
                    for (let c = 0; c < GRID_SIZE; c++) {
                        if (canPlaceShape(blockData.matrix, r, c)) {
                            hasValidMove = true;
                            break;
                        }
                    }
                    if (hasValidMove) break;
                }
            }
            if (hasValidMove) break;
        }

        if (!hasValidMove && availableBlocks.some(b => b !== null)) {
            // Board locked! Notify server
            syncScore(myScore, true);
        }
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

    // Mouse & Touch Controls
    function renderHeldBlock(blockData) {
        const hc = $('#mabar-held-container');
        hc.empty().show();

        const shape = blockData.matrix;
        const color = blockData.color;
        const grid = $('<div class="mabar-held-shape-grid"></div>');

        grid.css({
            'grid-template-columns': `repeat(${shape[0].length}, var(--cell-size))`,
            'grid-template-rows': `repeat(${shape.length}, var(--cell-size))`
        });

        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                const cell = $('<div class="mabar-held-cell"></div>');
                if (shape[r][c] === 1) {
                    cell.addClass('filled').css('background-color', color);
                }
                grid.append(cell);
            }
        }
        hc.append(grid);
    }

    function moveHeldBlock(x, y) {
        if (!heldBlock) return;
        $('#mabar-held-container').css({ left: x + 'px', top: y + 'px' });
    }

    let activeHoverCells = [];
    let activePredictCells = [];

    function clearHover() {
        activeHoverCells.forEach(cell => cell.removeClass('hover-valid'));
        activeHoverCells = [];
        activePredictCells.forEach(cell => cell.removeClass('predict-clear'));
        activePredictCells = [];
    }

    function updateHover(x, y) {
        if (!heldBlock) return;
        const target = getGridPos(x, y);
        clearHover();

        if (target && canPlaceShape(heldBlock.matrix, target.r, target.c)) {
            heldBlock.snappedTarget = target;
            const shape = heldBlock.matrix;
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[0].length; c++) {
                    if (shape[r][c] === 1) {
                        const cell = cellElements[target.r + r][target.c + c];
                        cell.addClass('hover-valid');
                        activeHoverCells.push(cell);
                    }
                }
            }
            predictClears(target.r, target.c, shape);
        } else {
            heldBlock.snappedTarget = null;
        }
    }

    function predictClears(startR, startC, shape) {
        let tempBoard = board.map(row => [...row]);
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c] === 1) tempBoard[startR + r][startC + c] = 1;
            }
        }

        for (let r = 0; r < GRID_SIZE; r++) {
            if (tempBoard[r].every(v => v !== 0)) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    cellElements[r][c].addClass('predict-clear');
                    activePredictCells.push(cellElements[r][c]);
                }
            }
        }

        for (let c = 0; c < GRID_SIZE; c++) {
            if (tempBoard.every(row => row[c] !== 0)) {
                for (let r = 0; r < GRID_SIZE; r++) {
                    cellElements[r][c].addClass('predict-clear');
                    activePredictCells.push(cellElements[r][c]);
                }
            }
        }
    }

    function getGridPos(mouseX, mouseY) {
        if (!boardOffset) cacheLayoutMeasurements();
        const step = cellSize + 2;
        const relX = mouseX - boardOffset.left - 10;
        const relY = mouseY - boardOffset.top - 10;

        if (relX < -50 || relX > (GRID_SIZE * step + 50) || relY < -50 || relY > (GRID_SIZE * step + 50)) return null;

        const c = Math.floor(relX / step);
        const r = Math.floor(relY / step);
        if (!heldBlock) return null;

        const rows = heldBlock.matrix.length;
        const cols = heldBlock.matrix[0].length;
        return { r: r - Math.floor(rows / 2), c: c - Math.floor(cols / 2) };
    }

    // Grab Block (Desktop Click)
    $(document).on('click', '.mabar-block-option:not(.empty)', function (e) {
        if (window.innerWidth <= 768) return; // Touch device handled separately
        if (heldBlock || !isMatchStarted || isMatchFinished) return;

        e.stopPropagation();
        const index = parseInt($(this).attr('data-index'));
        const blockData = availableBlocks[index];
        if (!blockData) return;

        if (sfxGrab) { sfxGrab.currentTime = 0; sfxGrab.play().catch(e => {}); }

        heldBlock = { matrix: blockData.matrix, color: blockData.color, index: index };
        $(this).find('.mabar-shape-grid').css('visibility', 'hidden');
        renderHeldBlock(heldBlock);
        moveHeldBlock(e.pageX, e.pageY);
    });

    $(document).on('mousemove', function (e) {
        if (!heldBlock) return;
        moveHeldBlock(e.pageX, e.pageY);
        updateHover(e.pageX, e.pageY);
    });

    $(document).on('click', function (e) {
        if (!heldBlock) return;
        dropHeldBlock();
    });

    // Touch / Pointer controls (Mobile)
    $(document).on('pointerdown', '.mabar-block-option:not(.empty)', function (e) {
        if (window.innerWidth > 768) return;
        if (heldBlock || !isMatchStarted || isMatchFinished) return;

        this.setPointerCapture(e.pointerId);
        e.preventDefault();

        const index = parseInt($(this).attr('data-index'));
        const blockData = availableBlocks[index];
        if (!blockData) return;

        if (sfxGrab) { sfxGrab.currentTime = 0; sfxGrab.play().catch(e => {}); }

        heldBlock = { matrix: blockData.matrix, color: blockData.color, index: index };
        isDragging = true;
        $(this).find('.mabar-shape-grid').css('visibility', 'hidden');
        renderHeldBlock(heldBlock);
        moveHeldBlock(e.pageX, e.pageY + dragYOffset);
        updateHover(e.pageX, e.pageY + dragYOffset);
    });

    $(document).on('pointermove', function (e) {
        if (!isDragging || !heldBlock) return;
        e.preventDefault();
        moveHeldBlock(e.pageX, e.pageY + dragYOffset);
        updateHover(e.pageX, e.pageY + dragYOffset);
    });

    $(document).on('pointerup pointercancel', function (e) {
        if (!isDragging || !heldBlock) return;
        isDragging = false;
        dropHeldBlock();
    });

    function dropHeldBlock() {
        if (!heldBlock) return;

        if (heldBlock.snappedTarget && canPlaceShape(heldBlock.matrix, heldBlock.snappedTarget.r, heldBlock.snappedTarget.c)) {
            placeShape(heldBlock.matrix, heldBlock.color, heldBlock.snappedTarget.r, heldBlock.snappedTarget.c);
            availableBlocks[heldBlock.index] = null;
            renderOptionSlot(heldBlock.index);

            $('#mabar-held-container').hide().empty();
            heldBlock = null;
            clearHover();

            if (sfxPlace) { sfxPlace.currentTime = 0; sfxPlace.play().catch(e => {}); }

            processLines();
            spawnBlocks();
        } else {
            // Restore slot
            $(`.mabar-block-option[data-index="${heldBlock.index}"]`).find('.mabar-shape-grid').css('visibility', 'visible');
            $('#mabar-held-container').hide().empty();
            heldBlock = null;
            clearHover();
        }
    }

    function placeShape(shape, color, startR, startC) {
        let placedCount = 0;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c] === 1) {
                    board[startR + r][startC + c] = color;
                    placedCount++;
                }
            }
        }
        myScore += placedCount;
        placementsSinceClear++;
        renderBoard();
        updateHudScores();
        syncScore(myScore, false);
    }

    // Process Line Clears with Accurate Block Color Destruction Particles
    function processLines() {
        let rowsToClear = [];
        let colsToClear = [];

        for (let r = 0; r < GRID_SIZE; r++) {
            if (board[r].every(v => v !== 0)) rowsToClear.push(r);
        }
        for (let c = 0; c < GRID_SIZE; c++) {
            if (board.every(row => row[c] !== 0)) colsToClear.push(c);
        }

        const linesCleared = rowsToClear.length + colsToClear.length;

        if (linesCleared > 0) {
            placementsSinceClear = 0;
            comboCount += linesCleared;

            const clearScore = (linesCleared * 10) + (comboCount * 50);
            myScore += clearScore;
            updateHudScores();
            syncScore(myScore, false);

            // Play combo sound
            let sndIdx = Math.min(10, comboCount);
            let comboSnd = document.getElementById('sfxCombo' + sndIdx);
            if (comboSnd) { comboSnd.currentTime = 0; comboSnd.play().catch(e => {}); }

            // Praise sound
            if (linesCleared >= 4) {
                if (sfxAwesome) { sfxAwesome.currentTime = 0; sfxAwesome.play().catch(e => {}); }
            } else if (linesCleared === 3) {
                if (sfxAmazing) { sfxAmazing.currentTime = 0; sfxAmazing.play().catch(e => {}); }
            } else if (linesCleared === 2) {
                if (sfxGreat) { sfxGreat.currentTime = 0; sfxGreat.play().catch(e => {}); }
            }

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

            const baseSweepDelay = 0.04;

            // Trigger destruction animation & color-matched particle burst
            rowsToClear.forEach(r => {
                for (let c = 0; c < GRID_SIZE; c++) {
                    const delay = c * baseSweepDelay;
                    const cell = cellElements[r][c];
                    const color = cellColorMap[`${r},${c}`];
                    cell.css({ 'animation-delay': `${delay}s`, 'background-color': color }).addClass('sweep-horizontal');
                    setTimeout(() => spawnBlockDestroyParticles(cell, color), delay * 1000);
                    board[r][c] = 0;
                }
            });

            colsToClear.forEach(c => {
                for (let r = 0; r < GRID_SIZE; r++) {
                    const delay = r * baseSweepDelay;
                    const cell = cellElements[r][c];
                    const color = cellColorMap[`${r},${c}`];
                    cell.css({ 'animation-delay': `${delay}s`, 'background-color': color }).addClass('sweep-vertical');
                    setTimeout(() => spawnBlockDestroyParticles(cell, color), delay * 1000);
                    board[r][c] = 0;
                }
            });

            const waitTime = (GRID_SIZE * baseSweepDelay + 0.3) * 1000;
            setTimeout(() => {
                $('.mabar-cell').css('animation-delay', '').removeClass('sweep-horizontal sweep-vertical');
                renderBoard();
            }, waitTime);

        } else {
            if (placementsSinceClear >= 3) {
                comboCount = 0;
                placementsSinceClear = 0;
            }
        }
    }

    // Saturated, Vibrant Particle Burst Matching Block Color
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
            const dist = 18 + Math.random() * 32;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;
            const size = 5 + Math.random() * 6;

            const p = $('<div class="block-destroy-particle"></div>').css({
                left: centerX + 'px',
                top: centerY + 'px',
                width: size + 'px',
                height: size + 'px',
                backgroundColor: color,
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

    // Sync score to server
    function syncScore(score, isLocked) {
        if (!isMatchStarted || isMatchFinished) return;

        $.ajax({
            url: '/Puzzle/UpdateMabarScore',
            type: 'POST',
            data: { roomId: roomId, score: score, isBoardLocked: isLocked },
            success: function (res) {
                if (res && res.success) {
                    if (res.status === 'Finished') {
                        handleMatchFinished(res.winnerUserId);
                    }
                }
            }
        });
    }

    // Update HUD Scores & Progress Bars
    function updateHudScores() {
        const hostScore = isHost ? myScore : opponentScore;
        const guestScore = !isHost ? myScore : opponentScore;

        $('#hudHostScore').text(hostScore.toLocaleString());
        $('#hudGuestScore').text(guestScore.toLocaleString());

        const hostPct = Math.min(100, Math.round((hostScore / targetScore) * 100));
        const guestPct = Math.min(100, Math.round((guestScore / targetScore) * 100));

        $('#hudHostScoreFill').css('width', hostPct + '%');
        $('#hudGuestScoreFill').css('width', guestPct + '%');

        // Leading indicator
        $('#hudCardHost').removeClass('leading');
        $('#hudCardGuest').removeClass('leading');

        if (hostScore > guestScore && hostScore > 0) {
            $('#hudCardHost').addClass('leading');
        } else if (guestScore > hostScore && guestScore > 0) {
            $('#hudCardGuest').addClass('leading');
        }
    }

    // Real-time Match Polling (every 1.2s)
    let pollInterval = setInterval(pollRoomStatus, 1200);

    function pollRoomStatus() {
        if (isMatchFinished) {
            clearInterval(pollInterval);
            return;
        }

        $.ajax({
            url: '/Puzzle/GetMabarRoomStatus',
            type: 'GET',
            data: { roomId: roomId },
            success: function (res) {
                if (!res || !res.success) return;

                // Sync Guest Info in Lobby
                if (res.guest) {
                    $('#lobbyGuestAvatar').attr('src', res.guest.avatar).css({ opacity: 1, filter: 'none' });
                    $('#lobbyGuestName').text(res.guest.username);
                    $('#lobbyGuestStatus').text('⚔️ Siap Bertanding').css({ background: '#06d6a0', color: '#12051e' });

                    if (isHost) {
                        $('#btnStartMabar').prop('disabled', false);
                        $('#hostLobbyNotice').hide();
                    }

                    // Sync In-Game Guest Info
                    $('#hudGuestAvatar').attr('src', res.guest.avatar);
                    $('#hudGuestName').text(res.guest.username);
                }

                // Sync Opponent Score during game
                if (res.status === 'Playing') {
                    if (!isMatchStarted) {
                        startMatchClientSide();
                    }

                    // Update Opponent Score
                    opponentScore = isHost ? (res.guest ? res.guest.score : 0) : res.host.score;
                    updateHudScores();

                    // Sync Countdown Timer
                    updateTimerDisplay(res.secondsLeft);
                }

                // Check for Game Over
                if (res.status === 'Finished') {
                    handleMatchFinished(res.winnerUserId, res.host, res.guest);
                }
            }
        });
    }

    function updateTimerDisplay(secondsLeft) {
        const mins = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;
        const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        const timerEl = $('#mabarTimer');
        timerEl.text(formatted);

        if (secondsLeft <= 30) {
            timerEl.addClass('urgent');
        } else {
            timerEl.removeClass('urgent');
        }
    }

    // Start Game Transition
    function startMatchClientSide() {
        isMatchStarted = true;
        $('#mabarLobbyOverlay').fadeOut(400);

        if (sfxStartGame) { sfxStartGame.currentTime = 0; sfxStartGame.play().catch(e => {}); }
        if (mabarBgm) { mabarBgm.volume = 0.35; mabarBgm.play().catch(e => {}); }

        initBoardDOM();
        spawnBlocks();
    }

    // Host clicks Start Match
    $('#btnStartMabar').on('click', function () {
        $(this).prop('disabled', true).text('Memulai... 🚀');
        $.ajax({
            url: '/Puzzle/StartMabarMatch',
            type: 'POST',
            data: { roomId: roomId },
            success: function (res) {
                if (res && res.success) {
                    startMatchClientSide();
                } else {
                    $('#btnStartMabar').prop('disabled', false).text('🔥 MULAI PERTANDINGAN! 🔥');
                    Swal.fire('Info', res.message || 'Gagal memulai pertandingan.', 'warning');
                }
            }
        });
    });

    // Leave / Cancel Match
    $('#btnLeaveMabar').on('click', function () {
        Swal.fire({
            title: 'Keluar dari Room?',
            text: isMatchStarted ? 'Kamu akan dinyatakan kalah (menyerah) jika keluar!' : 'Room akan ditutup jika kamu keluar.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#e63946',
            cancelButtonColor: '#6c757d',
            background: '#2b1055',
            color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/Puzzle/CancelOrLeaveMabar',
                    type: 'POST',
                    data: { roomId: roomId },
                    complete: function () {
                        window.location.href = urlBack;
                    }
                });
            }
        });
    });

    // Handle Victory / Defeat Modal
    function handleMatchFinished(winnerUserId, hostData, guestData) {
        if (isMatchFinished) return;
        isMatchFinished = true;
        clearInterval(pollInterval);

        if (mabarBgm) mabarBgm.pause();

        const didIWin = (winnerUserId === currentUserId);
        const isDraw = (winnerUserId === null);

        let title = '';
        let subtitle = '';
        let icon = '';

        if (didIWin) {
            title = '🎉 KAMU MENANG! 🏆';
            subtitle = `Hebat sekali! Kamu berhasil mengalahkan lawan dan mencapai skor tertinggi!`;
            if (sfxGameSelesai) { sfxGameSelesai.currentTime = 0; sfxGameSelesai.play().catch(e => {}); }
            if (typeof confetti !== 'undefined') {
                confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 }, zIndex: 99999 });
            }
        } else if (isDraw) {
            title = '🤝 PERTANDINGAN SERI!';
            subtitle = `Kedua pemain memiliki skor yang seimbang saat waktu berakhir!`;
            if (sfxGameSelesai) { sfxGameSelesai.currentTime = 0; sfxGameSelesai.play().catch(e => {}); }
        } else {
            title = '😢 KAMU KALAH!';
            subtitle = `Jangan patah semangat, asah kecepatanmu dan tantang temanmu lagi!`;
            if (sfxGameOver) { sfxGameOver.currentTime = 0; sfxGameOver.play().catch(e => {}); }
        }

        const hostScore = hostData ? hostData.score : (isHost ? myScore : opponentScore);
        const guestScore = guestData ? guestData.score : (!isHost ? myScore : opponentScore);
        const hostName = hostData ? hostData.username : ($('#hudHostName').text());
        const guestName = guestData ? guestData.username : ($('#hudGuestName').text());

        Swal.fire({
            title: title,
            html: `
                <div style="font-size:1rem; color:#fecfef; margin-bottom:18px;">${subtitle}</div>
                <div style="background:rgba(255,255,255,0.08); padding:16px; border-radius:14px; border:1px solid rgba(255,255,255,0.15); margin-bottom:15px;">
                    <div style="font-size:0.85rem; color:#ffd166; margin-bottom:8px; font-weight:bold;">HASIL AKHIR PERTANDINGAN:</div>
                    <div style="display:flex; justify-content:space-around; align-items:center;">
                        <div>
                            <div style="font-size:1.1rem; font-weight:bold; color:#fff;">${hostName}</div>
                            <div style="font-size:1.4rem; font-family:'Fredoka One', cursive; color:#ffd166;">${hostScore.toLocaleString()} pts</div>
                        </div>
                        <div style="font-size:1.2rem; color:#ff2a6d; font-weight:bold;">VS</div>
                        <div>
                            <div style="font-size:1.1rem; font-weight:bold; color:#fff;">${guestName}</div>
                            <div style="font-size:1.4rem; font-family:'Fredoka One', cursive; color:#ffd166;">${guestScore.toLocaleString()} pts</div>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: false,
            confirmButtonText: 'Kembali ke Menu 🏠',
            confirmButtonColor: '#f72585',
            background: '#2b1055',
            color: '#fff',
            allowOutsideClick: false,
            customClass: {
                popup: 'swal-puzzle-lb-popup'
            }
        }).then(() => {
            window.location.href = urlBack;
        });
    }

    // If game was already Playing on load
    if (isMatchStarted) {
        startMatchClientSide();
    }
});
