/* ==========================================================================
   Quest Manager - Sequential Checkpoint Pad Toggle & 3D Star Badge Attachment
   ========================================================================== */

class QuestManager {
  constructor(courtWorld, bankNPC) {
    this.courtWorld = courtWorld;
    this.bankNPC = bankNPC;

    // Current State
    this.currentRoom = 1; // Room 1 to 5
    this.roomSubState = 'ART_1'; // 'ART_1' -> 'ART_2' -> 'GIFT_BOX' -> 'ROOM_COMPLETE'
    this.currentQuestIndex = 0;
    this.totalQuests = 5;

    this.activeTargetPos = new THREE.Vector3(0, 0, 0);
    this.isNearTarget = false;
    this.isProcessingCutscene = false;

    this.initHUD();
    this.startRoomQuest(1);
  }

  initHUD() {
    this.questTitleEl = document.getElementById('current-quest-title');
    this.questCountEl = document.getElementById('quest-count');
    this.questProgressFill = document.getElementById('quest-progress-fill');
    
    this.actionPrompt = document.getElementById('action-prompt');
    this.actionBtn = document.getElementById('action-prompt-btn');
    this.actionText = document.getElementById('action-prompt-text');

    if (this.actionBtn) {
      this.actionBtn.addEventListener('click', () => {
        this.handleActionClick();
      });
    }
  }

  startRoomQuest(roomNum) {
    this.currentRoom = roomNum;
    this.roomSubState = 'ART_1';

    // Hide all checkpoint pads and gift boxes first
    this.courtWorld.checkpointPads.forEach(pad => pad.visible = false);
    this.courtWorld.questMarkers.forEach(box => box.visible = false);

    // Show Checkpoint Pad #1 (Left Wall)
    const pad1Index = (roomNum - 1) * 2;
    if (this.courtWorld.checkpointPads[pad1Index]) {
      this.courtWorld.checkpointPads[pad1Index].visible = true;
      const p = this.courtWorld.checkpointPads[pad1Index].userData;
      this.activeTargetPos.set(p.xPos, 0, p.zPos);
    }

    this.updateTrackerText();
  }

  updateTrackerText() {
    if (this.questCountEl) {
      this.questCountEl.innerText = `${this.currentQuestIndex}/${this.totalQuests}`;
    }
    if (this.questProgressFill) {
      this.questProgressFill.style.width = `${(this.currentQuestIndex / this.totalQuests) * 100}%`;
    }

    if (this.currentRoom <= 5) {
      if (this.roomSubState === 'ART_1') {
        if (this.questTitleEl) this.questTitleEl.innerText = `📌 ห้องที่ ${this.currentRoom}: เดินไปที่จุด Checkpoint ฝั่งซ้าย เพื่อชมและให้คะแนนรูปศิลปะ #1`;
      } else if (this.roomSubState === 'ART_2') {
        if (this.questTitleEl) this.questTitleEl.innerText = `📌 ห้องที่ ${this.currentRoom}: เดินไปที่จุด Checkpoint ฝั่งขวา เพื่อชมและให้คะแนนรูปศิลปะ #2`;
      } else if (this.roomSubState === 'GIFT_BOX') {
        if (this.questTitleEl) this.questTitleEl.innerText = `🎁 ห้องที่ ${this.currentRoom}: เดินไปเปิดกล่องของขวัญกลางห้องเพื่อปลดล็อคประตูห้องถัดไป!`;
      }
    } else {
      if (this.questTitleEl) this.questTitleEl.innerText = `👑 เดินเข้าสู่ห้องโถงแชมเปียน เพื่อพูดคุยกับ Bank!`;
      this.activeTargetPos.set(0, 0, -152);
    }
  }

  checkProximity(playerPos) {
    if (this.isProcessingCutscene) return;

    if (this.currentRoom <= 5) {
      if (this.roomSubState === 'ART_1' || this.roomSubState === 'ART_2') {
        const artIdx = (this.currentRoom - 1) * 2 + (this.roomSubState === 'ART_1' ? 0 : 1);
        const pad = this.courtWorld.checkpointPads[artIdx];

        if (pad && pad.visible) {
          const dist = Math.hypot(playerPos.x - pad.userData.xPos, playerPos.z - pad.userData.zPos);
          if (dist < 2.8) {
            this.showActionPrompt(`🎨 ชมและให้คะแนนรูปภาพ #${artIdx + 1}`);
            this.isNearTarget = true;
            return;
          }
        }
      } else if (this.roomSubState === 'GIFT_BOX') {
        const box = this.courtWorld.questMarkers[this.currentRoom - 1];
        if (box && box.visible) {
          const dist = Math.hypot(playerPos.x - box.position.x, playerPos.z - box.position.z);
          if (dist < 3.2) {
            this.showActionPrompt(`🎁 เปิดกล่องของขวัญประจำห้อง #${this.currentRoom}`);
            this.isNearTarget = true;
            return;
          }
        }
      }
    } else {
      // Near Bank NPC in Grand Hall
      const dist = Math.hypot(playerPos.x - 0, playerPos.z - (-152));
      if (dist < 3.5) {
        this.showActionPrompt(`🏸 พูดคุยกับ Bank (Happy Birthday!)`);
        this.isNearTarget = true;
        return;
      }
    }

    this.hideActionPrompt();
    this.isNearTarget = false;
  }

