(function() {
    // Exclude Shop/E-Commerce pages: no game audio, no settings gear button, no portrait lock
    if ((document.body && document.body.classList.contains('shop-body')) ||
        (window.location.pathname && window.location.pathname.toLowerCase().indexOf('/shop') > -1)) {
        return;
    }

    // ==========================================
    // 1. PATH RESOLVER & AUDIO SFX POOL
    // ==========================================
    var scriptSrc = document.currentScript ? document.currentScript.src : '';
    var basePath = '';
    if (scriptSrc) {
        var match = scriptSrc.match(/^(https?:\/\/[^\/]+)?(.*?)\/Scripts\/bubble-pop\.js/i);
        if (match) {
            basePath = match[2];
        }
    }
    var audioUrl = basePath + '/Content/Audio/bubble-pop.mp3';
    
    // Volume & Mute state from localStorage
    var bgmVolKey = 'game_bgm_volume';
    var sfxVolKey = 'game_sfx_volume';
    var bgmMutedKey = 'game_bgm_muted';
    var sfxMutedKey = 'game_sfx_muted';
    
    if (localStorage.getItem(bgmVolKey) === null) localStorage.setItem(bgmVolKey, '0.3');
    if (localStorage.getItem(sfxVolKey) === null) localStorage.setItem(sfxVolKey, '0.5');
    if (localStorage.getItem(bgmMutedKey) === null) localStorage.setItem(bgmMutedKey, 'false');
    if (localStorage.getItem(sfxMutedKey) === null) localStorage.setItem(sfxMutedKey, 'false');

    var audioPool = [];
    var poolSize = 6;
    for (var i = 0; i < poolSize; i++) {
        var audio = new Audio(audioUrl);
        audioPool.push(audio);
    }
    var poolIndex = 0;
    var lastPlayTime = 0;

    // Apply volumes to pool and page-level audio elements
    function applyVolumes() {
        var bgmVol = parseFloat(localStorage.getItem(bgmVolKey));
        var sfxVol = parseFloat(localStorage.getItem(sfxVolKey));
        var bgmMuted = localStorage.getItem(bgmMutedKey) === 'true';
        var sfxMuted = localStorage.getItem(sfxMutedKey) === 'true';

        var activeBgmVol = bgmMuted ? 0 : bgmVol;
        var activeSfxVol = sfxMuted ? 0 : sfxVol;

        // Update pool volumes
        for (var j = 0; j < audioPool.length; j++) {
            audioPool[j].volume = activeSfxVol;
        }

        // Update all DOM audio elements
        var audios = document.getElementsByTagName('audio');
        for (var k = 0; k < audios.length; k++) {
            var aud = audios[k];
            var isBgm = aud.hasAttribute('loop') || 
                        (aud.id && aud.id.toLowerCase().indexOf('bgm') > -1) ||
                        (aud.src && aud.src.toLowerCase().indexOf('bgm') > -1);
            
            aud.volume = isBgm ? activeBgmVol : activeSfxVol;
        }
    }

    // Periodically sync volumes for dynamic elements
    setInterval(applyVolumes, 500);

    function playBubblePop() {
        var sfxMuted = localStorage.getItem(sfxMutedKey) === 'true';
        if (sfxMuted) return; // Muted, do not play SFX

        var now = Date.now();
        if (now - lastPlayTime < 50) return; // Prevent double play on same tick
        lastPlayTime = now;

        try {
            var audio = audioPool[poolIndex];
            audio.currentTime = 0;
            audio.volume = parseFloat(localStorage.getItem(sfxVolKey));
            audio.play().catch(function(e) {
                // Ignore autoplay/interaction warnings
            });
            poolIndex = (poolIndex + 1) % poolSize;
        } catch (err) {
            console.error("Bubble pop play error:", err);
        }
    }

    // Expose globally
    window.playBubblePop = playBubblePop;

    // ==========================================
    // 2. INJECT UI ELEMENTS (SETTINGS BUTTON & MODAL)
    // ==========================================
    var isVisibilityCheckScheduled = false;
    function scheduleSettingsButtonVisibility() {
        if (isVisibilityCheckScheduled) return;
        isVisibilityCheckScheduled = true;
        (window.requestAnimationFrame || function(cb) { setTimeout(cb, 16); })(function() {
            isVisibilityCheckScheduled = false;
            updateSettingsButtonVisibility();
        });
    }

    function updateSettingsButtonVisibility() {
        var btn = document.getElementById('global-settings-btn');
        if (!btn) return;

        // Check if page loader is visible or exists (use offsetHeight/style to avoid forced reflow)
        var loader = document.getElementById('global-page-loader');
        var isLoaderVisible = loader && (loader.style.display !== 'none' && loader.offsetHeight > 0);

        // Check if ready-go-overlay exists and is active
        var readyGo = document.querySelector('.ready-go-overlay');
        var isReadyGoActive = readyGo && (readyGo.style.display !== 'none' && readyGo.offsetHeight > 0);

        // Check if global-portrait-overlay is active
        var portraitOverlay = document.getElementById('global-portrait-overlay');
        var isPortraitActive = portraitOverlay && 
                              (portraitOverlay.classList.contains('active') || 
                               portraitOverlay.style.display === 'flex' || 
                               portraitOverlay.offsetHeight > 0);

        if (isLoaderVisible || isReadyGoActive || isPortraitActive || document.readyState === 'loading') {
            btn.style.setProperty('display', 'none', 'important');
        } else {
            btn.style.setProperty('display', 'flex', 'important');
        }
    }

    function injectUI() {
        if (document.getElementById('global-settings-btn')) return;

        // Create style block
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = '\
            /* Hide legacy BGM toggles on all pages */\
            #musicToggle, #btnToggleBgm {\
                display: none !important;\
            }\
            /* Floating Settings Button */\
            #global-settings-btn {\
                position: fixed;\
                bottom: clamp(15px, 3vw, 30px);\
                right: clamp(15px, 3vw, 30px);\
                width: clamp(45px, 5vw, 65px);\
                height: clamp(45px, 5vw, 65px);\
                background: linear-gradient(135deg, #FF9A9E 0%, #FF6B8B 100%);\
                border: 3px solid #FFF;\
                border-radius: 50%;\
                box-shadow: 0 4px 15px rgba(255, 107, 139, 0.4);\
                color: #FFF;\
                font-size: clamp(20px, 2.5vw, 30px);\
                display: none;\
                align-items: center;\
                justify-content: center;\
                z-index: 999998;\
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s;\
            }\
            #global-settings-btn:hover {\
                transform: scale(1.1) rotate(45deg);\
                box-shadow: 0 6px 20px rgba(255, 107, 139, 0.6);\
            }\
            #global-settings-btn:active {\
                transform: scale(0.9) rotate(-30deg);\
            }\
            /* Modal Overlay */\
            #global-settings-overlay {\
                position: fixed;\
                top: 0;\
                left: 0;\
                width: 100%;\
                height: 100%;\
                background: rgba(0,0,0,0.5);\
                backdrop-filter: blur(5px);\
                -webkit-backdrop-filter: blur(5px);\
                z-index: 999999;\
                display: flex;\
                align-items: center;\
                justify-content: center;\
                opacity: 0;\
                pointer-events: none;\
                transition: opacity 0.3s ease;\
            }\
            #global-settings-overlay.show {\
                opacity: 1;\
                pointer-events: auto;\
            }\
            /* Modal Container */\
            #global-settings-modal {\
                background: #FFFEF7;\
                border: 4px solid #D4A373;\
                border-radius: 24px;\
                padding: 25px;\
                width: 90%;\
                max-width: 380px;\
                max-height: 95vh;\
                overflow-y: auto;\
                box-shadow: 0 10px 30px rgba(0,0,0,0.25);\
                text-align: center;\
                font-family: "Fredoka", "Quicksand", "Nunito", sans-serif;\
                color: #7B5B3A;\
                transform: scale(0.8);\
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);\
            }\
            #global-settings-overlay.show #global-settings-modal {\
                transform: scale(1);\
            }\
            #global-settings-modal h3 {\
                font-size: 1.5rem;\
                font-weight: bold;\
                margin-bottom: 20px;\
                color: #5a412d;\
                text-shadow: 1px 1px 0 #fff;\
                margin-top: 0;\
            }\
            /* Quick Mute Section */\
            .quick-mute-container {\
                display: flex;\
                justify-content: space-around;\
                margin-bottom: 25px;\
                padding: 10px 0 15px 0;\
                border-bottom: 2px solid #EEDDCC;\
            }\
            .mute-toggle-wrapper {\
                display: flex;\
                flex-direction: column;\
                align-items: center;\
                cursor: pointer;\
            }\
            .mute-icon-btn {\
                width: 65px;\
                height: 65px;\
                background: linear-gradient(135deg, #FF9A9E 0%, #FF6B8B 100%);\
                border: 3px solid #FFF;\
                border-radius: 50%;\
                box-shadow: 0 4px 10px rgba(255, 107, 139, 0.3);\
                color: #FFF;\
                display: flex;\
                align-items: center;\
                justify-content: center;\
                transition: all 0.2s ease;\
                position: relative;\
            }\
            .mute-icon-btn:hover {\
                transform: scale(1.08);\
                box-shadow: 0 6px 14px rgba(255, 107, 139, 0.5);\
            }\
            .mute-icon-btn:active {\
                transform: scale(0.95);\
            }\
            .mute-icon-btn.muted {\
                background: linear-gradient(135deg, #E2B4B7 0%, #C98A96 100%);\
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);\
            }\
            .mute-icon-btn .slash-line {\
                display: none;\
            }\
            .mute-icon-btn.muted .slash-line {\
                display: block;\
            }\
            .mute-toggle-label {\
                font-size: 0.95rem;\
                font-weight: 700;\
                margin-top: 8px;\
                color: #7B5B3A;\
            }\
            /* Volume controls */\
            .vol-control-group {\
                text-align: left;\
                margin-bottom: 20px;\
            }\
            .vol-control-group label {\
                font-weight: 600;\
                display: flex;\
                justify-content: space-between;\
                font-size: 1rem;\
                color: #7b5b3a;\
                margin-bottom: 5px;\
            }\
            /* Slider Styling */\
            .vol-slider {\
                -webkit-appearance: none;\
                width: 100%;\
                height: 10px;\
                border-radius: 5px;\
                background: #EEDDCC;\
                outline: none;\
                margin: 5px 0;\
                border: 1px solid #eed6bd;\
            }\
            .vol-slider::-webkit-slider-thumb {\
                -webkit-appearance: none;\
                appearance: none;\
                width: 22px;\
                height: 22px;\
                border-radius: 50%;\
                background: linear-gradient(135deg, #FF9A9E 0%, #FF6B8B 100%);\
                border: 2px solid #FFF;\
                cursor: pointer;\
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);\
            }\
            .vol-slider::-moz-range-thumb {\
                width: 22px;\
                height: 22px;\
                border-radius: 50%;\
                background: linear-gradient(135deg, #FF9A9E 0%, #FF6B8B 100%);\
                border: 2px solid #FFF;\
                cursor: pointer;\
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);\
            }\
            /* Developer Contact Section */\
            .developer-contact-group {\
                margin: 20px 0 15px 0;\
                padding-top: 15px;\
                border-top: 2px dashed #EEDDCC;\
                text-align: center;\
            }\
            .contact-title {\
                font-size: 0.9rem;\
                font-weight: 700;\
                color: #7B5B3A;\
                margin-bottom: 12px;\
                line-height: 1.3;\
            }\
            .contact-links {\
                display: flex;\
                justify-content: center;\
                gap: 15px;\
            }\
            .contact-link {\
                display: flex;\
                align-items: center;\
                gap: 8px;\
                padding: 6px 14px;\
                border-radius: 20px;\
                color: #FFF !important;\
                text-decoration: none !important;\
                font-size: 0.85rem;\
                font-weight: bold;\
                transition: all 0.2s ease;\
                box-shadow: 0 3px 6px rgba(0,0,0,0.1);\
            }\
            .contact-link.instagram {\
                background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);\
            }\
            .contact-link.gmail {\
                background: #ea4335;\
            }\
            .contact-link:hover {\
                transform: translateY(-2px) scale(1.05);\
                box-shadow: 0 5px 12px rgba(0,0,0,0.15);\
                filter: brightness(1.1);\
            }\
            .contact-link:active {\
                transform: translateY(1px) scale(0.95);\
            }\
            .contact-icon {\
                display: block;\
            }\
            \
            /* Close Button */\
            .settings-close-btn {\
                background: linear-gradient(180deg, #D4A373 0%, #B5835A 100%);\
                color: white;\
                border: none;\
                border-radius: 15px;\
                padding: 10px 25px;\
                font-weight: bold;\
                font-size: 1rem;\
                box-shadow: 0 4px 0 #8b5f3a;\
                cursor: pointer;\
                transition: transform 0.1s, box-shadow 0.1s;\
                margin-top: 10px;\
                display: inline-block;\
                text-decoration: none;\
            }\
            .settings-close-btn:hover {\
                transform: translateY(-2px);\
                box-shadow: 0 6px 0 #8b5f3a;\
            }\
            .settings-close-btn:active {\
                transform: translateY(2px);\
                box-shadow: 0 2px 0 #8b5f3a;\
            }\
            \
            /* Mobile responsive settings overrides */\
            @media (max-width: 480px) {\
                #global-settings-modal {\
                    padding: 15px 20px;\
                    border-radius: 20px;\
                    border-width: 3px;\
                    max-width: 310px;\
                }\
                #global-settings-modal h3 {\
                    font-size: 1.2rem;\
                    margin-bottom: 15px;\
                }\
                .quick-mute-container {\
                    margin-bottom: 15px;\
                    padding-bottom: 10px;\
                }\
                .mute-icon-btn {\
                    width: 48px;\
                    height: 48px;\
                    border-width: 2px;\
                }\
                .mute-toggle-label {\
                    font-size: 0.8rem;\
                }\
                .vol-control-group label {\
                    font-size: 0.85rem;\
                }\
                .vol-slider::-webkit-slider-thumb {\
                    width: 18px;\
                    height: 18px;\
                }\
                .vol-slider::-moz-range-thumb {\
                    width: 18px;\
                    height: 18px;\
                }\
                .contact-title {\
                    font-size: 0.8rem;\
                    margin-bottom: 8px;\
                }\
                .contact-links {\
                    gap: 10px;\
                }\
                .contact-link {\
                    padding: 4px 10px;\
                    font-size: 0.75rem;\
                    border-radius: 15px;\
                }\
                .settings-close-btn {\
                    padding: 8px 20px;\
                    font-size: 0.85rem;\
                    border-radius: 12px;\
                }\
            }\
            \
            /* Mobile Landscape/Short viewports settings overrides */\
            @media (max-height: 520px) {\
                #global-settings-modal {\
                    padding: 10px 15px;\
                    border-radius: 16px;\
                    border-width: 2.5px;\
                    max-width: 380px;\
                    margin: auto;\
                }\
                #global-settings-modal h3 {\
                    font-size: 1.1rem;\
                    margin-bottom: 8px;\
                    margin-top: 0;\
                }\
                .quick-mute-container {\
                    margin-bottom: 8px;\
                    padding: 4px 0 8px 0;\
                }\
                .mute-icon-btn {\
                    width: 40px;\
                    height: 40px;\
                    border-width: 2px;\
                }\
                .mute-icon-btn svg {\
                    width: 20px !important;\
                    height: 20px !important;\
                }\
                .mute-toggle-label {\
                    font-size: 0.75rem;\
                    margin-top: 4px;\
                }\
                .vol-control-group {\
                    margin-bottom: 8px;\
                }\
                .vol-control-group label {\
                    font-size: 0.8rem;\
                    margin-bottom: 2px;\
                }\
                .vol-slider {\
                    height: 8px;\
                    margin: 2px 0;\
                }\
                .vol-slider::-webkit-slider-thumb {\
                    width: 16px;\
                    height: 16px;\
                }\
                .vol-slider::-moz-range-thumb {\
                    width: 16px;\
                    height: 16px;\
                }\
                .developer-contact-group {\
                    margin: 8px 0;\
                    padding-top: 8px;\
                }\
                .contact-title {\
                    font-size: 0.75rem;\
                    margin-bottom: 6px;\
                }\
                .contact-links {\
                    gap: 8px;\
                }\
                .contact-link {\
                    padding: 3px 8px;\
                    font-size: 0.7rem;\
                    border-radius: 12px;\
                }\
                .contact-link svg {\
                    width: 14px !important;\
                    height: 14px !important;\
                }\
                .settings-close-btn {\
                    padding: 6px 15px;\
                    font-size: 0.8rem;\
                    border-radius: 10px;\
                    margin-top: 5px;\
                    box-shadow: 0 2px 0 #8b5f3a;\
                }\
            }\
        ';
        document.head.appendChild(style);

        // Inject Floating Button
        var btn = document.createElement('div');
        btn.id = 'global-settings-btn';
        btn.innerHTML = '\u{2699}\u{fe0f}';
        btn.title = 'Pengaturan Volume';
        document.body.appendChild(btn);

        // Initial visibility check
        scheduleSettingsButtonVisibility();

        // Setup MutationObserver to watch for loader/overlay showing up or disappearing
        // Scoped to ignore gameplay mutations (board cells, held blocks, animations)
        if (window.MutationObserver) {
            var observer = new MutationObserver(function(mutations) {
                var needsCheck = false;
                for (var i = 0; i < mutations.length; i++) {
                    var target = mutations[i].target;
                    // Ignore mutations on game board cells, held pieces, and clouds
                    if (target && target.closest && (
                        target.closest('#gridBoard') || 
                        target.closest('#held-block-container') || 
                        target.closest('.game-container') || 
                        target.closest('.adv-board-only') ||
                        target.classList.contains('cell') || 
                        target.classList.contains('floating-dessert') || 
                        target.classList.contains('cloud')
                    )) {
                        continue;
                    }
                    needsCheck = true;
                    break;
                }
                if (needsCheck) {
                    scheduleSettingsButtonVisibility();
                }
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }

        // Inject Modal HTML
        var overlay = document.createElement('div');
        overlay.id = 'global-settings-overlay';
        
        var initBgmVal = Math.round(parseFloat(localStorage.getItem(bgmVolKey)) * 100);
        var initSfxVal = Math.round(parseFloat(localStorage.getItem(sfxVolKey)) * 100);
        var isBgmMuted = localStorage.getItem(bgmMutedKey) === 'true';
        var isSfxMuted = localStorage.getItem(sfxMutedKey) === 'true';

        overlay.innerHTML = '\
            <div id="global-settings-modal">\
                <h3>\u{2699}\u{fe0f} Pengaturan Suara</h3>\
                \
                <!-- Quick Mute Icons -->\
                <div class="quick-mute-container">\
                    <div class="mute-toggle-wrapper" id="suara-toggle-wrapper">\
                        <div class="mute-icon-btn ' + (isSfxMuted ? 'muted' : '') + '" id="suara-mute-btn">\
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;">\
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>\
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor"></path>\
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor"></path>\
                                <line class="slash-line" x1="3" y1="21" x2="21" y2="3" stroke="#ff3b30" stroke-width="3" stroke-linecap="round"></line>\
                            </svg>\
                        </div>\
                        <span class="mute-toggle-label">Suara</span>\
                    </div>\
                    <div class="mute-toggle-wrapper" id="bgm-toggle-wrapper">\
                        <div class="mute-icon-btn ' + (isBgmMuted ? 'muted' : '') + '" id="bgm-mute-btn">\
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;">\
                                <path d="M9 18V5l12-2v13" stroke="currentColor"></path>\
                                <circle cx="6" cy="18" r="3" fill="currentColor"></circle>\
                                <circle cx="18" cy="16" r="3" fill="currentColor"></circle>\
                                <line class="slash-line" x1="3" y1="21" x2="21" y2="3" stroke="#ff3b30" stroke-width="3" stroke-linecap="round"></line>\
                            </svg>\
                        </div>\
                        <span class="mute-toggle-label">BGM</span>\
                    </div>\
                </div>\
                \
                <div class="vol-control-group">\
                    <label><span>\u{1f3b5} Volume Musik (BGM)</span><span id="bgm-vol-val">' + initBgmVal + '%</span></label>\
                    <input type="range" id="bgm-vol-slider" class="vol-slider" min="0" max="100" value="' + initBgmVal + '">\
                </div>\
                <div class="vol-control-group">\
                    <label><span>\u{1f50a} Volume Efek (SFX)</span><span id="sfx-vol-val">' + initSfxVal + '%</span></label>\
                    <input type="range" id="sfx-vol-slider" class="vol-slider" min="0" max="100" value="' + initSfxVal + '">\
                </div>\
                \
                <!-- Developer Contact Section -->\
                <div class="developer-contact-group">\
                    <div class="contact-title">Kenalan dan berikan masukan dengan dev game ini!</div>\
                    <div class="contact-links">\
                        <a href="https://www.instagram.com/ywizzky?igsh=dGJlcWg1OHByYWQx" target="_blank" class="contact-link instagram" title="Instagram Developer">\
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="contact-icon"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>\
                            <span>Instagram</span>\
                        </a>\
                        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=zakys3301@gmail.com" target="_blank" class="contact-link gmail" title="Gmail Developer">\
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="contact-icon"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>\
                            <span>Gmail</span>\
                        </a>\
                    </div>\
                </div>\
                \
                <button class="settings-close-btn" id="settings-save-close-btn">Tutup & Simpan \u{2728}</button>\
            </div>\
        ';
        document.body.appendChild(overlay);

        // Add event listeners for Floating settings button
        btn.addEventListener('click', function() {
            playBubblePop();
            overlay.classList.add('show');
        });

        var closeBtn = document.getElementById('settings-save-close-btn');
        closeBtn.addEventListener('click', function() {
            playBubblePop();
            overlay.classList.remove('show');
        });

        // Add event listeners for Mute buttons
        var suaraMuteBtn = document.getElementById('suara-mute-btn');
        suaraMuteBtn.addEventListener('click', function() {
            var isMuted = localStorage.getItem(sfxMutedKey) === 'true';
            var newMuted = !isMuted;
            localStorage.setItem(sfxMutedKey, newMuted ? 'true' : 'false');
            
            if (newMuted) {
                suaraMuteBtn.classList.add('muted');
            } else {
                suaraMuteBtn.classList.remove('muted');
            }
            
            applyVolumes();
            playBubblePop(); // Play pop feedback if unmuting (or it will just be ignored if muting)
        });

        var bgmMuteBtn = document.getElementById('bgm-mute-btn');
        bgmMuteBtn.addEventListener('click', function() {
            var isMuted = localStorage.getItem(bgmMutedKey) === 'true';
            var newMuted = !isMuted;
            localStorage.setItem(bgmMutedKey, newMuted ? 'true' : 'false');
            
            if (newMuted) {
                bgmMuteBtn.classList.add('muted');
            } else {
                bgmMuteBtn.classList.remove('muted');
            }
            
            applyVolumes();
            playBubblePop();
        });

        // Add event listeners for Sliders
        var bgmSlider = document.getElementById('bgm-vol-slider');
        var bgmValueText = document.getElementById('bgm-vol-val');
        bgmSlider.addEventListener('input', function() {
            var valVal = this.value;
            bgmValueText.innerText = valVal + '%';
            localStorage.setItem(bgmVolKey, (valVal / 100).toString());
            
            // If user adjusts slider, automatically unmute BGM for better UX
            if (localStorage.getItem(bgmMutedKey) === 'true') {
                localStorage.setItem(bgmMutedKey, 'false');
                bgmMuteBtn.classList.remove('muted');
            }
            
            applyVolumes();
        });

        var sfxSlider = document.getElementById('sfx-vol-slider');
        var sfxValueText = document.getElementById('sfx-vol-val');
        sfxSlider.addEventListener('input', function() {
            var valVal = this.value;
            sfxValueText.innerText = valVal + '%';
            localStorage.setItem(sfxVolKey, (valVal / 100).toString());
            
            // If user adjusts slider, automatically unmute SFX for better UX
            if (localStorage.getItem(sfxMutedKey) === 'true') {
                localStorage.setItem(sfxMutedKey, 'false');
                suaraMuteBtn.classList.remove('muted');
            }
            
            applyVolumes();
        });

        // Hide settings button when page loader is triggered on unload
        window.addEventListener('beforeunload', function() {
            var btn = document.getElementById('global-settings-btn');
            if (btn) {
                btn.style.display = 'none';
            }
            startNavSafetyTimer();
        });
    }

    // ==========================================
    // GLOBAL DOUBLE-CLICK & NAVIGATION PROTECTION
    // ==========================================
    var isNavigatingGlobal = false;
    var navSafetyTimeout = null;

    function resetGlobalNavigation() {
        isNavigatingGlobal = false;
        if (navSafetyTimeout) {
            clearTimeout(navSafetyTimeout);
            navSafetyTimeout = null;
        }
        var loader = document.getElementById('global-page-loader');
        if (loader) {
            loader.style.display = 'none';
        }
        scheduleSettingsButtonVisibility();
    }

    function startNavSafetyTimer() {
        if (navSafetyTimeout) clearTimeout(navSafetyTimeout);
        navSafetyTimeout = setTimeout(function() {
            resetGlobalNavigation();
        }, 2200);
    }

    // Ensure bfcache, browser back/forward, and cancelled requests never lock screen
    window.addEventListener('pageshow', function() {
        resetGlobalNavigation();
    });

    window.addEventListener('focus', function() {
        setTimeout(function() {
            if (isNavigatingGlobal) {
                resetGlobalNavigation();
            }
        }, 600);
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            resetGlobalNavigation();
        }
    });

    // If user clicks on the loader overlay itself, dismiss it immediately
    document.addEventListener('click', function(e) {
        var loader = document.getElementById('global-page-loader');
        if (loader && (e.target === loader || loader.contains(e.target))) {
            resetGlobalNavigation();
        }
    }, true);

    // Run UI Injection
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectUI);
    } else {
        injectUI();
    }

    // ==========================================
    // 3. CAPTURE CLICK LISTENER & NAVIGATION GUARD
    // ==========================================
    document.addEventListener('click', function(e) {
        var target = e.target;
        var anchorTarget = null;
        var isButton = false;

        while (target && target !== document.documentElement) {
            var tagName = target.tagName ? target.tagName.toLowerCase() : '';
            
            if (tagName === 'a' && target.href && !anchorTarget) {
                anchorTarget = target;
            }

            // Define what elements are considered "buttons"
            if (!isButton) {
                isButton = 
                    tagName === 'button' ||
                    (tagName === 'input' && (target.type === 'button' || target.type === 'submit' || target.type === 'reset')) ||
                    (tagName === 'a' && (
                        target.classList.contains('btn') || 
                        target.classList.contains('btn-game-menu') || 
                        target.classList.contains('puzzle-btn') || 
                        target.classList.contains('btn-back') || 
                        target.classList.contains('btn-back-pink') ||
                        target.classList.contains('level-node')
                    )) ||
                    (target.classList && (
                        target.classList.contains('btn') || 
                        target.classList.contains('btn-game-menu') || 
                        target.classList.contains('btn-game') || 
                        target.classList.contains('puzzle-btn') || 
                        target.classList.contains('level-node') || 
                        target.classList.contains('level-island') ||
                        target.classList.contains('ingredient-btn') || 
                        target.classList.contains('topping-btn') || 
                        target.classList.contains('tool-station') ||
                        target.classList.contains('packer-flavor-btn') || 
                        target.classList.contains('btnUnlockRecipe') || 
                        target.classList.contains('floating-shop-btn') || 
                        target.classList.contains('profile-avatar') || 
                        target.classList.contains('audio-control') ||
                        target.classList.contains('btn-desainer') ||
                        target.classList.contains('btn-sajikan') ||
                        target.classList.contains('btn-buang') ||
                        target.id === 'musicToggle' ||
                        target.id === 'btnToggleBgm' ||
                        target.id === 'btnTogglePass' ||
                        target.id === 'btnToggleLoginPass' ||
                        target.id === 'global-settings-btn' ||
                        target.id === 'settings-save-close-btn' ||
                        target.id === 'suara-mute-btn' ||
                        target.id === 'bgm-mute-btn' ||
                        target.parentNode.id === 'suara-mute-btn' ||
                        target.parentNode.id === 'bgm-mute-btn'
                    )) ||
                    target.getAttribute('role') === 'button';
            }

            target = target.parentNode;
        }

        // DOUBLE-CLICK NAVIGATION SHIELD:
        // If an anchor link is clicked to navigate, prevent rapid secondary clicks
        // from aborting Chromium's pending navigation or causing UI deadlock.
        if (anchorTarget && anchorTarget.href) {
            var href = anchorTarget.getAttribute('href') || '';
            var isNavUrl = href && href !== '#' && !href.toLowerCase().startsWith('javascript') && !anchorTarget.hasAttribute('download');
            if (isNavUrl) {
                if (isNavigatingGlobal) {
                    // Swallow duplicate click so browser does NOT abort navigation!
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return false;
                }
                isNavigatingGlobal = true;
                startNavSafetyTimer();
            }
        }

        if (isButton) {
            playBubblePop();
        }
    }, true);

    // ==========================================
    // 4. GLOBAL PORTRAIT ORIENTATION ENFORCER
    // (Berlaku di SEMUA halaman selain Game Cooking)
    // ==========================================
    function initGlobalPortraitEnforcer() {
        // Cek apakah di halaman cooking
        function checkIsCooking() {
            return (document.body && document.body.classList.contains('cooking-body')) ||
                   (window.location.pathname && window.location.pathname.toLowerCase().indexOf('/cooking') > -1) ||
                   (document.getElementById('cookingPrepOverlay') !== null);
        }

        if (checkIsCooking()) return;

        // Pastikan style portrait overlay selalu tersedia di semua halaman
        if (!document.getElementById('global-portrait-overlay-styles')) {
            var style = document.createElement('style');
            style.id = 'global-portrait-overlay-styles';
            style.type = 'text/css';
            style.innerHTML = '\
                #global-portrait-overlay {\
                    display: none;\
                    position: fixed !important;\
                    top: 0 !important;\
                    left: 0 !important;\
                    width: 100vw !important;\
                    height: 100vh !important;\
                    background: radial-gradient(circle, #3d2410 0%, #1a1006 100%) !important;\
                    color: #ffe8c4 !important;\
                    z-index: 2147483647 !important;\
                    flex-direction: column !important;\
                    justify-content: center !important;\
                    align-items: center !important;\
                    text-align: center !important;\
                    font-family: "Fredoka", "Quicksand", "Plus Jakarta Sans", sans-serif !important;\
                    padding: 20px !important;\
                    box-sizing: border-box !important;\
                }\
                body:not(.cooking-body) #global-portrait-overlay.active {\
                    display: flex !important;\
                }\
                @media screen and (orientation: landscape) and (pointer: coarse) and (hover: none) and (max-width: 1366px) {\
                    body:not(.cooking-body) #global-portrait-overlay {\
                        display: flex !important;\
                    }\
                }\
                .global-portrait-card {\
                    max-width: 480px !important;\
                    width: 90% !important;\
                    display: flex !important;\
                    flex-direction: column !important;\
                    align-items: center !important;\
                    background: rgba(43, 29, 12, 0.9) !important;\
                    border: 2px solid #8b5f3a !important;\
                    border-radius: 24px !important;\
                    padding: 24px 30px !important;\
                    box-shadow: 0 10px 30px rgba(0,0,0,0.6) !important;\
                    backdrop-filter: blur(8px) !important;\
                    -webkit-backdrop-filter: blur(8px) !important;\
                    box-sizing: border-box !important;\
                }\
                .global-phone-icon {\
                    font-size: 3.5rem !important;\
                    margin-bottom: 12px !important;\
                    animation: rotatePhoneToPortrait 2s infinite ease-in-out !important;\
                }\
                @keyframes rotatePhoneToPortrait {\
                    0% { transform: rotate(-90deg); }\
                    50% { transform: rotate(0deg); }\
                    100% { transform: rotate(0deg); }\
                }\
                .global-portrait-title {\
                    font-size: clamp(1.2rem, 3.5vw, 1.6rem) !important;\
                    font-weight: 700 !important;\
                    margin-bottom: 10px !important;\
                    color: #ff5c8a !important;\
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.6) !important;\
                    line-height: 1.3 !important;\
                }\
                .global-portrait-desc {\
                    font-size: clamp(0.85rem, 2vw, 1rem) !important;\
                    line-height: 1.45 !important;\
                    color: #fce3b5 !important;\
                    margin-bottom: 0 !important;\
                }\
            ';
            if (document.head) {
                document.head.appendChild(style);
            } else {
                document.addEventListener('DOMContentLoaded', function() {
                    document.head.appendChild(style);
                });
            }
        }

        // Pastikan overlay DOM element dibuat jika belum ada
        var overlay = document.getElementById('global-portrait-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'global-portrait-overlay';
            overlay.innerHTML = '\
                <div class="global-portrait-card">\
                    <div class="global-phone-icon">\
                        <span style="font-size: 60px; display: inline-block;">📱</span>\
                    </div>\
                    <h2 class="global-portrait-title">Harap Putar Layar ke Posisi Tegak (Portrait) 🔄</h2>\
                    <p class="global-portrait-desc">Halaman ini dirancang dalam posisi tegak (Portrait) agar pas dengan genggaman Anda. Silakan putar HP Anda!</p>\
                </div>\
            ';
            if (document.body) {
                document.body.appendChild(overlay);
            } else {
                document.addEventListener('DOMContentLoaded', function() {
                    document.body.appendChild(overlay);
                });
            }
        }

        function checkPortraitOrientation() {
            if (checkIsCooking()) {
                if (overlay) {
                    overlay.classList.remove('active');
                    overlay.style.display = 'none';
                }
                return;
            }

            var isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
            var hasCoarseTouch = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)) && 
                                 (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) &&
                                 (window.matchMedia && window.matchMedia('(hover: none)').matches);

            var isRealMobileOrTablet = isMobileUA || hasCoarseTouch;
            var isLandscape = window.innerWidth > window.innerHeight;

            if (isLandscape && isRealMobileOrTablet) {
                if (overlay) {
                    overlay.classList.add('active');
                    overlay.style.display = 'flex';
                }
            } else {
                if (overlay) {
                    overlay.classList.remove('active');
                    overlay.style.display = 'none';
                }
            }
        }

        window.addEventListener('resize', checkPortraitOrientation);
        window.addEventListener('orientationchange', checkPortraitOrientation);
        window.addEventListener('load', checkPortraitOrientation);
        
        checkPortraitOrientation();
        setTimeout(checkPortraitOrientation, 100);
        setTimeout(checkPortraitOrientation, 500);
        setInterval(checkPortraitOrientation, 300);
    }

    if (document.body) {
        initGlobalPortraitEnforcer();
    } else {
        document.addEventListener('DOMContentLoaded', initGlobalPortraitEnforcer);
    }
})();

