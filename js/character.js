/* ==========================================================================
   3D Character Controller - NaDream Chibi Avatar with Non-clipping Arms
   ========================================================================== */

class CharacterController {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    this.position = new THREE.Vector3(0, 0.05, 5);
    this.rotation = 0;
    this.moveSpeed = 7.5;
    this.rotationSpeed = 10;

    this.velocity = new THREE.Vector3();
    this.isGrounded = true;
    this.verticalVelocity = 0;
    this.gravity = -24;
    this.jumpForce = 9.5;

    this.bodyParts = {};
    this.initChibiMesh();
    this.scene.add(this.group);
  }

  initChibiMesh() {
    this.characterGroup = new THREE.Group();

    // Shadow Disc underneath avatar
    const shadowGeo = new THREE.CircleGeometry(0.8, 24);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.01;
    this.group.add(shadowMesh);

    // Main Body Container
    this.body = new THREE.Group();

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.55, 12);
    const legMat = new THREE.MeshToonMaterial({ color: 0x334155 });

    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.24, 0.28, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, legMat);
    leftLegMesh.position.y = -0.25;
    leftLegGroup.add(leftLegMesh);

    const shoeGeo = new THREE.BoxGeometry(0.2, 0.14, 0.32);
    const shoeMat = new THREE.MeshToonMaterial({ color: 0xffffff });
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(0, -0.5, 0.06);
    leftLegGroup.add(leftShoe);

    this.body.add(leftLegGroup);
    this.leftLeg = leftLegGroup;

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.24, 0.28, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, legMat);
    rightLegMesh.position.y = -0.25;
    rightLegGroup.add(rightLegMesh);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0, -0.5, 0.06);
    rightLegGroup.add(rightShoe);

    this.body.add(rightLegGroup);
    this.rightLeg = rightLegGroup;

    // Torso (Badminton Jersey Shirt)
    const bodyGeo = new THREE.BoxGeometry(0.72, 0.85, 0.45);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#0284c7');
    grad.addColorStop(1, '#00f5d4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 12;
    for (let y = 260; y < 512; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px Prompt, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('NaDream', 256, 120);

    const bodyTexture = new THREE.CanvasTexture(canvas);
    const bodyMat = new THREE.MeshToonMaterial({ map: bodyTexture });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.95;
    this.body.add(bodyMesh);

    // Left Arm (Outward Position & Angle so it never clips inside torso!)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.48, 0.95, 0.04);

    const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.62, 12);
    const armMat = new THREE.MeshToonMaterial({ color: 0x1e293b });
    const leftArmMesh = new THREE.Mesh(armGeo, armMat);
    leftArmMesh.position.y = -0.28;
    leftArmGroup.add(leftArmMesh);

    const handGeo = new THREE.SphereGeometry(0.11, 12, 12);
    const handMat = new THREE.MeshToonMaterial({ color: 0xffdbac });
    const leftHandMesh = new THREE.Mesh(handGeo, handMat);
    leftHandMesh.position.y = -0.6;
    leftArmGroup.add(leftHandMesh);

    this.body.add(leftArmGroup);
    this.leftArm = leftArmGroup;

    // Right Arm (Outward Position & Angle)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.48, 0.95, 0.04);

    const rightArmMesh = new THREE.Mesh(armGeo, armMat);
    rightArmMesh.position.y = -0.28;
    rightArmGroup.add(rightArmMesh);

    const rightHandMesh = new THREE.Mesh(handGeo, handMat);
    rightHandMesh.position.y = -0.6;
    rightArmGroup.add(rightHandMesh);

    this.body.add(rightArmGroup);
    this.rightArm = rightArmGroup;

    // Oversized Chibi Head
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.75;

    const headGeo = new THREE.SphereGeometry(0.65, 32, 32);
    const skinMat = new THREE.MeshToonMaterial({ color: 0xffdbac });
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headGroup.add(headMesh);

    const hairGeo = new THREE.SphereGeometry(0.68, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const hairMat = new THREE.MeshToonMaterial({ color: 0x1e293b });
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.rotation.x = -Math.PI / 10;
    headGroup.add(hairMesh);

    const capGeo = new THREE.SphereGeometry(0.69, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
    const capMat = new THREE.MeshToonMaterial({ color: 0x0f172a });
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.rotation.x = -Math.PI / 8;
    headGroup.add(capMesh);

    const visorGeo = new THREE.BoxGeometry(0.7, 0.06, 0.45);
    const visorMesh = new THREE.Mesh(visorGeo, capMat);
    visorMesh.position.set(0, 0.35, 0.65);
    visorMesh.rotation.x = 0.2;
    headGroup.add(visorMesh);

    // Cute Glasses
    const glassGroup = new THREE.Group();
    glassGroup.position.set(0, 0.05, 0.62);

    const ringGeo = new THREE.TorusGeometry(0.18, 0.03, 12, 24);
    const glassFrameMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const leftGlass = new THREE.Mesh(ringGeo, glassFrameMat);
    leftGlass.position.x = -0.24;
    glassGroup.add(leftGlass);

    const rightGlass = new THREE.Mesh(ringGeo, glassFrameMat);
    rightGlass.position.x = 0.24;
    glassGroup.add(rightGlass);

    const bridgeGeo = new THREE.BoxGeometry(0.16, 0.03, 0.03);
    const bridge = new THREE.Mesh(bridgeGeo, glassFrameMat);
    glassGroup.add(bridge);

    const eyeGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.24, 0, -0.02);
    glassGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.24, 0, -0.02);
    glassGroup.add(rightEye);

    headGroup.add(glassGroup);
    this.body.add(headGroup);
    this.head = headGroup;

    // Floating Name Label (NaDream - Plain Clean White Text, NO Background Box, NO Frame!)
    const nameCanvas = document.createElement('canvas');
    nameCanvas.width = 512;
    nameCanvas.height = 128;
    const nCtx = nameCanvas.getContext('2d');

    nCtx.fillStyle = '#ffffff';
    nCtx.font = 'bold 56px Prompt, Arial';
    nCtx.textAlign = 'center';
    nCtx.textBaseline = 'middle';
    
    nCtx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    nCtx.shadowBlur = 12;
    nCtx.shadowOffsetX = 3;
    nCtx.shadowOffsetY = 3;

    nCtx.fillText('NaDream', 256, 64);

    const nameTex = new THREE.CanvasTexture(nameCanvas);
    const nameMat = new THREE.MeshBasicMaterial({ map: nameTex, transparent: true, side: THREE.DoubleSide });
    const nameGeo = new THREE.PlaneGeometry(2.4, 0.6);
    const nameMesh = new THREE.Mesh(nameGeo, nameMat);
    nameMesh.position.y = 2.7;
    this.group.add(nameMesh);

    this.characterGroup.add(this.body);
    this.group.add(this.characterGroup);

    this.group.position.copy(this.position);
  }

  setFloatingPose(time) {
    this.group.position.y = 3.5 + Math.sin(time * 1.8) * 0.45;
    this.group.rotation.x = Math.sin(time * 1.2) * 0.12;
    this.group.rotation.z = Math.cos(time * 1.5) * 0.08;

    if (this.leftArm && this.rightArm) {
      this.leftArm.rotation.x = -Math.PI / 4 + Math.sin(time * 2) * 0.2;
      this.rightArm.rotation.x = -Math.PI / 4 - Math.sin(time * 2) * 0.2;
      this.leftArm.rotation.z = 0.35;
      this.rightArm.rotation.z = -0.35;
    }
  }

  setLandingPose(progress) {
    const targetY = 0.05;
    const startY = 3.5;
    this.group.position.y = startY + (targetY - startY) * progress;

    this.group.rotation.x = (1 - progress) * 0.15;
    this.group.rotation.z = 0;

    if (progress >= 1.0) {
      this.isGrounded = true;
      if (this.leftArm && this.rightArm) {
        this.leftArm.rotation.x = 0;
        this.rightArm.rotation.x = 0;
        this.leftArm.rotation.z = 0.18;
        this.rightArm.rotation.z = -0.18;
      }
    }
  }

  update(delta, keysPressed, joystickVector, cameraAngleY, activeBarrierZ) {
    let inputX = 0;
    let inputZ = 0;

    if (keysPressed['KeyW'] || keysPressed['ArrowUp']) inputZ -= 1;
    if (keysPressed['KeyS'] || keysPressed['ArrowDown']) inputZ += 1;
    if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) inputX -= 1;
    if (keysPressed['KeyD'] || keysPressed['ArrowRight']) inputX += 1;

    if (joystickVector && (joystickVector.x !== 0 || joystickVector.y !== 0)) {
      inputX = joystickVector.x;
      inputZ = joystickVector.y;
    }

    const length = Math.hypot(inputX, inputZ);
    const isMoving = length > 0.1;

    if (isMoving) {
      const normX = inputX / (length || 1);
      const normZ = inputZ / (length || 1);

      const moveAngle = Math.atan2(normX, normZ) + cameraAngleY;

      this.velocity.x = Math.sin(moveAngle) * this.moveSpeed;
      this.velocity.z = Math.cos(moveAngle) * this.moveSpeed;

      const targetRotation = moveAngle;
      let diff = targetRotation - this.rotation;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      this.rotation += diff * Math.min(1, delta * this.rotationSpeed);
      this.characterGroup.rotation.y = this.rotation;
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    if (keysPressed['Space'] && this.isGrounded) {
      this.verticalVelocity = this.jumpForce;
      this.isGrounded = false;
      if (window.soundEngine) window.soundEngine.playJump();
    }

    if (!this.isGrounded) {
      this.verticalVelocity += this.gravity * delta;
      this.position.y += this.verticalVelocity * delta;

      if (this.position.y <= 0.05) {
        this.position.y = 0.05;
        this.isGrounded = true;
        this.verticalVelocity = 0;
      }
    }

    this.position.x += this.velocity.x * delta;
    this.position.z += this.velocity.z * delta;

    this.position.x = Math.max(-17.5, Math.min(17.5, this.position.x));
    
    if (activeBarrierZ !== undefined && activeBarrierZ !== -1000) {
      if (this.position.z < activeBarrierZ + 0.5) {
        this.position.z = activeBarrierZ + 0.5;
      }
    }

    this.group.position.copy(this.position);

    // Limb Animation (Walk vs Idle with non-clipping arm angles)
    const time = Date.now() * 0.005;
    if (isMoving) {
      const swingSpeed = 10;
      this.leftArm.rotation.x = Math.sin(time * swingSpeed) * 0.65;
      this.rightArm.rotation.x = -Math.sin(time * swingSpeed) * 0.65;
      this.leftLeg.rotation.x = -Math.sin(time * swingSpeed) * 0.65;
      this.rightLeg.rotation.x = Math.sin(time * swingSpeed) * 0.65;
      this.body.position.y = Math.abs(Math.sin(time * swingSpeed * 2)) * 0.08;
    } else {
      this.leftArm.rotation.x = Math.sin(time * 2) * 0.08;
      this.rightArm.rotation.x = -Math.sin(time * 2) * 0.08;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.body.position.y = 0;
    }

    // Keep arms angled outward slightly so they never clip into torso box!
    this.leftArm.rotation.z = 0.18;
    this.rightArm.rotation.z = -0.18;
  }
}

window.CharacterController = CharacterController;
