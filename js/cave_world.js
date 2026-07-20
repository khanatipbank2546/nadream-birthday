/* ==========================================================================
   3D Cave World Generator - Cavern Tunnel & 5 Gated Progression Barriers
   ========================================================================== */

export class CaveWorld {
  constructor(scene) {
    this.scene = scene;
    this.barriers = []; // Array of 5 barrier wall meshes
    this.questMarkers = [];
    this.torches = [];

    this.initCaveLighting();
    this.initCaveTunnel();
    this.initBarriers();
    this.initQuestMarkers();
  }

  initCaveLighting() {
    // Soft Dim Cave Ambient Light
    const ambient = new THREE.AmbientLight(0x2a2d3e, 0.65);
    this.scene.add(ambient);

    this.scene.fog = new THREE.FogExp2(0x0a0b10, 0.018);
  }

  // 3D Cave Tunnel System
  initCaveTunnel() {
    const tunnelLength = 130;
    const tunnelWidth = 11;
    const tunnelHeight = 8;

    // Floor
    const floorGeo = new THREE.PlaneGeometry(tunnelWidth, tunnelLength, 16, 64);
    const floorMat = new THREE.MeshToonMaterial({ color: 0x1c1d26, side: THREE.DoubleSide });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0, -tunnelLength / 2 + 10);
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    // Left Rock Wall
    const leftWallGeo = new THREE.BoxGeometry(2, tunnelHeight, tunnelLength);
    const wallMat = new THREE.MeshToonMaterial({ color: 0x12131a });
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-5.8, tunnelHeight / 2, -tunnelLength / 2 + 10);
    this.scene.add(leftWall);

    // Right Rock Wall
    const rightWall = new THREE.Mesh(leftWallGeo, wallMat);
    rightWall.position.set(5.8, tunnelHeight / 2, -tunnelLength / 2 + 10);
    this.scene.add(rightWall);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(tunnelWidth, tunnelLength);
    const ceilingMat = new THREE.MeshToonMaterial({ color: 0x0f1017, side: THREE.DoubleSide });
    const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceilingMesh.rotation.x = Math.PI / 2;
    ceilingMesh.position.set(0, tunnelHeight, -tunnelLength / 2 + 10);
    this.scene.add(ceilingMesh);

    // Add Stalactites (hanging from ceiling) & Stalagmites (rising from ground)
    for (let z = 5; z > -115; z -= 6) {
      this.createStalactite(-4.5 + Math.random() * 2, 7.8, z);
      this.createStalactite(2.5 + Math.random() * 2, 7.8, z - 3);

      this.createStalagmite(-4.8, 0, z - 2);
      this.createStalagmite(4.8, 0, z + 1);

      // Add Wall Torches with warm flickering point light every 15 meters
      if (z % 15 === 0) {
        this.createTorch(-4.6, 3.2, z);
        this.createTorch(4.6, 3.2, z);
      }
    }

    // Final Chamber for Bank NPC (Z = -110 to -125)
    const chamberGeo = new THREE.CylinderGeometry(9, 9, 8, 32);
    const chamberMat = new THREE.MeshToonMaterial({ color: 0x181924, side: THREE.BackSide });
    const chamber = new THREE.Mesh(chamberGeo, chamberMat);
    chamber.position.set(0, 4, -118);
    this.scene.add(chamber);

    // Glowing Crystal Cluster in Final Chamber
    const crystalGeo = new THREE.OctahedronGeometry(1.2, 0);
    const crystalMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.set(0, 2.5, -122);
    this.scene.add(crystal);

    const crystalLight = new THREE.PointLight(0x00f5d4, 2.5, 18);
    crystalLight.position.set(0, 3, -122);
    this.scene.add(crystalLight);
  }

  createStalactite(x, y, z) {
    const geo = new THREE.ConeGeometry(0.4, 2.2, 8);
    const mat = new THREE.MeshToonMaterial({ color: 0x282936 });
    const cone = new THREE.Mesh(geo, mat);
    cone.rotation.x = Math.PI;
    cone.position.set(x, y - 1.1, z);
    this.scene.add(cone);
  }

  createStalagmite(x, y, z) {
    const geo = new THREE.ConeGeometry(0.45, 1.8, 8);
    const mat = new THREE.MeshToonMaterial({ color: 0x20212d });
    const cone = new THREE.Mesh(geo, mat);
    cone.position.set(x, y + 0.9, z);
    this.scene.add(cone);
  }

  createTorch(x, y, z) {
    const torchGroup = new THREE.Group();
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.06, 0.8, 8),
      new THREE.MeshToonMaterial({ color: 0x5c3d2e })
    );
    handle.position.y = 0.4;
    torchGroup.add(handle);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.45, 8),
      new THREE.MeshBasicMaterial({ color: 0xffa500 })
    );
    flame.position.y = 0.9;
    torchGroup.add(flame);

    const light = new THREE.PointLight(0xffaa00, 1.8, 12);
    light.position.y = 0.9;
    torchGroup.add(light);

    torchGroup.position.set(x, y, z);
    this.scene.add(torchGroup);
    this.torches.push({ flame, light });
  }

  // 5 Gated Progression Barriers (กำแพงกั้นทาง)
  initBarriers() {
    const barrierZPositions = [-20, -40, -60, -80, -100];
    const colors = [0xff0054, 0x9d4edd, 0x00f5d4, 0xffd700, 0xff6b9b];

    barrierZPositions.forEach((zPos, idx) => {
      const barrierGeo = new THREE.BoxGeometry(10.5, 7.5, 0.6);
      const barrierMat = new THREE.MeshBasicMaterial({
        color: colors[idx],
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      });

      const barrierMesh = new THREE.Mesh(barrierGeo, barrierMat);
      barrierMesh.position.set(0, 3.75, zPos);
      barrierMesh.userData = { id: idx + 1, zPos, unlocked: false };

      this.scene.add(barrierMesh);
      this.barriers.push(barrierMesh);
    });
  }

  // Floating 3D Quest Markers (Numbers 1 to 5)
  initQuestMarkers() {
    const questZPositions = [-12, -32, -52, -72, -92];

    questZPositions.forEach((zPos, idx) => {
      const questNum = idx + 1;
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(64, 64, 56, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 8;
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 72px Impact, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${questNum}`, 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(0, 2.8, zPos);
      sprite.scale.set(2.4, 2.4, 1);
      sprite.userData = { questNum, baseY: 2.8 };

      this.scene.add(sprite);
      this.questMarkers.push(sprite);
    });
  }

  // Unlock Barrier by Index (1 to 5)
  unlockBarrier(index) {
    const barrier = this.barriers[index - 1];
    if (barrier && !barrier.userData.unlocked) {
      barrier.userData.unlocked = true;
      barrier.visible = false; // Hide barrier so player can walk through!
    }
  }

  // Return the closest active locked barrier Z coordinate
  getActiveBarrierZ() {
    for (let i = 0; i < this.barriers.length; i++) {
      if (!this.barriers[i].userData.unlocked) {
        return this.barriers[i].userData.zPos + 0.3; // Collision wall line
      }
    }
    return -1000; // All unlocked
  }

  // Animation Update
  update(time) {
    // Bob quest markers
    this.questMarkers.forEach(marker => {
      marker.position.y = marker.userData.baseY + Math.sin(time * 0.003 + marker.userData.questNum) * 0.25;
    });

    // Flickering torch flames
    this.torches.forEach(t => {
      t.light.intensity = 1.6 + Math.sin(time * 0.01 + Math.random()) * 0.3;
    });
  }
}
