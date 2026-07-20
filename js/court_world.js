/* ==========================================================================
   3D Indoor Badminton Complex - Spacious Rooms, Secret Doors & Light Beams
   ========================================================================== */

class CourtWorld {
  constructor(scene) {
    this.scene = scene;
    this.doors = []; // Array of secret door objects with light beams
    this.questMarkers = [];

    this.initLighting();
    this.initBadmintonComplex();
    this.initSecretDoorBarriers();
    this.initQuestMarkers();
  }

  initLighting() {
    const ambient = new THREE.AmbientLight(0x2d3748, 0.75);
    this.scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xfffae6, 0.95);
    sunLight.position.set(10, 30, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    this.scene.add(sunLight);

    this.scene.fog = new THREE.FogExp2(0x1a202c, 0.010);
  }

  initBadmintonComplex() {
    const roomWidth = 38; // 38 meters wide (Spacious!)
    const roomDepth = 28; // 28 meters depth per room
    const hallHeight = 9.5;

    // Build 5 Rooms (Room 1 to Room 5)
    for (let r = 0; r < 5; r++) {
      const roomCenterZ = -r * roomDepth - roomDepth / 2;

      // 1. Floor Base
      const floorGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
      const floorMat = new THREE.MeshToonMaterial({ color: 0x1a202c, side: THREE.DoubleSide });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.set(0, 0, roomCenterZ);
      floorMesh.receiveShadow = true;
      this.scene.add(floorMesh);

      // 2. 4 Authentic Badminton Courts spaced widely apart!
      const courtOffsets = [
        { x: -10.5, z: roomCenterZ + 6.5 },  // Court 1
        { x: 10.5, z: roomCenterZ + 6.5 },   // Court 2
        { x: -10.5, z: roomCenterZ - 6.5 },  // Court 3
        { x: 10.5, z: roomCenterZ - 6.5 }    // Court 4
      ];

      courtOffsets.forEach(c => {
        this.createAuthenticBadmintonCourt(c.x, c.z);
      });

      // 3. Side Walls
      const wallMat = new THREE.MeshToonMaterial({ color: 0x2d3748 });
      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, hallHeight, roomDepth), wallMat);
      leftWall.position.set(-roomWidth / 2, hallHeight / 2, roomCenterZ);
      this.scene.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, hallHeight, roomDepth), wallMat);
      rightWall.position.set(roomWidth / 2, hallHeight / 2, roomCenterZ);
      this.scene.add(rightWall);

      // 4. LED Ceiling Lights
      courtOffsets.forEach(c => {
        const ledLight = new THREE.PointLight(0xffffff, 0.8, 18);
        ledLight.position.set(c.x, 8.0, c.z);
        this.scene.add(ledLight);
      });

      // 5. Secret Door Wall Divider
      const doorZ = - (r + 1) * roomDepth;
      this.createRoomDividerWall(doorZ, roomWidth, hallHeight);
    }

    // 6. Grand Winner's Sanctuary for Bank NPC (Z = -140 to -165)
    const grandCenterZ = -152;
    const grandFloorGeo = new THREE.PlaneGeometry(roomWidth, 26);
    const grandFloorMat = new THREE.MeshToonMaterial({ color: 0x2b6cb0, side: THREE.DoubleSide });
    const grandFloor = new THREE.Mesh(grandFloorGeo, grandFloorMat);
    grandFloor.rotation.x = -Math.PI / 2;
    grandFloor.position.set(0, 0, grandCenterZ);
    grandFloor.receiveShadow = true;
    this.scene.add(grandFloor);

    // Gold Winner's Stage
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
    const matMaterial = new THREE.MeshToonMaterial({ color: 0x0b8457, side: THREE.DoubleSide });
    const courtMat = new THREE.Mesh(matGeo, matMaterial);
    courtMat.rotation.x = -Math.PI / 2;
    courtMat.position.set(centerX, 0.01, centerZ);
    courtMat.receiveShadow = true;
    this.scene.add(courtMat);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 512, 1024);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;

    ctx.strokeRect(10, 10, 492, 1004);
    ctx.strokeRect(35, 10, 442, 1004);

    ctx.beginPath();
    ctx.moveTo(10, 512);
    ctx.lineTo(502, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(10, 364);
    ctx.lineTo(502, 364);
    ctx.moveTo(10, 660);
    ctx.lineTo(502, 660);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(256, 10);
    ctx.lineTo(256, 364);
    ctx.moveTo(256, 660);
    ctx.lineTo(256, 1014);
    ctx.stroke();

    const lineTex = new THREE.CanvasTexture(canvas);
    const lineGeo = new THREE.PlaneGeometry(courtWidth, courtLength);
    const lineMat = new THREE.MeshBasicMaterial({ map: lineTex, transparent: true, side: THREE.DoubleSide });
    const linesMesh = new THREE.Mesh(lineGeo, lineMat);
    linesMesh.rotation.x = -Math.PI / 2;
    linesMesh.position.set(centerX, 0.02, centerZ);
    this.scene.add(linesMesh);

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

  // Secret Door Barriers & Radiant Light Beams
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

      // Radiant Light Beam Emitter Light behind secret door
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

  // Floating Checkpoint Markers in Room Center
  initQuestMarkers() {
    // Checkpoints in the EXACT CENTER of each room!
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

    // Animate sliding doors & radiant light beams bursting out!
    this.doors.forEach(door => {
      if (door.userData.unlocked && door.userData.openProgress < 1.0) {
        door.userData.openProgress += 0.04;
        const slideX = door.userData.openProgress * 3.6;
        door.userData.leftPanel.position.x = -2.0 - slideX;
        door.userData.rightPanel.position.x = 2.0 + slideX;

        // Flare up light beam behind doorway
        door.userData.lightBeam.intensity = door.userData.openProgress * 4.5;
      }
    });
  }
}

window.CourtWorld = CourtWorld;
