/* ==========================================================================
   3D NPC Generator - Bank Character in Grand Winner's Sanctuary (Global Window)
   ========================================================================== */

class BankNPC {
  constructor(scene, position = new THREE.Vector3(0, 0, -152)) {
    this.scene = scene;
    this.position = position;
    this.group = new THREE.Group();
    this.nametag = null;
    this.rightArm = null;

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

  createRacket() {
    const racketGroup = new THREE.Group();
    
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.8, 12),
      new THREE.MeshToonMaterial({ color: 0x1e2029 })
    );
    handle.position.y = 0.4;
    racketGroup.add(handle);

    const frameGeo = new THREE.TorusGeometry(0.32, 0.03, 8, 24);
    const frameMat = new THREE.MeshToonMaterial({ color: 0x00f5d4 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 1.1;
    racketGroup.add(frame);

    return racketGroup;
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
    this.group.add(rightLegGroup);

    // 4. ARMS & BADMINTON RACKET
    const armGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.75, 16);
    const leftArm = new THREE.Mesh(armGeo, tshirtMaterial);
    leftArm.position.set(-0.55, 0.95, 0);
    this.group.add(leftArm);

    const rightArmGroup = new THREE.Group();
    const rightArmMesh = new THREE.Mesh(armGeo, tshirtMaterial);
    rightArmMesh.position.y = -0.35;
    rightArmGroup.add(rightArmMesh);

    const racket = this.createRacket();
    racket.position.set(0, -0.7, 0.3);
    racket.rotation.x = Math.PI / 4;
    rightArmGroup.add(racket);

    rightArmGroup.position.set(0.55, 1.3, 0);
    this.rightArm = rightArmGroup;
    this.group.add(rightArmGroup);

    // 5. NAMETAG
    this.nametag = this.createNametag();
    this.group.add(this.nametag);
  }

  update(time) {
    if (this.rightArm) {
      this.rightArm.rotation.z = Math.sin(time * 0.004) * 0.2 - 0.3;
    }
    if (this.nametag) {
      this.nametag.position.y = 3.2 + Math.sin(time * 0.003) * 0.08;
    }
  }
}

window.BankNPC = BankNPC;
