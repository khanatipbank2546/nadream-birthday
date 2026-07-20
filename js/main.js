/* ==========================================================================
   Main Application Entry Point - Laptop PC 3D Showcase & Calendar Intro Cutscene
   ========================================================================== */

class Game {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.clock = new THREE.Clock();

    // Game State Machine
    this.gameState = 'SHOWCASE'; // SHOWCASE -> FLOATING -> CALENDAR_TEAR -> BURST_LAND -> PLAYING
    this.cutsceneTimer = 0;
    this.currentMonthIdx = 0;

    this.isCutsceneActive = false; // Secret door cutscene state
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

    // High-Graphics Laptop / PC WebGL Renderer
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
          this.startIntroCutscene();
        };
      }
    }, 50);
  }

  // 5-Phase Intro Cutscene Execution Sequence
  startIntroCutscene() {
    this.gameState = 'FLOATING';
    this.cutsceneTimer = 0;
    this.currentMonthIdx = 0;

    const calendarOverlay = document.getElementById('calendar-cutscene-overlay');
    if (calendarOverlay) calendarOverlay.classList.remove('hidden');

    const months = [
      'มกราคม 2569',
      'กุมภาพันธ์ 2569',
      'มีนาคม 2569',
      'เมษายน 2569',
      'พฤษภาคม 2569',
      'มิถุนายน 2569',
      'กรกฎาคม 2569'
    ];

    const monthTitleEl = document.getElementById('calendar-month-title');
    const calendarCard = document.getElementById('calendar-card');
    const date20 = document.getElementById('date-20-highlight');
    const burstFlare = document.getElementById('burst-flare');

    // Step 1: NaDream Levitates up (0s - 1.2s)
    setTimeout(() => {
      this.gameState = 'CALENDAR_TEAR';
      
      // Step 2: Rapid Calendar Month Tearing Sequence (1.2s - 3.8s)
      const tearInterval = setInterval(() => {
        if (this.currentMonthIdx < months.length) {
          if (monthTitleEl) monthTitleEl.innerText = months[this.currentMonthIdx];
          if (calendarCard) {
            calendarCard.classList.remove('flip-tear');
            void calendarCard.offsetWidth; // Trigger reflow
            calendarCard.classList.add('flip-tear');
          }
          if (window.soundEngine) window.soundEngine.playCalendarTear();
          this.currentMonthIdx++;
        } else {
          clearInterval(tearInterval);

          // Step 3: Zooming to Date 20 (July 20th 2569)
          if (monthTitleEl) monthTitleEl.innerText = '✨ 20 กรกฎาคม 2569 (วันเกิด NaDream!) ✨';
          if (date20) date20.scrollIntoView({ behavior: 'smooth', block: 'center' });

          setTimeout(() => {
            // Step 4: Burst Through Date 20 Flare Explosion
            if (burstFlare) burstFlare.classList.remove('hidden');
            if (window.soundEngine) window.soundEngine.playLandingImpact();
            this.gameState = 'BURST_LAND';

            setTimeout(() => {
              // Step 5: Superhero Landing onto Room 1 Floor & Start Playing!
              if (calendarOverlay) calendarOverlay.classList.add('hidden');
              if (burstFlare) burstFlare.classList.add('hidden');
              this.gameState = 'PLAYING';
            }, 800);

          }, 1200);
        }
      }, 380);

    }, 1200);
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
      // 360° Camera Orbit around NaDream in Room 1
      this.controls.updateShowcaseCamera(this.character.position, elapsedTime * 1000);
      this.character.group.rotation.y += 0.005;

    } else if (this.gameState === 'FLOATING' || this.gameState === 'CALENDAR_TEAR') {
      // Zero-Gravity Levitation Pose
      this.character.setFloatingPose(elapsedTime);
      this.controls.updateShowcaseCamera(this.character.position, elapsedTime * 1000);

    } else if (this.gameState === 'BURST_LAND') {
      // Superhero Burst Landing Animation
      this.cutsceneTimer += delta * 2.5;
      this.character.setLandingPose(Math.min(1.0, this.cutsceneTimer));

    } else if (this.isCutsceneActive) {
      // Secret Door Opening Cutscene
      this.secretDoorTimer += delta;
      this.controls.updateCutsceneCamera(this.secretDoorZ, this.secretDoorTimer / 2.5);

      if (this.secretDoorTimer >= 2.5) {
        this.isCutsceneActive = false;
      }

    } else if (this.gameState === 'PLAYING') {
      // 3rd Person Gameplay
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
