/* ==========================================================================
   Quest Engine - Centered Room Checkpoints & Secret Door Cutscene Triggers
   ========================================================================== */

class QuestManager {
  constructor(courtWorld, bankNPC) {
    this.courtWorld = courtWorld;
    this.bankNPC = bankNPC;
    
    this.completedCount = 0;
    this.currentQuestIndex = 1; // 1 to 5
    this.activeTrigger = null;

    // Checkpoint Positions (Placed in the EXACT CENTER of each room!)
    this.questPositions = {
      1: new THREE.Vector3(0, 0, -14),
      2: new THREE.Vector3(0, 0, -42),
      3: new THREE.Vector3(0, 0, -70),
      4: new THREE.Vector3(0, 0, -98),
      5: new THREE.Vector3(0, 0, -126),
      'bank': new THREE.Vector3(0, 0, -150)
    };

    this.bindUIEvents();
  }

  bindUIEvents() {
    const actionBtn = document.getElementById('action-prompt-btn');
    const mobileActionBtn = document.getElementById('mobile-action-btn');
    const npcCloseBtn = document.getElementById('npc-close-btn');
    const npcHeaderClose = document.getElementById('npc-modal-close');
    const replayMusicBtn = document.getElementById('replay-hbd-music');

    if (actionBtn) actionBtn.addEventListener('click', () => this.handleActionClick());
    if (mobileActionBtn) mobileActionBtn.addEventListener('click', () => this.handleActionClick());
    if (npcCloseBtn) npcCloseBtn.addEventListener('click', () => this.hideNPCModal());
    if (npcHeaderClose) npcHeaderClose.addEventListener('click', () => this.hideNPCModal());
    if (replayMusicBtn && window.soundEngine) replayMusicBtn.addEventListener('click', () => window.soundEngine.playHappyBirthday());
  }

  checkProximity(playerPos) {
    const actionPrompt = document.getElementById('action-prompt');
    const promptNumber = document.getElementById('action-prompt-number');
    const promptText = document.getElementById('action-prompt-text');

    if (this.currentQuestIndex <= 5) {
      const qPos = this.questPositions[this.currentQuestIndex];
      const dist = playerPos.distanceTo(qPos);

      if (dist < 4.5) {
        this.activeTrigger = this.currentQuestIndex;
        if (actionPrompt) actionPrompt.classList.remove('hidden');
        if (promptNumber) promptNumber.innerText = `${this.currentQuestIndex}`;
        if (promptText) promptText.innerText = `กดเลข ${this.currentQuestIndex} เพื่อเปิดประตูทางลับห้องที่ ${this.currentQuestIndex + 1}`;
        return;
      }
    }

    if (this.completedCount >= 5) {
      const bankPos = this.questPositions['bank'];
      const dist = playerPos.distanceTo(bankPos);

      if (dist < 5.0) {
        this.activeTrigger = 'bank';
        if (actionPrompt) actionPrompt.classList.remove('hidden');
        if (promptNumber) promptNumber.innerText = `🏸`;
        if (promptText) promptText.innerText = `ทักทาย Bank`;
        return;
      }
    }

    this.activeTrigger = null;
    if (actionPrompt) actionPrompt.classList.add('hidden');
  }

  handleActionClick() {
    if (!this.activeTrigger) return;
    if (window.soundEngine) window.soundEngine.playClick();

    if (typeof this.activeTrigger === 'number') {
      const questNum = this.activeTrigger;
      
      this.courtWorld.unlockBarrier(questNum);
      if (window.soundEngine) window.soundEngine.playSecretDoorCutscene();

      this.completedCount = questNum;
      this.currentQuestIndex = questNum + 1;

      const countBadge = document.getElementById('quest-count');
      const progressFill = document.getElementById('quest-progress-fill');
      const hudTitle = document.getElementById('current-quest-title');

      if (countBadge) countBadge.innerText = `${this.completedCount}/5`;
      if (progressFill) progressFill.style.width = `${(this.completedCount / 5) * 100}%`;

      if (this.currentQuestIndex <= 5) {
        if (hudTitle) hudTitle.innerText = `✨ ประตูทางลับห้องที่ ${questNum} เปิดออกแล้ว! เดินผ่านลำแสงเข้าสู่ห้องที่ ${this.currentQuestIndex}`;
      } else {
        if (hudTitle) hudTitle.innerText = `🎉 ปลดล็อคประตูทางลับทั้งหมดแล้ว! เดินเข้าสู่ห้องโถงแชมเปียนพบ Bank`;
      }

      const actionPrompt = document.getElementById('action-prompt');
      if (actionPrompt) actionPrompt.classList.add('hidden');

      // Trigger Cinematic Cutscene focusing on the secret door opening with light beams!
      if (window.game) {
        window.game.startDoorCutscene(questNum);
      }

    } else if (this.activeTrigger === 'bank') {
      this.showNPCModal();
    }
  }

  showNPCModal() {
    if (window.soundEngine) window.soundEngine.playHappyBirthday();
    const npcModal = document.getElementById('npc-modal');
    if (npcModal) npcModal.classList.remove('hidden');
  }

  hideNPCModal() {
    const npcModal = document.getElementById('npc-modal');
    if (npcModal) npcModal.classList.add('hidden');
  }
}

window.QuestManager = QuestManager;
