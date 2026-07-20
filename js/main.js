/* ==========================================================================
   Main Application Entry Point - 3D Badminton RPG & Cutscene Engine
   ========================================================================== */

class Game {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.clock = new THREE.Clock();

    this.isGameStarted = false; // Pre-game 360 showcase state
    this.isCutsceneActive = false; // Secret door cutscene state
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
    this.scene.background = new THREE.Color(0x1a202c); // Cozy Indoor Stadium Atmosphere

    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
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
          this.isGameStarted = true;
        };
      }
    }, 80);
  }

  // Trigger 2.5-second Secret Door & Light Beams Cutscene
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
      // Pre-Game 360° Showcase Mode
      this.controls.updateShowcaseCamera(this.character.position, elapsedTime * 1000);
      this.character.group.rotation.y += 0.005;

    } else if (this.isCutsceneActive) {
      // Secret Door Cutscene Mode
      this.cutsceneTimer += delta;
      this.controls.updateCutsceneCamera(this.cutsceneDoorZ, this.cutsceneTimer / 2.5);

      if (this.cutsceneTimer >= 2.5) {
        this.isCutsceneActive = false; // Return control to player!
      }

    } else {
      // Gameplay Mode: Camera-Relative Movement
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
