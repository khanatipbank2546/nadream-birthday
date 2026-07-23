/* ==========================================================================
   3D Indoor Badminton Complex - Guaranteed Photos & Unlit 3D Gold Stars
   ========================================================================== */

class CourtWorld {
  constructor(scene) {
    this.scene = scene;
    this.doors = [];
    this.questMarkers = [];
    this.checkpointPads = [];
    this.giftBoxPads = [];
    this.artFrames = [];
    this.photoGalleryWallGroup = null;
    this.activePathArrow = null;

    this.sharedCourtTexture = this.createSharedCourtTexture();
    this.textureLoader = new THREE.TextureLoader();

    try {
      this.initLighting();
      this.initBadmintonComplex();
      this.initPhotoGalleryWall();
      this.initArtGalleryPhotos();
      this.initSecretDoorBarriers();
      this.initGiftBoxQuestMarkers();
      this.initCheckpointPadsAndArrows();
    } catch (err) {
      console.error("CourtWorld Init Error handled gracefully:", err);
    }
  }

  createSharedCourtTexture() {
    try {
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
    } catch (e) {
      return null;
    }
  }

  initLighting() {
    const ambient = new THREE.AmbientLight(0x405068, 0.85);
    this.scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xfffae6, 0.9);
    sunLight.position.set(10, 35, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    this.scene.add(sunLight);

    this.showcaseLight = new THREE.PointLight(0xfff0c2, 1.4, 30);
    this.showcaseLight.position.set(0, 7, -12);
    this.scene.add(this.showcaseLight);

    this.scene.fog = new THREE.FogExp2(0x1a202c, 0.005);
  }

  initPhotoGalleryWall() {
    this.photoGalleryWallGroup = new THREE.Group();
    const wallZ = -20.0;

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
    this.photoGalleryWallGroup.add(wallMesh);

    // Guaranteed 5 Pre-Game Feature Wall Photos (NO TITLES/PLAQUES, JUST FRAMED PHOTOS)
    const bgPhotos = [
      { x: 0, y: 5.6, w: 5.8, h: 3.2, path: 'background/11.jpg' },
      { x: -5.2, y: 6.0, w: 3.2, h: 2.4, path: 'background/12.jpg' },
      { x: 5.2, y: 6.0, w: 3.2, h: 2.4, path: 'background/13.jpg' },
      { x: -4.8, y: 3.0, w: 2.8, h: 2.2, path: 'background/14.jpg' },
      { x: 4.8, y: 3.0, w: 2.8, h: 2.2, path: 'background/15.jpg' }
    ];

    bgPhotos.forEach(p => {
      const pGroup = new THREE.Group();
      
      const frameGeo = new THREE.BoxGeometry(p.w + 0.2, p.h + 0.2, 0.08);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      pGroup.add(frameMesh);

      const picGeo = new THREE.PlaneGeometry(p.w, p.h);
      this.textureLoader.load(encodeURI(p.path), (tex) => {
        const picMat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
        const picMesh = new THREE.Mesh(picGeo, picMat);
        picMesh.position.z = 0.05;
        pGroup.add(picMesh);
      }, undefined, () => {
        // Fallback to pic/ photos if background/ has any issue
        this.textureLoader.load(encodeURI('pic/เจ๊สมคิด.jpg'), (tex) => {
          const picMat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
          const picMesh = new THREE.Mesh(picGeo, picMat);
          picMesh.position.z = 0.05;
          pGroup.add(picMesh);
        });
      });

      pGroup.position.set(p.x, p.y, wallZ + 0.1);
      this.photoGalleryWallGroup.add(pGroup);
    });

    this.scene.add(this.photoGalleryWallGroup);
  }

  hidePhotoGalleryWall() {
    if (this.photoGalleryWallGroup) {
      this.scene.remove(this.photoGalleryWallGroup);
    }
  }

