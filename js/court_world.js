/* ==========================================================================
   3D Indoor Badminton Complex - Photo Gallery Wall (Aligned & Bright)
   ========================================================================== */

class CourtWorld {
  constructor(scene) {
    this.scene = scene;
    this.doors = [];
    this.questMarkers = [];

    this.sharedCourtTexture = this.createSharedCourtTexture();

    this.initLighting();
    this.initBadmintonComplex();
    this.initPhotoGalleryWall(); // Photo Wall behind Room 1 Center!
    this.initSecretDoorBarriers();
    this.initQuestMarkers();
  }

  createSharedCourtTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0b8457';
    ctx.fillRect(0, 0, 1024, 2048);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 20;

    ctx.strokeRect(24, 24, 976, 2000);
    ctx.strokeRect(72, 24, 880, 2000);

    ctx.beginPath();
    ctx.moveTo(24, 1024);
    ctx.lineTo(1000, 1024);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(24, 728);
    ctx.lineTo(1000, 728);
    ctx.moveTo(24, 1320);
    ctx.lineTo(1000, 1320);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(512, 24);
    ctx.lineTo(512, 728);
    ctx.moveTo(512, 1320);
    ctx.lineTo(512, 2024);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
  }

  initLighting() {
    const ambient = new THREE.AmbientLight(0x506078, 1.1);
    this.scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xfffae6, 1.2);
    sunLight.position.set(10, 35, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    this.scene.add(sunLight);

    // Dedicated Bright Room 1 Spotlight for NaDream Showcase
    const showcaseLight = new THREE.PointLight(0xfffae6, 2.5, 40);
    showcaseLight.position.set(0, 8, -12);
    this.scene.add(showcaseLight);

    this.scene.fog = new THREE.FogExp2(0x1a202c, 0.005);
  }

  // Feature Wall behind NaDream inside Room 1 (Z = -20 facing +Z)
  initPhotoGalleryWall() {
    const wallGroup = new THREE.Group();
    const wallZ = -20.0; // Placed inside Room 1 behind NaDream (Z = -14)

    // 1. Cozy Feature Wall Panel
    const wallGeo = new THREE.PlaneGeometry(20, 10);
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 1024;
    wallCanvas.height = 512;
    const wCtx = wallCanvas.getContext('2d');

    const wallGrad = wCtx.createLinearGradient(0, 0, 1024, 512);
    wallGrad.addColorStop(0, '#1e293b');
    wallGrad.addColorStop(0.5, '#0f172a');
    wallGrad.addColorStop(1.0, '#1a202c');
    wCtx.fillStyle = wallGrad;
    wCtx.fillRect(0, 0, 1024, 512);

    wCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    wCtx.lineWidth = 4;
    for (let x = 0; x < 1024; x += 64) {
      wCtx.beginPath();
      wCtx.moveTo(x, 0);
      wCtx.lineTo(x, 512);
      wCtx.stroke();
    }

    const wallTex = new THREE.CanvasTexture(wallCanvas);
    const wallMat = new THREE.MeshToonMaterial({ map: wallTex, side: THREE.DoubleSide });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, 5.0, wallZ);
    wallGroup.add(wallMesh);

    // 2. Framed Photo Posters of NaDream & Badminton Memories!
    const photos = [
      { x: 0, y: 5.6, w: 5.8, h: 3.0, title: '👑 NaDream Birthday 🎂', color: '#ffd700' },
      { x: -5.2, y: 6.0, w: 3.2, h: 2.4, title: '🏸 Badminton Queen', color: '#00f5d4' },
      { x: 5.2, y: 6.0, w: 3.2, h: 2.4, title: '✨ July 20th 2569', color: '#ff6b9b' },
      { x: -4.8, y: 3.0, w: 2.8, h: 2.2, title: '🏸 Quest with Bank', color: '#9d4edd' },
      { x: 4.8, y: 3.0, w: 2.8, h: 2.2, title: '🎉 Happy Birthday!', color: '#ff8c00' }
    ];

    photos.forEach(p => {
      const pGroup = new THREE.Group();
      
      const frameGeo = new THREE.BoxGeometry(p.w + 0.2, p.h + 0.2, 0.08);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      pGroup.add(frameMesh);

      const pCanvas = document.createElement('canvas');
      pCanvas.width = 512;
      pCanvas.height = 384;
      const pCtx = pCanvas.getContext('2d');

      pCtx.fillStyle = '#0f172a';
      pCtx.fillRect(0, 0, 512, 384);

      pCtx.fillStyle = '#ffffff';
      pCtx.fillRect(16, 16, 480, 310);

      const photoGrad = pCtx.createLinearGradient(0, 0, 512, 384);
      photoGrad.addColorStop(0, p.color);
      photoGrad.addColorStop(1, '#1e293b');
      pCtx.fillStyle = photoGrad;
      pCtx.fillRect(24, 24, 464, 250);

      pCtx.fillStyle = '#ffffff';
      pCtx.font = 'bold 44px Arial';
      pCtx.textAlign = 'center';
      pCtx.fillText('🏸', 256, 125);

      pCtx.font = 'bold 28px Prompt, Arial';
      pCtx.fillStyle = '#1e293b';
      pCtx.fillText(p.title, 256, 300);

      const pTex = new THREE.CanvasTexture(pCanvas);
      const pMat = new THREE.MeshBasicMaterial({ map: pTex });
      const pMesh = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), pMat);
      pMesh.position.z = 0.05;
      pGroup.add(pMesh);

      pGroup.position.set(p.x, p.y, wallZ + 0.1);
      wallGroup.add(pGroup);
    });

    this.scene.add(wallGroup);
  }

  initBadmintonComplex() {
    const roomWidth = 38;
    const roomDepth = 28;
    const hallHeight = 9.5;

    for (let r = 0; r < 5; r++) {
      const roomCenterZ = -r * roomDepth - roomDepth / 2;

      const floorGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
      const floorMat = new THREE.MeshToonMaterial({ color: 0x1a202c, side: THREE.DoubleSide });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.set(0, 0, roomCenterZ);
      floorMesh.receiveShadow = true;
      this.scene.add(floorMesh);

      const courtOffsets = [
        { x: -10.5, z: roomCenterZ + 6.5 },
        { x: 10.5, z: roomCenterZ + 6.5 },
        { x: -10.5, z: roomCenterZ - 6.5 },
        { x: 10.5, z: roomCenterZ - 6.5 }
      ];

      courtOffsets.forEach(c => {
        this.createAuthenticBadmintonCourt(c.x, c.z);
      });

      const wallMat = new THREE.MeshToonMaterial({ color: 0x2d3748 });
      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, hallHeight, roomDepth), wallMat);
      leftWall.position.set(-roomWidth / 2, hallHeight / 2, roomCenterZ);
      this.scene.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, hallHeight, roomDepth), wallMat);
      rightWall.position.set(roomWidth / 2, hallHeight / 2, roomCenterZ);
      this.scene.add(rightWall);

      const doorZ = - (r + 1) * roomDepth;
      this.createRoomDividerWall(doorZ, roomWidth, hallHeight);
    }

    const grandCenterZ = -152;
    const grandFloorGeo = new THREE.PlaneGeometry(roomWidth, 26);
    const grandFloorMat = new THREE.MeshToonMaterial({ color: 0x2b6cb0, side: THREE.DoubleSide });
    const grandFloor = new THREE.Mesh(grandFloorGeo, grandFloorMat);
    grandFloor.rotation.x = -Math.PI / 2;
    grandFloor.position.set(0, 0, grandCenterZ);
    grandFloor.receiveShadow = true;
    this.scene.add(grandFloor);

    const stageGeo = new THREE.CylinderGeometry(7.0, 7.0, 0.6, 32);
    const stageMat = new THREE.MeshToonMaterial({ color: 0xffd700 });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.set(0, 0.3, grandCenterZ);
    stage.receiveShadow = true;
    this.scene.add(stage);

    const stageLight = new THREE.PointLight(0xffd700, 2.5, 30);
    stageLight.position.set(0, 5, grandCenterZ);
    this.scene.add(stageLight);
  }

  createAuthenticBadmintonCourt(centerX, centerZ) {
    const courtWidth = 6.1;
    const courtLength = 13.4;

    const matGeo = new THREE.PlaneGeometry(courtWidth, courtLength);
    const matMaterial = new THREE.MeshToonMaterial({ map: this.sharedCourtTexture, side: THREE.DoubleSide });
    const courtMat = new THREE.Mesh(matGeo, matMaterial);
    courtMat.rotation.x = -Math.PI / 2;
    courtMat.position.set(centerX, 0.01, centerZ);
    courtMat.receiveShadow = true;
    this.scene.add(courtMat);

    const netGeo = new THREE.PlaneGeometry(courtWidth + 0.6, 1.55);
    const netMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
    const netMesh = new THREE.Mesh(netGeo, netMat);
    netMesh.position.set(centerX, 0.78, centerZ);
    this.scene.add(netMesh);

    const postMat = new THREE.MeshToonMaterial({ color: 0x1a202c });
    const postLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.55, 12), postMat);
    postLeft.position.set(centerX - courtWidth / 2 - 0.3, 0.78, centerZ);
    this.scene.add(postLeft);

    const postRight = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.55, 12), postMat);
    postRight.position.set(centerX + courtWidth / 2 + 0.3, 0.78, centerZ);
    this.scene.add(postRight);
  }

  createRoomDividerWall(zPos, roomWidth, hallHeight) {
    const wallMat = new THREE.MeshToonMaterial({ color: 0x2d3748 });
    const doorWidth = 8.0;
    const sideWallWidth = (roomWidth - doorWidth) / 2;

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(sideWallWidth, hallHeight, 0.8), wallMat);
    leftWall.position.set(-doorWidth / 2 - sideWallWidth / 2, hallHeight / 2, zPos);
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(sideWallWidth, hallHeight, 0.8), wallMat);
    rightWall.position.set(doorWidth / 2 + sideWallWidth / 2, hallHeight / 2, zPos);
    this.scene.add(rightWall);

    const header = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, 2.5, 0.8), wallMat);
    header.position.set(0, hallHeight - 1.25, zPos);
    this.scene.add(header);
  }

  initSecretDoorBarriers() {
    const doorZPositions = [-28, -56, -84, -112, -140];
    const doorColors = [0xff0054, 0x9d4edd, 0x00f5d4, 0xffd700, 0xff6b9b];

    doorZPositions.forEach((zPos, idx) => {
      const doorGroup = new THREE.Group();
      const doorMat = new THREE.MeshToonMaterial({ color: doorColors[idx] });

      const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(4.0, 7.0, 0.5), doorMat);
      leftPanel.position.set(-2.0, 3.5, 0);

      const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(4.0, 7.0, 0.5), doorMat);
      rightPanel.position.set(2.0, 3.5, 0);

      doorGroup.add(leftPanel);
      doorGroup.add(rightPanel);

      const lightBeam = new THREE.PointLight(doorColors[idx], 0, 25);
      lightBeam.position.set(0, 3.5, zPos - 2.0);
      this.scene.add(lightBeam);

      doorGroup.position.set(0, 0, zPos);

      doorGroup.userData = { 
        id: idx + 1, 
        zPos, 
        unlocked: false, 
        leftPanel, 
        rightPanel, 
        openProgress: 0,
        lightBeam
      };

      this.scene.add(doorGroup);
      this.doors.push(doorGroup);
    });
  }

  initQuestMarkers() {
    const questZPositions = [-14, -42, -70, -98, -126];

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
      sprite.position.set(0, 3.5, zPos);
      sprite.scale.set(2.4, 2.4, 1);
      sprite.userData = { questNum, baseY: 3.5 };

      this.scene.add(sprite);
      this.questMarkers.push(sprite);
    });
  }

  unlockBarrier(index) {
    const door = this.doors[index - 1];
    if (door && !door.userData.unlocked) {
      door.userData.unlocked = true;
    }
  }

  getActiveBarrierZ() {
    for (let i = 0; i < this.doors.length; i++) {
      if (!this.doors[i].userData.unlocked) {
        return this.doors[i].userData.zPos + 0.3;
      }
    }
    return -1000;
  }

  update(time) {
    this.questMarkers.forEach(marker => {
      marker.position.y = marker.userData.baseY + Math.sin(time * 0.003 + marker.userData.questNum) * 0.25;
    });

    this.doors.forEach(door => {
      if (door.userData.unlocked && door.userData.openProgress < 1.0) {
        door.userData.openProgress += 0.04;
        const slideX = door.userData.openProgress * 3.6;
        door.userData.leftPanel.position.x = -2.0 - slideX;
        door.userData.rightPanel.position.x = 2.0 + slideX;

        door.userData.lightBeam.intensity = door.userData.openProgress * 4.5;
      }
    });
  }
}

window.CourtWorld = CourtWorld;
