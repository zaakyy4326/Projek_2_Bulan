$(document).ready(function () {
    var bgm = document.getElementById("bgmMusic");
    var sfx = document.getElementById("sfxClick");

    // Pengaturan Volume
    bgm.volume = 0.2;
    sfx.volume = 0.5;

    // 1. Sinkronisasi Detik Musik dari Session Storage
    var lastTime = sessionStorage.getItem("bgm_current_time");
    if (lastTime) {
        bgm.currentTime = parseFloat(lastTime);
    }
    bgm.addEventListener("timeupdate", function () {
        sessionStorage.setItem("bgm_current_time", bgm.currentTime);
    });

    // 2. Auto-play Musik
    window.showAchievementUnlockNotification = function (name, key) {
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
    };

    let musicStarted = false;
    function startMusic() {
        if (!musicStarted) {
            bgm.play()
                .then(() => {
                    musicStarted = true;
                    $('#musicToggle').html("\u{1f50a} Musik: ON");
                })
                .catch(e => console.log("Autoplay ditahan browser, menunggu interaksi..."));
        }
    }

    $('body').on('click mousedown keydown touchstart mousemove', function () {
        startMusic();
    });

    // 3. Toggle Musik Manual
    $('#musicToggle').click(function (e) {
        e.stopPropagation();
        if (bgm.paused) {
            bgm.play();
            $(this).html("\u{1f50a} Musik: ON");
        } else {
            bgm.pause();
            $(this).html("\u{1f507} Musik: OFF");
        }
    });

    // 4. Efek Suara
    function playSfx() {
        if (window.playBubblePop) {
            window.playBubblePop();
        } else {
            sfx.currentTime = 0;
            sfx.play().catch(e => console.log("SFX play error"));
        }
    }

    $('.btn-game-menu, #btnProfilCorner').click(function () {
        playSfx();
    });

    // 5. PROFIL CORNER & MODAL EDIT PROFIL
    $(document).on('click', '#btnProfilCorner', function (e) {
        e.preventDefault();
        e.stopPropagation();

        let emailOtpTimer = null;
        let isEmailOtpActive = false;

        Swal.fire({
            title: '\u{1f4cb} Profil & Progress Player',
            html: $('#tplProfilModal').html(),
            showConfirmButton: false,
            showCloseButton: true,
            background: '#FFFEF7',
            color: '#7B5B3A',
            width: 'min(420px, 94vw)',
            customClass: {
                popup: 'swal-profile-popup'
            },
            willClose: () => {
                if (emailOtpTimer) {
                    clearInterval(emailOtpTimer);
                    emailOtpTimer = null;
                }
                if (isEmailOtpActive) {
                    isEmailOtpActive = false;
                    $.post('/MainMenu/CancelEmailChangeOtp');
                }
            },
            didOpen: () => {
                const $popup = $(Swal.getPopup());
                
                // Highlight active avatar in gallery
                const currentAvatarUrl = $('#profileCornerImg').attr('src');
                if (currentAvatarUrl) {
                    const parts = currentAvatarUrl.split('/');
                    const currentFilename = parts[parts.length - 1];
                    $popup.find(`.avatar-thumbnail-option[data-filename="${currentFilename}"]`).addClass('active');
                }

                // 5a. Gallery Avatar Click Handler
                $popup.find('.avatar-thumbnail-option').click(function () {
                    playSfx();
                    Swal.resetValidationMessage();
                    const $thumb = $(this);
                    const filename = $thumb.data('filename');
                    
                    $.ajax({
                        url: '/MainMenu/ChooseAvatar',
                        type: 'POST',
                        data: { avatarName: filename },
                        success: function (response) {
                            if (response.success) {
                                $popup.find('.avatar-thumbnail-option').removeClass('active');
                                $thumb.addClass('active');
                                
                                $popup.find('#modalAvatarPreview').attr('src', response.avatarUrl);
                                $('#profileCornerEmoji').hide();
                                $('#profileCornerImg').attr('src', response.avatarUrl).show();
                                
                                var template = document.getElementById('tplProfilModal');
                                if (template && template.content) {
                                    $(template.content).find('#modalAvatarPreview').attr('src', response.avatarUrl);
                                }
                                
                                Swal.resetValidationMessage();
                                showToast('Avatar berhasil diganti! \u{1f389}', '#4cd964');
                            } else {
                                Swal.showValidationMessage(response.message);
                            }
                        },
                        error: function () {
                            Swal.showValidationMessage('Terjadi kesalahan koneksi.');
                        }
                    });
                });

                // 5b. Custom Avatar Upload Handler
                $popup.find('#btnTriggerUpload').click(function () {
                    playSfx();
                    Swal.resetValidationMessage();
                    $popup.find('#inputCustomAvatar').click();
                });

                $popup.find('#inputCustomAvatar').change(function () {
                    const file = this.files[0];
                    if (!file) return;

                    if (file.size > 150 * 1024 * 1024) {
                        Swal.showValidationMessage('Ukuran file terlalu besar! Maksimal 150MB.');
                        return;
                    }

                    const formData = new FormData();
                    formData.append('avatarFile', file);

                    $popup.find('#btnTriggerUpload').text('\u{23f3}').prop('disabled', true);

                    $.ajax({
                        url: '/MainMenu/UploadAvatar',
                        type: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (response) {
                            $popup.find('#btnTriggerUpload').text('\u{1f4f8}').prop('disabled', false);
                            if (response.success) {
                                // Update preview in modal
                                $popup.find('#modalAvatarPreview').attr('src', response.avatarUrl);
                                // Update corner avatar on dashboard
                                $('#profileCornerEmoji').hide();
                                $('#profileCornerImg').attr('src', response.avatarUrl).show();
                                // Remove highlight from gallery list
                                $popup.find('.avatar-thumbnail-option').removeClass('active');

                                // Update template fragment for persistence across reopenings
                                var template = document.getElementById('tplProfilModal');
                                if (template && template.content) {
                                    $(template.content).find('#modalAvatarPreview').attr('src', response.avatarUrl);
                                }

                                Swal.resetValidationMessage();
                                showToast('Foto profil kustom berhasil diunggah! \u{1f4f8}', '#4cd964');
                            } else {
                                Swal.showValidationMessage(response.message);
                            }
                        },
                        error: function () {
                            $popup.find('#btnTriggerUpload').text('\u{1f4f8}').prop('disabled', false);
                            Swal.showValidationMessage('Terjadi kesalahan koneksi saat mengunggah foto.');
                        }
                    });
                });

                // 5c. Username Update Handler
                $popup.find('#btnSimpanUsername').click(function () {
                    playSfx();
                    Swal.resetValidationMessage();
                    const $btn = $(this);
                    const newName = $popup.find('#txtEditUsername').val().trim();

                    if (!newName) {
                        Swal.showValidationMessage('Username tidak boleh kosong!');
                        return;
                    }

                    $btn.prop('disabled', true).html('\u{23f3}');

                    $.ajax({
                        url: '/MainMenu/UpdateUsername',
                        type: 'POST',
                        data: { newUsername: newName },
                        success: function (response) {
                            $btn.prop('disabled', false).html('Simpan');
                            if (response.success) {
                                $('#lblDisplayUsername').text(newName);
                                $('#profileNameDisplay').text(newName);

                                // Update template fragment for persistence across reopenings
                                var template = document.getElementById('tplProfilModal');
                                if (template && template.content) {
                                    $(template.content).find('#txtEditUsername').attr('value', newName);
                                }

                                Swal.resetValidationMessage();
                                showToast(response.message, '#4cd964');
                            } else {
                                Swal.showValidationMessage(response.message);
                            }
                        },
                        error: function () {
                            $btn.prop('disabled', false).html('Simpan');
                            Swal.showValidationMessage('Terjadi kesalahan koneksi saat memperbarui nama toko.');
                        }
                    });
                });

                function stopEmailOtpTimer() {
                    if (emailOtpTimer) {
                        clearInterval(emailOtpTimer);
                        emailOtpTimer = null;
                    }
                }

                function startEmailOtpCountdown() {
                    stopEmailOtpTimer();
                    isEmailOtpActive = true;
                    let timeLeft = 120;
                    const $countdownEl = $popup.find('#emailOtpCountdown');
                    const $resendBtn = $popup.find('#btnResendEmailOtp');
                    
                    $countdownEl.text('02:00').css('color', '#FF5C8A');
                    $resendBtn.hide().prop('disabled', false);

                    emailOtpTimer = setInterval(() => {
                        timeLeft--;
                        if (timeLeft <= 0) {
                            stopEmailOtpTimer();
                            isEmailOtpActive = false;
                            $.post('/MainMenu/CancelEmailChangeOtp');
                            
                            $countdownEl.text('00:00 (Kedaluwarsa)').css('color', '#E63946');
                            $resendBtn.fadeIn().html('🔄 Kirim Ulang').prop('disabled', false);
                            $popup.find('#btnMintaOtpEmail').html('Kirim Ulang OTP').prop('disabled', false);
                            Swal.showValidationMessage('Waktu OTP habis! Silakan klik tombol Kirim Ulang untuk meminta kode baru.');
                        } else {
                            const m = Math.floor(timeLeft / 60);
                            const s = timeLeft % 60;
                            $countdownEl.text(`${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`);
                            if (timeLeft <= 30) {
                                $countdownEl.css('color', '#E63946');
                            }
                        }
                    }, 1000);
                }

                // Handler Kirim Ulang OTP di dalam form
                $popup.find('#btnResendEmailOtp').click(function () {
                    playSfx();
                    const $btn = $(this);
                    $btn.prop('disabled', true).html('Mengirim... ⏳');
                    Swal.resetValidationMessage();

                    $.ajax({
                        url: '/MainMenu/RequestEmailChangeOtp',
                        type: 'POST',
                        success: function (response) {
                            if (response.success) {
                                $popup.find('#txtEmailOtpCode').val('');
                                startEmailOtpCountdown();
                                showToast(response.message, '#4cd964');
                                Swal.resetValidationMessage();
                            } else {
                                $btn.prop('disabled', false).html('🔄 Kirim Ulang');
                                Swal.showValidationMessage(response.message);
                            }
                        },
                        error: function () {
                            $btn.prop('disabled', false).html('🔄 Kirim Ulang');
                            Swal.showValidationMessage('Gagal meminta kode OTP. Cek koneksi Anda.');
                        }
                    });
                });

                // 5d. Request Email Change OTP Handler
                $popup.find('#btnMintaOtpEmail').click(function () {
                    playSfx();
                    Swal.resetValidationMessage();
                    const $btn = $(this);
                    $btn.prop('disabled', true).html('\u{23f3}');

                    $.ajax({
                        url: '/MainMenu/RequestEmailChangeOtp',
                        type: 'POST',
                        success: function (response) {
                            if (response.success) {
                                // Tampilkan form OTP & jalankan timer 2 menit
                                $popup.find('#emailSectionOtp').slideDown();
                                showToast(response.message, '#4cd964');
                                $btn.html('Kirim Ulang OTP').prop('disabled', false);
                                startEmailOtpCountdown();
                                Swal.resetValidationMessage();
                            } else {
                                $btn.html('Ganti').prop('disabled', false);
                                Swal.showValidationMessage(response.message);
                            }
                        },
                        error: function () {
                            $btn.html('Ganti').prop('disabled', false);
                            Swal.showValidationMessage('Gagal meminta kode OTP. Cek koneksi Anda.');
                        }
                    });
                });

                // 5e. Verify and Save Email Handler
                $popup.find('#btnVerifyAndSaveEmail').click(function () {
                    playSfx();
                    Swal.resetValidationMessage();
                    const $btn = $(this);
                    const otpCode = $popup.find('#txtEmailOtpCode').val().trim();
                    const newEmail = $popup.find('#txtNewEmailAddress').val().trim();

                    if (!otpCode || !newEmail) {
                        Swal.showValidationMessage('Mohon isi kode OTP dan alamat email baru!');
                        return;
                    }

                    $btn.prop('disabled', true).html('Memproses... \u{23f3}');

                    $.ajax({
                        url: '/MainMenu/VerifyAndChangeEmail',
                        type: 'POST',
                        data: { otp: otpCode, newEmail: newEmail },
                        success: function (response) {
                            $btn.prop('disabled', false).html('Verifikasi & Ubah Email \u{2728}');
                            if (response.success) {
                                stopEmailOtpTimer();
                                isEmailOtpActive = false;
                                // Update current email display in active modal
                                $popup.find('#txtDisplayEmail').val(newEmail);
                                // Sembunyikan form OTP
                                $popup.find('#emailSectionOtp').slideUp();
                                // Bersihkan input
                                $popup.find('#txtEmailOtpCode').val('');
                                $popup.find('#txtNewEmailAddress').val('');
                                $popup.find('#btnMintaOtpEmail').html('Ganti').prop('disabled', false);
                                
                                // Update template fragment for persistence across reopenings
                                var template = document.getElementById('tplProfilModal');
                                if (template && template.content) {
                                    $(template.content).find('#txtDisplayEmail').attr('value', newEmail);
                                }

                                Swal.resetValidationMessage();
                                showToast(response.message, '#4cd964');
                            } else {
                                Swal.showValidationMessage(response.message);
                            }
                        },
                        error: function () {
                            $btn.prop('disabled', false).html('Verifikasi & Ubah Email \u{2728}');
                            Swal.showValidationMessage('Gagal memperbarui email. Terjadi kesalahan jaringan.');
                        }
                    });
                });

                // 5f. Batal Ganti Email
                $popup.find('#btnBatalGantiEmail').click(function () {
                    playSfx();
                    Swal.resetValidationMessage();
                    stopEmailOtpTimer();
                    if (isEmailOtpActive) {
                        isEmailOtpActive = false;
                        $.post('/MainMenu/CancelEmailChangeOtp');
                    }
                    $popup.find('#emailSectionOtp').slideUp();
                    $popup.find('#txtEmailOtpCode').val('');
                    $popup.find('#txtNewEmailAddress').val('');
                    $popup.find('#btnMintaOtpEmail').html('Ganti').prop('disabled', false);
                });

                // 5g. Logout Button Click Handler (Relocated)
                $popup.find('#btnModalLogout').click(function () {
                    playSfx();
                    Swal.fire({
                        title: '\u{1f370} Konfirmasi Keluar',
                        text: "Yakin Ingin Logout?",
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonColor: '#D4A373',
                        confirmButtonText: 'Ya, Keluar \u{1f44b}',
                        cancelButtonText: 'Batal',
                        background: '#FFFEF7',
                        color: '#7B5B3A'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            try {
                                localStorage.clear();
                                sessionStorage.clear();
                            } catch (e) { }
                            window.location.href = '/Account/Logout';
                        } else {
                            // Re-open profile modal
                            $('#btnProfilCorner').click();
                        }
                    });
                });

                // --- TAB & ACHIEVEMENTS HANDLERS IN MODAL ---
                $popup.find('#btnTabAccount').click(function () {
                    $popup.find('.modal-tab-btn').removeClass('active').css({ 'background': 'rgba(230, 204, 178, 0.4)', 'color': '#7B5B3A' });
                    $(this).addClass('active').css({ 'background': '#D4A373', 'color': 'white' });
                    $popup.find('#sectionAccountTab').show();
                    $popup.find('#sectionAchievementsTab').hide();
                });
                
                $popup.find('#btnTabAchievements').click(function () {
                    $popup.find('.modal-tab-btn').removeClass('active').css({ 'background': 'rgba(230, 204, 178, 0.4)', 'color': '#7B5B3A' });
                    $(this).addClass('active').css({ 'background': '#D4A373', 'color': 'white' });
                    $popup.find('#sectionAccountTab').hide();
                    $popup.find('#sectionAchievementsTab').show();
                    loadAchievementsBookInModal($popup);
                });

                $(document).off('change', '.achievement-checkbox-pin').on('change', '.achievement-checkbox-pin', function (e) {
                    var chk = $(this);
                    var key = chk.data('key');
                    
                    $.ajax({
                        url: '/MainMenu/PinAchievement',
                        type: 'POST',
                        data: { key: key },
                        success: function (res) {
                            if (res.success) {
                                showToast(res.message, '#4cd964');
                                updateMainScreenBadgesAndInfo();
                            } else {
                                Swal.showValidationMessage(res.message);
                                chk.prop('checked', !chk.prop('checked'));
                            }
                        },
                        error: function () {
                            showToast('Gagal memproses pin lencana.', '#ff3b30');
                            chk.prop('checked', !chk.prop('checked'));
                        }
                    });
                });
            }
        });
    });

    // Helper Toast Notification
    function showToast(message, bgColor) {
        var toast = $('<div style="position:fixed; top:20px; right:20px; background:' + bgColor + '; color:white; padding:12px 24px; border-radius:12px; font-weight:bold; z-index:99999; box-shadow:0 4px 10px rgba(0,0,0,0.2); animation:slideIn 0.3s forwards;">' + message + '</div>');
        $('body').append(toast);
        setTimeout(function() {
            toast.fadeOut(500, function() { toast.remove(); });
        }, 3000);
    }


    // 8. Tombol Mulai Menjual & Main Puzzle
    //$('#btnStartSelling, #btnPlayPuzzle').click(function (e) {
    //    //e.preventDefault();
    //    playSfx();
    //    Swal.fire({
    //        title: '\u{1f36a} Coming Soon!',
    //        text: 'Fitur ini sedang dalam pengembangan. Stay tuned! \u{1f680}',
    //        icon: 'info',
    //        confirmButtonColor: '#D4A373',
    //        background: '#FFFEF7',
    //        color: '#7B5B3A'
    //    });
    //});

    // 9. GENERATOR KUE MENGAMBANG
    const desserts = ['\u{1f9c1}', '\u{1f369}', '\u{1f370}', '\u{1f967}', '\u{1f36a}', '\u{1f36b}', '\u{1f36c}', '\u{1f36d}', '\u{1f95e}'];
    const container = $('#floating-container');
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

    // 10. SHOP (BUKU RESEP) FLOATING BUTTON
    var sfxBuyRecipe = document.getElementById("sfxBuyRecipe");

    function playBuySfx() {
        if (sfxBuyRecipe) {
            sfxBuyRecipe.currentTime = 0;
            sfxBuyRecipe.play().catch(e => console.log(e));
        }
    }

    function openShop() {
        playSfx();
        
        // Fetch content dari partial view
        $.get('/MainMenu/RecipeBookPartial', function (data) {
            Swal.fire({
                title: '',
                html: data,
                showConfirmButton: false,
                showCloseButton: true,
                background: '#FFFEF7',
                color: '#7B5B3A',
                customClass: {
                    popup: 'swal2-shop-popup'
                },
                width: '600px'
            });
        }).fail(function () {
            Swal.fire('Error', 'Gagal memuat toko resep.', 'error');
        });
    }

    $('#btnOpenShopMenu').click(function () {
        openShop();
    });

    // Delegasi event untuk tombol unlock di dalam Shop modal
    $(document).on('click', '.btnUnlockRecipe', function () {
        var recipeId = $(this).data("id");
        var $btn = $(this);

        // Kasih efek loading kecil
        $btn.html('&#x23F3;').prop('disabled', true);

        $.ajax({
            url: "/MainMenu/UnlockRecipe",
            type: "POST",
            data: { recipeId: recipeId },
            success: function (response) {
                if (response.success) {
                    playBuySfx();
                    
                    if (response.totalKoinBaru !== undefined) {
                        $('#lblTotalCoins').text(response.totalKoinBaru);
                    }
                    
                    if (response.achievementUnlocked) {
                        showAchievementUnlockNotification(response.achievementName, response.achievementKey);
                        
                        if (response.leveledUp) {
                            setTimeout(function() {
                                triggerLevelUpAnimation(response.newLevel);
                            }, 1500);
                        }
                        updateMainScreenBadgesAndInfo();
                    }
                    
                    $.get('/MainMenu/RecipeBookPartial', function (data) {
                        Swal.getHtmlContainer().innerHTML = data;
                    });
                    
                    var recipeName = $btn.closest('.rbp-card').find('.rbp-name').text();
                    // Toast success custom
                    var toast = $('<div style="position:fixed; top:20px; right:20px; background:#4cd964; color:white; padding:12px 24px; border-radius:12px; font-weight:bold; z-index:9999; box-shadow:0 4px 10px rgba(0,0,0,0.2); animation:slideIn 0.3s forwards;">' + recipeName + ' berhasil dibeli! &#x1F389;</div>');
                    $('body').append(toast);
                    setTimeout(function() {
                        toast.fadeOut(500, function() { toast.remove(); });
                    }, 2000);

                } else {
                    $btn.html('&#x1F512; Unlock').prop('disabled', false);
                    
                    // Tampilkan pesan error tanpa menutup popup shop
                    var existingAlert = $('.shop-error-alert');
                    if (existingAlert.length > 0) existingAlert.remove();
                    
                    var errorMsg = '<div class="shop-error-alert" style="background:#fef2f2; color:#ef4444; padding:10px; border-radius:12px; margin-bottom:15px; font-weight:bold; border:1px solid #fca5a5; font-size:0.9rem; animation: shake 0.5s;">' +
                                   '&#x1F61E; koin tidak cukup, silahkan bermain untuk mendapatkan koin' +
                                   '</div>';
                    
                    $('.rbp-header').after(errorMsg);
                    
                    setTimeout(function() {
                        $('.shop-error-alert').fadeOut(300, function(){ $(this).remove(); });
                    }, 4000);
                }
            },
            error: function () {
                $btn.html('&#x1F512; Unlock').prop('disabled', false);
                Swal.fire('Error', 'Terjadi kesalahan jaringan.', 'error');
            }
        });
    });

    // --- DAILY MISSIONS & HEARTBEAT LOGIC ---
    function loadDailyMissions() {
        $.ajax({
            url: '/MainMenu/GetMisiHarian',
            type: 'GET',
            success: function (response) {
                if (response.success) {
                    var container = $('#dailyMissionsContainer');
                    container.empty();
                    
                    response.data.forEach(function (m) {
                        var isCompleted = m.isCompleted;
                        var isClaimed = m.isClaimed;
                        var progressPct = (m.progress / m.target) * 100;
                        
                        var missionHtml = '';
                        var cardBg = isCompleted ? '#E8F5E9' : '#FFFDF9';
                        var borderCol = isCompleted ? '#81C784' : '#E6CCB2';
                        var titleText = '';
                        
                        if (m.type === 'Cook') {
                            titleText = `Masak & Sajikan 5 Kue <strong>${m.menuName}</strong>`;
                        } else {
                            titleText = `Jam Kerja Sibuk: Sajikan <strong>10</strong> Pelanggan Beruntun`;
                        }
                        
                        var btnHtml = '';
                        if (isCompleted && !isClaimed) {
                            var coinsReward = m.type === 'Streak' ? 40 : 10;
                            btnHtml = `<button type="button" class="btn btn-sm btn-claim-mission-reward" data-id="${m.id}" style="background:#FF5C8A; color:white; border-radius:12px; border:none; padding:4px 10px; font-weight:bold; font-size:0.75rem; cursor:pointer;">Klaim (${coinsReward}c)</button>`;
                        } else if (isClaimed) {
                            btnHtml = `<span style="color:#2E7D32; font-weight:bold; font-size:0.75rem;">Selesai ✅</span>`;
                        } else {
                            btnHtml = `<span style="color:#7B5B3A; font-weight:bold; font-size:0.75rem;">${m.progress}/${m.target}</span>`;
                        }
                        
                        missionHtml = `
                            <div class="mission-item" style="background:${cardBg}; border:1.5px solid ${borderCol}; padding:10px 12px; border-radius:14px; display:flex; flex-direction:column; gap:4px;">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:0.82rem; color:#7B5B3A; text-align:left;">${titleText}</span>
                                    ${btnHtml}
                                </div>
                                <div class="mission-bar-container" style="width:100%; height:6px; background:#FAEDCD; border-radius:3px; overflow:hidden; border:0.5px solid #D4A373; margin-top:2px;">
                                    <div class="mission-bar-fill" style="width:${progressPct}%; height:100%; background:${isCompleted ? '#81C784' : '#FF9999'}; transition: width 0.3s;"></div>
                                </div>
                            </div>
                        `;
                        container.append(missionHtml);
                    });
                }
            }
        });
    }

    // Call daily missions load initially
    loadDailyMissions();

    $(document).on('click', '.btn-claim-mission-reward', function (e) {
        e.preventDefault();
        var btn = $(this);
        var missionId = btn.data('id');
        btn.prop('disabled', true).text('Claiming...');
        
        $.ajax({
            url: '/MainMenu/ClaimMissionReward',
            type: 'POST',
            data: { missionId: missionId },
            success: function (response) {
                if (response.success) {
                    Swal.fire({
                        title: 'Hadiah Diklaim!',
                        text: response.message,
                        icon: 'success',
                        confirmButtonColor: '#FF5C8A',
                        background: '#FFFEF7',
                        color: '#7B5B3A'
                    });
                    $('#lblTotalCoins').text(response.totalCoins);
                    loadDailyMissions();
                } else {
                    Swal.fire('Gagal', response.message, 'error');
                    loadDailyMissions();
                }
            },
            error: function () {
                Swal.fire('Error', 'Kesalahan koneksi saat klaim.', 'error');
                loadDailyMissions();
            }
        });
    });

    // Heartbeat every 30 seconds
    setInterval(function () {
        $.ajax({
            url: '/MainMenu/Heartbeat',
            type: 'POST',
            success: function (response) {
                if (response.success && response.achievementUnlocked) {
                    showAchievementUnlockNotification(response.achievementName, response.achievementKey);
                    
                    if (response.leveledUp) {
                        setTimeout(function() {
                            triggerLevelUpAnimation(response.newLevel);
                        }, 1500);
                    }
                    updateMainScreenBadgesAndInfo();
                }
            }
        });
    }, 30000);

    function triggerLevelUpAnimation(newLevel) {
        Swal.fire({
            title: '⭐ NAIK LEVEL! ⭐',
            html: `<h3 style="color:#FF5C8A; font-weight:bold;">Selamat! Akun Anda naik ke Level ${newLevel}!</h3><p>Tingkat bingkai foto profil Anda telah ditingkatkan dan slot pajangan lencana bertambah!</p>`,
            icon: 'success',
            confirmButtonColor: '#FF5C8A',
            background: '#FFFEF7',
            color: '#7B5B3A',
            backdrop: `
                rgba(255,92,138,0.2)
                url("/Content/PNG/confetti.gif")
                left top
                no-repeat
            `
        });
        
        $('#lblDashboardLevel').text(newLevel);
        $('#lblPlayerLevel').text(newLevel);
        
        var avatarCorner = $('#btnProfilCorner');
        avatarCorner.removeClass('border-bronze border-silver border-gold border-rainbow');
        var borderClass = 'border-bronze';
        if (newLevel >= 15) borderClass = 'border-rainbow';
        else if (newLevel >= 10) borderClass = 'border-gold';
        else if (newLevel >= 5) borderClass = 'border-silver';
        avatarCorner.addClass(borderClass);
    }

    function updateMainScreenBadgesAndInfo() {
        $.ajax({
            url: '/MainMenu/GetBukuPencapaian',
            type: 'GET',
            success: function (response) {
                if (response.success) {
                    var badgesContainer = $('#pinnedBadgesContainer');
                    badgesContainer.empty();
                    
                    response.data.forEach(function (ach) {
                        if (ach.isUnlocked && ach.isPinned) {
                            var emoji = '';
                            switch (ach.key) {
                                case "ChefMagang": emoji = "🧑‍🍳"; break;
                                case "MasterPastry": emoji = "👑"; break;
                                case "SoClose": emoji = "⚡"; break;
                                case "PlayTime": emoji = "🕰️"; break;
                                case "BintangKejora": emoji = "⭐"; break;
                                case "DewaDessert": emoji = "🏁"; break;
                                case "RajaBlok": emoji = "🧱"; break;
                            }
                            badgesContainer.append(`<span class="pinned-badge-emoji" title="${ach.name}" style="font-size:1.1rem; margin-right:2px; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));">${emoji}</span>`);
                        }
                    });
                    
                    $('#lblDashboardLevel').text(response.level);
                    $('#lblDashboardXp').text(`${response.xp} / 300 XP`);
                    $('#xpBarFill').css('width', `${(response.xp / 300) * 100}%`);
                    $('#lblPlayerLevel').text(response.level);
                    
                    var avatarCorner = $('#btnProfilCorner');
                    avatarCorner.removeClass('border-bronze border-silver border-gold border-rainbow');
                    var borderClass = 'border-bronze';
                    if (response.level >= 15) borderClass = 'border-rainbow';
                    else if (response.level >= 10) borderClass = 'border-gold';
                    else if (response.level >= 5) borderClass = 'border-silver';
                    avatarCorner.addClass(borderClass);
                }
            }
        });
    }

    function loadAchievementsBookInModal($popup) {
        $popup.find('#achievementsGridList').html('<div class="text-muted text-center py-3" style="font-size:0.8rem; grid-column:span 3;">Loading lencana... 🏅</div>');
        $popup.find('#vouchersListContainer').html('<div class="text-muted text-center py-2" style="font-size:0.8rem;">Loading voucher...</div>');
        
        $.ajax({
            url: '/MainMenu/GetBukuPencapaian',
            type: 'GET',
            success: function (response) {
                if (response.success) {
                    $popup.find('#modalLevelVal').text(response.level);
                    $popup.find('#modalXpVal').text(`${response.xp} / 300 XP`);
                    $popup.find('#modalXpFill').css('width', `${(response.xp / 300) * 100}%`);
                    
                    var achContainer = $popup.find('#achievementsGridList');
                    achContainer.empty();
                    
                    var voucherContainer = $popup.find('#vouchersListContainer');
                    voucherContainer.empty();
                    var voucherCount = 0;
                    
                    response.data.forEach(function (ach) {
                        var isUnlocked = ach.isUnlocked;
                        var isPinned = ach.isPinned;
                        var emoji = '';
                        var badgeClass = '';
                        switch (ach.key) {
                            case "ChefMagang": emoji = "🧑‍🍳"; badgeClass = "badge-chefmagang"; break;
                            case "MasterPastry": emoji = "👑"; badgeClass = "badge-masterpastry"; break;
                            case "SoClose": emoji = "⚡"; badgeClass = "badge-soclose"; break;
                            case "PlayTime": emoji = "🕰️"; badgeClass = "badge-playtime"; break;
                            case "BintangKejora": emoji = "⭐"; badgeClass = "badge-bintangkejora"; break;
                            case "DewaDessert": emoji = "🏁"; badgeClass = "badge-dewadessert"; break;
                            case "RajaBlok": emoji = "🧱"; badgeClass = "badge-rajablok"; break;
                        }
                        
                        var lockClass = isUnlocked ? '' : 'locked';
                        var circleLockClass = isUnlocked ? badgeClass : 'locked';
                        
                        var pinCheckboxOrLock = isUnlocked 
                            ? `<label class="ach-card-pin-label" title="Pajang di Dashboard"><input type="checkbox" class="achievement-checkbox-pin" data-key="${ach.key}" ${isPinned ? 'checked' : ''} /> Pajang</label>` 
                            : `<span style="font-size:0.65rem; color:#888;"><span style="font-size:0.75rem;">🔒</span> Lock</span>`;
                            
                        var cardHtml = `
                            <div class="ach-card-item ${lockClass}" title="${ach.desc} (Hadiah: Voucher ${ach.voucher})">
                                <div class="ach-card-badge-circle ${circleLockClass}">
                                    ${emoji}
                                </div>
                                <div class="ach-card-title">${ach.name.replace(/[^a-zA-Z0-9\s]/g, '').trim()}</div>
                                <div style="font-size:0.58rem; color:#8B6B42; margin-top:-5px; margin-bottom:5px; line-height:1.2; min-height:28px; padding:0 3px;">${ach.desc}</div>
                                <div class="ach-card-status">
                                    ${pinCheckboxOrLock}
                                </div>
                            </div>
                        `;
                        achContainer.append(cardHtml);
                        
                        if (isUnlocked && ach.voucher) {
                            voucherCount++;
                            var voucherHtml = `
                                <div class="voucher-item-box">
                                    <div style="text-align:left;">
                                        <div style="font-weight:bold; color:#D93B65;">${ach.name}</div>
                                        <div style="font-size:0.68rem; color:#8B6B42;">Voucher diskon e-commerce</div>
                                    </div>
                                    <span class="voucher-code-text">${ach.voucher}</span>
                                </div>
                            `;
                            voucherContainer.append(voucherHtml);
                        }
                    });
                    
                    if (voucherCount === 0) {
                        voucherContainer.html('<div class="text-muted text-center py-2">Belum ada voucher diskon yang terbuka.</div>');
                    }
                }
            }
        });
    }

    // --- LEADERBOARD, SEARCH PLAYERS & FRIENDS LOGIC ---
    var currentFindPlayersTab = 'All'; // 'All', 'Requests', atau 'Friends'

    function updateFriendRequestBadges(count) {
        if (typeof count === 'number') {
            if (count > 0) {
                $('#badgeFriendRequests').text(count).show();
                $('#badgeCardPendingFriends').text(count).show();
            } else {
                $('#badgeFriendRequests').hide();
                $('#badgeCardPendingFriends').hide();
            }
        }
    }

    function checkPendingFriendRequests() {
        $.ajax({
            url: '/MainMenu/GetPendingFriendRequestsCount',
            type: 'GET',
            success: function(res) {
                if (res && res.success) {
                    updateFriendRequestBadges(res.count);
                }
            }
        });
    }

    // Initial check & auto-poll pending friend requests every 10 seconds
    checkPendingFriendRequests();
    setInterval(checkPendingFriendRequests, 10000);

    function loadFindPlayers(searchQuery = '') {
        var container = $('#leaderboardListContainer');
        container.html('<div class="text-muted text-center py-3" style="font-size:0.85rem;">Memuat daftar player... 🔍</div>');

        $.ajax({
            url: '/MainMenu/FindPlayers',
            type: 'GET',
            data: { search: searchQuery },
            success: function (response) {
                if (response.success) {
                    if (typeof response.pendingCount !== 'undefined') {
                        updateFriendRequestBadges(response.pendingCount);
                    }
                    container.empty();
                    
                    var listToRender = response.data;
                    if (currentFindPlayersTab === 'Friends') {
                        listToRender = response.data.filter(p => p.friendStatus === 'Accepted');
                    } else if (currentFindPlayersTab === 'Requests') {
                        listToRender = response.data.filter(p => p.friendStatus === 'ReceivedPending');
                    }

                    if (listToRender.length === 0) {
                        var noMsg = 'Tidak ada player ditemukan.';
                        if (currentFindPlayersTab === 'Friends') {
                            noMsg = 'Belum ada teman terdaftar. Cari player di tab sebelah dan tambahkan teman! 🤝';
                        } else if (currentFindPlayersTab === 'Requests') {
                            noMsg = 'Belum ada permintaan pertemanan masuk. 📩';
                        }
                        container.html(`<div class="text-muted text-center py-3" style="font-size:0.8rem; line-height:1.4;">${noMsg}</div>`);
                        return;
                    }
                    
                    listToRender.forEach(function (player) {
                        var avatarUrl = player.avatar ? player.avatar : '/Content/PNG/avatar/avatar_1.png';
                        
                        var borderClass = 'border-bronze';
                        if (player.level >= 15) borderClass = 'border-rainbow';
                        else if (player.level >= 10) borderClass = 'border-gold';
                        else if (player.level >= 5) borderClass = 'border-silver';
                        
                        var friendBtnHtml = '';
                        if (currentFindPlayersTab === 'Friends') {
                            friendBtnHtml = `<button type="button" class="leaderboard-btn-friend-action remove" data-id="${player.userId}" style="background:#FFCCD2; color:#D93B65; border:none; border-radius:12px; padding:4px 8px; font-size:0.68rem; font-weight:bold; cursor:pointer; margin-left:4px;">❌ Hapus</button>`;
                        } else if (currentFindPlayersTab === 'Requests') {
                            friendBtnHtml = `
                                <button type="button" class="leaderboard-btn-request-action accept" data-id="${player.userId}" style="background:#E8F5E9; color:#2E7D32; border:none; border-radius:12px; padding:4px 8px; font-size:0.68rem; font-weight:bold; cursor:pointer;">Acc</button>
                                <button type="button" class="leaderboard-btn-request-action reject" data-id="${player.userId}" style="background:#FFEBEE; color:#C62828; border:none; border-radius:12px; padding:4px 8px; font-size:0.68rem; font-weight:bold; cursor:pointer; margin-left:2px;">Tolak</button>
                            `;
                        } else {
                            if (player.friendStatus === 'Accepted') {
                                friendBtnHtml = `<button type="button" class="leaderboard-btn-friend-action remove" data-id="${player.userId}" style="background:#FFCCD2; color:#D93B65; border:none; border-radius:12px; padding:4px 8px; font-size:0.68rem; font-weight:bold; cursor:pointer;">❌ Hapus</button>`;
                            } else if (player.friendStatus === 'SentPending') {
                                friendBtnHtml = `<button type="button" disabled style="background:#ECEFF1; color:#78909C; border:none; border-radius:12px; padding:4px 8px; font-size:0.68rem; font-weight:bold; cursor:not-allowed;">⏳ Pending</button>`;
                            } else if (player.friendStatus === 'ReceivedPending') {
                                friendBtnHtml = `
                                    <button type="button" class="leaderboard-btn-request-action accept" data-id="${player.userId}" style="background:#E8F5E9; color:#2E7D32; border:none; border-radius:12px; padding:4px 8px; font-size:0.68rem; font-weight:bold; cursor:pointer;">Acc</button>
                                    <button type="button" class="leaderboard-btn-request-action reject" data-id="${player.userId}" style="background:#FFEBEE; color:#C62828; border:none; border-radius:12px; padding:4px 8px; font-size:0.68rem; font-weight:bold; cursor:pointer; margin-left:2px;">Tolak</button>
                                `;
                            } else {
                                friendBtnHtml = `<button type="button" class="leaderboard-btn-friend-action add" data-id="${player.userId}" style="background:#FFEAD2; color:#E65100; border:none; border-radius:12px; padding:4px 8px; font-size:0.68rem; font-weight:bold; cursor:pointer;">➕ Teman</button>`;
                            }
                        }

                        var rowHtml = `
                            <div class="leaderboard-row-item" style="padding: 6px 10px;">
                                <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                                    <div class="profile-avatar-circle ${borderClass}" style="width:34px; height:34px; flex-shrink:0;">
                                        <img src="${avatarUrl}" />
                                    </div>
                                    <div style="display:flex; flex-direction:column; text-align:left; margin-left:2px; min-width:0; flex:1;">
                                        <span style="font-size:0.8rem; font-weight:bold; color:#7B5B3A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${player.username}</span>
                                        <span style="font-size:0.65rem; color:#8B6B42; white-space:nowrap;">Lvl ${player.level}</span>
                                    </div>
                                </div>
                                <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
                                    <button type="button" class="leaderboard-btn-visit" data-id="${player.userId}" title="Lihat Profil">👁️</button>
                                    ${friendBtnHtml}
                                </div>
                            </div>
                        `;
                        container.append(rowHtml);
                    });
                }
            }
        });
    }

    // Load initial list
    loadFindPlayers();

    // Tab bindings in Temukan Player card
    $('#tabFindPlayersAll').click(function() {
        currentFindPlayersTab = 'All';
        $('.leaderboard-tab').removeClass('active').css({ 'background': 'transparent', 'color': '#8B6B42' });
        $(this).addClass('active').css({ 'background': '#FFEAD2', 'color': '#E65100' });
        loadFindPlayers($('#txtSearchPlayer').val());
    });

    $('#tabFindPlayersRequests').click(function() {
        currentFindPlayersTab = 'Requests';
        $('.leaderboard-tab').removeClass('active').css({ 'background': 'transparent', 'color': '#8B6B42' });
        $(this).addClass('active').css({ 'background': '#FFEAD2', 'color': '#E65100' });
        loadFindPlayers($('#txtSearchPlayer').val());
    });

    $('#tabFindPlayersFriends').click(function() {
        currentFindPlayersTab = 'Friends';
        $('.leaderboard-tab').removeClass('active').css({ 'background': 'transparent', 'color': '#8B6B42' });
        $(this).addClass('active').css({ 'background': '#FFEAD2', 'color': '#E65100' });
        loadFindPlayers($('#txtSearchPlayer').val());
    });

    // Search action binding
    $('#btnSearchPlayer').click(function() {
        loadFindPlayers($('#txtSearchPlayer').val());
    });

    $('#txtSearchPlayer').keypress(function(e) {
        if (e.which === 13) {
            loadFindPlayers($(this).val());
        }
    });

    // Add Friend / Remove Friend handler (with confirmation on delete)
    $(document).on('click', '.leaderboard-btn-friend-action', function(e) {
        e.preventDefault();
        var btn = $(this);
        var friendUserId = btn.data('id');
        var isAdd = btn.hasClass('add');
        
        if (!isAdd) {
            Swal.fire({
                title: 'Hapus Teman?',
                text: 'Apakah Anda yakin ingin menghapus player ini dari daftar teman Anda?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#FF5C8A',
                cancelButtonColor: '#D4A373',
                confirmButtonText: 'Ya, Hapus',
                cancelButtonText: 'Batal',
                background: '#FFFEF7',
                color: '#7B5B3A'
            }).then((result) => {
                if (result.isConfirmed) {
                    processFriendAction(btn, friendUserId, false);
                }
            });
            return;
        }

        processFriendAction(btn, friendUserId, true);
    });

    function processFriendAction(btn, friendUserId, isAdd) {
        btn.prop('disabled', true).text('⏳');
        var endpoint = isAdd ? '/MainMenu/AddFriend' : '/MainMenu/RemoveFriend';
        
        $.ajax({
            url: endpoint,
            type: 'POST',
            data: { friendUserId: friendUserId },
            success: function(res) {
                if (res.success) {
                    showToast(res.message, isAdd ? '#4cd964' : '#f57c00');
                    loadFindPlayers($('#txtSearchPlayer').val());
                } else {
                    Swal.fire('Gagal', res.message, 'error');
                    loadFindPlayers($('#txtSearchPlayer').val());
                }
            },
            error: function() {
                Swal.fire('Error', 'Terjadi kesalahan koneksi.', 'error');
                loadFindPlayers($('#txtSearchPlayer').val());
            }
        });
    }

    // Accept / Reject Request handler
    $(document).on('click', '.leaderboard-btn-request-action', function(e) {
        e.preventDefault();
        var btn = $(this);
        var requesterUserId = btn.data('id');
        var isAccept = btn.hasClass('accept');
        
        btn.prop('disabled', true).text('⏳');
        var endpoint = isAccept ? '/MainMenu/AcceptFriendRequest' : '/MainMenu/RejectFriendRequest';
        
        $.ajax({
            url: endpoint,
            type: 'POST',
            data: { requesterUserId: requesterUserId },
            success: function(res) {
                if (res.success) {
                    showToast(res.message, isAccept ? '#4cd964' : '#f57c00');
                    checkPendingFriendRequests();
                    loadFindPlayers($('#txtSearchPlayer').val());
                } else {
                    Swal.fire('Gagal', res.message, 'error');
                    checkPendingFriendRequests();
                    loadFindPlayers($('#txtSearchPlayer').val());
                }
            },
            error: function() {
                Swal.fire('Error', 'Terjadi kesalahan koneksi.', 'error');
                checkPendingFriendRequests();
                loadFindPlayers($('#txtSearchPlayer').val());
            }
        });
    });

    // Visiting profiles click handler
    $(document).on('click', '.leaderboard-btn-visit', function (e) {
        e.preventDefault();
        var userId = $(this).data('id');
        var btn = $(this);
        btn.prop('disabled', true).text('⏳');
        
        $.ajax({
            url: '/MainMenu/GetPublicProfile',
            type: 'GET',
            data: { userId: userId },
            success: function (res) {
                btn.prop('disabled', false).text('👁️');
                if (res.success) {
                    var avatarUrl = res.avatar ? res.avatar : '/Content/PNG/avatar/avatar_1.png';
                    
                    var borderClass = 'border-bronze';
                    if (res.level >= 15) borderClass = 'border-rainbow';
                    else if (res.level >= 10) borderClass = 'border-gold';
                    else if (res.level >= 5) borderClass = 'border-silver';
                    
                    var badgeListHtml = '';
                    if (res.pinned.length === 0) {
                        badgeListHtml = '<div style="font-size:0.75rem; color:#888; text-align:center; grid-column:span 3; padding:15px 0; width:100%;">Pemain ini belum memajang lencana apa pun.</div>';
                    } else {
                        res.pinned.forEach(function (ach) {
                            var emoji = '';
                            var badgeClass = '';
                            switch (ach.key) {
                                case "ChefMagang": emoji = "🧑‍🍳"; badgeClass = "badge-chefmagang"; break;
                                case "MasterPastry": emoji = "👑"; badgeClass = "badge-masterpastry"; break;
                                case "SoClose": emoji = "⚡"; badgeClass = "badge-soclose"; break;
                                case "PlayTime": emoji = "🕰️"; badgeClass = "badge-playtime"; break;
                                case "BintangKejora": emoji = "⭐"; badgeClass = "badge-bintangkejora"; break;
                                case "DewaDessert": emoji = "🏁"; badgeClass = "badge-dewadessert"; break;
                                case "RajaBlok": emoji = "🧱"; badgeClass = "badge-rajablok"; break;
                            }
                            badgeListHtml += `
                                <div class="public-profile-badge-item">
                                    <div class="ach-card-badge-circle ${badgeClass}" title="${ach.desc}">
                                        ${emoji}
                                    </div>
                                    <div style="font-size:0.7rem; font-weight:bold; color:#7B5B3A; margin-top:4px;">${ach.name.replace(/[^a-zA-Z0-9\s]/g, '').trim()}</div>
                                </div>
                            `;
                        });
                    }
                    
                    var modalHtml = `
                        <div class="profile-modal-container text-center" style="font-family: 'Fredoka', sans-serif;">
                            <div class="public-profile-header">
                                <div class="profile-avatar-circle ${borderClass}" style="width: 80px; height: 80px;">
                                    <div class="level-badge-avatar">${res.level}</div>
                                    <img src="${avatarUrl}" />
                                </div>
                                <h3 style="color:#7B5B3A; font-weight:bold; margin-top:12px; font-size:1.2rem; margin-bottom: 2px;">${res.username}</h3>
                                <span style="font-size:0.75rem; font-weight:bold; color:#8B6B42;">Skor Tertinggi Mode Klasik: 🏆 ${res.highScore}</span>
                            </div>
                            
                            <div class="public-profile-badges-title" style="font-weight:bold; color:#7B5B3A; font-size:0.85rem; margin-bottom:10px; text-align:left;">🏅 Achievement:</div>
                            <div class="public-profile-badges-grid">
                                ${badgeListHtml}
                            </div>
                        </div>
                    `;
                    
                    Swal.fire({
                        title: '👤 Profil Pemain',
                        html: modalHtml,
                        showConfirmButton: true,
                        confirmButtonText: 'Tutup',
                        confirmButtonColor: '#D4A373',
                        background: '#FFFEF7',
                        color: '#7B5B3A',
                        width: 'min(400px, 92vw)'
                    });
                } else {
                    Swal.fire('Error', res.message, 'error');
                }
            },
            error: function () {
                btn.prop('disabled', false).text('👁️');
                Swal.fire('Error', 'Gagal memuat profil pemain.', 'error');
            }
        });
    });

    // --- GLOBAL PAGE LOADER (WITH SAFE DISMISSAL) ---
    $(window).on('beforeunload', function () {
        if ($('#global-page-loader').length === 0) {
            $('body').append('<div id="global-page-loader"><div class="loader-spinner"></div><div class="loader-text">Loading... \u{1f370}</div></div>');
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