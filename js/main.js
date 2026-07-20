/* ==========================================================================
   Main Entry Point - Calendar Month Sync & 3D Shatter Burst Cutscene
   ========================================================================== */

class Game {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.clock = new THREE.Clock();

    // Game State Machine
    this.gameState = 'SHOWCASE'; // SHOWCASE -> FLOATING -> CALENDAR_TEAR -> BURST_LAND -> PLAYING
    this.cutsceneTimer = 0;
    this.currentMonthIdx = 0;

    this.isCutsceneActive = false;
    this.secretDoorZ = 0;
    this.secretDoorTimer = 0;

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
    this.courtWorld = new window.CourtWorld(this.scene);
    this.character = new window.CharacterController(this.scene);
    this.bankNPC = new window.BankNPC(this.scene, new THREE.Vector3(0, 0, -152));
    this.questManager = new window.QuestManager(this.courtWorld, this.bankNPC);
    this.controls = new window.Controls(this.camera, this.canvas, this.character);
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

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (progressBar) progressBar.style.width = `${progress}%`;

      if (progress >= 100) {
        clearInterval(interval);
        if (startBtn) startBtn.classList.remove('hidden');

        startBtn.onclick = () => {
          if (window.soundEngine) {
            window.soundEngine.startBGM();
            window.soundEngine.playClick();
          }
          loadingScreen.classList.add('fade-out');
          
          if (this.courtWorld) {
            this.courtWorld.hidePhotoGalleryWall();
          }

          this.startIntroCutscene();
        };
      }
    }, 50);
  }

  // Synchronized Calendar Month Tearing & 3D NaDream Burst Dive Sequence
  startIntroCutscene() {
    this.gameState = 'FLOATING';
    this.cutsceneTimer = 0;
    this.currentMonthIdx = 0;

    const calendarOverlay = document.getElementById('calendar-cutscene-overlay');
    if (calendarOverlay) calendarOverlay.classList.remove('hidden');

    // Synchronized Thai & English Months (Jan 2569 -> July 2569)
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

    setTimeout(() => {
      this.gameState = 'CALENDAR_TEAR';
      
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
            // Step 3: Calendar Page 3D Shatter Burst + Gold Flare Explosion
            if (calendarCard) calendarCard.classList.add('shatter-burst');
            if (burstFlare) burstFlare.classList.remove('hidden');
            if (window.soundEngine) window.soundEngine.playLandingImpact();
            
            // Step 4: NaDream 3D Avatar Dives & Shatters Through Calendar Page
            this.gameState = 'BURST_LAND';

            setTimeout(() => {
              // Step 5: Superhero Impact Landing on Room 1 Court Floor
              if (calendarOverlay) calendarOverlay.classList.add('hidden');
              if (burstFlare) burstFlare.classList.add('hidden');
              this.gameState = 'PLAYING';
            }, 750);

          }, 1100);
        }
      }, 360);

    }, 1000);
  }

  startDoorCutscene(roomNumber) {
    const doorZPositions = [-28, -56, -84, -112, -140];
    this.secretDoorZ = doorZPositions[roomNumber - 1];
    this.secretDoorTimer = 0;
    this.isCutsceneActive = true;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    if (this.gameState === 'SHOWCASE') {
      this.controls.updateShowcaseCamera(this.character.position, elapsedTime * 1000);
      this.character.group.rotation.y += 0.008;

    } else if (this.gameState === 'FLOATING' || this.gameState === 'CALENDAR_TEAR') {
      this.character.setFloatingPose(elapsedTime);
      this.character.group.rotation.y += 0.008;
      this.controls.updateShowcaseCamera(this.character.position, elapsedTime * 1000);

    } else if (this.gameState === 'BURST_LAND') {
      // Physical 3D Dive & Superhero Landing through shattered calendar page
      this.cutsceneTimer += delta * 2.8;
      this.character.setLandingPose(Math.min(1.0, this.cutsceneTimer));

    } else if (this.isCutsceneActive) {
      this.secretDoorTimer += delta;
      this.controls.updateCutsceneCamera(this.secretDoorZ, this.secretDoorTimer / 2.5);

      if (this.secretDoorTimer >= 2.5) {
        this.isCutsceneActive = false;
      }

    } else if (this.gameState === 'PLAYING') {
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
    }

    this.bankNPC.update(elapsedTime * 1000);
    this.courtWorld.update(elapsedTime * 1000);

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
