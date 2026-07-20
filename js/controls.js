/* ==========================================================================
   3D Camera Controls - 4-Second Photo Preview Orbit & Gift Box Cutscenes
   ========================================================================== */

class Controls {
  constructor(camera, domElement, character) {
    this.camera = camera;
    this.domElement = domElement;
    this.character = character;

    // Camera Modes: 'THIRD_PERSON', 'FIRST_PERSON', 'TOP_DOWN'
    this.cameraMode = 'THIRD_PERSON';

    // Orbit Angles & Distances
    this.cameraDistance = 7.5;
    this.cameraAngleY = 0; // Horizontal orbit angle
    this.cameraAngleX = 0.28; // Vertical elevation angle

    // Mouse Drag Control
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };

    // Keyboard Pressed State
    this.keysPressed = {};

    // Mobile Virtual Joystick Vector
    this.joystickVector = { x: 0, y: 0 };

    this.initEventListeners();
    this.initHUDControls();
  }

  initEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keysPressed[e.code] = true;
      if (e.code === 'KeyV') {
        this.toggleCameraMode();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysPressed[e.code] = false;
    });

    // Mouse Drag Camera Orbit
    this.domElement.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.cameraAngleY -= deltaX * 0.005;
      this.cameraAngleX += deltaY * 0.003;

      // Clamp vertical elevation angle
      this.cameraAngleX = Math.max(0.05, Math.min(Math.PI / 2.5, this.cameraAngleX));

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Mouse Wheel Zoom
    this.domElement.addEventListener('wheel', (e) => {
      this.cameraDistance += e.deltaY * 0.005;
      this.cameraDistance = Math.max(3.5, Math.min(18.0, this.cameraDistance));
    });
  }

  initHUDControls() {
    const cameraToggleBtn = document.getElementById('camera-toggle-btn');
    const cameraText = document.getElementById('camera-mode-text');

    if (cameraToggleBtn) {
      cameraToggleBtn.addEventListener('click', () => {
        this.toggleCameraMode();
        if (cameraText) {
          if (this.cameraMode === 'THIRD_PERSON') cameraText.innerText = 'มุมมอง 3rd Person';
          else if (this.cameraMode === 'FIRST_PERSON') cameraText.innerText = 'มุมมอง 1st Person';
          else cameraText.innerText = 'มุมมอง Top-Down';
        }
      });
    }
  }

  toggleCameraMode() {
    if (this.cameraMode === 'THIRD_PERSON') {
      this.cameraMode = 'FIRST_PERSON';
    } else if (this.cameraMode === 'FIRST_PERSON') {
      this.cameraMode = 'TOP_DOWN';
    } else {
      this.cameraMode = 'THIRD_PERSON';
    }
    if (window.soundEngine) window.soundEngine.playClick();
  }

  updateShowcaseCamera(characterPos, timeMs) {
    const orbitSpeed = 0.0004;
    const radius = 6.8;
    const angle = timeMs * orbitSpeed;

    const camX = characterPos.x + Math.sin(angle) * radius;
    const camY = characterPos.y + 2.2;
    const camZ = characterPos.z + Math.cos(angle) * radius;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(characterPos.x, characterPos.y + 1.4, characterPos.z);
  }

  // 4-Second 3D Camera Orbit Preview around Wall Art Frame
  updatePhotoPreviewCamera(artPos, progress) {
    const orbitAngle = progress * Math.PI * 1.5; // Orbit 270 degrees in 4s
    const distance = 4.2;

    const camX = artPos.x + Math.sin(orbitAngle) * distance;
    const camY = artPos.y + Math.sin(progress * Math.PI) * 0.4;
    const camZ = artPos.z + Math.cos(orbitAngle) * distance;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(artPos.x, artPos.y, artPos.z);
  }

  // Grand Gift Box Spawn & Opening Zoom Cutscene Camera
  updateGiftBoxCutsceneCamera(boxPos, progress) {
    const orbitAngle = progress * Math.PI * 2.0;
    const distance = 6.5 * (1 - progress * 0.3);

    const camX = boxPos.x + Math.sin(orbitAngle) * distance;
    const camY = boxPos.y + 1.8 + Math.sin(progress * Math.PI) * 0.6;
    const camZ = boxPos.z + Math.cos(orbitAngle) * distance;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(boxPos.x, boxPos.y + 0.5, boxPos.z);
  }

  updateCutsceneCamera(doorZ, progress) {
    const startCamZ = doorZ + 12;
    const targetCamZ = doorZ - 6;

    const camZ = startCamZ + (targetCamZ - startCamZ) * progress;
    this.camera.position.set(0, 3.8, camZ);
    this.camera.lookAt(0, 2.8, doorZ - 2);
  }

  updateCamera(characterPos, characterRotation) {
    if (this.cameraMode === 'THIRD_PERSON') {
      const offsetX = Math.sin(this.cameraAngleY) * Math.cos(this.cameraAngleX) * this.cameraDistance;
      const offsetY = Math.sin(this.cameraAngleX) * this.cameraDistance;
      const offsetZ = Math.cos(this.cameraAngleY) * Math.cos(this.cameraAngleX) * this.cameraDistance;

      this.camera.position.x = characterPos.x + offsetX;
      this.camera.position.y = characterPos.y + 1.6 + offsetY;
      this.camera.position.z = characterPos.z + offsetZ;

      const lookTargetY = characterPos.y + 1.4;
      this.camera.lookAt(characterPos.x, lookTargetY, characterPos.z);

    } else if (this.cameraMode === 'FIRST_PERSON') {
      const headY = characterPos.y + 1.82;
      const fwdX = Math.sin(characterRotation);
      const fwdZ = Math.cos(characterRotation);

      this.camera.position.set(characterPos.x, headY, characterPos.z);
      this.camera.lookAt(characterPos.x + fwdX * 10, headY, characterPos.z + fwdZ * 10);

    } else if (this.cameraMode === 'TOP_DOWN') {
      this.camera.position.set(characterPos.x, characterPos.y + 14.0, characterPos.z + 0.1);
      this.camera.lookAt(characterPos.x, characterPos.y, characterPos.z);
    }
  }
}

window.Controls = Controls;
