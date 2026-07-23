/* ==========================================================================
   Main Entry Point - Mini-Game Engine & Grand Birthday Finale Cutscene
   ========================================================================== */

// On-Screen logger hook
(function() {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  function appendToDebugConsole(message, type) {
    const consoleEl = document.getElementById('debug-log-console');
    if (!consoleEl) return;

    const line = document.createElement('div');
    line.className = `debug-log-line ${type}`;
    line.innerText = `[${new Date().toLocaleTimeString()}] ${message}`;
    consoleEl.appendChild(line);

    consoleEl.scrollTop = consoleEl.scrollHeight;

    while (consoleEl.children.length > 50) {
      consoleEl.removeChild(consoleEl.firstChild);
    }
  }

  console.log = function(...args) {
    originalLog.apply(console, args);
    appendToDebugConsole(args.join(' '), 'log');
  };

  console.warn = function(...args) {
    originalWarn.apply(console, args);
    appendToDebugConsole(args.join(' '), 'warn');
  };

  console.error = function(...args) {
    originalError.apply(console, args);
    appendToDebugConsole(args.join(' '), 'error');
  };
})();

class Game {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.clock = new THREE.Clock();

    // Game States: 'SHOWCASE', 'FLOATING', 'CALENDAR_TEAR', 'BURST_LAND', 'PLAYING', 'PHOTO_PREVIEW', 'GIFT_BOX_CUTSCENE', 'FINALE'
    this.gameState = 'SHOWCASE';
    this.cutsceneTimer = 0;
    this.currentMonthIdx = 0;

    this.isCutsceneActive = false;
    this.secretDoorZ = 0;
    this.secretDoorTimer = 0;

    // Photo Preview Cutscene State
    this.previewArtPos = new THREE.Vector3();
    this.previewTimer = 0;
    this.previewCallback = null;

    // Gift Box Opening Cutscene State
    this.giftBoxRoomIdx = 0;
    this.giftBoxTimer = 0;
    this.giftBoxCallback = null;