  initArtGalleryPhotos() {
    // 10 Exact Thai Photo Filenames & Explicit Plaque Titles
    const photoItems = [
      { path: 'pic/เจ๊สมคิด.jpg', title: 'เจ๊สมคิด' },
      { path: 'pic/แช้มแรกป่ะ.jpg', title: 'แช้มแรกป่ะ' },
      { path: 'pic/ณเดช.jpg', title: 'ณเดช' },
      { path: 'pic/เด็กใหม่.jpg', title: 'เด็กใหม่' },
      { path: 'pic/นิ้วเกิน.jpg', title: 'นิ้วเกิน' },
      { path: 'pic/พี่หล่อไหมน้อง.jpg', title: 'พี่หล่อไหมน้อง' },
      { path: 'pic/แพ้ทุกเกมครับ555.jpg', title: 'แพ้ทุกเกมครับ555' },
      { path: 'pic/ยิ้มกระชากกระเป๋า.jpg', title: 'ยิ้มกระชากกระเป๋า' },
      { path: 'pic/เล-กง เล-โก้.jpg', title: 'เล-กง เล-โก้' },
      { path: 'pic/เสื้อเทพ.jpg', title: 'เสื้อเทพ' }
    ];

    const roomDepth = 28;

    for (let r = 0; r < 5; r++) {
      const roomCenterZ = -r * roomDepth - roomDepth / 2;
      const leftItem = photoItems[r * 2];
      const rightItem = photoItems[r * 2 + 1];

      const leftFrame = this.createWallArtFrame(-18.45, 4.5, roomCenterZ, Math.PI / 2, leftItem.path, leftItem.title, r * 2 + 1);
      this.artFrames.push(leftFrame);

      const rightFrame = this.createWallArtFrame(18.45, 4.5, roomCenterZ, -Math.PI / 2, rightItem.path, rightItem.title, r * 2 + 2);
      this.artFrames.push(rightFrame);
    }
  }

