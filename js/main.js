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
        if (startBtn) startBtn.classList.remove('hidden');
      }
    }, 50);
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
    }, 1500);
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

    // 1. Dim Room Lighting Subtly
    if (this.scene) {
      this.scene.background = new THREE.Color(0x0a0d14);
      this.scene.fog = new THREE.FogExp2(0x0a0d14, 0.012);
    }

    // 2. Open Secret Door #5
    if (this.courtWorld) {
      this.courtWorld.unlockBarrier(5);
    }

    // 3. Play Birthday Music
    if (window.soundEngine) {
      window.soundEngine.startBGM();
    }

    // 4. Bank NPC Walks Out Carrying Birthday Cake with Candlelight to NaDream!
    if (this.bankNPC && this.character) {
      const targetPos = new THREE.Vector3(
        this.character.position.x,
        this.character.position.y,
        this.character.position.z - 2.5
      );

      this.bankNPC.walkToPlayer(targetPos, () => {
        // Arrived! Open HBD Modal Popup!
        if (window.showNPCModal) {
          window.showNPCModal();
        }
      });
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
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
      const progress = Math.min(1.0, this.previewTimer / 1.5);
      if (this.controls) {
        this.controls.updateGiftBoxCutsceneCamera(this.previewArtPos, progress);
      }

    } else if (this.gameState === 'GIFT_BOX_OPENING') {
      this.giftBoxTimer += delta;
      const progress = Math.min(1.0, this.giftBoxTimer / 1.8);

      if (this.courtWorld) {
        this.courtWorld.animateGiftBoxOpening(this.giftBoxRoomIdx, progress);
      }
      if (this.controls && this.courtWorld.questMarkers[this.giftBoxRoomIdx]) {
        const boxPos = this.courtWorld.questMarkers[this.giftBoxRoomIdx].position;
        this.controls.updateGiftBoxCutsceneCamera(boxPos, progress);
      }

      if (this.giftBoxTimer >= 1.8) {
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
      if (this.controls && this.bankNPC && this.character) {
        this.character.update(delta, {}, null, 0, 0);
        this.character.group.lookAt(this.bankNPC.position.x, this.character.group.position.y, this.bankNPC.position.z);
        this.controls.updateFinaleCamera(this.bankNPC.position, this.character.position);
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
        
        this.controls.updateCamera(this.character.position, this.character.rotation);
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
