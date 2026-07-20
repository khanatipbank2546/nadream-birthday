/* ==========================================================================
   Input & Controls Manager - Front NaDream Showcase Camera & Controls
   ========================================================================== */

class Controls {
  constructor(camera, domElement, character) {
    this.camera = camera;
    this.domElement = domElement;
    this.character = character;

    this.keysPressed = {};
    this.joystickVector = { x: 0, y: 0 };

    this.cameraMode = '3rd';
    this.cameraDistance = 9.0;
    this.cameraHeight = 4.5;
    this.cameraAngleY = 0;
    this.cameraAngleX = 0.25;

    this.showcaseAngle = 0;

    this.isDraggingMouse = false;
    this.previousMousePosition = { x: 0, y: 0 };

    this.bindKeyboardEvents();
    this.bindMouseEvents();
    this.bindCameraToggle();
  }

  bindKeyboardEvents() {
    window.addEventListener('keydown', (e) => {
      this.keysPressed[e.code] = true;
      
      if (e.code === 'Space') {
        if (this.character) this.character.jump();
      }

      if (e.code === 'KeyV') {
        this.toggleCameraView();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysPressed[e.code] = false;
    });
  }

  bindMouseEvents() {
    this.domElement.addEventListener('mousedown', (e) => {
      this.isDraggingMouse = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDraggingMouse) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.cameraAngleY -= deltaX * 0.005;
      this.cameraAngleX = Math.max(0.1, Math.min(1.0, this.cameraAngleX + deltaY * 0.005));

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDraggingMouse = false;
    });
  }

  bindCameraToggle() {
    const toggleBtn = document.getElementById('camera-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleCameraView());
    }
  }

  toggleCameraView() {
    this.cameraMode = (this.cameraMode === '3rd') ? '1st' : '3rd';
    const textEl = document.getElementById('camera-mode-text');
    if (textEl) {
      textEl.innerText = (this.cameraMode === '3rd') ? 'มุมมอง 3rd Person' : 'มุมมอง 1st Person';
    }
  }

  // Front & Center Showcase Camera Orbit around Floating NaDream
  updateShowcaseCamera(targetPosition, time) {
    this.showcaseAngle = time * 0.0006;
    const dist = 5.2; // Front & Center focus!
    const height = 2.2;

    const eyeX = targetPosition.x + Math.sin(this.showcaseAngle) * dist;
    const eyeZ = targetPosition.z + Math.cos(this.showcaseAngle) * dist;

    this.camera.position.set(eyeX, targetPosition.y + height, eyeZ);
    this.camera.lookAt(targetPosition.x, targetPosition.y + 1.8, targetPosition.z);
  }

  updateCutsceneCamera(doorZPos, cutsceneProgress) {
    const camTarget = new THREE.Vector3(0, 3.5, doorZPos);
    const camEye = new THREE.Vector3(0, 4.5, doorZPos + 14.0 - cutsceneProgress * 3.0);

    this.camera.position.lerp(camEye, 0.1);
    this.camera.lookAt(camTarget);
  }

  updateCamera(targetPosition, characterRotation) {
    if (this.cameraMode === '3rd') {
      const offsetX = Math.sin(this.cameraAngleY) * this.cameraDistance * Math.cos(this.cameraAngleX);
      const offsetY = Math.sin(this.cameraAngleX) * this.cameraDistance + this.cameraHeight;
      const offsetZ = Math.cos(this.cameraAngleY) * this.cameraDistance * Math.cos(this.cameraAngleX);

      const desiredPos = new THREE.Vector3(
        targetPosition.x + offsetX,
        targetPosition.y + offsetY,
        targetPosition.z + offsetZ
      );

      this.camera.position.lerp(desiredPos, 0.1);
      this.camera.lookAt(targetPosition.x, targetPosition.y + 1.6, targetPosition.z);

    } else {
      const eyePos = new THREE.Vector3(
        targetPosition.x,
        targetPosition.y + 1.8,
        targetPosition.z
      );

      const lookTarget = new THREE.Vector3(
        targetPosition.x + Math.sin(characterRotation) * 10,
        targetPosition.y + 1.8,
        targetPosition.z + Math.cos(characterRotation) * 10
      );

      this.camera.position.copy(eyePos);
      this.camera.lookAt(lookTarget);
    }
  }
}

window.Controls = Controls;
