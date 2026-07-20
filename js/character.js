/* ==========================================================================
   3D Character Controller - NaDream Avatar Redesign (Photo 5 Matching)
   ========================================================================== */

class CharacterController {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    
    // Position & Movement Parameters
    this.position = new THREE.Vector3(0, 0, 0);
    this.rotation = 0; // Radians
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

  // Custom Blue/Navy & White Abstract Wave T-Shirt (Exact match for Photo 5!)
  createTshirtTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Deep Navy Blue Base (Upper Chest & Shoulders)
    const baseGrad = ctx.createLinearGradient(0, 0, 0, 512);
    baseGrad.addColorStop(0, '#0f172a');
    baseGrad.addColorStop(0.35, '#1e293b');
    baseGrad.addColorStop(0.7, '#0284c7');
    baseGrad.addColorStop(1.0, '#38bdf8');

    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Wave / Horizontal Gradient Lines (Photo 5 Athletic Pattern)
    ctx.lineWidth = 14;
    for (let y = 180; y < 512; y += 22) {
      const alpha = (y - 180) / 332;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + alpha * 0.6})`;
      
      ctx.beginPath();
      ctx.moveTo(0, y + Math.sin(y * 0.05) * 8);
      ctx.bezierCurveTo(128, y - 10, 256, y + 10, 384, y - 8);
      ctx.lineTo(512, y + Math.sin(y * 0.05) * 8);
      ctx.stroke();
    }

    // Cyan Accent Highlights
    ctx.lineWidth = 8;
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
    ctx.ellipse(85, 110, 14, 20, 0, 0, Math.PI * 2);
    ctx.ellipse(171, 110, 14, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(80, 102, 5, 0, Math.PI * 2);
    ctx.arc(166, 102, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 143, 163, 0.45)';
    ctx.beginPath();
    ctx.arc(65, 135, 16, 0, Math.PI * 2);
    ctx.arc(191, 135, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#8d5b4c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(128, 140, 18, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }

  // 3D Thin Metallic Wire Glasses (Exact match for Photos 1, 3, 4!)
  createGlasses() {
    const glassesGroup = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });

    // Left Rim
    const rimGeo = new THREE.TorusGeometry(0.16, 0.018, 8, 24);
    const leftRim = new THREE.Mesh(rimGeo, frameMat);
    leftRim.position.set(-0.21, 0.02, 0.52);
    glassesGroup.add(leftRim);

    // Right Rim
    const rightRim = new THREE.Mesh(rimGeo, frameMat);
    rightRim.position.set(0.21, 0.02, 0.52);
    glassesGroup.add(rightRim);

    // Double Nose Bridge
    const bridgeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8);
    const bridge1 = new THREE.Mesh(bridgeGeo, frameMat);
    bridge1.rotation.z = Math.PI / 2;
    bridge1.position.set(0, 0.04, 0.52);
    glassesGroup.add(bridge1);

    const bridge2 = new THREE.Mesh(bridgeGeo, frameMat);
    bridge2.rotation.z = Math.PI / 2;
    bridge2.position.set(0, -0.04, 0.52);
    glassesGroup.add(bridge2);

    // Side Temples
    const templeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.45, 8);
    const leftTemple = new THREE.Mesh(templeGeo, frameMat);
    leftTemple.rotation.x = Math.PI / 2;
    leftTemple.position.set(-0.38, 0.02, 0.3);
    glassesGroup.add(leftTemple);

    const rightTemple = new THREE.Mesh(templeGeo, frameMat);
    rightTemple.rotation.x = Math.PI / 2;
    rightTemple.position.set(0.38, 0.02, 0.3);
    glassesGroup.add(rightTemple);

    return glassesGroup;
  }

  createNametag() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(15, 16, 22, 0.88)';
    ctx.beginPath();
    ctx.roundRect(16, 16, 480, 96, 48);
    ctx.fill();

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px Arial, Prompt';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👑 NaDream 👑', 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(3.2, 0.8, 1);
    sprite.position.set(0, 3.2, 0);
    return sprite;
  }

  buildCharacter() {
    const hairMaterial = new THREE.MeshToonMaterial({ color: 0x222225 });
    const shortsMaterial = new THREE.MeshToonMaterial({ color: 0x141416 }); // Black Shorts
    const stripeMaterial = new THREE.MeshToonMaterial({ color: 0xffffff });
    const shoeMaterial = new THREE.MeshToonMaterial({ color: 0xffffff });
    const bagMaterial = new THREE.MeshToonMaterial({ color: 0xf4f4f0 });

    // 1. HEAD, FACE & WIRE GLASSES
    const headGroup = new THREE.Group();
    const faceTex = this.createFaceTexture();
    const faceMaterial = new THREE.MeshToonMaterial({ map: faceTex });

    const headGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const headMesh = new THREE.Mesh(headGeo, faceMaterial);
    headMesh.rotation.y = -Math.PI / 2;
    headGroup.add(headMesh);

    // Hair Cap
    const hairCapGeo = new THREE.SphereGeometry(0.58, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.8);
    const hairCap = new THREE.Mesh(hairCapGeo, hairMaterial);
    hairCap.position.set(0, 0.05, -0.02);
    headGroup.add(hairCap);

    // 3D Thin Wire Glasses
    const glasses = this.createGlasses();
    headGroup.add(glasses);

    // Ponytail Hair
    const ponytailGroup = new THREE.Group();
    const ponytailGeo = new THREE.ConeGeometry(0.2, 0.7, 16);
    const ponytailMesh = new THREE.Mesh(ponytailGeo, hairMaterial);
    ponytailMesh.rotation.x = -Math.PI / 3;
    ponytailMesh.position.set(0, -0.25, -0.2);
    ponytailGroup.add(ponytailMesh);

    ponytailGroup.position.set(0, 0.15, -0.48);
    headGroup.add(ponytailGroup);
    this.ponytail = ponytailGroup;

    headGroup.position.set(0, 1.85, 0);
    this.group.add(headGroup);

    // 2. TORSO & BLUE/WHITE WAVE SPORT T-SHIRT (PHOTO 5 MATCH)
    const tshirtTex = this.createTshirtTexture();
    const tshirtMat = new THREE.MeshToonMaterial({ map: tshirtTex });

    const torsoGeo = new THREE.BoxGeometry(0.9, 1.1, 0.6);
    const torsoMesh = new THREE.Mesh(torsoGeo, tshirtMat);
    torsoMesh.position.set(0, 1.05, 0);
    this.group.add(torsoMesh);

    // 3. WHITE TOTE BAG
    const bagGroup = new THREE.Group();
    const bagGeo = new THREE.BoxGeometry(0.18, 0.65, 0.5);
    const bagMesh = new THREE.Mesh(bagGeo, bagMaterial);
    bagMesh.position.set(0.48, 0.85, 0.1);
    bagGroup.add(bagMesh);
    this.group.add(bagGroup);

    // 4. ARMS & BLACK ATHLETIC SHORTS
    const armGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.75, 16);
    this.leftArm = new THREE.Mesh(armGeo, tshirtMat);
    this.leftArm.position.set(-0.55, 0.95, 0);
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, tshirtMat);
    this.rightArm.position.set(0.55, 0.95, 0);
    this.group.add(this.rightArm);

    // Black Shorts & Legs
    const leftLegGroup = new THREE.Group();
    const shortsLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.42, 16), shortsMaterial);
    shortsLeft.position.y = -0.2;
    leftLegGroup.add(shortsLeft);

    const legSkinGeo = new THREE.CylinderGeometry(0.13, 0.12, 0.45, 16);
    const skinMat = new THREE.MeshToonMaterial({ color: 0xfce0d4 });
    const legLeft = new THREE.Mesh(legSkinGeo, skinMat);
    legLeft.position.y = -0.6;
    leftLegGroup.add(legLeft);

    const shoeGeo = new THREE.BoxGeometry(0.22, 0.15, 0.38);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMaterial);
    leftShoe.position.set(0, -0.85, 0.06);
    leftLegGroup.add(leftShoe);

    leftLegGroup.position.set(-0.25, 0.8, 0);
    this.leftLeg = leftLegGroup;
    this.group.add(leftLegGroup);

    const rightLegGroup = new THREE.Group();
    const shortsRight = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.42, 16), shortsMaterial);
    shortsRight.position.y = -0.2;
    rightLegGroup.add(shortsRight);

    const legRight = new THREE.Mesh(legSkinGeo, skinMat);
    legRight.position.y = -0.6;
    rightLegGroup.add(legRight);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMaterial);
    rightShoe.position.set(0, -0.85, 0.06);
    rightLegGroup.add(rightShoe);

    rightLegGroup.position.set(0.25, 0.8, 0);
    this.rightLeg = rightLegGroup;
    this.group.add(rightLegGroup);

    // 5. FLOATING NAMETAG
    this.nametag = this.createNametag();
    this.group.add(this.nametag);
  }

  // Zero-Gravity Levitation Floating Pose
  setFloatingPose(elapsedTime) {
    const floatY = 2.5 + Math.sin(elapsedTime * 2.5) * 0.4;
    this.position.y = floatY;

    this.leftArm.rotation.z = Math.PI / 4 + Math.sin(elapsedTime * 2) * 0.15;
    this.rightArm.rotation.z = -Math.PI / 4 - Math.sin(elapsedTime * 2) * 0.15;
    this.leftArm.rotation.x = -0.2;
    this.rightArm.rotation.x = -0.2;

    this.leftLeg.rotation.x = 0.3 + Math.sin(elapsedTime * 1.8) * 0.1;
    this.rightLeg.rotation.x = -0.3 - Math.sin(elapsedTime * 1.8) * 0.1;

    if (this.ponytail) {
      this.ponytail.rotation.x = -Math.PI / 3 + Math.sin(elapsedTime * 3) * 0.1;
    }

    this.group.position.copy(this.position);
  }

  // Superhero Burst & Landing Pose
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

  // Camera-Relative Movement Update
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

    // 1. Gravity Physics
    if (!this.isGrounded) {
      this.position.y += this.velocityY * delta;
      this.velocityY += this.gravity * delta;

      if (this.position.y <= this.groundY) {
        this.position.y = this.groundY;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    }

    // 2. Movement Vector Math
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
      this.nametag.position.y = 3.2 + Math.sin(Date.now() * 0.003) * 0.08;
    }
  }
}

window.CharacterController = CharacterController;
