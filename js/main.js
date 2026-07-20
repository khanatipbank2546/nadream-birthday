/* ==========================================================================
   Main Entry Point - 4-Second Photo Review, 5-Star Rating & Gift Box Cutscenes
   ========================================================================== */

class Game {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.clock = new THREE.Clock();

    // Game States: 'SHOWCASE', 'FLOATING', 'CALENDAR_TEAR', 'BURST_LAND', 'PLAYING', 'PHOTO_PREVIEW', 'GIFT_BOX_CUTSCENE'
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
    const headerStripEl = document.getElementById('calendar-header-strip');
    const calendarCard = document.getElementById('calendar-card');
    const date20 = document.getElementById('date-20-highlight');
    const burstFlare = document.getElementById('burst-flare');

    const tearInterval = setInterval(() => {
      if (this.currentMonthIdx < months.length) {
        const m = months[this.currentMonthIdx];
        if (monthTitleEl) monthTitleEl.innerText = m.th;
        if (headerStripEl) headerStripEl.innerText = m.en;

        if (calendarCard) {
          calendarCard.classList.remove('flip-tear');
          void calendarCard.offsetWidth;
          calendarCard.classList.add('flip-tear');
        }
        if (window.soundEngine) window.soundEngine.playCalendarTear();
        this.currentMonthIdx++;
      } else {
        clearInterval(tearInterval);

        if (monthTitleEl) monthTitleEl.innerText = '✨ 20 กรกฎาคม 2569 (วันเกิด NaDream!) ✨';
        if (headerStripEl) headerStripEl.innerText = 'JULY 20th 2569';
        if (date20) date20.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
          if (calendarCard) calendarCard.classList.add('shatter-burst');
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

        }, 1000);
      }
    }, 400);
  }

  // 4-Second 3D Camera Orbit Preview Cutscene
  startPhotoPreviewCutscene(artData, callback) {
    this.gameState = 'PHOTO_PREVIEW';
    this.previewArtPos.set(artData.xPos, artData.yPos, artData.zPos);
    this.previewTimer = 0;
    this.previewCallback = callback;

    if (window.soundEngine) window.soundEngine.playClick();
  }

  // Grand Gift Box Spawn Cutscene
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

  // Grand Gift Box Opening Lid Popping Cutscene
  startGiftBoxOpeningCutscene(roomNum, callback) {
    this.gameState = 'GIFT_BOX_OPENING';
    this.giftBoxRoomIdx = roomNum - 1;
    this.giftBoxTimer = 0;
    this.giftBoxCallback = callback;

    if (window.soundEngine) window.soundEngine.playDoorUnlock();
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
      const progress = Math.min(1.0, this.previewTimer / 4.0); // 4 Seconds Orbit!

      if (this.controls) {
        this.controls.updatePhotoPreviewCamera(this.previewArtPos, progress);
      }

      if (this.previewTimer >= 4.0) {
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

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// Global helper for 5-Star Photo Review Rating Modal Popup
window.showStarRatingModal = function(imagePath, cleanTitleText, onConfirmCallback) {
  const modal = document.getElementById('star-rating-modal');
  const img = document.getElementById('star-photo-img');
  const title = document.getElementById('star-title-text');
  const confirmBtn = document.getElementById('star-confirm-btn');
  const closeBtn = document.getElementById('star-modal-close');

  if (modal && img && title) {
    img.src = imagePath;
    title.innerText = cleanTitleText;
    modal.classList.remove('hidden');

    const handleConfirm = () => {
      modal.classList.add('hidden');
      if (window.soundEngine) window.soundEngine.playQuestComplete();
      if (onConfirmCallback) onConfirmCallback();
    };

    if (confirmBtn) confirmBtn.onclick = handleConfirm;
    if (closeBtn) closeBtn.onclick = handleConfirm;
  } else {
    if (onConfirmCallback) onConfirmCallback();
  }
};

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
