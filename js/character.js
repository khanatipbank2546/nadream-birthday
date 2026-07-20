/* ==========================================================================
   3D Character Controller - NaDream Avatar (High Quality Aesthetic Model)
   ========================================================================== */

class CharacterController {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    
    // Position & Movement Parameters (Room 1 Center at Z = -14)
    this.position = new THREE.Vector3(0, 0, -14);
    this.rotation = 0;
    this.speed = 0.085;
    this.isMoving = false;
    this.walkCycle = 0;

    // Physics & Jumping
    this.velocityY = 0;
    this.gravity = -24.0;
    this.jumpPower = 9.0;
    this.isGrounded = true;
    this.groundY = 0;

    // Limbs & Accessories
    this.leftArm = null;
    this.rightArm = null;
    this.leftLeg = null;
    this.rightLeg = null;
    this.ponytail = null;
    this.nametag = null;

    this.buildCharacter();
    this.scene.add(this.group);
  }

  // Custom Blue/Navy & White Abstract Wave T-Shirt (Crisp High-Contrast Texture)
  createTshirtTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const baseGrad = ctx.createLinearGradient(0, 0, 0, 512);
    baseGrad.addColorStop(0, '#0f172a');
    baseGrad.addColorStop(0.35, '#1e293b');
    baseGrad.addColorStop(0.7, '#0284c7');
    baseGrad.addColorStop(1.0, '#38bdf8');

    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.lineWidth = 12;
    for (let y = 180; y < 512; y += 22) {
      ctx.strokeStyle = `rgba(255, 255, 255, 0.85)`;
      ctx.beginPath();
      ctx.moveTo(0, y + Math.sin(y * 0.05) * 8);
      ctx.bezierCurveTo(128, y - 10, 256, y + 10, 384, y - 8);
      ctx.lineTo(512, y + Math.sin(y * 0.05) * 8);
      ctx.stroke();
    }

    ctx.lineWidth = 6;
    ctx.strokeStyle = '#00f5d4';
    for (let y = 220; y < 480; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }

  createFaceTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#fce0d4';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#2b2d42';
    ctx.beginPath();
    ctx.ellipse(85, 110, 12, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(171, 110, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(81, 104, 4, 0, Math.PI * 2);
    ctx.arc(167, 104, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 143, 163, 0.4)';
    ctx.beginPath();
    ctx.arc(68, 135, 14, 0, Math.PI * 2);
    ctx.arc(188, 135, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#8d5b4c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(128, 138, 16, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }

  createGlasses() {
    const glassesGroup = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 });

    const rimGeo = new THREE.TorusGeometry(0.15, 0.015, 8, 24);
    const leftRim = new THREE.Mesh(rimGeo, frameMat);
    leftRim.position.set(-0.21, 0.02, 0.52);
    glassesGroup.add(leftRim);

    const rightRim = new THREE.Mesh(rimGeo, frameMat);
    rightRim.position.set(0.21, 0.02, 0.52);
    glassesGroup.add(rightRim);

    const bridgeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.2, 8);
    const bridge = new THREE.Mesh(bridgeGeo, frameMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.02, 0.52);
    glassesGroup.add(bridge);

    const templeGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.45, 8);
    const leftTemple = new THREE.Mesh(templeGeo, frameMat);
    leftTemple.rotation.x = Math.PI / 2;
    leftTemple.position.set(-0.36, 0.02, 0.3);
    glassesGroup.add(leftTemple);

    const rightTemple = new THREE.Mesh(templeGeo, frameMat);
    rightTemple.rotation.x = Math.PI / 2;
    rightTemple.position.set(0.36, 0.02, 0.3);
    glassesGroup.add(rightTemple);

    return glassesGroup;
  }

  createNametag() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // 100% Transparent Background (No black box, No gold border)
    ctx.clearRect(0, 0, 512, 128);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Prompt, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NaDream', 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2.8, 0.7, 1);
    sprite.position.set(0, 2.9, 0);
    return sprite;
  }

  buildCharacter() {
    const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.4 });
    const shortsMaterial = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.5 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfce0d4, roughness: 0.6 });
    const shoeMaterial = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
    const shoeTrimMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });

    // 1. HEAD & ELEGANT HAIR (NO BANGS, SMOOTH PONYTAIL)
    const headGroup = new THREE.Group();
    const faceTex = this.createFaceTexture();
    const faceMaterial = new THREE.MeshToonMaterial({ map: faceTex });

    const headGeo = new THREE.SphereGeometry(0.52, 32, 32);
    const headMesh = new THREE.Mesh(headGeo, faceMaterial);
    headMesh.rotation.y = -Math.PI / 2;
    headGroup.add(headMesh);

    // Natural Combed Hair Cap
    const hairCapGeo = new THREE.SphereGeometry(0.54, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.1);
    const hairCap = new THREE.Mesh(hairCapGeo, hairMaterial);
    hairCap.position.set(0, 0.08, -0.06);
    headGroup.add(hairCap);

    // 3D Thin Wire Glasses
    const glasses = this.createGlasses();
    headGroup.add(glasses);

    // Stylish Flowing Ponytail with Hair Tie Ring
    const ponytailGroup = new THREE.Group();
    
    // Hair Tie Gold Ring
    const ringGeo = new THREE.TorusGeometry(0.12, 0.03, 8, 16);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 });
    const hairRing = new THREE.Mesh(ringGeo, ringMat);
    hairRing.rotation.x = Math.PI / 2;
    ponytailGroup.add(hairRing);

    // Multi-segment curved ponytail body
    const pSegment1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.35, 12), hairMaterial);
    pSegment1.position.set(0, -0.15, -0.05);
    pSegment1.rotation.x = -Math.PI / 6;
    ponytailGroup.add(pSegment1);

    const pSegment2 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.05, 0.45, 12), hairMaterial);
    pSegment2.position.set(0, -0.42, -0.16);
    pSegment2.rotation.x = -Math.PI / 4;
    ponytailGroup.add(pSegment2);

    ponytailGroup.position.set(0, 0.15, -0.48);
    headGroup.add(ponytailGroup);
    this.ponytail = ponytailGroup;

    headGroup.position.set(0, 1.82, 0);
    this.group.add(headGroup);

    // 2. TORSO & BLUE/WHITE WAVE SPORT SHIRT
    const tshirtTex = this.createTshirtTexture();
    const tshirtMat = new THREE.MeshToonMaterial({ map: tshirtTex });

    const torsoGeo = new THREE.BoxGeometry(0.85, 1.05, 0.55);
    const torsoMesh = new THREE.Mesh(torsoGeo, tshirtMat);
    torsoMesh.position.set(0, 1.05, 0);
    this.group.add(torsoMesh);

    // 3. ELEGANT TAPERED ARMS WITH HANDS
    const armUpperGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.4, 16);
    const armLowerGeo = new THREE.CylinderGeometry(0.09, 0.075, 0.38, 16);
    const handGeo = new THREE.SphereGeometry(0.08, 12, 12);

    // Left Arm
    const leftArmGroup = new THREE.Group();
    const leftUpper = new THREE.Mesh(armUpperGeo, tshirtMat);
    leftUpper.position.y = -0.2;
    leftArmGroup.add(leftUpper);

    const leftLower = new THREE.Mesh(armLowerGeo, skinMat);
    leftLower.position.y = -0.55;
    leftArmGroup.add(leftLower);

    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.y = -0.78;
    leftArmGroup.add(leftHand);

    leftArmGroup.position.set(-0.52, 1.45, 0);
    this.leftArm = leftArmGroup;
    this.group.add(leftArmGroup);

    // Right Arm
    const rightArmGroup = new THREE.Group();
    const rightUpper = new THREE.Mesh(armUpperGeo, tshirtMat);
    rightUpper.position.y = -0.2;
    rightArmGroup.add(rightUpper);

    const rightLower = new THREE.Mesh(armLowerGeo, skinMat);
    rightLower.position.y = -0.55;
    rightArmGroup.add(rightLower);

    const rightHand = new THREE.Mesh(handGeo, skinMat);
    rightHand.position.y = -0.78;
    rightArmGroup.add(rightHand);

    rightArmGroup.position.set(0.52, 1.45, 0);
    this.rightArm = rightArmGroup;
    this.group.add(rightArmGroup);

    // 4. ELEGANT TAPERED LEGS & ATHLETIC SNEAKERS
    const legSkinGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.45, 16);

    // Left Leg & Black Shorts
    const leftLegGroup = new THREE.Group();
    const shortsLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.38, 16), shortsMaterial);
    shortsLeft.position.y = -0.19;
    leftLegGroup.add(shortsLeft);

    const legLeft = new THREE.Mesh(legSkinGeo, skinMat);
    legLeft.position.y = -0.58;
    leftLegGroup.add(legLeft);

    // Athletic Sneaker
    const sneakerMain = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.36), shoeMaterial);
    sneakerMain.position.set(0, -0.84, 0.05);
    leftLegGroup.add(sneakerMain);

    const sneakerTrim = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.05, 0.37), shoeTrimMat);
    sneakerTrim.position.set(0, -0.88, 0.05);
    leftLegGroup.add(sneakerTrim);

    leftLegGroup.position.set(-0.24, 0.8, 0);
    this.leftLeg = leftLegGroup;
    this.group.add(leftLegGroup);

    // Right Leg & Black Shorts
    const rightLegGroup = new THREE.Group();
    const shortsRight = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.38, 16), shortsMaterial);
    shortsRight.position.y = -0.19;
    rightLegGroup.add(shortsRight);

    const legRight = new THREE.Mesh(legSkinGeo, skinMat);
    legRight.position.y = -0.58;
    rightLegGroup.add(legRight);

    const sneakerRight = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.36), shoeMaterial);
    sneakerRight.position.set(0, -0.84, 0.05);
    rightLegGroup.add(sneakerRight);

    const sneakerRightTrim = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.05, 0.37), shoeTrimMat);
    sneakerRightTrim.position.set(0, -0.88, 0.05);
    rightLegGroup.add(sneakerRightTrim);

    rightLegGroup.position.set(0.24, 0.8, 0);
    this.rightLeg = rightLegGroup;
    this.group.add(rightLegGroup);

    // 5. NAMETAG
    this.nametag = this.createNametag();
    this.group.add(this.nametag);
    
    this.group.position.copy(this.position);
  }

  setFloatingPose(elapsedTime) {
    const floatY = 2.2 + Math.sin(elapsedTime * 2.5) * 0.3;
    this.position.y = floatY;

    this.leftArm.rotation.z = Math.PI / 4 + Math.sin(elapsedTime * 2) * 0.15;
    this.rightArm.rotation.z = -Math.PI / 4 - Math.sin(elapsedTime * 2) * 0.15;
    this.leftArm.rotation.x = -0.2;
    this.rightArm.rotation.x = -0.2;

    this.leftLeg.rotation.x = 0.3 + Math.sin(elapsedTime * 1.8) * 0.1;
    this.rightLeg.rotation.x = -0.3 - Math.sin(elapsedTime * 1.8) * 0.1;

    if (this.ponytail) {
      this.ponytail.rotation.x = -Math.PI / 6 + Math.sin(elapsedTime * 3) * 0.12;
    }

    this.group.position.copy(this.position);
  }

  setLandingPose(progress) {
    const startY = 4.5;
    this.position.y = startY * (1 - progress);

    if (progress < 0.7) {
      this.leftArm.rotation.x = Math.PI * 0.8;
      this.rightArm.rotation.x = Math.PI * 0.8;
      this.leftLeg.rotation.x = -0.4;
      this.rightLeg.rotation.x = 0.4;
    } else {
      const crouch = (1 - progress) / 0.3;
      this.leftArm.rotation.x = -0.8;
      this.rightArm.rotation.x = 0.8;
      this.leftLeg.rotation.x = 0.9 * crouch;
      this.rightLeg.rotation.x = 0.9 * crouch;
    }

    if (progress >= 1.0) {
      this.position.y = 0;
      this.isGrounded = true;
    }

    this.group.position.copy(this.position);
  }

  jump() {
    if (this.isGrounded) {
      this.velocityY = this.jumpPower;
      this.isGrounded = false;
      if (window.soundEngine) window.soundEngine.playJump();
    }
  }

  update(delta, keysPressed, joystickVector, cameraAngleY = 0, activeBarrierZ = -1000) {
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

    if (keysPressed['Space']) {
      this.jump();
    }

    if (!this.isGrounded) {
      this.position.y += this.velocityY * delta;
      this.velocityY += this.gravity * delta;

      if (this.position.y <= this.groundY) {
        this.position.y = this.groundY;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    }

    if (inputX !== 0 || inputZ !== 0) {
      this.isMoving = true;

      const fwdX = Math.sin(cameraAngleY);
      const fwdZ = Math.cos(cameraAngleY);
      const rightX = Math.cos(cameraAngleY);
      const rightZ = -Math.sin(cameraAngleY);

      let moveDirX = (fwdX * inputZ) + (rightX * inputX);
      let moveDirZ = (fwdZ * inputZ) + (rightZ * inputX);

      const length = Math.hypot(moveDirX, moveDirZ);
      if (length > 0) {
        moveDirX /= length;
        moveDirZ /= length;
      }

      this.rotation = Math.atan2(moveDirX, moveDirZ);
      this.group.rotation.y = this.rotation;

      const nextX = this.position.x + moveDirX * this.speed;
      const nextZ = this.position.z + moveDirZ * this.speed;

      if (nextX >= -17.5 && nextX <= 17.5) {
        this.position.x = nextX;
      }

      if (nextZ > activeBarrierZ) {
        this.position.z = nextZ;
      }

      this.walkCycle += delta * 10;
      const swing = Math.sin(this.walkCycle) * 0.6;
      
      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;
      this.leftArm.rotation.x = -swing * 0.8;
      this.rightArm.rotation.x = swing * 0.8;

      if (this.ponytail) {
        this.ponytail.rotation.x = Math.sin(this.walkCycle * 2) * 0.15;
      }
    } else {
      this.isMoving = false;
      this.leftLeg.rotation.x *= 0.8;
      this.rightLeg.rotation.x *= 0.8;
      this.leftArm.rotation.x *= 0.8;
      this.rightArm.rotation.x *= 0.8;
    }

    this.group.position.copy(this.position);

    if (this.nametag) {
      this.nametag.position.y = 3.1 + Math.sin(Date.now() * 0.003) * 0.08;
    }
  }
}

window.CharacterController = CharacterController;