    this.initScene();
    this.initEntities();
    this.initEventListeners();
    this.setupLoadingScreen();

    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a202c);

    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      precision: 'highp'
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  initEntities() {
    try {
      this.courtWorld = new window.CourtWorld(this.scene);
      this.character = new window.CharacterController(this.scene);
      this.bankNPC = new window.BankNPC(this.scene, new THREE.Vector3(0, 0, -152));
      this.questManager = new window.QuestManager(this.courtWorld, this.bankNPC);
      this.controls = new window.Controls(this.camera, this.canvas, this.character);
      
      // Global Mini-Game Engine
      window.miniGameEngine = new window.MiniGameEngine();
    } catch (e) {
      console.error("Safeguarded Entity Init:", e);
    }
  }

  initEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const soundBtn = document.getElementById('sound-toggle-btn');
    const soundIcon = document.getElementById('sound-icon');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        if (window.soundEngine) {
          const isMuted = window.soundEngine.toggleMute();
          soundIcon.className = isMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
        }
      });
    }
  }

  setupLoadingScreen() {
    const progressBar = document.getElementById('loading-progress');
    const startBtn = document.getElementById('start-btn');
    const loadingScreen = document.getElementById('loading-screen');

    const handleStart = () => {
      if (window.soundEngine) {
        window.soundEngine.startBGM();
        window.soundEngine.playClick();
      }
      if (loadingScreen) loadingScreen.classList.add('fade-out');
      
      if (this.courtWorld) {
        this.courtWorld.hidePhotoGalleryWall();
      }

      if (this.character && this.character.group) {
        this.character.group.rotation.y = 0;
      }

      this.startIntroCutscene();
    };

    if (startBtn) {
      startBtn.onclick = handleStart;
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (progressBar) progressBar.style.width = `${progress}%`;

      if (progress >= 100) {
        clearInterval(interval);
        this.prewarmShaders();
        if (startBtn) startBtn.classList.remove('hidden');
      }
    }, 50);
  }

  prewarmShaders() {
    console.log("DEBUG: Pre-warming WebGL shaders...");
    const tempVisibleElements = [];

    if (this.courtWorld) {
      // Temporarily make hidden items visible for the compilation step
      if (this.courtWorld.questMarkers) {
        this.courtWorld.questMarkers.forEach(el => {
          if (!el.visible) {
            el.visible = true;
            tempVisibleElements.push(el);
          }
        });
      }
      if (this.courtWorld.giftBoxPads) {
        this.courtWorld.giftBoxPads.forEach(el => {
          if (!el.visible) {
            el.visible = true;
            tempVisibleElements.push(el);
          }
        });
      }
      if (this.courtWorld.doors) {
        this.courtWorld.doors.forEach(el => {
          if (!el.visible) {
            el.visible = true;
            tempVisibleElements.push(el);
          }
        });
      }
      if (this.courtWorld.checkpointPads) {
        this.courtWorld.checkpointPads.forEach(el => {
          if (!el.visible) {
            el.visible = true;
            tempVisibleElements.push(el);
          }
        });
      }
    }

    if (this.renderer && this.scene && this.camera) {
      try {
        // Compile standard shaders
        this.renderer.compile(this.scene, this.camera);
        
        // Force a render pass to compile dynamic lights, shadows, and link programs!
        this.renderer.render(this.scene, this.camera);
        
        console.log("DEBUG: WebGL shaders pre-warmed and rendered successfully!");
      } catch (err) {
        console.error("DEBUG: WebGL shader pre-warming failed:", err);
      }
    }

    // Restore visibility back to hidden
    tempVisibleElements.forEach(el => {
      el.visible = false;
    });
  }

  startIntroCutscene() {
    this.gameState = 'CALENDAR_TEAR';
    this.cutsceneTimer = 0;
    this.currentMonthIdx = 0;

    const calendarOverlay = document.getElementById('calendar-cutscene-overlay');
    if (calendarOverlay) {
      calendarOverlay.classList.remove('hidden');
      calendarOverlay.style.display = 'flex';
      calendarOverlay.style.zIndex = '9999';
    }

    const months = [
      { th: 'มกราคม 2569', en: 'JANUARY 2569' },
      { th: 'กุมภาพันธ์ 2569', en: 'FEBRUARY 2569' },
      { th: 'มีนาคม 2569', en: 'MARCH 2569' },
      { th: 'เมษายน 2569', en: 'APRIL 2569' },
      { th: 'พฤษภาคม 2569', en: 'MAY 2569' },
      { th: 'มิถุนายน 2569', en: 'JUNE 2569' },
      { th: 'กรกฎาคม 2569', en: 'JULY 2569' }
    ];

    const monthTitleEl = document.getElementById('calendar-month-title');
    const tearHeaderEl = document.getElementById('calendar-header-strip');
    const baseHeaderEl = document.getElementById('calendar-base-header');
    
    const baseCard = document.getElementById('calendar-base-card');
    const tearSheet = document.getElementById('calendar-card');
    
    const date20 = document.getElementById('date-20-highlight');
    const burstFlare = document.getElementById('burst-flare');

    const updateCalendarText = (idx, targetTear, targetBase) => {
      const curMonth = months[idx];
      const nextMonth = months[idx + 1] || { en: 'JULY 20th 2569' };

      if (monthTitleEl) monthTitleEl.innerText = curMonth.th;
      if (targetTear) targetTear.innerText = curMonth.en;
      if (targetBase) targetBase.innerText = nextMonth.en;
    };

    updateCalendarText(0, tearHeaderEl, baseHeaderEl);

    const tearInterval = setInterval(() => {
      if (this.currentMonthIdx < months.length - 1) {
        if (window.soundEngine) window.soundEngine.playCalendarTear();

        if (tearSheet) {
          tearSheet.classList.remove('ripping');
          void tearSheet.offsetWidth;
          tearSheet.classList.add('ripping');
        }

        this.currentMonthIdx++;

        setTimeout(() => {
          if (tearSheet) {
            tearSheet.classList.remove('ripping');
          }
          updateCalendarText(this.currentMonthIdx, tearHeaderEl, baseHeaderEl);
        }, 380);

      } else {
        clearInterval(tearInterval);

        if (monthTitleEl) monthTitleEl.innerText = '✨ 20 กรกฎาคม 2569 (วันเกิด NaDream!) ✨';
        if (tearHeaderEl) tearHeaderEl.innerText = 'JULY 20th 2569';
        
        if (baseCard) baseCard.style.display = 'none';

        setTimeout(() => {
          if (tearSheet) {
            tearSheet.classList.remove('ripping');
            tearSheet.classList.add('shatter-burst');
          }
          if (burstFlare) burstFlare.classList.remove('hidden');
          if (window.soundEngine) window.soundEngine.playLandingImpact();
          
          this.gameState = 'BURST_LAND';

          setTimeout(() => {
            if (calendarOverlay) {
              calendarOverlay.classList.add('hidden');
              calendarOverlay.style.display = 'none';
            }
            if (burstFlare) burstFlare.classList.add('hidden');
            this.gameState = 'PLAYING';
          }, 750);

        }, 1200);
      }
    }, 700);
  }

  // 6-Second 180° Wall-Safe Preview Cutscene
  startPhotoPreviewCutscene(artData, callback) {
    this.gameState = 'PHOTO_PREVIEW';
    this.previewArtPos.set(artData.xPos, artData.yPos, artData.zPos);
    this.previewTimer = 0;
    this.previewCallback = callback;

    if (window.soundEngine) window.soundEngine.playClick();
  }

  startGiftBoxSpawnCutscene(boxPos) {
    this.gameState = 'GIFT_BOX_SPAWN';
    this.previewArtPos.copy(boxPos);
    this.previewTimer = 0;

    setTimeout(() => {
      if (this.gameState === 'GIFT_BOX_SPAWN') {
        this.gameState = 'PLAYING';
      }
    }, 3500); // Slower spawn cutscene (3.5 seconds)
  }

  startGiftBoxOpeningCutscene(roomNum, callback) {
    this.gameState = 'GIFT_BOX_OPENING';
    this.giftBoxRoomIdx = roomNum - 1;
    this.giftBoxTimer = 0;
    this.giftBoxCallback = callback;

    if (window.soundEngine) window.soundEngine.playDoorUnlock();
  }

  // Secret Door Opening Camera Cutscene (Pans to Door as panels slide open with glowing light!)
  startDoorOpeningCutscene(doorIndex, callback) {
    this.gameState = 'DOOR_OPENING';
    const door = this.courtWorld ? this.courtWorld.doors[doorIndex - 1] : null;
    const doorZ = door ? door.userData.zPos : -doorIndex * 28;

    this.previewArtPos.set(0, 0, doorZ);
    this.previewTimer = 0;
    this.previewCallback = callback;

    if (this.courtWorld) {
      this.courtWorld.unlockBarrier(doorIndex);
    }
    if (window.soundEngine) {
      window.soundEngine.playDoorUnlock();
    }
  }

  // Grand Birthday Finale Cutscene (Room 5 Complete)
  startGrandBirthdayFinale() {
    this.gameState = 'FINALE';
    this.finaleTimer = 0;

    // Room 5 layout: roomDepth=28, r=4 -> roomCenterZ = -4*28 - 14 = -126
    // Room 5 spans from z=-112 to z=-140
    // NaDream stands near front of room, Bank starts at back of room and walks forward

    // Teleport NaDream (player character) to front-center of Room 5, facing inward
    if (this.character) {
      this.character.position.set(0, 0, -118.0);
      if (this.character.group) {
        this.character.group.position.copy(this.character.position);
        this.character.group.rotation.y = -Math.PI; // Face toward Bank (facing -z direction)
        this.character.group.rotation.x = 0;
      }
    }

    // Bank starts at back of Room 5 (z=-138) holding cake, walks forward to z=-122
    if (this.bankNPC) {
      this.bankNPC.position.set(0, 0, -138.0);
      this.bankNPC.group.position.copy(this.bankNPC.position);
      this.bankNPC.group.rotation.y = Math.PI; // Face toward NaDream (facing +z)
      this.bankNPC.attachBirthdayCake();
    }

    // Reset cutscene triggers
    this.candlesLitPlayed = false;
    this.candleBlowPlayed = false;

    // Dim Room Lighting Subtly for atmosphere
    if (this.scene) {
      this.scene.background = new THREE.Color(0x05070c);
      this.scene.fog = new THREE.FogExp2(0x05070c, 0.015);
    }

    // Play Birthday Music
    if (window.soundEngine) {
      window.soundEngine.startBGM();
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    let delta = this.clock.getDelta();
    if (delta > 0.05) delta = 0.05; // Cap delta to prevent frame skips during stutters
    const elapsedTime = this.clock.getElapsedTime();

    if (this.gameState === 'SHOWCASE') {
      if (this.controls && this.character) {
        this.controls.updateShowcaseCamera(this.character.position, elapsedTime * 1000);
        if (this.character.group) this.character.group.rotation.y += 0.008;
      }

    } else if (this.gameState === 'FLOATING' || this.gameState === 'CALENDAR_TEAR') {
      if (this.character) {
        this.character.setFloatingPose(elapsedTime);
        if (this.character.group) this.character.group.rotation.y = 0;
      }
      if (this.controls && this.character) {
        this.controls.updateShowcaseCamera(this.character.position, elapsedTime * 1000);
      }

    } else if (this.gameState === 'BURST_LAND') {
      if (this.character) {
        if (this.character.group) this.character.group.rotation.y = 0;
        this.cutsceneTimer += delta * 2.8;
        this.character.setLandingPose(Math.min(1.0, this.cutsceneTimer));
      }

    } else if (this.gameState === 'PHOTO_PREVIEW') {
      this.previewTimer += delta;
      const progress = Math.min(1.0, this.previewTimer / 6.0);

      if (this.controls) {
        this.controls.updatePhotoPreviewCamera(this.previewArtPos, progress);
      }

      if (this.previewTimer >= 6.0) {
        this.gameState = 'PLAYING';
        if (this.previewCallback) {
          const cb = this.previewCallback;
          this.previewCallback = null;
          cb();
        }
      }

    } else if (this.gameState === 'GIFT_BOX_SPAWN') {
      this.previewTimer += delta;
      const progress = Math.min(1.0, this.previewTimer / 3.5); // Slower orbit (3.5s)
      if (this.controls) {
        this.controls.updateGiftBoxCutsceneCamera(this.previewArtPos, progress);
      }

    } else if (this.gameState === 'GIFT_BOX_OPENING') {
      this.giftBoxTimer += delta;
      const progress = Math.min(1.0, this.giftBoxTimer / 2.5); // Slower opening (2.5s)

      if (this.courtWorld) {
        this.courtWorld.animateGiftBoxOpening(this.giftBoxRoomIdx, progress);
      }
      if (this.controls && this.courtWorld.questMarkers[this.giftBoxRoomIdx]) {
        const boxPos = this.courtWorld.questMarkers[this.giftBoxRoomIdx].position;
        this.controls.updateGiftBoxCutsceneCamera(boxPos, progress);
      }

      if (this.giftBoxTimer >= 2.5) { // Slower opening limit (2.5s)
        this.gameState = 'PLAYING';
        if (this.giftBoxCallback) {
          const cb = this.giftBoxCallback;
          this.giftBoxCallback = null;
          cb();
        }
      }

    } else if (this.gameState === 'DOOR_OPENING') {
      this.previewTimer += delta;
      const progress = Math.min(1.0, this.previewTimer / 2.0); // 2.0s Secret Door Opening Cutscene!

      if (this.controls) {
        this.controls.updateDoorOpeningCamera(this.previewArtPos, progress);
      }

      if (this.previewTimer >= 2.0) {
        this.gameState = 'PLAYING';
        if (this.previewCallback) {
          const cb = this.previewCallback;
          this.previewCallback = null;
          cb();
        }
      }

    } else if (this.gameState === 'FINALE') {
      this.finaleTimer += delta;

      // ================================================================
      // Phase 0: Candle lighting close-up (0.0s to 3.0s)
      // ================================================================
      if (this.finaleTimer < 3.0) {
        const progress = this.finaleTimer / 3.0;

        // Animate candle flames scaling up and candlelight PointLight fading up
        if (this.bankNPC && this.bankNPC.cakeGroup) {
          const { flameMeshes, candleLight } = this.bankNPC.cakeGroup.userData;
          if (flameMeshes && candleLight) {
            if (this.finaleTimer < 1.0) {
              flameMeshes.forEach(mesh => mesh.scale.set(0, 0, 0));
              candleLight.intensity = 0;
            } else if (this.finaleTimer >= 1.0 && this.finaleTimer < 2.0) {
              const scaleProg = (this.finaleTimer - 1.0) / 1.0;
              flameMeshes.forEach(mesh => mesh.scale.set(scaleProg, scaleProg, scaleProg));
              candleLight.intensity = scaleProg * 4.0;

              if (!this.candlesLitPlayed) {
                if (window.soundEngine) {
                  window.soundEngine.playNote(800, 'triangle', 0.15, 0.2);
                  window.soundEngine.playNote(1000, 'sine', 0.15, 0.2, 0.08);
                }
                this.candlesLitPlayed = true;
              }
            } else {
              flameMeshes.forEach(mesh => mesh.scale.set(1.0, 1.0, 1.0));
              candleLight.intensity = 4.0;
            }
          }
        }

        // Camera: Close-up on Bank's cake at z=-138, slight zoom-out
        // Bank is at z=-138, cake is held at ~chest height y≈1.3
        const camX = 0.1 * (1 - progress);
        const camY = 1.2 + progress * 0.3;   // 1.2 -> 1.5
        const camZ = -135.5 + progress * 1.5; // -135.5 -> -134.0 (pulls back slightly)
        this.camera.position.set(camX, camY, camZ);
        this.camera.lookAt(0, 1.15, -137.5); // Look at the cake Bank is holding
      }

      // ================================================================
      // Phase 1: Bank walks to NaDream (3.0s to 11.0s) [8 seconds]
      // Bank moves from z=-138 to z=-122 (stops 4 units from NaDream at z=-118)
      // ================================================================
      else if (this.finaleTimer >= 3.0 && this.finaleTimer < 11.0) {
        const progress = (this.finaleTimer - 3.0) / 8.0;

        // Bank walks from z=-138 toward NaDream at z=-118, stops at z=-122
        const bankZ = -138.0 + progress * 16.0; // -138 -> -122
        if (this.bankNPC) {
          this.bankNPC.position.set(0, 0, bankZ);
          this.bankNPC.group.position.copy(this.bankNPC.position);
          this.bankNPC.group.rotation.y = Math.PI; // Still facing +z toward NaDream

          // Leg swing walking animation
          this.bankNPC.walkCycle = (this.bankNPC.walkCycle || 0) + delta * 7.5;
          const swing = Math.sin(this.bankNPC.walkCycle) * 0.4;
          if (this.bankNPC.leftLeg) this.bankNPC.leftLeg.rotation.x = swing;
          if (this.bankNPC.rightLeg) this.bankNPC.rightLeg.rotation.x = -swing;
        }

        // Side-view tracking camera: stays beside them, pans along
        // Midpoint between Bank (bankZ) and NaDream (-118)
        const midZ = (bankZ + (-118.0)) / 2.0;
        const camX = 4.5;
        const camY = 1.8;
        const camZ = midZ + 2.0; // Slightly ahead of midpoint
        this.camera.position.set(camX, camY, camZ);
        this.camera.lookAt(0, 1.3, midZ);
      }

      // ================================================================
      // Phase 2: NaDream blows candles (11.0s to 15.0s) [4 seconds]
      // Bank is now stopped at z=-122, NaDream at z=-118
      // ================================================================
      else if (this.finaleTimer >= 11.0 && this.finaleTimer < 15.0) {
        // Bank stands still at final position
        if (this.bankNPC) {
          this.bankNPC.position.set(0, 0, -122.0);
          this.bankNPC.group.position.copy(this.bankNPC.position);
          if (this.bankNPC.leftLeg) this.bankNPC.leftLeg.rotation.x = 0;
          if (this.bankNPC.rightLeg) this.bankNPC.rightLeg.rotation.x = 0;
        }

        // Camera: Over Bank's shoulder, looking at NaDream
        // Bank at z=-122, NaDream at z=-118 -> camera just behind Bank
        this.camera.position.set(0.4, 1.55, -120.5);
        this.camera.lookAt(0, 1.4, -118.0); // Look at NaDream's face

        // 11.5s -> 12.2s: NaDream leans forward to blow
        if (this.finaleTimer >= 11.5 && this.finaleTimer < 12.2) {
          const leanProg = (this.finaleTimer - 11.5) / 0.7;
          if (this.character && this.character.group) {
            this.character.group.rotation.x = leanProg * 0.25;
          }
        }
        // 12.2s -> 13.0s: Blow out candles!
        else if (this.finaleTimer >= 12.2 && this.finaleTimer < 13.0) {
          if (this.character && this.character.group) {
            this.character.group.rotation.x = 0.25;
          }

          // Extinguish flames!
          if (this.bankNPC && this.bankNPC.cakeGroup) {
            const { flameMeshes, candleLight } = this.bankNPC.cakeGroup.userData;
            if (flameMeshes && candleLight) {
              const extinguishProg = Math.max(0, (13.0 - this.finaleTimer) / 0.8);
              flameMeshes.forEach(mesh => mesh.scale.set(extinguishProg, extinguishProg, extinguishProg));
              candleLight.intensity = extinguishProg * 4.0;
            }
          }

          if (!this.candleBlowPlayed) {
            if (window.soundEngine) {
              window.soundEngine.playNote(150, 'sine', 0.45, 0.4);
            }
            this.candleBlowPlayed = true;
          }
        }
        // 13.0s -> 15.0s: Stand back up, candles completely out
        else {
          if (this.character && this.character.group) {
            const standProg = Math.max(0, (14.0 - this.finaleTimer) / 1.0);
            this.character.group.rotation.x = standProg * 0.25;
          }
          if (this.bankNPC && this.bankNPC.cakeGroup) {
            const { flameMeshes, candleLight } = this.bankNPC.cakeGroup.userData;
            if (flameMeshes && candleLight) {
              flameMeshes.forEach(mesh => mesh.scale.set(0, 0, 0));
              candleLight.intensity = 0;
            }
          }
        }
      }

      // ================================================================
      // Phase 3: Wish text pops up (15.0s to 25.0s) [10 seconds]
      // Orbit camera slowly around both characters
      // ================================================================
      else if (this.finaleTimer >= 15.0 && this.finaleTimer < 25.0) {
        const progress = (this.finaleTimer - 15.0) / 10.0;
        // Midpoint between NaDream(z=-118) and Bank(z=-122) = z=-120
        const focusZ = -120.0;
        const orbitAngle = progress * Math.PI * 0.25; // 45-degree orbit
        const orbitR = 3.0;
        const camX = Math.sin(orbitAngle) * orbitR;
        const camY = 1.6;
        const camZ = focusZ - Math.cos(orbitAngle) * orbitR;
        this.camera.position.set(camX, camY, camZ);
        this.camera.lookAt(0, 1.4, focusZ);

        // Show the blessing text overlay
        const wishOverlay = document.getElementById('wish-overlay');
        if (wishOverlay) {
          wishOverlay.classList.remove('hidden');
          wishOverlay.style.display = 'flex';
          wishOverlay.style.opacity = '1';
        }
      }

      // ================================================================
      // Phase 4: Fade to Black & Silence (25.0s to 29.0s) [4 seconds]
      // ================================================================
      else if (this.finaleTimer >= 25.0 && this.finaleTimer < 29.0) {
        const progress = (this.finaleTimer - 25.0) / 4.0;

        // Hide wish overlay gradually
        const wishOverlay = document.getElementById('wish-overlay');
        if (wishOverlay) wishOverlay.style.opacity = (1 - progress).toString();

        // Fade in black overlay
        const blackOverlay = document.getElementById('black-overlay');
        if (blackOverlay) {
          blackOverlay.classList.remove('hidden');
          blackOverlay.style.display = 'block';
          blackOverlay.style.opacity = progress.toString();
        }

        // Fade out music volume
        if (window.soundEngine && window.soundEngine.bgm) {
          window.soundEngine.bgm.volume = Math.max(0, 0.3 * (1 - progress));
        }
      }

      // ================================================================
      // Phase 5: "จบ" Screen (29.0s onwards)
      // ================================================================
      else if (this.finaleTimer >= 29.0) {
        const wishOverlay = document.getElementById('wish-overlay');
        if (wishOverlay) wishOverlay.style.display = 'none';

        const blackOverlay = document.getElementById('black-overlay');
        if (blackOverlay) {
          blackOverlay.style.opacity = '1';
        }

        if (window.soundEngine && window.soundEngine.bgm) {
          window.soundEngine.bgm.pause();
        }

        // Show "จบ" text
        const endingText = document.getElementById('ending-text');
        if (endingText) {
          endingText.classList.remove('hidden');
          endingText.style.display = 'block';
          endingText.style.opacity = '1';
        }
      }

    } else if (this.gameState === 'PLAYING') {
      if (this.courtWorld && this.character && this.controls && this.questManager) {
        const activeBarrierZ = this.courtWorld.getActiveBarrierZ();
        this.character.update(
          delta, 
          this.controls.keysPressed, 
          this.controls.joystickVector, 
          this.controls.cameraAngleY, 
          activeBarrierZ
        );
        
        this.controls.updateCamera(this.character.position, this.character.rotation, activeBarrierZ);
        this.questManager.checkProximity(this.character.position);
        this.courtWorld.updatePathArrow(this.character.position, this.questManager.activeTargetPos);
      }
    }

    if (this.bankNPC) this.bankNPC.update(elapsedTime * 1000);
    if (this.courtWorld) this.courtWorld.update(elapsedTime * 1000);

    // Update debug overlay values
    const roomVal = document.getElementById('debug-room-val');
    const substateVal = document.getElementById('debug-substate-val');
    const gamestateVal = document.getElementById('debug-gamestate-val');
    
    if (roomVal && this.questManager) roomVal.innerText = this.questManager.currentRoom;
    if (substateVal && this.questManager) substateVal.innerText = this.questManager.roomSubState;
    if (gamestateVal) gamestateVal.innerText = this.gameState;

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// Global helper for Interactive 1-5 Star Photo Review Rating Modal Popup
window.showStarRatingModal = function(imagePath, cleanTitleText, onConfirmCallback) {
  const modal = document.getElementById('star-rating-modal');
  const img = document.getElementById('star-photo-img');
  const title = document.getElementById('star-title-text');
  const confirmBtn = document.getElementById('star-confirm-btn');
  const closeBtn = document.getElementById('star-modal-close');
  const starsContainer = document.getElementById('stars-row');
  const scoreText = document.getElementById('rating-score-text');

  if (modal && img && title) {
    img.src = encodeURI(imagePath);
    title.innerText = cleanTitleText;
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    modal.style.zIndex = '99999';

    let currentRating = 5;

    const scoreLabels = [
      "⭐ 1 ดาว พอใช้ได้",
      "⭐⭐ 2 ดาว ดีงามมาก",
      "⭐⭐⭐ 3 ดาว เท่สุดยอด",
      "⭐⭐⭐⭐ 4 ดาว เท่เหลือล้น",
      "⭐⭐⭐⭐⭐ 5 ดาว เท่ระดับเทพ!"
    ];

    const updateStarDisplay = (score) => {
      currentRating = score;
      if (scoreText) scoreText.innerText = scoreLabels[score - 1];

      if (starsContainer) {
        const starIcons = starsContainer.querySelectorAll('.star-icon');
        starIcons.forEach((star, idx) => {
          if (idx < score) {
            star.style.opacity = '1.0';
            star.style.filter = 'drop-shadow(0 0 10px #ffd700)';
            star.style.color = '#ffd700';
          } else {
            star.style.opacity = '0.3';
            star.style.filter = 'none';
            star.style.color = '#a0aab2';
          }
        });
      }
    };

    updateStarDisplay(5);

    if (starsContainer) {
      const starIcons = starsContainer.querySelectorAll('.star-icon');
      starIcons.forEach(star => {
        star.onclick = (e) => {
          e.stopPropagation();
          const starVal = parseInt(star.getAttribute('data-star') || '5', 10);
          updateStarDisplay(starVal);
          if (window.soundEngine) window.soundEngine.playClick();
        };
      });
    }

    const handleConfirm = () => {
      modal.classList.add('hidden');
      modal.style.display = 'none';
      if (window.soundEngine) window.soundEngine.playQuestComplete();
      if (onConfirmCallback) onConfirmCallback(currentRating);
    };

    if (confirmBtn) confirmBtn.onclick = handleConfirm;
    if (closeBtn) closeBtn.onclick = handleConfirm;
  } else {
    if (onConfirmCallback) onConfirmCallback(5);
  }
};

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
