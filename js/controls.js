/* ==========================================================================
   3D Camera Controls - Fixed Showcase Framing & 6-Second 180-deg Zoom Orbit
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
      if (e.code === 'KeyP') {
        console.log("Cheat/Testing key 'P' pressed. Forcing completion of current room's gift box.");
        if (window.game && window.game.questManager && window.game.questManager.forceCompleteGiftBox) {
          window.game.questManager.forceCompleteGiftBox(window.game.questManager.currentRoom);
        }
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

  // Pre-Game Showcase Camera: PERFECTLY FRAMED facing NaDream and the Feature Wall! (No clipping!)
  updateShowcaseCamera(characterPos, timeMs) {
    this.camera.position.set(0, 2.8, -8.0);
    this.camera.lookAt(0, 3.0, -16.0);
  }

  // 6-Second 180° Wall-Safe Preview Camera with Dynamic Multi-Phase Zoom (No Wall Clipping!)
  updatePhotoPreviewCamera(artPos, progress) {
    // 180° Front Arc Pan facing the Wall (From -PI/2 to +PI/2)
    const arcAngle = (progress - 0.5) * Math.PI * 0.95;
    
    // Dynamic Multi-Phase Zoom Curve in 6 Seconds (Zoomed out further to capture name/title below):
    // 0.0s -> 2.0s: Smooth Zoom-in (Distance 7.5 -> 5.2)
    // 2.0s -> 4.5s: 180° Pan Across Details (Distance 5.2 -> 5.8)
    // 4.5s -> 6.0s: Smooth Zoom-out (Distance 5.8 -> 7.0)
    let zoomDist = 7.0;
    if (progress < 0.33) {
      const t = progress / 0.33;
      zoomDist = 7.5 - t * 2.3; // Keep close-up at 5.2 (instead of 4.0)
    } else if (progress < 0.75) {
      const t = (progress - 0.33) / 0.42;
      zoomDist = 5.2 + t * 0.6;
    } else {
      const t = (progress - 0.75) / 0.25;
      zoomDist = 5.8 + t * 1.2; // Zoom out to 7.0
    }

    // Determine wall facing direction from artPos.x
    const wallNormalDir = artPos.x < 0 ? 1 : -1;

    const camX = artPos.x + Math.cos(arcAngle) * zoomDist * wallNormalDir;
    const camY = artPos.y + Math.sin(progress * Math.PI) * 0.4;
    const camZ = artPos.z + Math.sin(arcAngle) * zoomDist * 0.8;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(artPos.x, artPos.y, artPos.z);
  }

  // Grand Gift Box Spawn & Opening Zoom Cutscene Camera
  updateGiftBoxCutsceneCamera(boxPos, progress) {
    // Start directly in front of the box (0 rad) and slowly orbit to the side (0.35 * PI)
    // This keeps the player character (standing at x = 16 or x = -16) completely off-screen from the start!
    const startAngle = 0;
    const endAngle = Math.PI * 0.35;
    const orbitAngle = startAngle + progress * (endAngle - startAngle);
    const distance = 7.0 * (1 - progress * 0.22); // Elegant zoom-in

    const camX = boxPos.x + Math.sin(orbitAngle) * distance;
    const camY = boxPos.y + 1.5 + Math.sin(progress * Math.PI) * 0.4;
    const camZ = boxPos.z + Math.cos(orbitAngle) * distance;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(boxPos.x, boxPos.y + 0.4, boxPos.z);
  }

  updateCutsceneCamera(doorZ, progress) {
    const startCamZ = doorZ + 12;
    const targetCamZ = doorZ - 6;

    const camZ = startCamZ + (targetCamZ - startCamZ) * progress;
    this.camera.position.set(0, 3.8, camZ);
    this.camera.lookAt(0, 2.8, doorZ - 2);
  }

  // Dedicated Secret Door Opening Camera Cutscene (Pans to facing Secret Door as it slides open)
  updateDoorOpeningCamera(doorPos, progress) {
    const camX = doorPos.x + Math.sin(progress * Math.PI * 0.2) * 1.5;
    const camY = 3.2;
    const camZ = doorPos.z + 8.5 - progress * 1.5;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(doorPos.x, 3.0, doorPos.z);
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
