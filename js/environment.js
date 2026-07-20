/* ==========================================================================
   3D World & Environment Generator - Fantasy Birthday Garden
   ========================================================================== */

export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.questMarkers = [];
    this.starsList = [];
    this.candlesList = [];
    this.fireflies = null;

    this.initLighting();
    this.initTerrain();
    this.initTrees();
    this.initCrystalLake();
    this.initQuestLandmarks();
    this.initParticles();
  }

  // Sunlight and Atmospheric Lighting
  initLighting() {
    // Soft Ambient Light
    const ambientLight = new THREE.AmbientLight(0xd8e2dc, 0.7);
    this.scene.add(ambientLight);

    // Main Warm Directional Sun Light
    const sunLight = new THREE.DirectionalLight(0xfff3b0, 1.2);
    sunLight.position.set(25, 45, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    const shadowDist = 40;
    sunLight.shadow.camera.left = -shadowDist;
    sunLight.shadow.camera.right = shadowDist;
    sunLight.shadow.camera.top = shadowDist;
    sunLight.shadow.camera.bottom = -shadowDist;
    this.scene.add(sunLight);

    // Fog for atmospheric depth
    this.scene.fog = new THREE.FogExp2(0x0f1016, 0.012);
  }

  // Floating Island Terrain Base
  initTerrain() {
    // Main Grass Ground Disk
    const islandGeo = new THREE.CylinderGeometry(40, 36, 6, 64);
    const islandMat = new THREE.MeshToonMaterial({ color: 0x38b000 });
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.y = -3;
    islandMesh.receiveShadow = true;
    this.scene.add(islandMesh);

    // Bottom Rock Base
    const rockGeo = new THREE.ConeGeometry(36, 15, 32);
    const rockMat = new THREE.MeshToonMaterial({ color: 0x2b2d42 });
    const rockMesh = new THREE.Mesh(rockGeo, rockMat);
    rockMesh.rotation.x = Math.PI;
    rockMesh.position.y = -13.5;
    this.scene.add(rockMesh);

    // Cobblestone Pathways leading to quests
    this.createCobblestonePath(0, 0, 0, -15);  // Path to Quest 1
    this.createCobblestonePath(0, 0, 18, -8);  // Path to Quest 2
    this.createCobblestonePath(0, 0, 15, 16);  // Path to Quest 3
    this.createCobblestonePath(0, 0, -16, 14); // Path to Quest 4
  }

  createCobblestonePath(x1, z1, x2, z2) {
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const pathGeo = new THREE.PlaneGeometry(3.2, dist);
    const pathMat = new THREE.MeshToonMaterial({ color: 0xe9ecef, side: THREE.DoubleSide });
    const pathMesh = new THREE.Mesh(pathGeo, pathMat);
    
    pathMesh.rotation.x = -Math.PI / 2;
    pathMesh.position.set((x1 + x2) / 2, 0.02, (z1 + z2) / 2);
    pathMesh.rotation.z = Math.atan2(x2 - x1, z2 - z1);
    pathMesh.receiveShadow = true;
    this.scene.add(pathMesh);
  }

  // Glowing Cherry Blossom Trees around Island
  initTrees() {
    const treePositions = [
      [-12, -22], [12, -22], [-24, -10], [24, -10],
      [-28, 10], [28, 10], [-10, 26], [10, 26]
    ];

    treePositions.forEach(([x, z]) => {
      const treeGroup = new THREE.Group();
      
      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 4, 8);
      const trunkMat = new THREE.MeshToonMaterial({ color: 0x5c3d2e });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 2;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Glowing Foliage Canopy
      const foliageGeo = new THREE.DodecahedronGeometry(2.5, 1);
      const foliageMat = new THREE.MeshToonMaterial({ color: 0xff758f });
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = 4.8;
      foliage.castShadow = true;
      treeGroup.add(foliage);

      treeGroup.position.set(x, 0, z);
      this.scene.add(treeGroup);
    });
  }

  // Crystal Clear Lake
  initCrystalLake() {
    const lakeGeo = new THREE.CircleGeometry(7.5, 32);
    const lakeMat = new THREE.MeshBasicMaterial({ 
      color: 0x48cae4, 
      transparent: true, 
      opacity: 0.85 
    });
    const lakeMesh = new THREE.Mesh(lakeGeo, lakeMat);
    lakeMesh.rotation.x = -Math.PI / 2;
    lakeMesh.position.set(-16, 0.04, 14);
    this.scene.add(lakeMesh);
  }

  // 5 Quest Landmarks & Interactive Glowing 3D Markers
  initQuestLandmarks() {
    // ----------------------------------------------------------------------
    // QUEST 1 LANDMARK: Ancient Tree of Memories (Position: [0, 0, -15])
    // ----------------------------------------------------------------------
    const q1Group = new THREE.Group();
    const q1TrunkGeo = new THREE.CylinderGeometry(1.2, 1.8, 7, 12);
    const q1TrunkMat = new THREE.MeshToonMaterial({ color: 0x4a3b32 });
    const q1Trunk = new THREE.Mesh(q1TrunkGeo, q1TrunkMat);
    q1Trunk.position.y = 3.5;
    q1Group.add(q1Trunk);

    const q1CanopyGeo = new THREE.SphereGeometry(4.5, 16, 16);
    const q1CanopyMat = new THREE.MeshToonMaterial({ color: 0x7209b7 });
    const q1Canopy = new THREE.Mesh(q1CanopyGeo, q1CanopyMat);
    q1Canopy.position.y = 7.5;
    q1Group.add(q1Canopy);

    q1Group.position.set(0, 0, -15);
    this.scene.add(q1Group);

    this.createQuestMarker(1, 0, 4.5, -15, '🧭');

    // ----------------------------------------------------------------------
    // QUEST 2 LANDMARK: Star Collector Grove (Position: [18, 0, -8])
    // ----------------------------------------------------------------------
    const starCoords = [
      [16, -6], [20, -10], [18, -12], [22, -6], [14, -10]
    ];
    
    starCoords.forEach(([sx, sz], idx) => {
      const starGeo = new THREE.OctahedronGeometry(0.7, 0);
      const starMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
      const starMesh = new THREE.Mesh(starGeo, starMat);
      starMesh.position.set(sx, 1.2, sz);
      starMesh.userData = { id: idx, collected: false };
      this.scene.add(starMesh);
      this.starsList.push(starMesh);
    });

    this.createQuestMarker(2, 18, 3.2, -8, '⭐');

    // ----------------------------------------------------------------------
    // QUEST 3 LANDMARK: Mysterious Music Box Stone (Position: [15, 0, 16])
    // ----------------------------------------------------------------------
    const runeStoneGeo = new THREE.BoxGeometry(2.5, 3.5, 2.5);
    const runeStoneMat = new THREE.MeshToonMaterial({ color: 0x3a0ca3 });
    const runeStone = new THREE.Mesh(runeStoneGeo, runeStoneMat);
    runeStone.position.set(15, 1.75, 16);
    this.scene.add(runeStone);

    this.createQuestMarker(3, 15, 4.2, 16, '🎵');

    // ----------------------------------------------------------------------
    // QUEST 4 LANDMARK: 3 Giant Birthday Wish Candles (Position: [-16, 0, 14])
    // ----------------------------------------------------------------------
    const candlePositions = [[-18, 12], [-16, 16], [-14, 12]];
    candlePositions.forEach(([cx, cz], idx) => {
      const candleGroup = new THREE.Group();
      const candleBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 2.5, 16),
        new THREE.MeshToonMaterial({ color: 0xff6b9b })
      );
      candleBody.position.y = 1.25;
      candleGroup.add(candleBody);

      // Candle Flame Light
      const flameGeo = new THREE.ConeGeometry(0.25, 0.6, 12);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.y = 2.8;
      flame.visible = false; // Turned on when quest completed/interacted
      candleGroup.add(flame);

      const flameLight = new THREE.PointLight(0xffaa00, 0, 8);
      flameLight.position.y = 2.8;
      candleGroup.add(flameLight);

      candleGroup.position.set(cx, 0, cz);
      candleGroup.userData = { flame, flameLight, lit: false };
      this.scene.add(candleGroup);
      this.candlesList.push(candleGroup);
    });

    this.createQuestMarker(4, -16, 4.2, 14, '🕯️');

    // ----------------------------------------------------------------------
    // QUEST 5 LANDMARK: Giant Birthday Gift Box at Center (Position: [0, 0, 0])
    // ----------------------------------------------------------------------
    const boxGroup = new THREE.Group();
    const boxGeo = new THREE.BoxGeometry(3.2, 3.2, 3.2);
    const boxMat = new THREE.MeshToonMaterial({ color: 0xff0054 });
    const giftBox = new THREE.Mesh(boxGeo, boxMat);
    giftBox.position.y = 1.6;
    boxGroup.add(giftBox);

    // Gold Ribbon Cross
    const ribbonMat = new THREE.MeshToonMaterial({ color: 0xffd700 });
    const ribbon1 = new THREE.Mesh(new THREE.BoxGeometry(3.3, 3.3, 0.6), ribbonMat);
    ribbon1.position.y = 1.6;
    boxGroup.add(ribbon1);

    const ribbon2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.3, 3.3), ribbonMat);
    ribbon2.position.y = 1.6;
    boxGroup.add(ribbon2);

    boxGroup.position.set(0, 0, 0);
    this.scene.add(boxGroup);

    this.createQuestMarker(5, 0, 4.2, 0, '🎁');
  }

  // Helper: Create Floating 3D Icon Marker above Quest Objective
  createQuestMarker(questId, x, y, z, iconText) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#9d4edd';
    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(iconText, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(x, y, z);
    sprite.scale.set(2.2, 2.2, 1);
    sprite.userData = { questId, baseY: y };

    this.scene.add(sprite);
    this.questMarkers.push(sprite);
  }

  // Ambient Floating Fireflies Particle System
  initParticles() {
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 70;
      positions[i + 1] = Math.random() * 12 + 1;
      positions[i + 2] = (Math.random() - 0.5) * 70;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x00f5d4,
      size: 0.45,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.fireflies = new THREE.Points(geometry, material);
    this.scene.add(this.fireflies);
  }

  // Animation Update Frame
  update(time) {
    // Bob and rotate 3D quest markers
    this.questMarkers.forEach(marker => {
      marker.position.y = marker.userData.baseY + Math.sin(time * 0.003 + marker.userData.questId) * 0.3;
    });

    // Rotate uncollected stars
    this.starsList.forEach(star => {
      if (!star.userData.collected) {
        star.rotation.y += 0.03;
        star.rotation.x += 0.01;
      }
    });

    // Gentle particle floating animation
    if (this.fireflies) {
      const positions = this.fireflies.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(time * 0.001 + i) * 0.02;
      }
      this.fireflies.geometry.attributes.position.needsUpdate = true;
    }
  }
}
