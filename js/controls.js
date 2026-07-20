/* ==========================================================================
   Input & Controls Manager - Camera-Relative Direction & Cutscene Camera
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
    this.cameraAngleY = 0; // Yaw orbit angle
    this.cameraAngleX = 0.25; // Pitch angle

    this.showcaseAngle = 0;

    this.isDraggingMouse = false;
    this.previousMousePosition = { x: e.clientX, y: e.clientY };

    this.bindKeyboardEvents();
    this.bindMouseEvents();
    this.bindTouchControls();
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

  bindTouchControls() {
    const joystickBase = document.getElementById('joystick-base');
    const joystickStick = document.getElementById('joystick-stick');
    if (joystickBase && joystickStick) {
      let touchId = null;
      let baseRect = null;

      const handleTouchStart = (e) => {
        if (touchId !== null) return;
        const touch = e.changedTouches[0];
        touchId = touch.identifier;
        baseRect = joystickBase.getBoundingClientRect();
        updateJoystick(touch);
      };

      const handleTouchMove = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === touchId) {
            updateJoystick(e.changedTouches[i]);
            break;
          }
        }
      };

      const handleTouchEnd = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === touchId) {
            touchId = null;
            this.joystickVector = { x: 0, y: 0 };
            joystickStick.style.transform = 'translate(-50%, -50%)';
            break;
          }
        }
      };

      const updateJoystick = (touch) => {
        const centerX = baseRect.left + baseRect.width / 2;
        const centerY = baseRect.top + baseRect.height / 2;

        let deltaX = touch.clientX - centerX;
        let deltaY = touch.clientY - centerY;
        const maxRadius = baseRect.width / 2;

        const dist = Math.hypot(deltaX, deltaY);
        if (dist > maxRadius) {
          deltaX = (deltaX / dist) * maxRadius;
          deltaY = (deltaY / dist) * maxRadius;
        }

        joystickStick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;

        this.joystickVector = {
          x: deltaX / maxRadius,
          y: deltaY / maxRadius
        };
      };

      joystickBase.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    const mobileJumpBtn = document.getElementById('mobile-jump-btn');
    if (mobileJumpBtn) {
      mobileJumpBtn.addEventListener('click', () => {
        if (this.character) this.character.jump();
      });
    }
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

  updateShowcaseCamera(targetPosition, time) {
    this.showcaseAngle = time * 0.0008;
    const dist = 7.5;
    const height = 3.2;

    const eyeX = targetPosition.x + Math.sin(this.showcaseAngle) * dist;
    const eyeZ = targetPosition.z + Math.cos(this.showcaseAngle) * dist;

    this.camera.position.set(eyeX, targetPosition.y + height, eyeZ);
    this.camera.lookAt(targetPosition.x, targetPosition.y + 1.6, targetPosition.z);
  }

  // Cinematic Cutscene Camera focusing on Secret Door opening
  updateCutsceneCamera(doorZPos, cutsceneProgress) {
    const camTarget = new THREE.Vector3(0, 3.5, doorZPos);
    const camEye = new THREE.Vector3(0, 4.5, doorZPos + 14.0 - cutsceneProgress * 3.0);

    this.camera.position.lerp(camEye, 0.1);
    this.camera.lookAt(camTarget);
  }

  // Gameplay Camera Update
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
