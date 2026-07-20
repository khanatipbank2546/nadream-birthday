/* ==========================================================================
   Quest Manager - Instant Pad #2 Activation & Arrow Direction Update
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

    // Hide all art pads, gift box pads, and gift boxes
    if (this.courtWorld.checkpointPads) this.courtWorld.checkpointPads.forEach(pad => pad.visible = false);
    if (this.courtWorld.giftBoxPads) this.courtWorld.giftBoxPads.forEach(pad => pad.visible = false);
    if (this.courtWorld.questMarkers) this.courtWorld.questMarkers.forEach(box => box.visible = false);

    // Show Checkpoint Pad #1 (Left Wall)
    const pad1Index = (roomNum - 1) * 2;
    if (this.courtWorld.checkpointPads && this.courtWorld.checkpointPads[pad1Index]) {
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
        if (this.questTitleEl) this.questTitleEl.innerText = `📌 ห้องที่ ${this.currentRoom}: เดินไปเหยียบจุด Checkpoint ฝั่งซ้าย เพื่อชมและให้คะแนนรูปภาพ #1`;
      } else if (this.roomSubState === 'ART_2') {
        if (this.questTitleEl) this.questTitleEl.innerText = `📌 ห้องที่ ${this.currentRoom}: เดินไปเหยียบจุด Checkpoint ฝั่งขวา เพื่อชมและให้คะแนนรูปภาพ #2`;
      } else if (this.roomSubState === 'GIFT_BOX') {
        if (this.questTitleEl) this.questTitleEl.innerText = `🎁 ห้องที่ ${this.currentRoom}: เดินไปเหยียบจุด Checkpoint กล่องของขวัญกลางห้องเพื่อปลดล็อคประตู!`;
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
          
          if (dist < 2.5) {
            // AUTOMATIC TRIGGER UPON STEPPING ON THE CHECKPOINT PAD!
            pad.visible = false;
            this.hideActionPrompt();
            this.isProcessingCutscene = true;

            const artFrame = this.courtWorld.artFrames[artIdx];
            if (artFrame && window.game) {
              window.game.startPhotoPreviewCutscene(artFrame.userData, () => {
                if (window.showStarRatingModal) {
                  window.showStarRatingModal(artFrame.userData.imagePath, artFrame.userData.cleanTitle, (ratedScore) => {
                    if (artFrame.userData.addStarBadge) {
                      artFrame.userData.addStarBadge(ratedScore || 5);
                    }
                    this.isProcessingCutscene = false;
                    this.advanceRoomSubState();
                  });
                } else {
                  if (artFrame.userData.addStarBadge) artFrame.userData.addStarBadge(5);
                  this.isProcessingCutscene = false;
                  this.advanceRoomSubState();
                }
              });
            }
            return;
          } else if (dist < 5.0) {
            this.showActionPrompt(`🎨 เดินไปเหยียบจุด Checkpoint รูปภาพ #${artIdx + 1}`);
            this.isNearTarget = true;
            return;
          }
        }
      } else if (this.roomSubState === 'GIFT_BOX') {
        const boxPad = this.courtWorld.giftBoxPads[this.currentRoom - 1];

        if (boxPad && boxPad.visible) {
          const dist = Math.hypot(playerPos.x - boxPad.userData.xPos, playerPos.z - boxPad.userData.zPos);
          
          if (dist < 2.5) {
            boxPad.visible = false;
            this.hideActionPrompt();
            this.isProcessingCutscene = true;

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
            return;
          } else if (dist < 5.0) {
            this.showActionPrompt(`🎁 เดินไปเหยียบจุด Checkpoint กล่องของขวัญ #${this.currentRoom}`);
            this.isNearTarget = true;
            return;
          }
        }
      }
    } else {
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
        const pad = this.courtWorld.checkpointPads[artIdx];
        if (pad) pad.visible = false;

        const artFrame = this.courtWorld.artFrames[artIdx];
        if (artFrame && window.game) {
          this.hideActionPrompt();
          this.isProcessingCutscene = true;

          window.game.startPhotoPreviewCutscene(artFrame.userData, () => {
            if (window.showStarRatingModal) {
              window.showStarRatingModal(artFrame.userData.imagePath, artFrame.userData.cleanTitle, (ratedScore) => {
                if (artFrame.userData.addStarBadge) {
                  artFrame.userData.addStarBadge(ratedScore || 5);
                }
                this.isProcessingCutscene = false;
                this.advanceRoomSubState();
              });
            } else {
              if (artFrame.userData.addStarBadge) artFrame.userData.addStarBadge(5);
              this.isProcessingCutscene = false;
              this.advanceRoomSubState();
            }
          });
        }
      } else if (this.roomSubState === 'GIFT_BOX') {
        const boxPad = this.courtWorld.giftBoxPads[this.currentRoom - 1];
        if (boxPad) boxPad.visible = false;

        this.hideActionPrompt();
        this.isProcessingCutscene = true;

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
        // DIRECTLY UPDATE TARGET POS SO ARROW IMMEDIATELY POINTS TO PAD #2 ON RIGHT WALL!
        this.activeTargetPos.set(p.xPos, 0, p.zPos);
      }

      this.updateTrackerText();

    } else if (this.roomSubState === 'ART_2') {
      this.roomSubState = 'GIFT_BOX';

      // Hide Pad #2 (Right Wall)
      const pad2Index = (this.currentRoom - 1) * 2 + 1;
      if (this.courtWorld.checkpointPads[pad2Index]) {
        this.courtWorld.checkpointPads[pad2Index].visible = false;
      }

      // Reveal 3D Gift Box AND Gift Box Floor Standing Pad under it!
      this.courtWorld.showGiftBoxForRoom(this.currentRoom - 1);
      const box = this.courtWorld.questMarkers[this.currentRoom - 1];
      if (box) {
        // DIRECTLY UPDATE TARGET POS SO ARROW IMMEDIATELY POINTS TO GIFT BOX IN ROOM CENTER!
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
