/* ==========================================================================
   3D Character Controller - Floating Pose & Superhero Landing (Global Window)
   ========================================================================== */

class CharacterController {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    
    // Position & Movement Parameters
    this.position = new THREE.Vector3(0, 0, 0); // Start at Room 1 entrance
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

    // Limbs
    this.leftArm = null;
    this.rightArm = null;
    this.leftLeg = null;
    this.rightLeg = null;
    this.ponytail = null;
    this.nametag = null;

    this.buildCharacter();
    this.scene.add(this.group);
  }

  createTshirtTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#141416';
    ctx.fillRect(0, 0, 512, 512);

    ctx.textAlign = 'center';
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('MAKE', 256, 170);

    ctx.font = 'bold 64px Impact, Arial';
    ctx.fillStyle = '#4cc9f0';
    ctx.fillText('YOURSELF', 256, 230);

    ctx.fillStyle = '#ffd166';
    ctx.fillRect(170, 260, 30, 40);
    ctx.fillStyle = '#ef476f';
    ctx.fillRect(240, 260, 32, 40);
    ctx.fillStyle = '#118ab2';
    ctx.fillRect(310, 260, 30, 40);

    ctx.font = 'bold 60px Impact, Arial';
    ctx.fillStyle = '#4cc9f0';
    ctx.fillText('AT HOME', 256, 360);

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
    const pantsMaterial = new THREE.MeshToonMaterial({ color: 0x1a1a24 });
    const shoeMaterial = new THREE.MeshToonMaterial({ color: 0xffffff });
    const bagMaterial = new THREE.MeshToonMaterial({ color: 0xf4f4f0 });

    // 1. HEAD & FACE
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

    // 2. TORSO & BLACK T-SHIRT
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

    // 4. LIMBS
    const armGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.75, 16);
    this.leftArm = new THREE.Mesh(armGeo, tshirtMat);
    this.leftArm.position.set(-0.55, 0.95, 0);
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, tshirtMat);
    this.rightArm.position.set(0.55, 0.95, 0);
    this.group.add(this.rightArm);

    const legGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.85, 16);
    const leftLegGroup = new THREE.Group();
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMaterial);
    leftLegMesh.position.y = -0.4;
    leftLegGroup.add(leftLegMesh);

    const shoeGeo = new THREE.BoxGeometry(0.22, 0.15, 0.38);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMaterial);
    leftShoe.position.set(0, -0.8, 0.06);
    leftLegGroup.add(leftShoe);

    leftLegGroup.position.set(-0.25, 0.8, 0);
    this.leftLeg = leftLegGroup;
    this.group.add(leftLegGroup);

    const rightLegGroup = new THREE.Group();
    const rightLegMesh = new THREE.Mesh(legGeo, pantsMaterial);
    rightLegMesh.position.y = -0.4;
    rightLegGroup.add(rightLegMesh);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMaterial);
    rightShoe.position.set(0, -0.8, 0.06);
    rightLegGroup.add(rightShoe);

    rightLegGroup.position.set(0.25, 0.8, 0);
    this.rightLeg = rightLegGroup;
    this.group.add(rightLegGroup);

    // 5. FLOATING NAMETAG
    this.nametag = this.createNametag();
    this.group.add(this.nametag);
  }

  // Zero-Gravity Levitation Floating Pose (Intro Cutscene Step 1 & 2)
  setFloatingPose(elapsedTime) {
    const floatY = 2.5 + Math.sin(elapsedTime * 2.5) * 0.4;
    this.position.y = floatY;

    // Levitation Arm & Leg Pose
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

  // Superhero Burst & Landing Pose (Intro Cutscene Step 4 & 5)
  setLandingPose(progress) {
    // Progress 0 -> 1: From height Y=4.0 down to floor Y=0
    const startY = 4.5;
    this.position.y = startY * (1 - progress);

    if (progress < 0.7) {
      // Diving Burst Forward Pose
      this.leftArm.rotation.x = Math.PI * 0.8;
      this.rightArm.rotation.x = Math.PI * 0.8;
      this.leftLeg.rotation.x = -0.4;
      this.rightLeg.rotation.x = 0.4;
    } else {
      // Impact Superhero Knee Landing Crouch
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

    // 2. Camera-Relative Movement Vector Math
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
