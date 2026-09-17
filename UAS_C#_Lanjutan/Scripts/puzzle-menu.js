$(document).ready(function() {
    const bgm = document.getElementById('puzzleBgm');
    const btnToggleBgm = document.getElementById('btnToggleBgm');
    let isBgmPlaying = false;

    // Try to auto play
    bgm.volume = 0.4;
    bgm.play().then(() => {
        isBgmPlaying = true;
    }).catch(e => {
        console.log("Autoplay prevented by browser. User must interact first.");
        btnToggleBgm.innerHTML = "&#x1F3B5; BGM OFF";
    });

    btnToggleBgm.addEventListener('click', function() {
        if (isBgmPlaying) {
            bgm.pause();
            isBgmPlaying = false;
            btnToggleBgm.innerHTML = "&#x1F3B5; BGM OFF";
        } else {
            bgm.play();
            isBgmPlaying = true;
            btnToggleBgm.innerHTML = "&#x1F3B5; BGM ON";
        }
    });

    // Reset BGM Main Menu sehingga saat kembali akan mulai dari awal
    sessionStorage.removeItem("bgm_current_time");

    // GENERATOR KUE MENGAMBANG
    const desserts = ['🧁', '🍩', '🍰', '🥧', '🍪', '🍫', '🍬', '🍭', '🥞'];
    const container = $('#floating-container');
    if (container.length > 0) {
        const totalDesserts = 14;
        container.empty();
        for (let i = 0; i < totalDesserts; i++) {
            let emoji = desserts[Math.floor(Math.random() * desserts.length)];
            let leftPos = Math.random() * 94;
            let size = 1.2 + Math.random() * 0.9;
            let duration = 14 + Math.random() * 10;
            let startTop = Math.random() * 100;
            let delay = Math.random() * -25;

            let element = $(`<div class="floating-dessert">${emoji}</div>`);
            element.css({
                'left': leftPos + '%',
                'font-size': size + 'rem',
                'animation-duration': duration + 's',
                'animation-delay': delay + 's',
                'top': startTop + 'vh',
                'pointer-events': 'none',
                'user-select': 'none'
            });
            container.append(element);
        }
    }

    // --- LEADERBOARD MODAL LOGIC ---
    function renderLeaderboardHtml(topKlasik, topLevel) {
        function buildRows(list, isScoreMode) {
            if (!list || list.length === 0) {
                return '<div style="text-align:center; padding:25px; color:#fecfef; font-size:0.9rem;">Belum ada data peringkat.</div>';
            }
            return list.map((player, idx) => {
                let rank = idx + 1;
                let rankDisplay = rank;
                if (rank === 1) rankDisplay = '🥇';
                else if (rank === 2) rankDisplay = '🥈';
                else if (rank === 3) rankDisplay = '🥉';

                let avatarHtml = player.avatar 
                    ? `<img src="${player.avatar}" class="puzzle-lb-avatar" />`
                    : `<div class="puzzle-lb-avatar-fallback">👤</div>`;

                let subText = isScoreMode 
                    ? `Level ${player.level}`
                    : `${player.xp || 0} XP`;

                let scoreBadge = isScoreMode 
                    ? `<div class="puzzle-lb-score">${(player.score || 0).toLocaleString()} <span style="font-size:0.75rem; color:#fecfef;">pts</span></div>`
                    : `<div class="puzzle-lb-score" style="color:#64B5F6;">Lvl ${player.level}</div>`;

                return `
                    <div class="puzzle-lb-item">
                        <div class="puzzle-lb-rank">${rankDisplay}</div>
                        ${avatarHtml}
                        <div class="puzzle-lb-info">
                            <span class="puzzle-lb-username">${player.username}</span>
                            <span class="puzzle-lb-sub">${subText}</span>
                        </div>
                        ${scoreBadge}
                    </div>
                `;
            }).join('');
        }

        return `
            <div class="puzzle-lb-tabs">
                <button type="button" class="puzzle-lb-tab-btn active" id="tabLbKlasik">🎮 Top Score Klasik</button>
                <button type="button" class="puzzle-lb-tab-btn" id="tabLbLevel">⭐ Top Level</button>
            </div>
            <div id="puzzleLbContent" class="puzzle-lb-list">
                ${buildRows(topKlasik, true)}
            </div>
        `;
    }

    $('#btnOpenLeaderboard').on('click', function() {
        Swal.fire({
            title: '🏆 PAPAN PERINGKAT',
            html: '<div style="padding: 30px 10px; color:#fecfef; font-size:0.95rem;">Memuat data peringkat... 🍰</div>',
            showConfirmButton: false,
            showCloseButton: true,
            heightAuto: false,
            width: 'min(440px, 94vw)',
            customClass: {
                popup: 'swal-puzzle-lb-popup'
            },
            didOpen: () => {
                $.ajax({
                    url: '/Puzzle/GetLeaderboard',
                    type: 'GET',
                    success: function(res) {
                        if (res && res.success) {
                            Swal.update({
                                html: renderLeaderboardHtml(res.topKlasik, res.topLevel)
                            });

                            let currentMode = 'klasik';

                            $('#tabLbKlasik').off('click').on('click', function() {
                                if (currentMode === 'klasik') return;
                                currentMode = 'klasik';
                                $('#tabLbLevel').removeClass('active');
                                $(this).addClass('active');
                                $('#puzzleLbContent').html(buildRows(res.topKlasik, true));
                            });

                            $('#tabLbLevel').off('click').on('click', function() {
                                if (currentMode === 'level') return;
                                currentMode = 'level';
                                $('#tabLbKlasik').removeClass('active');
                                $(this).addClass('active');
                                $('#puzzleLbContent').html(buildRows(res.topLevel, false));
                            });
                        } else {
                            Swal.update({
                                html: '<div style="color:#ff6b8b; padding:20px;">Gagal memuat papan peringkat.</div>'
                            });
                        }
                    },
                    error: function() {
                        Swal.update({
                            html: '<div style="color:#ff6b8b; padding:20px;">Terjadi kendala saat memuat data.</div>'
                        });
                    }
                });
            }
        });
    });

    // ==========================================
    // --- MABAR 1 VS 1 & PRESENCE LOGIC ---
    // ==========================================
    let isInviteModalOpen = false;
    let roomCheckInterval = null;

    // Ping Presence & Check Incoming Invites every 2.5s
    function pingPresence() {
        $.ajax({
            url: '/Puzzle/PingPresence',
            type: 'POST',
            success: function(res) {
                if (res && res.success && res.hasInvite && !isInviteModalOpen) {
                    isInviteModalOpen = true;
                    Swal.fire({
                        title: '👥 AJAKAN MAIN DENGAN TEMAN!',
                        html: `
                            <div style="text-align:center; padding:10px;">
                                <img src="${res.senderAvatar}" style="width:65px; height:65px; border-radius:50%; border:3px solid #ffd166; object-fit:cover; margin-bottom:12px; box-shadow:0 4px 12px rgba(0,0,0,0.3);" />
                                <div style="font-size:1.15rem; font-weight:bold; color:#fff; margin-bottom:6px;">${res.senderName}</div>
                                <div style="color:#fecfef; font-size:0.95rem; margin-bottom:15px;">Mengajakmu bertanding Block Blast 1 vs 1!</div>
                                <div style="background:rgba(255,255,255,0.12); padding:10px 14px; border-radius:12px; display:inline-block; font-size:0.9rem; color:#ffd166; border:1px solid rgba(255,255,255,0.2);">
                                    🎯 Target: <b>${res.targetScore.toLocaleString()} Pts</b> &bull; ⏱️ <b>3 Menit</b>
                                </div>
                            </div>
                        `,
                        showCancelButton: true,
                        confirmButtonText: 'Terima Ajakan! 🔥',
                        cancelButtonText: 'Tolak ❌',
                        confirmButtonColor: '#06d6a0',
                        cancelButtonColor: '#e63946',
                        background: '#2b1055',
                        color: '#fff',
                        heightAuto: false,
                        allowOutsideClick: false,
                        customClass: {
                            popup: 'swal-puzzle-lb-popup'
                        }
                    }).then((result) => {
                        isInviteModalOpen = false;
                        if (result.isConfirmed) {
                            // Terima tantangan
                            $.ajax({
                                url: '/Puzzle/RespondMabarInvite',
                                type: 'POST',
                                data: { inviteId: res.inviteId, accept: true },
                                success: function(acceptRes) {
                                    if (acceptRes && acceptRes.success) {
                                        window.location.href = '/Puzzle/Mabar?roomId=' + acceptRes.roomId;
                                    } else {
                                        Swal.fire({
                                            title: 'Gagal Masuk Room',
                                            text: acceptRes.message || 'Room sudah tidak tersedia.',
                                            icon: 'error',
                                            confirmButtonColor: '#ff5c8a'
                                        });
                                    }
                                }
                            });
                        } else {
                            // Tolak tantangan
                            $.ajax({
                                url: '/Puzzle/RespondMabarInvite',
                                type: 'POST',
                                data: { inviteId: res.inviteId, accept: false }
                            });
                        }
                    });
                }
            }
        });
    }

    // Jalankan ping pertama kali lalu tiap 2.5 detik
    pingPresence();
    const presenceTimer = setInterval(pingPresence, 2500);

    // Buka Modal Mabar: Buat Room & Tampilkan Teman Online
    $('#btnOpenMabar').on('click', function() {
        Swal.fire({
            title: '👥 MAIN DENGAN TEMAN (1 VS 1)',
            html: '<div style="padding:20px; color:#fecfef;">Sedang menyiapkan room tanding... 🎮</div>',
            showConfirmButton: false,
            showCloseButton: true,
            background: '#2b1055',
            color: '#fff',
            heightAuto: false,
            width: 'min(480px, 94vw)',
            customClass: {
                popup: 'swal-puzzle-lb-popup'
            },
            didOpen: () => {
                // Buat room baru di server
                $.ajax({
                    url: '/Puzzle/CreateMabarRoom',
                    type: 'POST',
                    success: function(roomRes) {
                        if (!roomRes || !roomRes.success) {
                            Swal.update({
                                html: `<div style="color:#ff6b8b; padding:20px;">${roomRes.message || 'Gagal membuat room mabar.'}</div>`
                            });
                            return;
                        }

                        const currentRoomId = roomRes.roomId;
                        const currentRoomCode = roomRes.roomCode;
                        const currentTarget = roomRes.targetScore;

                        // Muat daftar teman (hanya teman accepted)
                        $.ajax({
                            url: '/Puzzle/GetOnlineFriends',
                            type: 'GET',
                            success: function(friendsRes) {
                                if (!friendsRes || !friendsRes.success) {
                                    Swal.update({
                                        html: '<div style="color:#ff6b8b; padding:20px;">Gagal memuat daftar teman.</div>'
                                    });
                                    return;
                                }

                                const friends = friendsRes.friends || [];
                                let friendsHtml = '';

                                if (friends.length === 0) {
                                    friendsHtml = `
                                        <div style="text-align:center; padding:25px; color:#fecfef; font-size:0.95rem;">
                                            Belum ada teman terdaftar.<br>
                                            <span style="font-size:0.85rem; color:#ffd166;">Tambahkan teman terlebih dahulu di profil atau menu pertemanan! 🍰</span>
                                        </div>
                                    `;
                                } else {
                                    friendsHtml = '<div class="mabar-friend-list">';
                                    friends.forEach(f => {
                                        const statusClass = f.isOnline ? 'online' : 'offline';
                                        const statusLabel = f.isOnline ? '🟢 Online' : '⚪ Offline';
                                        const btnDisabled = !f.isOnline ? 'disabled' : '';
                                        const btnText = f.isOnline ? 'Undang Tanding ⚔️' : 'Offline';

                                        friendsHtml += `
                                            <div class="mabar-friend-card">
                                                <div class="mabar-friend-info">
                                                    <div class="mabar-friend-avatar-wrap">
                                                        <img src="${f.avatar}" class="mabar-friend-avatar" />
                                                        <div class="mabar-status-dot ${statusClass}"></div>
                                                    </div>
                                                    <div>
                                                        <div class="mabar-friend-name">${f.username}</div>
                                                        <div class="mabar-friend-meta">Lvl ${f.level} &bull; ${statusLabel}</div>
                                                    </div>
                                                </div>
                                                <button type="button" class="btn-invite-friend" data-user-id="${f.userId}" ${btnDisabled}>${btnText}</button>
                                            </div>
                                        `;
                                    });
                                    friendsHtml += '</div>';
                                }

                                const contentHtml = `
                                    <div style="text-align:center; margin-bottom:15px;">
                                        <div style="display:flex; justify-content:center; gap:10px; margin-bottom:10px;">
                                            <span style="background:rgba(255,255,255,0.1); padding:6px 12px; border-radius:10px; font-size:0.85rem; color:#ffd166;">
                                                Kode: <b>${currentRoomCode}</b>
                                            </span>
                                            <span style="background:rgba(255,255,255,0.1); padding:6px 12px; border-radius:10px; font-size:0.85rem; color:#06d6a0;">
                                                🎯 Target: <b>${currentTarget.toLocaleString()} Pts</b>
                                            </span>
                                        </div>
                                        <div style="font-size:0.95rem; color:#fecfef; font-weight:bold;">
                                            Pilih Teman Online untuk Ditandingi:
                                        </div>
                                    </div>
                                    <div id="mabarFriendsContainer">
                                        ${friendsHtml}
                                    </div>
                                    <div id="mabarRoomStatusArea" style="margin-top:15px; text-align:center; font-size:0.9rem; color:#ffd166;">
                                        Menunggu lawan bergabung... ⏳
                                    </div>
                                    <div style="margin-top:16px; padding:10px 12px; background:rgba(255,255,255,0.08); border-radius:14px; border:1px dashed rgba(255,209,102,0.4); text-align:center;">
                                        <div style="font-size:0.82rem; color:#fecfef; font-weight:bold; margin-bottom:6px;">Punya Kode Room dari Teman? 🔑</div>
                                        <div style="display:flex; gap:6px; justify-content:center; align-items:center;">
                                            <input type="text" id="txtJoinRoomCode" placeholder="Contoh: MBR3525" maxlength="10" style="width:130px; text-transform:uppercase; text-align:center; font-family:'Fredoka One',cursive; padding:6px 8px; border-radius:10px; border:1.5px solid #ffd166; font-size:0.88rem; background:#fff; color:#333; outline:none;" />
                                            <button type="button" id="btnJoinByCode" style="background:linear-gradient(135deg, #06d6a0, #118ab2); color:#fff; border:none; border-radius:10px; padding:6px 14px; font-weight:bold; font-size:0.82rem; cursor:pointer;">Gabung 🚀</button>
                                        </div>
                                    </div>
                                `;

                                Swal.update({
                                    html: contentHtml,
                                    showCloseButton: true
                                });

                                // Event klik tombol undang teman
                                $(document).off('click', '.btn-invite-friend').on('click', '.btn-invite-friend', function() {
                                    const friendId = $(this).data('user-id');
                                    const btn = $(this);
                                    btn.prop('disabled', true).text('Mengirim... 📨');

                                    $.ajax({
                                        url: '/Puzzle/InviteFriendMabar',
                                        type: 'POST',
                                        data: { roomId: currentRoomId, friendUserId: friendId },
                                        success: function(invRes) {
                                            if (invRes && invRes.success) {
                                                btn.text('Terkirim! ⏳').css('background', '#7209b7');
                                                $('#mabarRoomStatusArea').html('Undangan dikirim! Menunggu konfirmasi teman... ✉️');
                                            } else {
                                                btn.prop('disabled', false).text('Undang Tanding ⚔️');
                                                Swal.showValidationMessage(invRes.message || 'Gagal mengirim undangan.');
                                            }
                                        }
                                    });
                                });

                                // Event gabung via kode room
                                $(document).off('click', '#btnJoinByCode').on('click', '#btnJoinByCode', function() {
                                    const code = $('#txtJoinRoomCode').val().trim();
                                    if (!code) {
                                        Swal.showValidationMessage('Masukkan kode room terlebih dahulu.');
                                        return;
                                    }
                                    const btn = $(this);
                                    btn.prop('disabled', true).text('Memeriksa... ⏳');

                                    $.ajax({
                                        url: '/Puzzle/JoinMabarRoomByCode',
                                        type: 'POST',
                                        data: { roomCode: code },
                                        success: function(joinRes) {
                                            if (joinRes && joinRes.success) {
                                                $('#mabarRoomStatusArea').html('<span style="color:#06d6a0; font-weight:bold;">Berhasil masuk room! Mengalihkan... 🚀</span>');
                                                setTimeout(function() {
                                                    window.location.href = '/Puzzle/Mabar?roomId=' + joinRes.roomId;
                                                }, 700);
                                            } else {
                                                btn.prop('disabled', false).text('Gabung 🚀');
                                                Swal.showValidationMessage(joinRes.message || 'Kode room tidak valid.');
                                            }
                                        },
                                        error: function() {
                                            btn.prop('disabled', false).text('Gabung 🚀');
                                            Swal.showValidationMessage('Terjadi kesalahan koneksi.');
                                        }
                                    });
                                });

                                // Polling cek apakah lawan sudah menerima & masuk room
                                if (roomCheckInterval) clearInterval(roomCheckInterval);
                                roomCheckInterval = setInterval(function() {
                                    $.ajax({
                                        url: '/Puzzle/GetMabarRoomStatus',
                                        type: 'GET',
                                        data: { roomId: currentRoomId },
                                        success: function(statusRes) {
                                            if (statusRes && statusRes.success && statusRes.guest) {
                                                clearInterval(roomCheckInterval);
                                                $('#mabarRoomStatusArea').html(`
                                                    <div style="color:#06d6a0; font-weight:bold; font-size:1.05rem; margin-bottom:10px;">
                                                        🎉 ${statusRes.guest.username} telah bergabung!
                                                    </div>
                                                    <div style="font-size:0.9rem; color:#fff;">Mengarahkan ke arena pertandingan... ⚔️</div>
                                                `);
                                                setTimeout(function() {
                                                    window.location.href = '/Puzzle/Mabar?roomId=' + currentRoomId;
                                                }, 1200);
                                            }
                                        }
                                    });
                                }, 1500);
                            }
                        });
                    }
                });
            },
            willClose: () => {
                if (roomCheckInterval) {
                    clearInterval(roomCheckInterval);
                    roomCheckInterval = null;
                }
            }
        });
    });

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