  // Create Extruded 3D Vector Gold Star Mesh (Ultra Glowing & Bright)
  create3DStarMesh() {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.36;
    const innerRadius = 0.14;

    for (let i = 0; i < points * 2; i++) {
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = { depth: 0.12, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    return new THREE.Mesh(geo, mat);
  }

  createWallArtFrame(xPos, yPos, zPos, rotationY, imagePath, displayTitle, artIndex) {
    const artGroup = new THREE.Group();
    const cleanTitle = displayTitle;

    const frameGeo = new THREE.BoxGeometry(3.1, 4.0, 0.12);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    artGroup.add(frameMesh);

    const picGeo = new THREE.PlaneGeometry(2.8, 3.6);
    
    this.textureLoader.load(encodeURI(imagePath), (tex) => {
      const picMat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
      const picMesh = new THREE.Mesh(picGeo, picMat);
      picMesh.position.z = 0.07;
      artGroup.add(picMesh);
    }, undefined, () => {
      const fallbackMat = new THREE.MeshBasicMaterial({ color: 0x3a86ff, side: THREE.DoubleSide });
      const picMesh = new THREE.Mesh(picGeo, fallbackMat);
      picMesh.position.z = 0.07;
      artGroup.add(picMesh);
    });

    // Plaque Mesh displaying exact Thai Title (e.g. "เจ๊สมคิด", "แช้มแรกป่ะ")
    const plaqueGeo = new THREE.BoxGeometry(2.8, 0.52, 0.08);
    let plaqueMesh = null;

    const renderPlaqueTexture = (starsScore = 0) => {
      const plaqueCanvas = document.createElement('canvas');
      plaqueCanvas.width = 512;
      plaqueCanvas.height = 96;
      const pCtx = plaqueCanvas.getContext('2d');

      pCtx.fillStyle = '#0f172a';
      pCtx.fillRect(0, 0, 512, 96);
      pCtx.strokeStyle = '#ffd700';
      pCtx.lineWidth = 5;
      pCtx.strokeRect(4, 4, 504, 88);

      const titleText = starsScore > 0 ? `${cleanTitle} (${'★'.repeat(starsScore)})` : cleanTitle;
      pCtx.fillStyle = '#ffffff';
      pCtx.font = 'bold 30px Prompt, Arial';
      pCtx.textAlign = 'center';
      pCtx.textBaseline = 'middle';
      pCtx.fillText(titleText, 256, 48);

      const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
      if (plaqueMesh) {
        plaqueMesh.material.map = plaqueTex;
        plaqueMesh.material.needsUpdate = true;
      }
      return plaqueTex;
    };

    const initialPlaqueTex = renderPlaqueTexture(0);
    const plaqueMat = new THREE.MeshStandardMaterial({ map: initialPlaqueTex });
    plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaqueMesh.position.set(0, -2.3, 0.06);
    artGroup.add(plaqueMesh);

    const spotlight = new THREE.SpotLight(0xfffae6, 1.6, 14, Math.PI / 4, 0.4);
    spotlight.position.set(xPos > 0 ? xPos - 2 : xPos + 2, yPos + 3, zPos);
    spotlight.target = frameMesh;
    this.scene.add(spotlight);

    // REAL 3D Extruded Gold Star Badge Row floating directly above the Frame!
    let starBadgeGroup = null;

    artGroup.position.set(xPos, yPos, zPos);
    artGroup.rotation.y = rotationY;

    artGroup.userData = {
      artIndex,
      cleanTitle,
      imagePath,
      xPos,
      yPos,
      zPos,
      addStarBadge: (score) => {
        if (starBadgeGroup) artGroup.remove(starBadgeGroup);
        starBadgeGroup = new THREE.Group();

        const count = Math.max(1, Math.min(5, score));
        const spacing = 0.65;
        const startX = -((count - 1) * spacing) / 2;

        for (let i = 0; i < count; i++) {
          const starMesh = this.create3DStarMesh();
          starMesh.position.set(startX + i * spacing, 2.35, 0.14);
          starMesh.position.y += Math.sin((i / (count - 1 || 1)) * Math.PI) * 0.18;
          starBadgeGroup.add(starMesh);
        }

        artGroup.add(starBadgeGroup);
        renderPlaqueTexture(count);
      },
      resetFrame: () => {
        if (starBadgeGroup) artGroup.remove(starBadgeGroup);
        starBadgeGroup = null;
        renderPlaqueTexture(0);
      }
    };

    this.scene.add(artGroup);
    return artGroup;
  }

  initCheckpointPadsAndArrows() {
    const roomDepth = 28;

    for (let r = 0; r < 5; r++) {
      const roomCenterZ = -r * roomDepth - roomDepth / 2;

      // Photo Art Standing Pads
      const padLeft = this.createStandingPad(-16.0, 0.02, roomCenterZ, r * 2 + 1);
      this.checkpointPads.push(padLeft);

      const padRight = this.createStandingPad(16.0, 0.02, roomCenterZ, r * 2 + 2);
      this.checkpointPads.push(padRight);

      // Dedicated Gift Box Floor Standing Pad in Room Center!
      const giftBoxPad = this.createStandingPad(0, 0.02, roomCenterZ, 100 + r + 1);
      this.giftBoxPads.push(giftBoxPad);
    }

    this.activePathArrow = this.createPathArrowMesh(0, 0, 0);
  }

  createStandingPad(xPos, yPos, zPos, padIndex) {
    const padGroup = new THREE.Group();

    const padGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.04, 32);
    const padMat = new THREE.MeshStandardMaterial({ 
      color: 0x00f5d4, 
      emissive: 0x00f5d4, 
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85 
    });
    const padMesh = new THREE.Mesh(padGeo, padMat);
    padGroup.add(padMesh);

    const ringGeo = new THREE.TorusGeometry(1.85, 0.06, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    padGroup.add(ringMesh);

    padGroup.position.set(xPos, yPos, zPos);
    padGroup.userData = { padIndex, xPos, zPos, padMat };
    padGroup.visible = false;

    this.scene.add(padGroup);
    return padGroup;
  }

  createPathArrowMesh(xPos, yPos, zPos) {
    const arrowGroup = new THREE.Group();

    const shape = new THREE.Shape();
    shape.moveTo(0, 1.4);
    shape.lineTo(0.9, 0);
    shape.lineTo(0.35, 0);
    shape.lineTo(0.35, -1.2);
    shape.lineTo(-0.35, -1.2);
    shape.lineTo(-0.35, 0);
    shape.lineTo(-0.9, 0);
    shape.closePath();

    const geo = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    arrowGroup.add(mesh);

    arrowGroup.position.set(xPos, yPos, zPos);
    arrowGroup.visible = false;

    this.scene.add(arrowGroup);
    return arrowGroup;
  }

  updatePathArrow(playerPos, targetPos) {
    if (!this.activePathArrow) return;

    if (targetPos && (targetPos.x !== 0 || targetPos.z !== 0)) {
      const dirX = targetPos.x - playerPos.x;
      const dirZ = targetPos.z - playerPos.z;
      const dist = Math.hypot(dirX, dirZ);

      if (dist > 1.2) {
        this.activePathArrow.visible = true;

        const normX = dirX / dist;
        const normZ = dirZ / dist;

        this.activePathArrow.position.set(
          playerPos.x + normX * 1.8,
          0.04,
          playerPos.z + normZ * 1.8
        );

        const angle = Math.atan2(dirX, dirZ) + Math.PI;
        this.activePathArrow.rotation.y = angle;

        const pulse = 1.0 + Math.sin(Date.now() * 0.008) * 0.2;
        this.activePathArrow.scale.set(pulse, pulse, pulse);
      } else {
        this.activePathArrow.visible = false;
      }
    } else {
      this.activePathArrow.visible = false;
    }
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
    const matMaterial = this.sharedCourtTexture 
      ? new THREE.MeshToonMaterial({ map: this.sharedCourtTexture, side: THREE.DoubleSide })
      : new THREE.MeshToonMaterial({ color: 0x0b8457, side: THREE.DoubleSide });

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
      
      const doorMat = new THREE.MeshToonMaterial({ color: 0x2d3748 });
      const seamMat = new THREE.MeshBasicMaterial({ color: 0x1a202c });

      const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(4.0, 7.0, 0.5), doorMat);
      leftPanel.position.set(-2.0, 3.5, 0);

      const leftSeam = new THREE.Mesh(new THREE.BoxGeometry(0.06, 7.0, 0.52), seamMat);
      leftSeam.position.set(1.98, 0, 0);
      leftPanel.add(leftSeam);

      const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(4.0, 7.0, 0.5), doorMat);
      rightPanel.position.set(2.0, 3.5, 0);

      const rightSeam = new THREE.Mesh(new THREE.BoxGeometry(0.06, 7.0, 0.52), seamMat);
      rightSeam.position.set(-1.98, 0, 0);
      rightPanel.add(rightSeam);

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

  initGiftBoxQuestMarkers() {
    const questZPositions = [-14, -42, -70, -98, -126];

    questZPositions.forEach((zPos, idx) => {
      const questNum = idx + 1;
      const boxGroup = new THREE.Group();

      const boxGeo = new THREE.BoxGeometry(1.0, 0.8, 1.0);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.3 });
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      boxMesh.position.y = -0.1;
      boxGroup.add(boxMesh);

      const lidGroup = new THREE.Group();
      const lidGeo = new THREE.BoxGeometry(1.06, 0.22, 1.06);
      const lidMesh = new THREE.Mesh(lidGeo, boxMat);
      lidMesh.position.y = 0.41;
      lidGroup.add(lidMesh);

      const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.85, roughness: 0.2 });
      
