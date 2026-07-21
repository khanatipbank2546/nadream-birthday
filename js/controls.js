/* ==========================================================================
   3D Camera Controls - Smooth 3.0s Door Opening Cutscene Camera
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
    this.cameraAngleY = 0;
    this.cameraAngleX = 0.28;

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

      this.cameraAngleX = Math.max(0.05, Math.min(Math.PI / 2.5, this.cameraAngleX));
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

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
    const targetZ = characterPos ? characterPos.z : 5;
    this.camera.position.set(0, 1.8, targetZ + 4.5);
    this.camera.lookAt(0, 1.3, targetZ);
  }

  updatePhotoPreviewCamera(artPos, progress) {
    const arcAngle = (progress - 0.5) * Math.PI * 0.95;
    let zoomDist = 4.5;
    if (progress < 0.33) {
      const t = progress / 0.33;
      zoomDist = 4.8 - t * 2.4;
    } else if (progress < 0.75) {
      const t = (progress - 0.33) / 0.42;
      zoomDist = 2.4 + t * 0.4;
    } else {
      const t = (progress - 0.75) / 0.25;
      zoomDist = 2.8 + t * 1.7;
    }

    const wallNormalDir = artPos.x < 0 ? 1 : -1;

    const camX = artPos.x + Math.cos(arcAngle) * zoomDist * wallNormalDir;
    const camY = artPos.y + Math.sin(progress * Math.PI) * 0.4;
    const camZ = artPos.z + Math.sin(arcAngle) * zoomDist * 0.8;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(artPos.x, artPos.y, artPos.z);
  }

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

  // Smooth Dramatic Door Opening Camera Cutscene facing Secret Door N
  updateDoorOpeningCamera(doorPos, progress) {
    // Smooth camera glide from high view to facing the door
    const startX = 0;
    const startY = 4.5;
    const startZ = doorPos.z + 12.0;

    const targetX = 0;
    const targetY = 3.2;
    const targetZ = doorPos.z + 6.8;

    const ease = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    const camX = startX + (targetX - startX) * ease;
    const camY = startY + (targetY - startY) * ease;
    const camZ = startZ + (targetZ - startZ) * ease;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(doorPos.x, 3.2, doorPos.z);
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
