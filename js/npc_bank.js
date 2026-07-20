/* ==========================================================================
   3D NPC Generator - Bank Character with Birthday Cake (Global Window)
   ========================================================================== */

class BankNPC {
  constructor(scene, position = new THREE.Vector3(0, 0, -152)) {
    this.scene = scene;
    this.position = position;
    this.group = new THREE.Group();
    this.nametag = null;
    this.leftArm = null;
    this.rightArm = null;
    this.leftLeg = null;
    this.rightLeg = null;
    this.cakeGroup = null;

    this.isWalking = false;
    this.walkCycle = 0;
    this.walkTarget = null;
    this.onArriveCallback = null;

    this.buildNPC();
    this.group.position.copy(this.position);
    this.scene.add(this.group);
  }

  createFaceTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f7d6c8';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#1e2029';
    ctx.beginPath();
    ctx.ellipse(85, 110, 15, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(171, 110, 15, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(80, 102, 5, 0, Math.PI * 2);
    ctx.arc(166, 102, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#7c4d3d';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(128, 145, 22, 0.1 * Math.PI, 0.9 * Math.PI);
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

    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 46px Arial, Prompt';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏸 Bank 🏸', 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(3.2, 0.8, 1);
    sprite.position.set(0, 3.2, 0);
    return sprite;
  }

  createBirthdayCake() {
    const cakeGroup = new THREE.Group();

    // 2-tier Cake
    const tier1Geo = new THREE.CylinderGeometry(0.5, 0.5, 0.35, 24);
    const tier1Mat = new THREE.MeshToonMaterial({ color: 0xff6b9b });
    const tier1 = new THREE.Mesh(tier1Geo, tier1Mat);
    tier1.position.y = 0.175;
    cakeGroup.add(tier1);

    const tier2Geo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 24);
    const tier2Mat = new THREE.MeshToonMaterial({ color: 0xffd700 });
    const tier2 = new THREE.Mesh(tier2Geo, tier2Mat);
    tier2.position.y = 0.5;
    cakeGroup.add(tier2);

    // Candles with Glowing Flames
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const rx = Math.cos(angle) * 0.18;
      const rz = Math.sin(angle) * 0.18;

      const candleMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.22, 12),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      candleMesh.position.set(rx, 0.76, rz);
      cakeGroup.add(candleMesh);

      const flameMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffa500 })
      );
      flameMesh.position.set(rx, 0.9, rz);
      cakeGroup.add(flameMesh);
    }

    // Warm Glowing Candlelight PointLight
    const candleLight = new THREE.PointLight(0xffaa00, 3.5, 14);
    candleLight.position.set(0, 1.0, 0);
    cakeGroup.add(candleLight);

    return cakeGroup;
  }

  attachBirthdayCake() {
    if (!this.cakeGroup) {
      this.cakeGroup = this.createBirthdayCake();
      this.cakeGroup.position.set(0, 0.9, 0.65);
      this.group.add(this.cakeGroup);
    }
    this.cakeGroup.visible = true;

    // Pose arms forward to carry cake
    if (this.leftArm) {
      this.leftArm.rotation.x = -Math.PI / 3;
      this.leftArm.rotation.z = -0.2;
    }
    if (this.rightArm) {
      this.rightArm.rotation.x = -Math.PI / 3;
      this.rightArm.rotation.z = 0.2;
    }
  }

  buildNPC() {
    const skinMaterial = new THREE.MeshToonMaterial({ color: 0xf7d6c8 });
    const hairMaterial = new THREE.MeshToonMaterial({ color: 0x4a2e1b });
    const tshirtMaterial = new THREE.MeshToonMaterial({ color: 0x1d3557 });
    const shortsMaterial = new THREE.MeshToonMaterial({ color: 0x457b9d });
    const shoeMaterial = new THREE.MeshToonMaterial({ color: 0xe1e5f2 });

    // 1. HEAD & SHORT BROWN HAIR
    const headGroup = new THREE.Group();
    const faceTex = this.createFaceTexture();
    const faceMaterial = new THREE.MeshToonMaterial({ map: faceTex });

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32), faceMaterial);
    headMesh.rotation.y = -Math.PI / 2;
    headGroup.add(headMesh);

    const hairTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.58, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.7),
      hairMaterial
    );
    hairTop.position.set(0, 0.06, 0);
    headGroup.add(hairTop);

    const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.25), hairMaterial);
    fringe.position.set(0, 0.35, 0.45);
    fringe.rotation.x = 0.3;
    headGroup.add(fringe);

    headGroup.position.set(0, 1.85, 0);
    this.group.add(headGroup);

    // 2. TORSO
    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.05, 0.6), tshirtMaterial);
    torsoMesh.position.set(0, 1.05, 0);
    this.group.add(torsoMesh);

    // 3. SHORTS & LEGS
    const leftLegGroup = new THREE.Group();
    const shortsGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.45, 16);
    const shortsLeft = new THREE.Mesh(shortsGeo, shortsMaterial);
    shortsLeft.position.y = -0.22;
    leftLegGroup.add(shortsLeft);

    const legSkinGeo = new THREE.CylinderGeometry(0.13, 0.12, 0.45, 16);
    const legLeft = new THREE.Mesh(legSkinGeo, skinMaterial);
    legLeft.position.y = -0.65;
    leftLegGroup.add(legLeft);

    const shoeLeft = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.38), shoeMaterial);
    shoeLeft.position.set(0, -0.9, 0.06);
    leftLegGroup.add(shoeLeft);

    leftLegGroup.position.set(-0.25, 0.8, 0);
    this.leftLeg = leftLegGroup;
    this.group.add(leftLegGroup);

    const rightLegGroup = new THREE.Group();
    const shortsRight = new THREE.Mesh(shortsGeo, shortsMaterial);
    shortsRight.position.y = -0.22;
    rightLegGroup.add(shortsRight);

    const legRight = new THREE.Mesh(legSkinGeo, skinMaterial);
    legRight.position.y = -0.65;
    rightLegGroup.add(legRight);

    const shoeRight = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.38), shoeMaterial);
    shoeRight.position.set(0, -0.9, 0.06);
    rightLegGroup.add(shoeRight);

    rightLegGroup.position.set(0.25, 0.8, 0);
    this.rightLeg = rightLegGroup;
    this.group.add(rightLegGroup);

    // 4. ARMS
    const armGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.75, 16);
    const leftArmGroup = new THREE.Group();
    const leftArmMesh = new THREE.Mesh(armGeo, tshirtMaterial);
    leftArmMesh.position.y = -0.35;
    leftArmGroup.add(leftArmMesh);
    leftArmGroup.position.set(-0.55, 1.3, 0);
    this.leftArm = leftArmGroup;
    this.group.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    const rightArmMesh = new THREE.Mesh(armGeo, tshirtMaterial);
    rightArmMesh.position.y = -0.35;
    rightArmGroup.add(rightArmMesh);
    rightArmGroup.position.set(0.55, 1.3, 0);
    this.rightArm = rightArmGroup;
    this.group.add(rightArmGroup);

    // 5. NAMETAG
    this.nametag = this.createNametag();
    this.group.add(this.nametag);
  }

  walkToPlayer(targetPos, onArrive) {
    this.walkTarget = targetPos;
    this.onArriveCallback = onArrive;
    this.isWalking = true;
    this.attachBirthdayCake();
  }

  update(time) {
    if (this.isWalking && this.walkTarget) {
      const speed = 0.045;
      const dirZ = this.walkTarget.z - this.position.z;
      const dirX = this.walkTarget.x - this.position.x;
      const dist = Math.hypot(dirX, dirZ);

      if (dist > 1.2) {
        this.position.z += (dirZ / dist) * speed;
        this.position.x += (dirX / dist) * speed;
        this.group.position.copy(this.position);

        this.walkCycle += 0.12;
        const swing = Math.sin(this.walkCycle) * 0.4;
        if (this.leftLeg) this.leftLeg.rotation.x = swing;
        if (this.rightLeg) this.rightLeg.rotation.x = -swing;
      } else {
        this.isWalking = false;
        if (this.leftLeg) this.leftLeg.rotation.x = 0;
        if (this.rightLeg) this.rightLeg.rotation.x = 0;

        if (this.onArriveCallback) {
          const cb = this.onArriveCallback;
          this.onArriveCallback = null;
          cb();
        }
      }
    } else {
      if (this.nametag) {
        this.nametag.position.y = 3.2 + Math.sin(time * 0.003) * 0.08;
      }
    }
  }
}

window.BankNPC = BankNPC;
