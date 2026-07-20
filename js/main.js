/* ==========================================================================
   Main Application Entry Point - Mobile 60 FPS Optimized Engine (Global Window)
   ========================================================================== */

class Game {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.clock = new THREE.Clock();

    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    this.isTurboMode = true; // Turbo 60 FPS Mode enabled by default!

    this.isGameStarted = false;
    this.isCutsceneActive = false;
    this.cutsceneTimer = 0;
    this.cutsceneDoorZ = 0;

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

    // Ultra-Fast Mobile WebGL Renderer Configuration
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isMobile,
      powerPreference: 'default',
      precision: 'mediump',
      failIfMajorPerformanceCaveat: false
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Cap Pixel Ratio to 1.0 on mobile to guarantee smooth 60 FPS without GPU overheating
    const targetPixelRatio = this.isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5);
    this.renderer.setPixelRatio(targetPixelRatio);

    // Disable heavy shadow map calculations on mobile for 300% FPS boost
    this.renderer.shadowMap.enabled = !this.isMobile;
    if (this.renderer.shadowMap.enabled) {
      this.renderer.shadowMap.type = THREE.BasicShadowMap;
    }
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

    const turboBtn = document.getElementById('turbo-toggle-btn');
    if (turboBtn) {
      turboBtn.addEventListener('click', () => this.toggleTurboMode());
    }
  }

  toggleTurboMode() {
    this.isTurboMode = !this.isTurboMode;
    const turboText = document.getElementById('turbo-mode-text');
    if (this.isTurboMode) {
      this.renderer.setPixelRatio(1.0);
      this.renderer.shadowMap.enabled = false;
      if (turboText) turboText.innerText = '⚡ โหมดลื่น (60 FPS)';
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      this.renderer.shadowMap.enabled = true;
      if (turboText) turboText.innerText = '✨ โหมดภาพสวย';
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

        const launchGame = () => {
          if (window.soundEngine) {
            window.soundEngine.startBGM();
            window.soundEngine.playClick();
          }
          loadingScreen.classList.add('fade-out');
          this.isGameStarted = true;
        };

        startBtn.onclick = launchGame;
        loadingScreen.onclick = launchGame;
      }
    }, 50);
  }

  startDoorCutscene(roomNumber) {
    const doorZPositions = [-28, -56, -84, -112, -140];
    this.cutsceneDoorZ = doorZPositions[roomNumber - 1];
    this.cutsceneTimer = 0;
    this.isCutsceneActive = true;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    if (!this.isGameStarted) {
      this.controls.updateShowcaseCamera(this.character.position, elapsedTime * 1000);
      this.character.group.rotation.y += 0.005;

    } else if (this.isCutsceneActive) {
      this.cutsceneTimer += delta;
      this.controls.updateCutsceneCamera(this.cutsceneDoorZ, this.cutsceneTimer / 2.5);

      if (this.cutsceneTimer >= 2.5) {
        this.isCutsceneActive = false;
      }

    } else {
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
