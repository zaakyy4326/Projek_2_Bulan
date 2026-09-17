$(document).ready(function () {
    var bgm = document.getElementById("bgmMusic");
    var sfx = document.getElementById("sfxClick");

    // Set volume lebih pas
    bgm.volume = 0.2;
    sfx.volume = 0.5;

    // GENERATOR KUE MENGAMBANG
    const desserts = ['🧁', '🍩', '🍰', '🥧', '🍪', '🍫', '🍬', '🍭', '🥞', '🍩'];
    const container = $('#floating-container');
    const totalDesserts = 30; // Jumlah yang pas agar tidak terlalu sepi/ramai

    for (let i = 0; i < totalDesserts; i++) {
        let emoji = desserts[Math.floor(Math.random() * desserts.length)];
        let leftPos = Math.random() * 95; // Batasi max 95% agar tidak keluar layar kanan
        let size = 1.5 + Math.random() * 1.8; // Variasi ukuran yang gemas
        let duration = 12 + Math.random() * 8; // Durasi terbang (12s - 20s)

        // Trik sebaran merata: bagi kemunculan awal di sepanjang tinggi layar yang berbeda-beda
        let startTop = Math.random() * 100;
        let delay = Math.random() * -20; // Menggunakan delay MINUS agar animasi langsung berjalan di tengah layar saat halaman dimuat

        let element = $(`<div class="floating-dessert">${emoji}</div>`);
        element.css({
            'left': leftPos + '%',
            'font-size': size + 'rem',
            'animation-duration': duration + 's',
            'animation-delay': delay + 's', // Langsung aktif menyebar tanpa mengantre dari bawah
            'top': startTop + 'vh'
        });

        container.append(element);
    }

    // Auto-play musik dengan interaksi pertama
    let musicStarted = false;

    function startMusic() {
        if (!musicStarted) {
            bgm.play()
                .then(() => {
                    musicStarted = true;
                    $('#musicToggle').html("🔊 Musik: ON");
                })
                .catch(e => {
                    // Jika benar-benar diblokir mutlak oleh browser, dia akan sabar menunggu klik pertama
                    console.log("Autoplay ditahan browser, menunggu interaksi fisik...");
                });
        }
    }

    // FIX: Kita tambah event 'mousemove' dan 'focus' pada inputan. 
    // Begitu user menggeser mouse masuk ke web atau klik kolom Username, musik langsung AUTO-PLAY!
    $('body, input').on('click mousedown keydown touchstart mousemove focus', function () {
        startMusic();
    });

    // Toggle musik manual
    $('#musicToggle').click(function (e) {
        e.stopPropagation();
        if (bgm.paused) {
            bgm.play();
            $(this).html("🔊 Musik: ON");
        } else {
            bgm.pause();
            $(this).html("🔇 Musik: OFF");
        }
    });

    // SFX Klik Tombol - suara "pop" gelembung
    function playSfx() {
        if (window.playBubblePop) {
            window.playBubblePop();
        } else {
            sfx.currentTime = 0;
            sfx.play().catch(e => console.log("SFX play error"));
        }
    }

    $('button, a, #btnToggleLoginPass').click(function () {
        playSfx();
    });

    // Toggle Mata Password
    $("#btnToggleLoginPass").click(function () {
        var passInput = $("#txtPassword");
        if (passInput.attr("type") === "password") {
            passInput.attr("type", "text");
            $(this).text("🔓");
        } else {
            passInput.attr("type", "password");
            $(this).text("👁️");
        }
    });

    // Trigger login with Enter key
    $("#txtUsername, #txtPassword").on("keypress", function (e) {
        if (e.which === 13) {
            $("#btnLogin").click();
        }
    });

    // AJAX Login
    $("#btnLogin").click(function () {
        var username = ($("#txtUsername").val() || "").trim();
        var password = $("#txtPassword").val();

        if (!username || !password) {
            $("#lblPesan").text("Username dan password harus diisi!");
            return;
        }

        // Tampilkan loading spinner & disable tombol
        $("#lblPesan").text("");
        $("#loginSpinner").removeClass("d-none");
        $("#loginText").text("Menghubungkan...");
        $("#btnLogin").prop("disabled", true);

        $.ajax({
            url: '/api/auth/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ Username: username, Password: password }),
            success: function (response) {
                localStorage.setItem("authToken", response.token);
                localStorage.setItem("userRole", response.role || "User");
                localStorage.setItem("playerName", response.username);
                localStorage.setItem("playerCoins", response.coins);
                localStorage.setItem("playerHighScore", response.highScore);

                // Ganti alert lama pakai SweetAlert2 yang memanjakan mata
                Swal.fire({
                    title: 'Login Berhasil! 🍪',
                    text: 'Selamat Datang Kembali, ' + response.username + '! Let\'s Bake!',
                    icon: 'success',
                    timer: 2000, // Pop-up otomatis hilang dalam 2 detik
                    showConfirmButton: false,
                    background: '#FFFEF7',
                    color: '#7B5B3A'
                });

                $.post('/Account/SetLoginSession', { userId: response.userId }, function () {
                    setTimeout(function () {
                        window.location.href = "/MainMenu/Index";
                    }, 2000);
                });
            },
            error: function (xhr) {
                // Kembalikan tombol ke keadaan normal
                $("#loginSpinner").addClass("d-none");
                $("#loginText").text("Masuk Game 🚀");
                $("#btnLogin").prop("disabled", false);

                console.error("Login error:", xhr);

                if (xhr.status === 401) {
                    $("#lblPesan").text("❌ Akun tidak ditemukan atau password salah!");
                } else if (xhr.status === 0) {
                    $("#lblPesan").text("❌ Gagal terhubung ke server! Pastikan aplikasi dijalankan via IIS Express di Visual Studio.");
                } else if (xhr.status === 400 && xhr.responseJSON && xhr.responseJSON.Message) {
                    $("#lblPesan").text("❌ " + xhr.responseJSON.Message);
                } else if (xhr.status === 500) {
                    var errorMsg = (xhr.responseJSON && (xhr.responseJSON.ExceptionMessage || xhr.responseJSON.Message))
                        ? (xhr.responseJSON.ExceptionMessage || xhr.responseJSON.Message)
                        : "Terjadi kesalahan internal server / database.";
                    $("#lblPesan").text("❌ " + errorMsg);
                } else {
                    $("#lblPesan").text("❌ Terjadi kendala koneksi (Kode: " + xhr.status + ")!");
                }
            }
        });
    });

    $('#btnForgotPassword').click(function (e) {
        e.preventDefault();

        // POP-UP 1: Input Email Player
        Swal.fire({
            title: 'Minta Kode OTP 🔍',
            text: 'Masukkan email akun game kamu yang telah terdaftar:',
            input: 'email',
            inputPlaceholder: 'contoh: player@email.com',
            confirmButtonText: 'Kirim OTP 🚀',
            confirmButtonColor: '#D4A373',
            cancelButtonText: 'Batal',
            showCancelButton: true,
            background: '#FFFEF7',
            color: '#7B5B3A',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: (emailInput) => {
                if (!emailInput) {
                    Swal.showValidationMessage('Email tidak boleh kosong!');
                    return false;
                }

                return $.ajax({
                    url: '/api/auth/request-otp',
                    type: 'POST',
                    contentType: 'application/json',
                    // Membungkus string email murni dengan tanda kutip ganda agar valid JSON String sesuai keinginan API [FromBody]
                    data: JSON.stringify(emailInput)
                }).then(response => {
                    return { email: emailInput, serverResponse: response };
                }).catch(error => {
                    // Jika backend mengirim objek error bikinan kita, tampilkan pesan manisnya
                    let errorMsg = "Email tidak ditemukan atau server bermasalah.";
                    if (error.responseJSON && error.responseJSON.message) {
                        errorMsg = error.responseJSON.message;
                    } else if (error.responseJSON && error.responseJSON.Message) {
                        errorMsg = error.responseJSON.Message;
                    }
                    Swal.showValidationMessage(errorMsg);
                });
            }
        }).then((result) => {
            // Jika Pop-up 1 berhasil dan mendapatkan respon sukses dari API
            if (result.isConfirmed && result.value) {
                const targetEmail = result.value.email;

                // POP-UP 2: Input OTP & Password Baru
                let otpTimer = null;
                let isResetSuccess = false;

                Swal.fire({
                    title: 'Verifikasi Akun 🔑',
                    html: $('#tplResetPassword').html(),
                    confirmButtonText: 'Simpan Password Baru ✨',
                    confirmButtonColor: '#D4A373',
                    showCancelButton: true,
                    cancelButtonText: 'Batal / Kembali',
                    background: '#FFFEF7',
                    color: '#7B5B3A',
                    allowOutsideClick: false,
                    showLoaderOnConfirm: true,

                    didOpen: () => {
                        const $popup = $(Swal.getPopup());
                        const passwordInput = $popup.find('#swalNewPass')[0];
                        const checkbox = $popup.find('#chkShowPassword')[0];
                        const $countdownEl = $popup.find('#otpCountdown');
                        const $btnResend = $popup.find('#btnResendOtp');
                        const $timerRunning = $popup.find('#otpTimerRunning');
                        const $timerExpired = $popup.find('#otpTimerExpired');
                        const $timerBanner = $popup.find('#otpTimerBanner');
                        const $otpInput = $popup.find('#swalOtp');

                        checkbox.addEventListener('change', function () {
                            passwordInput.type = this.checked ? 'text' : 'password';
                        });

                        function startTimer(durationSeconds) {
                            if (otpTimer) clearInterval(otpTimer);
                            let timeLeft = durationSeconds;
                            const $resendContainer = $popup.find('#resendOtpContainer');
                            $resendContainer.hide();
                            $timerRunning.show();
                            $timerExpired.hide();
                            $timerBanner.css({ 'background': '#FFF2E2', 'border-color': '#D4A373' });
                            $countdownEl.css('color', '#D4A373').text('02:00');
                            $btnResend.prop('disabled', false).html('🔄 Kirim Ulang OTP').css({ 'background': '#D4A373', 'color': 'white' });

                            otpTimer = setInterval(() => {
                                timeLeft--;
                                if (timeLeft <= 0) {
                                    clearInterval(otpTimer);
                                    otpTimer = null;

                                    // Otomatis hapus OTP di database karena waktu habis
                                    $.ajax({
                                        url: '/api/auth/cancel-otp',
                                        type: 'POST',
                                        contentType: 'application/json',
                                        data: JSON.stringify(targetEmail)
                                    });

                                    $timerRunning.hide();
                                    $timerExpired.fadeIn();
                                    $timerBanner.css({ 'background': '#FFEBEA', 'border-color': '#E63946' });
                                    // Tampilkan tombol kirim ulang karena waktu habis
                                    $resendContainer.fadeIn();
                                    Swal.showValidationMessage('Waktu OTP habis! Silakan klik tombol Kirim Ulang OTP di atas.');
                                } else {
                                    const m = Math.floor(timeLeft / 60);
                                    const s = timeLeft % 60;
                                    $countdownEl.text(`${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`);
                                    if (timeLeft <= 30) {
                                        $countdownEl.css('color', '#E63946');
                                        $timerBanner.css('border-color', '#E63946');
                                    }
                                }
                            }, 1000);
                        }

                        // Mulai hitung mundur 2 menit saat modal dibuka
                        startTimer(120);

                        // Handler Klik Tombol Kirim Ulang OTP
                        $btnResend.click(function (e) {
                            e.preventDefault();
                            $btnResend.prop('disabled', true).html('Mengirim OTP... ⏳');
                            Swal.resetValidationMessage();

                            $.ajax({
                                url: '/api/auth/request-otp',
                                type: 'POST',
                                contentType: 'application/json',
                                data: JSON.stringify(targetEmail)
                            }).then(() => {
                                $otpInput.val('');
                                startTimer(120);
                                Swal.showValidationMessage('Kode OTP baru berhasil dikirim! Silakan periksa email kamu. 🧁');
                                setTimeout(() => {
                                    Swal.resetValidationMessage();
                                }, 3500);
                            }).catch((err) => {
                                $btnResend.prop('disabled', false).html('🔄 Kirim Ulang OTP');
                                let errTxt = (err.responseJSON && err.responseJSON.message) ? err.responseJSON.message : 'Gagal mengirim ulang OTP.';
                                Swal.showValidationMessage(errTxt);
                            });
                        });
                    },

                    willClose: () => {
                        if (otpTimer) {
                            clearInterval(otpTimer);
                            otpTimer = null;
                        }
                    },

                    preConfirm: () => {
                        const $popup = $(Swal.getPopup());
                        const otpVal = $popup.find('#swalOtp').val().trim();
                        const newPassVal = $popup.find('#swalNewPass').val();

                        if (!otpVal || otpVal.length !== 6) {
                            Swal.showValidationMessage('Kode OTP harus 6 digit angka!');
                            return false;
                        }
                        if (!newPassVal || newPassVal.length < 8) {
                            Swal.showValidationMessage('Password baru minimal 8 karakter!');
                            return false;
                        }

                        const requestData = {
                            Email: targetEmail,
                            Otp: otpVal,
                            NewPassword: newPassVal
                        };

                        return $.ajax({
                            url: '/api/auth/reset-password',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(requestData)
                        }).then(response => {
                            isResetSuccess = true;
                            return response;
                        }).catch(error => {
                            let errorMsg = error.responseJSON ? error.responseJSON.message : "Kode OTP salah atau sandi tidak memenuhi kriteria.";
                            Swal.showValidationMessage(errorMsg);
                        });
                    }
                }).then((finalResult) => {
                    if (otpTimer) {
                        clearInterval(otpTimer);
                        otpTimer = null;
                    }

                    if (finalResult.isConfirmed && isResetSuccess) {
                        Swal.fire({
                            title: 'Berhasil! 🎉',
                            text: 'Password akun game kamu telah diperbarui. Silakan login kembali!',
                            icon: 'success',
                            confirmButtonText: 'Siap, Let\'s Bake! 🧁',
                            confirmButtonColor: '#D4A373',
                            background: '#FFFEF7',
                            color: '#7B5B3A'
                        });
                    } else if (!isResetSuccess) {
                        // Jika player klik 'Batal / Kembali' atau menutup modal tanpa menyelesaikan reset,
                        // hapus OTP di database agar tidak tersangkut
                        $.ajax({
                            url: '/api/auth/cancel-otp',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(targetEmail)
                        });
                    }
                });
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