      const ribbonH = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.23, 0.2), ribbonMat);
      ribbonH.position.y = 0.41;
      lidGroup.add(ribbonH);

      const ribbonV = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.23, 1.08), ribbonMat);
      ribbonV.position.y = 0.41;
      lidGroup.add(ribbonV);

      const bowLeft = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 8, 16), ribbonMat);
      bowLeft.position.set(-0.16, 0.62, 0);
      bowLeft.rotation.z = Math.PI / 4;
      lidGroup.add(bowLeft);

      const bowRight = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 8, 16), ribbonMat);
      bowRight.position.set(0.16, 0.62, 0);
      bowRight.rotation.z = -Math.PI / 4;
      lidGroup.add(bowRight);

      const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), ribbonMat);
      bowCenter.position.set(0, 0.58, 0);
      lidGroup.add(bowCenter);

      boxGroup.add(lidGroup);

      const burstLight = new THREE.PointLight(0xffd700, 0, 15);
      burstLight.position.set(0, 0.5, 0);
      boxGroup.add(burstLight);

      boxGroup.position.set(0, 2.5, zPos);
      boxGroup.userData = { questNum, baseY: 2.5, lidGroup, burstLight, openingProgress: 0 };

      boxGroup.visible = false;

      this.scene.add(boxGroup);
      this.questMarkers.push(boxGroup);
    });
  }

  showGiftBoxForRoom(roomIdx) {
    if (this.questMarkers[roomIdx]) {
      this.questMarkers[roomIdx].visible = true;
    }
    if (this.giftBoxPads[roomIdx]) {
      this.giftBoxPads[roomIdx].visible = true;
    }
  }

  animateGiftBoxOpening(roomIdx, progress) {
    const boxGroup = this.questMarkers[roomIdx];
    if (boxGroup && boxGroup.userData.lidGroup) {
      boxGroup.userData.openingProgress = progress;
      const lid = boxGroup.userData.lidGroup;

      lid.position.y = progress * 2.5;
      lid.rotation.x = progress * Math.PI * 0.5;
      lid.rotation.z = progress * Math.PI * 0.25;

      if (boxGroup.userData.burstLight) {
        boxGroup.userData.burstLight.intensity = Math.sin(progress * Math.PI) * 6.0;
      }
    }
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
      if (marker.visible) {
        if (marker.userData.openingProgress === 0) {
          marker.position.y = marker.userData.baseY + Math.sin(time * 0.003 + marker.userData.questNum) * 0.25;
          marker.rotation.y += 0.012;
        }
      }
    });

    this.checkpointPads.forEach(pad => {
      if (pad.visible) {
        pad.userData.padMat.emissiveIntensity = 0.5 + Math.sin(time * 0.005) * 0.3;
      }
    });

    this.giftBoxPads.forEach(pad => {
      if (pad.visible) {
        pad.userData.padMat.emissiveIntensity = 0.6 + Math.sin(time * 0.006) * 0.3;
      }
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

  resetWorld() {
    // Reset doors
    this.doors.forEach(door => {
      door.userData.unlocked = false;
      door.userData.openProgress = 0;
      if (door.userData.leftPanel) door.userData.leftPanel.position.set(-2.0, 3.5, 0);
      if (door.userData.rightPanel) door.userData.rightPanel.position.set(2.0, 3.5, 0);
      if (door.userData.lightBeam) door.userData.lightBeam.intensity = 0;
    });

    // Reset gift boxes
    this.questMarkers.forEach(box => {
      box.visible = false;
      box.userData.openingProgress = 0;
      if (box.userData.lidGroup) {
        box.userData.lidGroup.position.set(0, 0, 0);
        box.userData.lidGroup.rotation.set(0, 0, 0);
      }
      if (box.userData.burstLight) {
        box.userData.burstLight.intensity = 0;
      }
    });

    // Reset art frames
    this.artFrames.forEach(frame => {
      if (frame.userData && frame.userData.resetFrame) {
        frame.userData.resetFrame();
      }
    });
  }
}

window.CourtWorld = CourtWorld;
