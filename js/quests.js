/* ==========================================================================
   Quest Manager - Secret Door Cutscene & Immediate Next Room Arrow Rotation
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

    // Store all 10 rated photos with scores and rating order
    this.ratedPhotos = [];

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

    // Show Checkpoint Pad #1 (Left Wall) for roomNum
    const pad1Index = (roomNum - 1) * 2;
    if (this.courtWorld.checkpointPads && this.courtWorld.checkpointPads[pad1Index]) {
      this.courtWorld.checkpointPads[pad1Index].visible = true;
      const p = this.courtWorld.checkpointPads[pad1Index].userData;
      // DIRECTLY UPDATE TARGET POS SO FLOOR ARROW IMMEDIATELY POINTS TO PAD #1 IN THIS ROOM!
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
        if (this.questTitleEl) this.questTitleEl.innerText = `🎁 ห้องที่ ${this.currentRoom}: เดินไปเหยียบจุด Checkpoint กล่องของขวัญกลางห้องเพื่อทำภารกิจด่าน!`;
      }
    } else {
      if (this.questTitleEl) this.questTitleEl.innerText = `👑 ร่วมฉลองวันเกิด Happy Birthday กับ Bank! 🎂🎉`;
      this.activeTargetPos.set(0, 0, -152);
    }
  }

  recordPhotoRating(artFrame, score) {
    if (!artFrame || !artFrame.userData) return;
    const finalScore = score || 5;

    const existing = this.ratedPhotos.find(p => p.artIndex === artFrame.userData.artIndex);
    if (existing) {
      existing.score = finalScore;
    } else {
      this.ratedPhotos.push({
        artIndex: artFrame.userData.artIndex,
        cleanTitle: artFrame.userData.cleanTitle,
        imagePath: artFrame.userData.imagePath,
        score: finalScore,
        orderIndex: this.ratedPhotos.length + 1
      });
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
            pad.visible = false;
            this.hideActionPrompt();
            this.isProcessingCutscene = true;

            const artFrame = this.courtWorld.artFrames[artIdx];
            if (artFrame && window.game) {
              window.game.startPhotoPreviewCutscene(artFrame.userData, () => {
                if (artFrame.userData.addStarBadge) {
                  artFrame.userData.addStarBadge(5);
                }
                this.recordPhotoRating(artFrame, 5);

                this.isProcessingCutscene = false;
                this.advanceRoomSubState();

                if (window.showStarRatingModal) {
                  window.showStarRatingModal(artFrame.userData.imagePath, artFrame.userData.cleanTitle, (ratedScore) => {
                    if (artFrame.userData.addStarBadge) {
                      artFrame.userData.addStarBadge(ratedScore || 5);
                    }
                    this.recordPhotoRating(artFrame, ratedScore || 5);
                  });
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
                // GIFT BOX CUTSCENE FINISHED -> START MINI-GAME MISSION!
                if (window.miniGameEngine) {
                  window.miniGameEngine.startMiniGame(this.currentRoom, this.ratedPhotos, (skipped) => {
                    if (this.currentRoom <= 4) {
                      const doorToUnlock = this.currentRoom;
                      this.currentQuestIndex++;
                      this.currentRoom++;

                      // IMMEDIATELY START NEXT ROOM QUEST SO ARROW POINTS TO NEXT ROOM'S CHECKPOINT PAD!
                      this.startRoomQuest(this.currentRoom);

                      // RUN SECRET DOOR OPENING CAMERA CUTSCENE!
                      if (window.game && window.game.startDoorOpeningCutscene) {
                        window.game.startDoorOpeningCutscene(doorToUnlock, () => {
                          this.isProcessingCutscene = false;
                        });
                      } else {
                        this.courtWorld.unlockBarrier(doorToUnlock);
                        this.isProcessingCutscene = false;
                      }

                    } else if (this.currentRoom === 5) {
                      this.currentQuestIndex = 5;
                      this.currentRoom = 6;
                      this.roomSubState = 'COMPLETE';
                      this.updateTrackerText();

                      if (window.game && window.game.startGrandBirthdayFinale) {
                        window.game.startGrandBirthdayFinale();
                      }
                      this.isProcessingCutscene = false;
                    }
                  });
                } else {
                  this.courtWorld.unlockBarrier(this.currentRoom);
                  this.currentQuestIndex++;
                  this.currentRoom++;
                  if (this.currentRoom <= 5) this.startRoomQuest(this.currentRoom);
                  this.isProcessingCutscene = false;
                }
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
            if (artFrame.userData.addStarBadge) {
              artFrame.userData.addStarBadge(5);
            }
            this.recordPhotoRating(artFrame, 5);

            this.isProcessingCutscene = false;
            this.advanceRoomSubState();

            if (window.showStarRatingModal) {
              window.showStarRatingModal(artFrame.userData.imagePath, artFrame.userData.cleanTitle, (ratedScore) => {
                if (artFrame.userData.addStarBadge) {
                  artFrame.userData.addStarBadge(ratedScore || 5);
                }
                this.recordPhotoRating(artFrame, ratedScore || 5);
              });
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
            if (window.miniGameEngine) {
              window.miniGameEngine.startMiniGame(this.currentRoom, this.ratedPhotos, (skipped) => {
                if (this.currentRoom <= 4) {
                  const doorToUnlock = this.currentRoom;
                  this.currentQuestIndex++;
                  this.currentRoom++;

                  this.startRoomQuest(this.currentRoom);

                  if (window.game && window.game.startDoorOpeningCutscene) {
                    window.game.startDoorOpeningCutscene(doorToUnlock, () => {
                      this.isProcessingCutscene = false;
                    });
                  } else {
                    this.courtWorld.unlockBarrier(doorToUnlock);
                    this.isProcessingCutscene = false;
                  }

                } else if (this.currentRoom === 5) {
                  this.currentQuestIndex = 5;
                  this.currentRoom = 6;
                  this.roomSubState = 'COMPLETE';
                  this.updateTrackerText();

                  if (window.game && window.game.startGrandBirthdayFinale) {
                    window.game.startGrandBirthdayFinale();
                  }
                  this.isProcessingCutscene = false;
                }
              });
            }
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
