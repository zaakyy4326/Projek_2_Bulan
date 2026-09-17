$(document).ready(function () {

    // === 1. VARIABEL UTAMA GAME ===
    var koinGame = 0;
    var waktuGame = 300;
    var gameInterval;
    var gameIsPaused = false;
    var isTutorialActive = false;
    var tutorialStep = 0;

    var daftarKueUtama = window.AvailableRecipesData || [
        { nama: "Donat", harga: 1 },
        { nama: "Es Krim", harga: 1 }
    ];
    var daftarKue = daftarKueUtama.map(function(r) { return r.nama; });

    var daftarTopping = ["Stroberi", "Cokelat", "Ceri", "Vanilla", "Anggur"];

    var emojiBahan = {
        "Donat": "\u{1f369}", "Es Krim": "\u{1f366}",
        "Stroberi": "\u{1f353}", "Cokelat": "\u{1f36b}", "Ceri": "\u{1f352}",
        "Vanilla": "\u{1f366}", "Anggur": "\u{1f347}",
        "Tepung": "\u{1f33e}", "Gula": "\u{1f36c}", "Mentega": "\u{1f9c8}", "Susu": "\u{1f95b}", "Ragi": "\u{1f9ea}", "EsBatu": "\u{1f9ca}",
        "Telur": "\u{1f95a}", "Krim Keju": "\u{1f9c0}"
    };
    var emojiPelanggan = ["\u{1f431}", "\u{1f430}", "\u{1f43b}", "\u{1f98a}", "\u{1f981}", "\u{1f43c}"];

    // PNG image asset maps
    var ingredientImages = {
        "Tepung": "/Content/PNG/tepung.png",
        "Gula": "/Content/PNG/gula.png",
        "Mentega": "/Content/PNG/mentega.png",
        "Susu": "/Content/PNG/susu.png",
        "Ragi": "/Content/PNG/ragi.png",
        "Telur": "/Content/PNG/telur.png",
        "Krim Keju": "/Content/PNG/krim-keju.png"
    };

    var toppingImages = {
        "Stroberi": "/Content/PNG/stroberi.png",
        "Cokelat": "/Content/PNG/coklat.png",
        "Ceri": "/Content/PNG/ceri.png",
        "Vanilla": "/Content/PNG/vanila.png",
        "Anggur": "/Content/PNG/anggur.png"
    };

    var bungkusanKue = {
        "Donat": "/Content/PNG/bungkusan_eskrim_donat.png",
        "Es Krim": "/Content/PNG/bungkusan_eskrim_donat.png",
        "Cupcake": "/Content/PNG/bungkusan_cupcake__pancake__shortcake_dan_waffle.png",
        "Pancake": "/Content/PNG/bungkusan_cupcake__pancake__shortcake_dan_waffle.png",
        "Waffle": "/Content/PNG/bungkusan_cupcake__pancake__shortcake_dan_waffle.png",
        "ShortCake": "/Content/PNG/bungkusan_cupcake__pancake__shortcake_dan_waffle.png",
        "Pai": "/Content/PNG/bungkusan_Pai_Kue_Ultah.png",
        "Birthday Cake": "/Content/PNG/bungkusan_Pai_Kue_Ultah.png"
    };

    var pesananKueAktif = "";
    var pesananToppingAktif = [];

    // State pembuatan di dapur
    var adonanTerpilih = [];
    var servingStreak = 0;

    // Anti-cheat flags: Catat di memori lokal sesi, hanya di-commit ke DB jika permainan selesai normal
    var hasAchievedSoCloseInSession = false;
    var hasNotifiedSoCloseInSession = false;
    var sessionCookedCounts = {};
    var sessionMaxStreak = 0;

    // Helper untuk mengecek apakah suatu achievement sudah pernah dibuka sebelumnya oleh user
    function isAchievementAlreadyUnlocked(key) {
        var list = window.UserUnlockedAchievements || [];
        return list.indexOf(key) > -1;
    }

    // Helper SFX yang selalu mematuhi pengaturan suara (Volume & Mute)
    function playGameSfx(id) {
        var sfxMuted = localStorage.getItem('game_sfx_muted') === 'true';
        if (sfxMuted) return; // Mute SFX aktif di Pengaturan

        var audio = document.getElementById(id);
        if (audio) {
            var sfxVol = parseFloat(localStorage.getItem('game_sfx_volume'));
            if (!isNaN(sfxVol) && sfxVol >= 0) {
                audio.volume = sfxVol;
            }
            audio.currentTime = 0;
            audio.play().catch(function(e){});
        }
    }

    function stopGameSfx(id) {
        var audio = document.getElementById(id);
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    // Kontrol BGM yang mematuhi Pengaturan Suara
    function startCookingBgm() {
        var bgm = document.getElementById("bgmMusic");
        if (!bgm) return;

        var bgmMuted = localStorage.getItem('game_bgm_muted') === 'true';
        var bgmVol = parseFloat(localStorage.getItem('game_bgm_volume'));
        if (isNaN(bgmVol) || bgmVol <= 0) bgmVol = 0.3;

        bgm.volume = bgmMuted ? 0 : bgmVol;
        bgm.play().then(function() {
            if (bgmMuted) {
                $('#musicToggle').html("🔇 Musik: OFF");
            } else {
                $('#musicToggle').html("🔊 Musik: ON");
            }
        }).catch(function(e) {
            console.log("BGM autoplay dicegah oleh browser hingga ada interaksi klik.");
        });
    }
    window.startCookingBgm = startCookingBgm;

    // Event listener untuk tombol toggle musik di Top Bar
    $(document).ready(function() {
        $('#musicToggle').off('click').on('click', function () {
            var bgm = document.getElementById("bgmMusic");
            if (!bgm) return;

            var bgmMuted = localStorage.getItem('game_bgm_muted') === 'true';
            if (bgm.paused || bgmMuted) {
                localStorage.setItem('game_bgm_muted', 'false');
                var bgmVol = parseFloat(localStorage.getItem('game_bgm_volume'));
                if (isNaN(bgmVol) || bgmVol <= 0) bgmVol = 0.3;
                bgm.volume = bgmVol;
                bgm.play().then(function() {
                    $('#musicToggle').html("🔊 Musik: ON");
                }).catch(function(e){});
            } else {
                bgm.pause();
                localStorage.setItem('game_bgm_muted', 'true');
                $('#musicToggle').html("🔇 Musik: OFF");
            }
        });
    });

    var kueHasilOven = "";
    var toppingTerpilih = [];
    var isBaking = false;

    // State packer baru
    var isSentToPacker = false;
    var isPacking = false;
    var isPacked = false;

    // Variabel pembantu oven
    var waktuMulaiBake;
    var totalDurasiBake = 3000; // 3 detik
    var sisaWaktuBake = 3000;
    var bakeTimeoutID;

    var sfx = document.getElementById("sfxClick");

    function mainkanSfx() {
        if (window.playBubblePop) {
            window.playBubblePop();
        } else if (sfx) {
            sfx.currentTime = 0;
            sfx.play().catch(function (e) { });
        }
    }

    // === 2. GENERATE PESANAN PELANGGAN ===
    var maxQueue = 3;
    var orderQueue = [];

    function renderOrderQueue() {
        var html = '';
        var emojiKueKamus = {
            "Donat": "\u{1f369}", "Es Krim": "\u{1f366}", "Cupcake": "\u{1f9c1}", "Pancake": "\u{1f95e}",
            "Waffle": "\u{1f9c7}", "ShortCake": "\u{1f370}", "Pai": "\u{1f967}", "Birthday Cake": "\u{1f382}", "Kue Ultah": "\u{1f382}"
        };
        var emojiToppingKamus = {
            "Stroberi": "\u{1f353}", "Cokelat": "\u{1f36b}", "Ceri": "\u{1f352}", "Vanilla": "\u{1f366}", "Anggur": "\u{1f347}"
        };

        for (let i = 0; i < maxQueue; i++) {
            var topPos = i === 0 ? 3 : (i === 1 ? 36 : 69); // Positioned inside the white boxes

            if (i < orderQueue.length) {
                var order = orderQueue[i];
                var emojiKue = emojiKueKamus[order.kue] || "\u{1f37d}\u{fe0f}";
                var avatar = emojiPelanggan[order.avatarIndex];

                var toppingsHtml = '';
                order.topping.forEach(function (t) {
                    var topImg = toppingImages[t];
                    if (topImg) {
                        toppingsHtml += `<img src="${topImg}" class="customer-order-topping-img" alt="${t}" />`;
                    } else {
                        toppingsHtml += `<span class="customer-order-emoji">${emojiToppingKamus[t] || t}</span>`;
                    }
                });

                var tooltipText = order.kue;
                if (order.topping.length > 0) {
                    tooltipText += " + " + order.topping.join(", ");
                }

                if (i === 0) {
                    html += `
                    <div class="order-slot active-order" id="orderSlot${i}" style="position: absolute; top: ${topPos}%; left: 4%; width: 92%; height: 28%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 10px; gap: 0px;">
                        
                        <div class="customer-order-info" title="${tooltipText}" style="background: rgba(255,255,255,0.85); padding: 4px 10px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.1); margin-bottom: -2px; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: help;">
                            <span class="customer-order-emoji">${emojiKue}</span>
                            ${order.topping.length > 0 ? '<span class="customer-order-plus mx-1" style="font-size:0.8rem;">+</span>' : ''}
                            ${toppingsHtml}
                        </div>
                        
                        <div style="display:flex; flex-direction:row; align-items:center; width: 100%; justify-content: center; gap: 10px;">
                            <div class="customer-avatar" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));">${avatar}</div>
                            <div class="d-flex align-items-center" style="width: 50%;">
                                <div class="customer-timer-text" style="font-size: 0.85rem; font-weight:bold; color:#5a412d; width: 25px; text-align: right; margin-right: 5px;">${order.timer}s</div>
                                <div class="order-progress mx-1" style="flex:1; height: 8px; background:#ddd; border-radius:4px; overflow:hidden;">
                                    <div class="order-progress-fill" id="progressFill${i}" style="height:100%; width: ${(order.timer / order.maxTimer) * 100}%; background: linear-gradient(90deg, #4cd964, #32cd32); transition: width 1s linear;"></div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                } else {
                    html += `
                    <div class="order-slot waiting-order" id="orderSlot${i}" style="position: absolute; top: ${topPos}%; left: 4%; width: 92%; height: 28%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 10px; gap: 0px; opacity: 0.85;">
                        
                        <div class="customer-order-info" title="${tooltipText}" style="background: rgba(255,255,255,0.6); padding: 2px 8px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); margin-bottom: -2px; z-index: 2; cursor: help;">
                            <span class="customer-order-emoji">${emojiKue}</span>
                            ${order.topping.length > 0 ? '<span class="customer-order-plus mx-1" style="font-size:0.7rem;">+</span>' : ''}
                            ${toppingsHtml}
                        </div>
                        
                        <div style="display:flex; flex-direction:row; align-items:center; width: 100%; justify-content: center; gap: 10px;">
                            <div class="customer-avatar" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));">${avatar}</div>
                            <div class="small text-muted" style="font-size:0.75rem; font-style:italic; font-weight:bold; color:#5a412d !important; text-align: right;">Menunggu...</div>
                        </div>
                    </div>`;
                }
            }
        }
        $("#orderQueueContainer").html(html);
    }

    function pelangganBaru() {
        // Fill the queue up to maxQueue
        while (orderQueue.length < maxQueue) {
            var kue = daftarKue[Math.floor(Math.random() * daftarKue.length)];

            var jumlahTopping = Math.floor(Math.random() * 2) + 1;
            var toppingTemp = [];
            var toppingSalinan = [...daftarTopping];
            for (var i = 0; i < jumlahTopping; i++) {
                var indeksAcak = Math.floor(Math.random() * toppingSalinan.length);
                toppingTemp.push(toppingSalinan[indeksAcak]);
                toppingSalinan.splice(indeksAcak, 1);
            }
            toppingTemp.sort();

            orderQueue.push({
                kue: kue,
                topping: toppingTemp,
                avatarIndex: Math.floor(Math.random() * emojiPelanggan.length),
                timer: 30, // 30 seconds wait time
                maxTimer: 30
            });
        }

        updatePesananAktif();
    }

    function updatePesananAktif() {
        if (orderQueue.length > 0) {
            pesananKueAktif = orderQueue[0].kue;
            pesananToppingAktif = orderQueue[0].topping;
        } else {
            pesananKueAktif = "";
            pesananToppingAktif = [];
        }
        renderOrderQueue();
        resetMejaRacik();
    }

    // === 6. SAJIKAN & BUANG ===
    function resetMejaRacik() {
        adonanTerpilih = [];
        kueHasilOven = "";
        toppingTerpilih = [];
        isBaking = false;
        isIceCreamRunning = false;
        isSentToPacker = false;
        isPacking = false;
        isPacked = false;
        $("#wadahBahanVisual").empty();
        $(".item-adonan").removeClass("active-bahan");
        $(".item-topping").removeClass("active-topping");
        $("#btnSerahkanPacker").hide();
        $("#arrowTopping").hide();
        $("#imgBowl").attr("src", "/Content/PNG/mangkuk.png");
        $("#imgBowl, #wadahBahanVisual").show();
        updateTampilanPiring();
    }

    // === 3. INTERAKSI INPUT BAHAN MENTAH (HANYA UNTUK ADONAN OVEN) ===
    $(document).on("click", ".item-adonan", function () {
        if (isBaking || gameIsPaused) return;

        if (isTutorialActive) {
            var adonan = $(this).data("adonan");
            if (tutorialStep === 1 && adonan === "Tepung") {
                tutorialStep++;
                applyTutorialStepHighlights();
            } else if (tutorialStep === 2 && adonan === "Gula") {
                tutorialStep++;
                applyTutorialStepHighlights();
            } else if (tutorialStep === 3 && adonan === "Mentega") {
                tutorialStep++;
                applyTutorialStepHighlights();
            } else if (tutorialStep === 4 && adonan === "Ragi") {
                tutorialStep++;
                applyTutorialStepHighlights();
            } else {
                return;
            }
        }

        mainkanSfx();

        var adonan = $(this).data("adonan");
        var emoji = emojiBahan[adonan];
        var imgUrl = ingredientImages[adonan];
        var $btn = $(this);

        if (!adonanTerpilih.includes(adonan)) {
            adonanTerpilih.push(adonan);
            $btn.addClass("active-bahan");
        }
        playGameSfx("sfxPutIngredient");

        var isiWadah = adonanTerpilih.map(function (a) { return emojiBahan[a]; }).join("+");
        $("#lblWadahMixer").html(isiWadah || "Kosong");

        // Update visual inside bowl
        $("#wadahBahanVisual").empty();
        adonanTerpilih.forEach(function (a) {
            var innerImg = ingredientImages[a];
            if (innerImg) {
                $("#wadahBahanVisual").append('<img src="' + innerImg + '" class="ingredient-img-in-bowl" alt="' + a + '" />');
            }
        });

        var btnOffset = $btn.offset();
        var bowlOffset = $("#imgBowl").offset();

        if (btnOffset && bowlOffset) {
            // Use image if available, fallback to emoji
            var $falling = imgUrl
                ? $('<img class="falling-img" src="' + imgUrl + '" style="position:fixed; z-index:9999; width:28px; height:28px; pointer-events:none; transition: transform 0.4s linear;" />')
                : $('<div class="falling-emoji" style="position:fixed; z-index:9999; font-size:1.3rem; pointer-events:none; transition: transform 0.4s linear;">' + emoji + '</div>');
            $falling.css({
                top: btnOffset.top + 5,
                left: btnOffset.left + 15
            });
            $('body').append($falling);

            setTimeout(function() {
                $falling.css('transform', 'rotate(135deg)');
            }, 10);

            $falling.animate({
                top: bowlOffset.top + 15,
                left: bowlOffset.left + 25
            }, 350, 'linear', function () {
                $falling.remove();
                $("#imgBowl").addClass("shake");
                setTimeout(() => $("#imgBowl").removeClass("shake"), 300);
                $("#imgBowl").attr("src", "/Content/PNG/Mangkuk_after.png");
            });
        } else {
            $("#imgBowl").attr("src", "/Content/PNG/Mangkuk_after.png");
        }
    });

    // === 4. PROSES MEMASAK (OVEN & MESIN ES KRIM) ===
    $("#btnBakeOven").click(function () {
        if (adonanTerpilih.length === 0) {
            Swal.fire({ title: "Mangkuk Kosong!", text: "Masukkan bahan ke mangkuk sebelum memanggang.", icon: "warning", confirmButtonColor: "#D4A373" });
            return;
        }
        if (kueHasilOven !== "") {
            Swal.fire({ title: "Piring Penuh!", text: "Sajikan atau buang kue yang ada di piring dulu.", icon: "warning", confirmButtonColor: "#D4A373" });
            return;
        }
        if (isBaking || isPacking || gameIsPaused) return;

        if (isTutorialActive) {
            if (tutorialStep !== 5) return;
            tutorialStep++;
            applyTutorialStepHighlights();
        }

        mainkanSfx();
        playGameSfx("sfxOven");
        isBaking = true;
        
        $("#imgBowl, #wadahBahanVisual").hide();
        $("#progressOvenContainer").removeClass("d-none");
        $("#btnBakeOven").addClass("machine-shaking");
        $("#progressOvenFill").css("width", "0%").animate({ width: "100%" }, sisaWaktuBake, "linear");

        jalankanProsesBake();
    });

    function jalankanProsesBake() {
        waktuMulaiBake = Date.now();
        $("#imgOven").attr("src", "/Content/PNG/over_after.png");

        bakeTimeoutID = setTimeout(function () {
            var bahanPemain = [...adonanTerpilih].sort();
            
            kueHasilOven = "";
            for(var i = 0; i < daftarKueUtama.length; i++) {
                var resep = daftarKueUtama[i];
                if(resep.nama === "Es Krim") continue; // Eskrim tidak dioven
                
                var bahanResep = [...(resep.bahan || [])].sort();
                if (bahanResep.length > 0 && JSON.stringify(bahanPemain) === JSON.stringify(bahanResep)) {
                    kueHasilOven = resep.nama;
                    break;
                }
            }

            $("#imgOven").attr("src", "/Content/PNG/oven_before.png");
            $("#progressOvenContainer").addClass("d-none");
            $("#btnBakeOven").removeClass("machine-shaking");
            $("#imgBowl, #wadahBahanVisual").show();

            if (kueHasilOven !== "") {
                kosongkanMangkuk();
                updateTampilanPiring();
                $("#btnSerahkanPacker").show().prop("disabled", false).css("opacity", "1");
                Swal.fire({ 
                    toast: true, 
                    position: 'bottom-end', 
                    icon: 'success', 
                    title: "\u{1f389} " + kueHasilOven + " Selesai!", 
                    showConfirmButton: false, 
                    timer: 1500, 
                    timerProgressBar: true,
                    width: 'auto',
                    padding: '0.5em',
                    customClass: {
                        title: 'small-toast-title'
                    }
                });
            } else {
                Swal.fire({ title: "Gagal! \u{1f4a5}", text: "Adonan gosong! Bahan tidak sesuai.", icon: "error" });
                resetMejaRacik();
            }
            isBaking = false;
        }, sisaWaktuBake);
    }

    $("#btnMesinEsKrim").click(function () {
        if (isTutorialActive) return;
        if (gameIsPaused || isBaking || isIceCreamRunning) return;
        if (kueHasilOven !== "") {
            Swal.fire({ title: "Piring Penuh!", text: "Sajikan atau buang piring dulu.", icon: "warning" });
            return;
        }
        
        mainkanSfx();
        playGameSfx("sfxMesinEskrim");
        isIceCreamRunning = true;
        
        $("#imgBowl, #wadahBahanVisual").hide();
        $("#imgIceCreamMaker").attr("src", "/Content/PNG/mesin_eskrim-after.png");
        $("#progressIceCreamContainer").removeClass("d-none");
        $("#btnMesinEsKrim").addClass("machine-shaking");
        $("#progressIceCreamFill").css("width", "0%").animate({ width: "100%" }, 2000, "linear");

        setTimeout(function () {
            isIceCreamRunning = false;
            kueHasilOven = "Es Krim";
            isSentToPacker = false;
            isPacked = false;
            toppingTerpilih = [];

            $("#imgIceCreamMaker").attr("src", "/Content/PNG/mesin_eskrim_before.png");
            $("#btnMesinEsKrim").removeClass("machine-shaking");
            $("#progressIceCreamContainer").addClass("d-none");
            $("#imgBowl, #wadahBahanVisual").show();

            kosongkanMangkuk();
            updateTampilanPiring();
            $("#btnSerahkanPacker").show().prop("disabled", false).css("opacity", "1");
            Swal.fire({ 
                toast: true, 
                position: 'bottom-end', 
                icon: 'success', 
                title: "\u{1f366} Es Krim Selesai!", 
                showConfirmButton: false, 
                timer: 1500, 
                timerProgressBar: true,
                width: 'auto',
                padding: '0.5em',
                customClass: {
                    title: 'small-toast-title'
                }
            });
        }, 2000);
    });

    function kosongkanMangkuk() {
        adonanTerpilih = [];
        $("#wadahBahanVisual").empty();
        $("#imgBowl").attr("src", "/Content/PNG/mangkuk.png");
    }

    // === 5. INTERAKSI DESIGNER & TOPPING ===
    $("body").append('<div id="arrowTopping" style="display:none; position:absolute; left: 49%; top: 51%; font-size: clamp(1rem, 4.5vh, 1.8rem); color: #ffeb3b; font-weight: bold; text-shadow: 1px 1px 3px rgba(0,0,0,0.8), 0 0 8px #d97706; z-index: 100; animation: bounce 1s infinite;">\u2193</div>');

    $("<style>")
        .prop("type", "text/css")
        .html(`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(15px); }
        }
      `)
        .appendTo("head");

    $(document).on("click", ".item-topping", function () {
        if (!kueHasilOven || isPacked || gameIsPaused) {
            Swal.fire({ title: "Tidak Bisa!", text: "Menu sudah dibungkus atau piring masih kosong!", icon: "warning", confirmButtonColor: "#D4A373" });
            return;
        }

        if (isTutorialActive) {
            var topping = $(this).data("topping");
            if (tutorialStep !== 6 || topping !== "Cokelat") return;
            tutorialStep++;
            applyTutorialStepHighlights();
        }

        mainkanSfx();

        var topping = $(this).data("topping");
        var $btn = $(this);

        var indeks = toppingTerpilih.indexOf(topping);

        if (indeks > -1) {
            toppingTerpilih.splice(indeks, 1);
            $btn.removeClass("active-topping");
        }
        else {
            toppingTerpilih.push(topping);
            toppingTerpilih.sort();
            $btn.addClass("active-topping");
        }
        updateTampilanPiring();
    });

    function updateTampilanPiring() {
        if (kueHasilOven) {
            $("#visualKuePiring").removeClass("pop-in");
            if (!isPacked) {
                // Tampilkan piring kosong (menunggu ditaburi rasa), tampilkan panah petunjuk ke rasa
                $("#visualKuePiring").empty();

                $("#visualToppingPiring").empty();
                toppingTerpilih.forEach(function (t) {
                    var topImg = toppingImages[t];
                    if (topImg) {
                        $("#visualToppingPiring").append('<img src="' + topImg + '" class="topping-img-on-plate" alt="' + t + '" />');
                    } else {
                        $("#visualToppingPiring").append('<span class="topping-item-visual">' + (emojiBahan[t] || t) + '</span>');
                    }
                });
                $("#lblPiringStatusEmoji").text("Pilih Rasa & Bungkus!");
                $("#btnSerahkanPacker").show().prop("disabled", false).css("opacity", "1");
                $("#arrowTopping").show();
            } else {
                $("#arrowTopping").hide();
                // Tampilkan hasil akhir (bungkusan) di piring
                var bungkusanImg = bungkusanKue[kueHasilOven] || "";
                if (bungkusanImg) {
                    $("#visualKuePiring").html('<img src="' + bungkusanImg + '" class="kue-img-on-plate" alt="' + kueHasilOven + '" />').addClass("pop-in");
                } else {
                    $("#visualKuePiring").html('<span style="font-size: 3.5rem; line-height: 1; display: block;">\u{1f381}</span>').addClass("pop-in");
                }
                $("#visualToppingPiring").empty();
                
                var emojiListHtml = emojiBahan[kueHasilOven] || kueHasilOven;
                toppingTerpilih.forEach(function (t) {
                    emojiListHtml += " + " + (emojiBahan[t] || t);
                });
                $("#lblPiringStatusEmoji").html(emojiListHtml);
                $("#btnSerahkanPacker").hide();
            }
        } else {
            $("#visualKuePiring").empty();
            $("#visualToppingPiring").empty();
            $("#lblPiringStatusEmoji").text("");
            $("#btnSajikan").prop("disabled", true);
            $("#btnSerahkanPacker").hide();
            $("#arrowTopping").hide();
        }
    }

    $(document).on("click", "#btnSerahkanPacker", function () {
        if (gameIsPaused || isPacking || isPacked) return;
        if (!kueHasilOven) {
            Swal.fire({
                title: "Piring Kosong! \u{1f37d}\u{fe0f}",
                text: "Masak kue / klik mesin es krim terlebih dahulu.",
                icon: "warning"
            });
            return;
        }

        if (isTutorialActive) {
            if (tutorialStep !== 7) return;
        }

        mainkanSfx();
        playGameSfx("sfxNgebungkus");
        isPacking = true;
        $("#btnSerahkanPacker").prop("disabled", true).css("opacity", "0.5");
        $("#arrowTopping").hide();
        
        $("#packerInlineLoading").fadeIn(200);
        $("#packerInlineProgress").css("width", "0%").animate({ width: "100%" }, 1500, "linear", function() {
            $("#packerInlineLoading").fadeOut(150, function() {
                isPacking = false;
                isPacked = true;
                updateTampilanPiring();
                $("#btnSajikan").prop("disabled", false);

                if (isTutorialActive) {
                    tutorialStep++;
                    applyTutorialStepHighlights();
                } else {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 1000,
                        icon: 'success',
                        title: 'Berhasil dibungkus! \u{1f4e6}'
                    });
                }
            });
        });
    });

        // === 6. SAJIKAN KUE ===
        $("#btnSajikan").click(function () {
            if (gameIsPaused) return;

            if (isTutorialActive) {
                if (tutorialStep !== 8) return;
            }

            mainkanSfx();

            if (!kueHasilOven) {
                Swal.fire({ title: "Belum Siap!", text: "Selesaikan masakan kue dan berikan topping rasa!", icon: "warning" });
                return;
            }

            if (!isPacked) {
                Swal.fire({
                    title: "Belum Dibungkus! \u{1f4e6}",
                    text: "Serahkan kue ke packer terlebih dahulu sebelum disajikan ke pelanggan!",
                    icon: "warning"
                });
                return;
            }

            var toppingCocok = JSON.stringify(toppingTerpilih) === JSON.stringify(pesananToppingAktif);

            if (kueHasilOven === pesananKueAktif && toppingCocok) {
                if (isTutorialActive) {
                    playGameSfx("sfxSajikan");
                    $("#tutorialBanner").remove();
                    isTutorialActive = false;
                    applyTutorialStepHighlights();
                    
                    // Show custom sweet tutorial end modal
                    Swal.fire({
                        title: "Tutorial Selesai! \u{1f389}",
                        html: "Hebat! Kamu sudah bisa membuat dan menyajikan kue.<br/><br/>Sekarang, mari buka toko untuk pelanggan sungguhan!",
                        icon: "success",
                        confirmButtonText: "Buka Toko! \u{1f680}",
                        confirmButtonColor: "#4cd964",
                        allowOutsideClick: false
                    }).then(() => {
                        // Reset session and trigger countdown
                        waktuGame = 300;
                        koinGame = 0;
                        
                        $("#lblWaktuGame").text(waktuGame);
                        orderQueue = [];
                        resetMejaRacik();
                        
                        window.mulaiGameVisual();
                    });
                    return;
                }

                if (orderQueue.length > 0 && orderQueue[0].timer <= 3) {
                    playGameSfx("sfxSoClose");
                    // Hanya tandai & beri notifikasi jika lencana SoClose belum pernah diperoleh sebelumnya
                    if (!isAchievementAlreadyUnlocked("SoClose")) {
                        hasAchievedSoCloseInSession = true;
                        if (!hasNotifiedSoCloseInSession) {
                            hasNotifiedSoCloseInSession = true;
                            showInGameAchievementNotification("Koki Kilat ⚡", "SoClose", "Tercapai! Selesaikan game untuk klaim 🏆");
                        }
                    }
                }
                playGameSfx("sfxSajikan");
                var resepCocok = daftarKueUtama.find(r => r.nama === pesananKueAktif);
                var hargaKue = resepCocok ? resepCocok.harga : 1;
                var totalPendapatan = hargaKue;

                koinGame += totalPendapatan;
                var basisKoin = parseInt($("#lblKoinSesi").data("total")) || 0;
                $("#lblKoinSesi").text(basisKoin + koinGame);
                waktuGame += 3;
                $("#lblWaktuGame").text(waktuGame);

                // Catat progress misi di memori lokal sesi (Anti-Cheat: hanya di-commit jika game selesai normal)
                sessionCookedCounts[pesananKueAktif] = (sessionCookedCounts[pesananKueAktif] || 0) + 1;
                servingStreak++;
                if (servingStreak > sessionMaxStreak) {
                    sessionMaxStreak = servingStreak;
                }

                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    icon: 'success',
                    title: 'Pesanan Cocok! +'+totalPendapatan+' \u{1f4b0} (+3 Detik Waktu\u{23f1}\u{fe0f})'
                });

                // Hentikan suara countdown jika berhasil disajikan cepat
                stopGameSfx("sfxCountdownPelanggan");

                // Remove the served customer from queue
                if (orderQueue.length > 0) {
                    orderQueue.shift();
                }
                pelangganBaru();
            } else {
                playGameSfx("sfxPelangganKecewa");
                servingStreak = 0;
                Swal.fire({ title: "Salah Menu! \u{1f622}", text: "Kombinasi masakan atau topping tidak cocok dengan selera pembeli.", icon: "error" });
                resetMejaRacik();
            }
        });

        $("#btnBuang").click(function () {
            if (gameIsPaused || isTutorialActive) return;
            mainkanSfx();
            resetMejaRacik();
        });

        // === 7. LOGIKA PAUSE GAME SYSTEM ===
        $("#btnPause").click(function () {
            if (gameIsPaused) return;
            mainkanSfx();

            clearInterval(gameInterval);
            gameIsPaused = true;

            if (isBaking) {
                clearTimeout(bakeTimeoutID);
                $("#barOven").stop();
                $("#imgOven").removeClass("baking-active");
                var waktuBerjalan = Date.now() - waktuMulaiBake;
                sisaWaktuBake -= waktuBerjalan;
            }

            Swal.fire({
                title: "\u{23f8}\u{fe0f} GAME DI-PAUSE",
                text: "Dapur dihentikan sementara. Pilih tindakan selanjutnya:",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#2a9d8f",
                cancelButtonColor: "#e63946",
                confirmButtonText: "\u{25b6}\u{fe0f} Lanjutkan Memasak",
                cancelButtonText: "\u{1f6aa} Keluar ke Main Menu",
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then((result) => {
                if (result.isConfirmed) {
                    gameIsPaused = false;
                    mulaiTimer();

                    if (isBaking) {
                        $("#imgOven").addClass("baking-active");
                        jalankanProsesBake();
                    }
                } else {
                    Swal.fire({
                        title: "Yakin Ingin Meninggalkan Tugas? \u{1f62e}",
                        text: "Koin game yang sudah kamu kumpulkan saat ini tidak akan dimasukkan ke saldo tokomu loh!",
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#3085d6",
                        confirmButtonText: "Ya, Keluar Saja",
                        cancelButtonText: "Tidak, Kembali Masak"
                    }).then((quitResult) => {
                        if (quitResult.isConfirmed) {
                            window.navigateWithExitTransition("/MainMenu/Index");
                        } else {
                            gameIsPaused = false;
                            $("#btnPause").click();
                        }
                    });
                }
            });
        });

        // === 8. DETAK TIME MANAGER & END GAME ===
        function mulaiTimer() {
            gameInterval = setInterval(function () {
                waktuGame--;
                $("#lblWaktuGame").text(waktuGame);

                // Antrian logic
                if (orderQueue.length > 0) {
                    var currentOrder = orderQueue[0];
                    currentOrder.timer--;

                    // Update UI bar & text
                    var progressPct = (currentOrder.timer / currentOrder.maxTimer) * 100;
                    $("#progressFill0").css("width", progressPct + "%");
                    
                    if (currentOrder.timer === 5) {
                        playGameSfx("sfxCountdownPelanggan");
                    }

                    if (currentOrder.timer <= 10) {
                        $("#progressFill0").css("background", "linear-gradient(90deg, #ef4444, #dc2626)");
                    }
                    $("#orderSlot0 .customer-timer-text").text(currentOrder.timer + "s");

                    if (currentOrder.timer <= 0) {
                        playGameSfx("sfxPelangganKecewa");
                        // Waktu habis, kurangi waktu utama 3 detik
                        waktuGame -= 3;
                        Swal.fire({
                            toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, icon: 'error', title: 'Pelanggan Kecewa! (-3s)'
                        });

                        servingStreak = 0;
                        orderQueue.shift(); // Buang pelanggan yang marah
                        pelangganBaru();    // Panggil pelanggan baru
                    }
                }

                if (waktuGame <= 9 && waktuGame > 0) {
                    var audio = document.getElementById("sfxTimer10DetikLagi");
                    var sfxMuted = localStorage.getItem('game_sfx_muted') === 'true';
                    if (audio && !sfxMuted) {
                        var sfxVol = parseFloat(localStorage.getItem('game_sfx_volume'));
                        if (!isNaN(sfxVol) && sfxVol >= 0) {
                            audio.volume = sfxVol;
                        }
                        var expectedTime = 9 - waktuGame;
                        if (audio.paused) {
                            audio.currentTime = expectedTime >= 0 ? expectedTime : 0;
                            audio.play().catch(function(e){});
                        } else {
                            // Sync if time difference > 1.5s (e.g. from +3s bonus)
                            if (Math.abs(audio.currentTime - expectedTime) > 1.5) {
                                audio.currentTime = expectedTime >= 0 ? expectedTime : 0;
                            }
                        }
                    }
                    $("#lblWaktuGame").parent().addClass("machine-shaking");
                    $("#lblWaktuGame").parent().css("color", "#ef4444");
                } else if (waktuGame > 9) {
                    stopGameSfx("sfxTimer10DetikLagi");
                    $("#lblWaktuGame").parent().removeClass("machine-shaking");
                    $("#lblWaktuGame").parent().css("color", "");
                }

                if (waktuGame <= 0) {
                    $("#lblWaktuGame").parent().removeClass("machine-shaking");
                    clearInterval(gameInterval);
                    gameSelesai();
                }
            }, 1000);
        }

        function gameSelesai() {
            $(".btn-bahan, #btnSajikan, #btnBuang, .item-adonan, .item-topping, #btnPauseGame").prop("disabled", true);
            clearInterval(gameInterval);
            gameInterval = null;

            if (koinGame >= 1) {
                playGameSfx("sfxGameSelesai");
            } else {
                playGameSfx("sfxGameOver");
            }

            Swal.fire({
                title: "Waktu Habis! \u{23f0}",
                html: "Toko kue ditutup untuk hari ini!<br/><br/>Berhasil mengumpulkan <b>" + koinGame + " Koin</b> \u{1f4b0}<br/><br/>Apa yang ingin kamu lakukan?",
                icon: "info",
                showCancelButton: true,
                confirmButtonText: "Main Lagi \u{1f3ae}",
                cancelButtonText: "Selesai & Simpan \u{1f4be}",
                confirmButtonColor: "#4cd964",
                cancelButtonColor: "#D4A373",
                allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                    // MAIN LAGI: Save coins and session achievements/missions!
                    var shouldUnlockSoClose = hasAchievedSoCloseInSession;
                    var currentCooked = Object.assign({}, sessionCookedCounts);
                    var currentStreak = sessionMaxStreak;

                    hasAchievedSoCloseInSession = false;
                    hasNotifiedSoCloseInSession = false;
                    sessionCookedCounts = {};
                    sessionMaxStreak = 0;

                    Swal.fire({
                        title: "Menyimpan Koin...",
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        didOpen: () => {
                            Swal.showLoading();
                            $.ajax({
                                url: '/MainMenu/SimpanKoinGame',
                                type: 'POST',
                                data: {
                                    koinDidapat: koinGame,
                                    unlockSoClose: shouldUnlockSoClose,
                                    cookedItemsJson: JSON.stringify(currentCooked),
                                    maxStreak: currentStreak
                                },
                                success: function (response) {
                                    if (response.success) {
                                        // Update local total
                                        $("#lblKoinSesi").data("total", response.totalKoinBaru);
                                        
                                        waktuGame = 300;
                                        koinGame = 0;
                                        var basisKoin = parseInt($("#lblKoinSesi").data("total")) || 0;
                                        $("#lblKoinSesi").text(basisKoin);
                                        $("#lblWaktuGame").text(waktuGame);
                                        $("#lblWaktuGame").parent().css("color", "white").removeClass("machine-shaking");
                                        orderQueue = [];
                                        $("#orderQueueContainer").empty();
                                        resetMejaRacik();
                                        $(".btn-bahan, #btnSajikan, #btnBuang, .item-adonan, .item-topping, #btnPauseGame").prop("disabled", false);
                                        
                                        if (response.achievementUnlocked) {
                                            if (!window.UserUnlockedAchievements) window.UserUnlockedAchievements = [];
                                            if (window.UserUnlockedAchievements.indexOf("SoClose") === -1) {
                                                window.UserUnlockedAchievements.push("SoClose");
                                            }

                                            Swal.fire({
                                                title: '🏆 LENCANA RESMI TERBUKA! 🏆',
                                                html: `<h3 style="color:#FF5C8A; font-weight:bold;">${response.achievementName}</h3><p>Selamat! Karena berhasil menyelesaikan permainan, lencana ini resmi disimpan di akunmu!</p><div style="margin:10px auto; padding:8px 12px; background:#FFF3BF; border:1.5px dashed #E67700; border-radius:10px; font-weight:bold; color:#D9480F; width:fit-content; font-size:0.95rem;">🎟️ Kode Voucher: ${response.achievementVoucher}</div>`,
                                                icon: 'success',
                                                confirmButtonColor: '#FF5C8A'
                                            }).then(() => {
                                                mulaiGameVisual();
                                            });
                                        } else {
                                            Swal.fire({
                                                toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, icon: 'success', title: 'Koin Disimpan! 💰'
                                            });
                                            mulaiGameVisual();
                                        }
                                    } else {
                                        Swal.fire("Gagal Menyimpan", response.message, "error");
                                    }
                                }
                            });
                        }
                    });
                } else {
                    // SELESAI & SIMPAN: Save coins and session achievements/missions!
                    var shouldUnlockSoClose = hasAchievedSoCloseInSession;
                    var currentCooked = Object.assign({}, sessionCookedCounts);
                    var currentStreak = sessionMaxStreak;

                    hasAchievedSoCloseInSession = false;
                    hasNotifiedSoCloseInSession = false;
                    sessionCookedCounts = {};
                    sessionMaxStreak = 0;

                    Swal.fire({
                        title: "Menyimpan Data...",
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        didOpen: () => {
                            Swal.showLoading();
                            $.ajax({
                                url: '/MainMenu/SimpanKoinGame',
                                type: 'POST',
                                data: {
                                    koinDidapat: koinGame,
                                    unlockSoClose: shouldUnlockSoClose,
                                    cookedItemsJson: JSON.stringify(currentCooked),
                                    maxStreak: currentStreak
                                },
                                success: function (response) {
                                    if (response.success) {
                                        var extraHtml = "";
                                        if (response.achievementUnlocked) {
                                            extraHtml = `<div style="margin:12px auto; padding:10px 14px; background:#FFF3BF; border:1.5px dashed #E67700; border-radius:10px;"><div style="color:#D9480F; font-weight:bold; font-size:1rem;">🏆 Pencapaian Terbuka: ${response.achievementName}</div><div style="font-size:0.85rem; color:#7B5B3A; margin-top:4px;">Kode Voucher Unik: <b>${response.achievementVoucher}</b></div></div>`;
                                        }

                                        Swal.fire({
                                            title: "Berhasil Disimpan! 🥳",
                                            html: "Total koin tokomu sekarang: <b>" + response.totalKoinBaru + "</b> 🪙" + extraHtml,
                                            icon: "success",
                                            confirmButtonText: "Kembali ke Dashboard 🚀",
                                            confirmButtonColor: "#D4A373",
                                            allowOutsideClick: false
                                        }).then((res) => {
                                            if (res.isConfirmed) {
                                                window.navigateWithExitTransition("/MainMenu/Index");
                                            }
                                        });
                                    } else {
                                        Swal.fire("Gagal Menyimpan", response.message, "error");
                                    }
                                },
                                error: function () {
                                    Swal.fire("Error Server", "Terjadi kegagalan koneksi.", "error");
                                }
                            });
                        }
                    });
                }
            });
        }

        // READY GO SCREEN LOGIC
        function mulaiGameVisual() {
            let countdown = 3;
            let $overlay = $('<div id="readyGoOverlay" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;"><div id="readyGoText" style="font-size:8rem; color:#fff; font-weight:bold; text-shadow:4px 4px 0 #d97706;"></div></div>');
            $('body').append($overlay);
            
            function tick() {
                if (countdown > 0) {
                    $("#readyGoText").text(countdown).hide().fadeIn(200);
                    countdown--;
                    setTimeout(tick, 1000);
                } else {
                    $("#readyGoText").text("GO!").hide().fadeIn(200, function() {
                        setTimeout(function() {
                            $overlay.fadeOut(300, function() { $(this).remove(); });
                            window.startCookingGame();
                        }, 500);
                    });
                }
            }
            tick();
        }

        window.mulaiGameVisual = mulaiGameVisual;

        window.startCookingGame = function () {
            if (gameInterval) return;
            pelangganBaru();
            mulaiTimer();
        };
        
        window.startInteractiveTutorial = function() {
            isTutorialActive = true;
            tutorialStep = 1;
            
            // 1. Setup the single tutorial order: Donat + Cokelat
            orderQueue = [{
                kue: "Donat",
                topping: ["Cokelat"],
                avatarIndex: 0,
                timer: 9999, // very high so it doesn't run out
                maxTimer: 9999
            }];
            pesananKueAktif = "Donat";
            pesananToppingAktif = ["Cokelat"];
            renderOrderQueue();
            resetMejaRacik();
            
            // 2. Pause the game timer
            waktuGame = 300;
            $("#lblWaktuGame").text(waktuGame);
            if (gameInterval) {
                clearInterval(gameInterval);
                gameInterval = null;
            }
            
            // 3. Add tutorial banner
            $("#tutorialBanner").remove();
            $("body").append('<div id="tutorialBanner" class="tutorial-banner"></div>');
            
            // 4. Highlight current target
            applyTutorialStepHighlights();
        };

        function applyTutorialStepHighlights() {
            // Clear all highlights
            $(".item-adonan, .tool-station, .item-topping, #btnSerahkanPacker, #btnSajikan").removeClass("tutorial-highlight");
            
            if (!isTutorialActive) {
                $("#tutorialBanner").remove();
                return;
            }
            
            if (tutorialStep === 1) {
                $('[data-adonan="Tepung"]').addClass("tutorial-highlight");
                $("#tutorialBanner").html("Langkah 1/8: Klik Tepung \u{1f33e} di rak atas untuk dimasukkan ke mangkuk! \u{1f963}");
            } 
            else if (tutorialStep === 2) {
                $('[data-adonan="Gula"]').addClass("tutorial-highlight");
                $("#tutorialBanner").html("Langkah 2/8: Klik Gula \u{1f36c} untuk dimasukkan ke mangkuk! \u{1f963}");
            }
            else if (tutorialStep === 3) {
                $('[data-adonan="Mentega"]').addClass("tutorial-highlight");
                $("#tutorialBanner").html("Langkah 3/8: Klik Mentega \u{1f9c8} untuk dimasukkan ke mangkuk! \u{1f963}");
            }
            else if (tutorialStep === 4) {
                $('[data-adonan="Ragi"]').addClass("tutorial-highlight");
                $("#tutorialBanner").html("Langkah 4/8: Klik Ragi \u{1f9ea} untuk melengkapi adonan Donat! \u{1f963}");
            }
            else if (tutorialStep === 5) {
                $("#btnBakeOven").addClass("tutorial-highlight");
                $("#tutorialBanner").html("Langkah 5/8: Adonan lengkap! Klik Oven \u{1f39b}\u{fe0f} untuk memanggang Donat!");
            }
            else if (tutorialStep === 6) {
                $('[data-topping="Cokelat"]').addClass("tutorial-highlight");
                $("#tutorialBanner").html("Langkah 6/8: Pelanggan meminta rasa Cokelat. Klik topping Cokelat \u{1f36b} di rak bawah!");
            }
            else if (tutorialStep === 7) {
                $("#btnSerahkanPacker").addClass("tutorial-highlight");
                $("#tutorialBanner").html("Langkah 7/8: Klik tombol Bungkus \u{1f4e6} (kuning) untuk mengemas kue!");
            }
            else if (tutorialStep === 8) {
                $("#btnSajikan").addClass("tutorial-highlight");
                $("#tutorialBanner").html("Langkah 8/8: Kue sudah terbungkus rapi! Klik tombol Sajikan \u{1f37d}\u{fe0f} (hijau)!");
            }
        }

        window.applyTutorialStepHighlights = applyTutorialStepHighlights;
        
        // Expose state to other scripts if needed
        window.getTutorialState = function() {
            return {
                isActive: isTutorialActive,
                step: tutorialStep
            };
        };
        
        window.setTutorialStep = function(step) {
            tutorialStep = step;
            applyTutorialStepHighlights();
        };

        window.endTutorialMode = function() {
            isTutorialActive = false;
            applyTutorialStepHighlights();
        };

        function navigateWithExitTransition(targetUrl) {
            var isMobileOrTablet = ('ontouchstart' in window || navigator.maxTouchPoints > 0 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) && window.innerWidth <= 1024;
            var isCurrentlyLandscape = window.innerWidth > window.innerHeight;

            if (isMobileOrTablet && isCurrentlyLandscape) {
                $("#exitRotateOverlay").addClass("show");
                
                var checkInterval = setInterval(function() {
                    if (window.innerWidth <= window.innerHeight) {
                        clearInterval(checkInterval);
                        window.location.href = targetUrl;
                    }
                }, 300);

                $("#btnSkipExitRotate").off("click").on("click", function() {
                    clearInterval(checkInterval);
                    window.location.href = targetUrl;
                });
            } else {
                window.location.href = targetUrl;
            }
        }
        window.navigateWithExitTransition = navigateWithExitTransition;

        // Intercept prep overlay exit
        $(".btn-back-cooking-prep").off("click").on("click", function(e) {
            e.preventDefault();
            window.navigateWithExitTransition("/MainMenu/Index");
        });

        function showInGameAchievementNotification(name, key, customSubTitle) {
            // Safeguard untuk SEMUA achievement: Jika akun pemain sudah memiliki lencana ini, jangan pernah munculkan notifikasi lagi
            if (isAchievementAlreadyUnlocked(key)) {
                return;
            }

            var sfxMuted = localStorage.getItem('game_sfx_muted') === 'true';
            if (!sfxMuted) {
                var audio = document.getElementById("sfxNewBest");
                if (audio) {
                    var sfxVol = parseFloat(localStorage.getItem('game_sfx_volume'));
                    if (!isNaN(sfxVol) && sfxVol >= 0) {
                        audio.volume = sfxVol;
                    }
                    audio.currentTime = 0;
                    audio.play().catch(e => console.log("Audio play failed:", e));
                }
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

            var headerText = customSubTitle ? "SYARAT TERCAPAI! ⚡" : "LENCANA TERBUKA! 🏆";
            var descText = customSubTitle ? `<div style="font-size:0.68rem; color:#FFE3E3; margin-top:2px;">${customSubTitle}</div>` : "";

            var banner = $(`
                <div id="achievementNotificationBanner" style="position:fixed; top:-120px; left:50%; transform:translateX(-50%); width:330px; background:linear-gradient(135deg, #FF9999, #FF5C8A); border:4px solid #FFFFFF; border-radius:24px; padding:12px 20px; display:flex; align-items:center; gap:12px; z-index:999999; box-shadow:0 12px 30px rgba(255, 92, 138, 0.4); font-family:'Fredoka', sans-serif; color:white; transition:all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                    <div style="font-size:2.2rem; background:rgba(255,255,255,0.25); width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.1); flex-shrink:0;">
                        ${emoji}
                    </div>
                    <div style="text-align:left;">
                        <div style="font-size:0.7rem; font-weight:bold; letter-spacing:0.8px; text-transform:uppercase; color:#FAEDCD;">${headerText}</div>
                        <div style="font-size:1.05rem; font-weight:bold; color:white; margin-top:2px; text-shadow:0 1px 2px rgba(0,0,0,0.1); line-height:1.2;">${name.replace(/[^a-zA-Z0-9\s]/g, '').trim()}</div>
                        ${descText}
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