  showActionPrompt(text) {
    if (this.actionPrompt) {
      this.actionPrompt.classList.remove('hidden');
      if (this.actionText) this.actionText.innerText = text;
    }
  }

  hideActionPrompt() {
    if (this.actionPrompt) {
      this.actionPrompt.classList.add('hidden');
    }
  }

  handleActionClick() {
    if (this.isProcessingCutscene) return;

    if (this.currentRoom <= 5) {
      if (this.roomSubState === 'ART_1' || this.roomSubState === 'ART_2') {
        const artIdx = (this.currentRoom - 1) * 2 + (this.roomSubState === 'ART_1' ? 0 : 1);
        const artFrame = this.courtWorld.artFrames[artIdx];

        if (artFrame && window.game) {
          this.hideActionPrompt();
          this.isProcessingCutscene = true;

          // Launch 6-Second 3D Camera Orbit Preview Cutscene!
          window.game.startPhotoPreviewCutscene(artFrame.userData, () => {
            // After 6-second preview, open Interactive 5-Star Rating Modal Popup!
            if (window.showStarRatingModal) {
              window.showStarRatingModal(artFrame.userData.imagePath, artFrame.userData.cleanTitle, (ratedScore) => {
                // Attach 3D Gold Star Badge above the frame in the 3D world!
                if (artFrame.userData.addStarBadge) {
                  artFrame.userData.addStarBadge(ratedScore || 5);
                }

                this.isProcessingCutscene = false;
                this.advanceRoomSubState();
              });
            }
          });
        }
      } else if (this.roomSubState === 'GIFT_BOX') {
        this.hideActionPrompt();
        this.isProcessingCutscene = true;

        // Launch Grand Gift Box Opening Cutscene!
        if (window.game) {
          window.game.startGiftBoxOpeningCutscene(this.currentRoom, () => {
            this.courtWorld.unlockBarrier(this.currentRoom);
            if (window.soundEngine) window.soundEngine.playQuestComplete();

            this.currentQuestIndex++;
            this.currentRoom++;

            if (this.currentRoom <= 5) {
              this.startRoomQuest(this.currentRoom);
            } else {
              this.roomSubState = 'COMPLETE';
              this.updateTrackerText();
            }

            this.isProcessingCutscene = false;
          });
        }
      }
    } else {
      // Interact with Bank NPC
      if (window.showNPCModal) window.showNPCModal();
    }
  }

  advanceRoomSubState() {
    if (this.roomSubState === 'ART_1') {
      this.roomSubState = 'ART_2';

      // Hide Pad #1 (Left Wall), Show Pad #2 (Right Wall)
      const pad1Index = (this.currentRoom - 1) * 2;
      const pad2Index = pad1Index + 1;

      if (this.courtWorld.checkpointPads[pad1Index]) {
        this.courtWorld.checkpointPads[pad1Index].visible = false;
      }
      if (this.courtWorld.checkpointPads[pad2Index]) {
        this.courtWorld.checkpointPads[pad2Index].visible = true;
        const p = this.courtWorld.checkpointPads[pad2Index].userData;
        this.activeTargetPos.set(p.xPos, 0, p.zPos);
      }

      this.updateTrackerText();

    } else if (this.roomSubState === 'ART_2') {
      this.roomSubState = 'GIFT_BOX';

      // Hide Pad #2, Spawn 3D Gift Box in room center with cutscene!
      const pad2Index = (this.currentRoom - 1) * 2 + 1;
      if (this.courtWorld.checkpointPads[pad2Index]) {
        this.courtWorld.checkpointPads[pad2Index].visible = false;
      }

      this.courtWorld.showGiftBoxForRoom(this.currentRoom - 1);
      const box = this.courtWorld.questMarkers[this.currentRoom - 1];
      if (box) {
        this.activeTargetPos.set(box.position.x, 0, box.position.z);
      }

      if (window.game) {
        window.game.startGiftBoxSpawnCutscene(box.position);
      }

      this.updateTrackerText();
    }
  }
}

window.QuestManager = QuestManager;
