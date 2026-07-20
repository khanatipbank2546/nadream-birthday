/* ==========================================================================
   Mini-Games Engine - Non-blocking Toast Banners & Guaranteed Cutscene Callbacks
   ========================================================================== */

class MiniGameEngine {
  constructor() {
    this.modalEl = null;
    this.titleEl = null;
    this.subtitleEl = null;
    this.containerEl = null;
    this.giveUpBtn = null;

    this.onCompleteCallback = null;
    this.currentRoom = 1;

    this.initDOM();
  }

  initDOM() {
    this.modalEl = document.getElementById('minigame-modal');
    this.titleEl = document.getElementById('minigame-title');
    this.subtitleEl = document.getElementById('minigame-subtitle');
    this.containerEl = document.getElementById('minigame-container');
    this.giveUpBtn = document.getElementById('minigame-giveup-btn');

    if (this.giveUpBtn) {
      this.giveUpBtn.onclick = () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.finishMiniGame(true); // Passed via Give Up / Skip
      };
    }
  }

  startMiniGame(roomNum, ratedPhotos, onComplete) {
    this.currentRoom = roomNum;
    this.onCompleteCallback = onComplete;
    this.ratedPhotos = ratedPhotos || [];

    if (!this.modalEl || !this.containerEl) return;

    this.modalEl.classList.remove('hidden');
    this.modalEl.style.display = 'flex';
    this.modalEl.style.zIndex = '99999';

    if (this.giveUpBtn) this.giveUpBtn.style.display = 'inline-block';

    this.containerEl.innerHTML = '';

    if (roomNum === 1) {
      this.initJigsawState1();
    } else if (roomNum === 2) {
      this.initSpotDifferenceState2();
    } else if (roomNum === 3) {
      this.initMemoryCardsState3();
    } else if (roomNum === 4) {
      this.initSlidingPuzzleState4();
    } else if (roomNum === 5) {
      this.initFIFACardRevealState5();
    }
  }

  showSuccessBanner(msg, callback) {
    if (this.containerEl) {
      const banner = document.createElement('div');
      banner.className = 'minigame-success-banner';
      banner.innerHTML = `<h3>${msg}</h3>`;
      this.containerEl.appendChild(banner);

      if (window.soundEngine) window.soundEngine.playQuestComplete();

      setTimeout(() => {
        if (callback) callback();
      }, 900);
    } else {
      if (callback) callback();
    }
  }

  finishMiniGame(skipped = false) {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
      this.modalEl.style.display = 'none';
    }

    if (window.soundEngine) {
      if (!skipped) window.soundEngine.playQuestComplete();
    }

    if (this.onCompleteCallback) {
      const cb = this.onCompleteCallback;
      this.onCompleteCallback = null;
      cb(skipped);
    }
  }

  // ==========================================================================
  // STATE 1: Jigsaw Puzzle (12 Pieces from game/state1/จิกซอ.jpg)
  // ==========================================================================
  initJigsawState1() {
    if (this.titleEl) this.titleEl.innerText = "🧩 ภารกิจด่านที่ 1: ต่อภาพจิ๊กซอว์ (12 ชิ้น)";
    if (this.subtitleEl) this.subtitleEl.innerText = "ดึงและต่อชิ้นส่วนจิ๊กซอว์ให้ถูกต้องตรงตามรูปตัวอย่าง!";

    const imgSrc = encodeURI("game/state1/จิกซอ.jpg");

    const jigsawHTML = `
      <div class="jigsaw-wrapper">
        <div class="jigsaw-sample-box">
          <div class="box-label">📸 รูปตัวอย่าง</div>
          <img src="${imgSrc}" class="jigsaw-sample-img" alt="Sample">
        </div>
        <div class="jigsaw-play-area">
          <div class="jigsaw-board" id="jigsaw-board"></div>
          <div class="jigsaw-pieces-tray" id="jigsaw-pieces-tray"></div>
        </div>
      </div>
    `;
    this.containerEl.innerHTML = jigsawHTML;

    const boardEl = document.getElementById('jigsaw-board');
    const trayEl = document.getElementById('jigsaw-pieces-tray');
    if (!boardEl || !trayEl) return;

    const cols = 4;
    const rows = 3;
    const totalPieces = cols * rows; // 12 Pieces
    let selectedPieceIndex = null;
    const boardState = new Array(totalPieces).fill(null);

    for (let i = 0; i < totalPieces; i++) {
      const slot = document.createElement('div');
      slot.className = 'jigsaw-slot';
      slot.dataset.slotIndex = i;

      slot.onclick = () => {
        if (selectedPieceIndex !== null && boardState[i] === null) {
          const pieceEl = document.querySelector(`.jigsaw-piece[data-piece-index="${selectedPieceIndex}"]`);
          if (pieceEl) {
            slot.appendChild(pieceEl);
            boardState[i] = selectedPieceIndex;
            pieceEl.classList.remove('selected');
            selectedPieceIndex = null;
            if (window.soundEngine) window.soundEngine.playClick();

            this.checkJigsawCompletion(boardState);
          }
        }
      };
      boardEl.appendChild(slot);
    }

    const pieceIndices = Array.from({ length: totalPieces }, (_, i) => i);
    pieceIndices.sort(() => Math.random() - 0.5);

    pieceIndices.forEach(idx => {
      const piece = document.createElement('div');
      piece.className = 'jigsaw-piece';
      piece.dataset.pieceIndex = idx;
      piece.style.backgroundImage = `url("${imgSrc}")`;
      
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      piece.style.backgroundPosition = `${(col / (cols - 1)) * 100}% ${(row / (rows - 1)) * 100}%`;

      piece.onclick = (e) => {
        e.stopPropagation();
        const parentSlot = piece.parentElement;
        if (parentSlot && parentSlot.classList.contains('jigsaw-slot')) {
          const slotIdx = parseInt(parentSlot.dataset.slotIndex, 10);
          boardState[slotIdx] = null;
          trayEl.appendChild(piece);
          selectedPieceIndex = null;
          return;
        }

        document.querySelectorAll('.jigsaw-piece').forEach(p => p.classList.remove('selected'));
        selectedPieceIndex = idx;
        piece.classList.add('selected');
        if (window.soundEngine) window.soundEngine.playClick();
      };

      trayEl.appendChild(piece);
    });
  }

  checkJigsawCompletion(boardState) {
    let isComplete = true;
    for (let i = 0; i < boardState.length; i++) {
      if (boardState[i] !== i) {
        isComplete = false;
        break;
      }
    }

    if (isComplete) {
      this.showSuccessBanner("🎉 ยอดเยี่ยมมาก! ต่อจิ๊กซอว์สำเร็จเรียบร้อย!", () => {
        this.finishMiniGame(false);
      });
    }
  }

  // ==========================================================================
  // STATE 2: Spot the Difference (5 Spots from game/state2/จับผิดภาพ.jpg)
  // ==========================================================================
  initSpotDifferenceState2() {
    if (this.titleEl) this.titleEl.innerText = "🔍 ภารกิจด่านที่ 2: จับผิดภาพ (5 จุด)";
    if (this.subtitleEl) this.subtitleEl.innerText = "คลิกค้นหาจุดที่แตกต่างกัน 5 จุดบนรูปภาพ!";

    const imgSrc = encodeURI("game/state2/จับผิดภาพ.jpg");

    const spots = [
      { id: 1, x: 22, y: 30, radius: 8 },
      { id: 2, x: 78, y: 24, radius: 8 },
      { id: 3, x: 50, y: 55, radius: 8 },
      { id: 4, x: 32, y: 76, radius: 8 },
      { id: 5, x: 72, y: 80, radius: 8 }
    ];

    let foundCount = 0;
    const foundSpots = new Set();

    const spotHTML = `
      <div class="spot-diff-wrapper">
        <div class="spot-header-status">
          🎯 ค้นพบจุดต่างแล้ว: <span id="spot-found-count" class="spot-counter">0 / 5</span> จุด
        </div>
        <div class="spot-img-container" id="spot-img-container">
          <img src="${imgSrc}" class="spot-diff-img" alt="Spot Difference">
          <div class="spot-overlay-layer" id="spot-overlay-layer"></div>
        </div>
      </div>
    `;
    this.containerEl.innerHTML = spotHTML;

    const overlayLayer = document.getElementById('spot-overlay-layer');
    const counterEl = document.getElementById('spot-found-count');
    if (!overlayLayer) return;

    overlayLayer.onclick = (e) => {
      const rect = overlayLayer.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 100;
      const clickY = ((e.clientY - rect.top) / rect.height) * 100;

      let hitFound = false;

      spots.forEach(spot => {
        if (!foundSpots.has(spot.id)) {
          const dist = Math.hypot(clickX - spot.x, clickY - spot.y);
          if (dist <= spot.radius) {
            foundSpots.add(spot.id);
            foundCount++;
            hitFound = true;

            const marker = document.createElement('div');
            marker.className = 'spot-found-marker';
            marker.style.left = `${spot.x}%`;
            marker.style.top = `${spot.y}%`;
            overlayLayer.appendChild(marker);

            if (counterEl) counterEl.innerText = `${foundCount} / 5`;
            if (window.soundEngine) window.soundEngine.playClick();

            if (foundCount >= 5) {
              this.showSuccessBanner("🎉 เก่งมากๆ! ค้นพบจุดต่างครบทั้ง 5 จุดเรียบร้อย!", () => {
                this.finishMiniGame(false);
              });
            }
          }
        }
      });

      if (!hitFound) {
        const miss = document.createElement('div');
        miss.className = 'spot-miss-marker';
        miss.style.left = `${clickX}%`;
        miss.style.top = `${clickY}%`;
        overlayLayer.appendChild(miss);
        setTimeout(() => miss.remove(), 600);
      }
    };
  }

  // ==========================================================================
  // STATE 3: Card Matching Memory Game (6 Pairs / 12 Cards from game/state3/)
  // ==========================================================================
  initMemoryCardsState3() {
    if (this.titleEl) this.titleEl.innerText = "🃏 ภารกิจด่านที่ 3: เกมจับคู่ภาพ (6 คู่)";
    if (this.subtitleEl) this.subtitleEl.innerText = "เปิดการ์ดจับคู่รูปภาพที่เหมือนกันให้ครบทั้ง 6 คู่!";

    const cardImages = [
      encodeURI("game/state3/จับคู่1.jpg"),
      encodeURI("game/state3/จับคู่2.jpg"),
      encodeURI("game/state3/จับคู่3.jpg"),
      encodeURI("game/state3/จับคู่4.jpg"),
      encodeURI("game/state3/จับคู่5.jpg"),
      encodeURI("game/state3/ยิ้มกระชากกระเป๋า.jpg")
    ];

    let cards = [];
    cardImages.forEach((img, index) => {
      cards.push({ id: index, img });
      cards.push({ id: index, img });
    });
    cards.sort(() => Math.random() - 0.5);

    let matchedPairs = 0;
    let flippedCards = [];
    let lockBoard = false;

    const memoryHTML = `
      <div class="memory-wrapper">
        <div class="memory-status-bar">
          🏆 จับคู่สำเร็จแล้ว: <span id="memory-counter" class="memory-counter">0 / 6</span> คู่
        </div>
        <div class="memory-grid" id="memory-grid"></div>
      </div>
    `;
    this.containerEl.innerHTML = memoryHTML;

    const gridEl = document.getElementById('memory-grid');
    const counterEl = document.getElementById('memory-counter');
    if (!gridEl) return;

    cards.forEach((card, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card';
      cardEl.dataset.cardId = card.id;
      cardEl.dataset.index = idx;

      cardEl.innerHTML = `
        <div class="card-inner">
          <div class="card-front">🏸</div>
          <div class="card-back" style="background-image: url('${card.img}')"></div>
        </div>
      `;

      cardEl.onclick = () => {
        if (lockBoard || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

        cardEl.classList.add('flipped');
        flippedCards.push({ element: cardEl, id: card.id });
        if (window.soundEngine) window.soundEngine.playClick();

        if (flippedCards.length === 2) {
          lockBoard = true;
          const [c1, c2] = flippedCards;

          if (c1.id === c2.id) {
            c1.element.classList.add('matched');
            c2.element.classList.add('matched');
            matchedPairs++;
            if (counterEl) counterEl.innerText = `${matchedPairs} / 6`;
            flippedCards = [];
            lockBoard = false;

            if (matchedPairs >= 6) {
              this.showSuccessBanner("🎉 สุดยอด! จับคู่การ์ดครบทั้ง 6 คู่เรียบร้อย!", () => {
                this.finishMiniGame(false);
              });
            }
          } else {
            setTimeout(() => {
              c1.element.classList.remove('flipped');
              c2.element.classList.remove('flipped');
              flippedCards = [];
              lockBoard = false;
            }, 850);
          }
        }
      };

      gridEl.appendChild(cardEl);
    });
  }

  // ==========================================================================
  // STATE 4: Sliding Tile Puzzle (3x3 Grid from game/state4/slidingPuzzle.jpg)
  // ==========================================================================
  initSlidingPuzzleState4() {
    if (this.titleEl) this.titleEl.innerText = "🧩 ภารกิจด่านที่ 4: เกมเลื่อนบล็อค Slide Puzzle (3x3)";
    if (this.subtitleEl) this.subtitleEl.innerText = "เลื่อนบล็อครูปภาพเรียงสลับตำแหน่งกลับคืนสู่รูปต้นฉบับ!";

    const imgSrc = encodeURI("game/state4/slidingPuzzle.jpg");

    const puzzleHTML = `
      <div class="sliding-wrapper">
        <div class="sliding-sample-box">
          <div class="box-label">📸 รูปตัวอย่าง</div>
          <img src="${imgSrc}" class="sliding-sample-img" alt="Sample">
        </div>
        <div class="sliding-board-box">
          <div class="sliding-board" id="sliding-board"></div>
        </div>
      </div>
    `;
    this.containerEl.innerHTML = puzzleHTML;

    const boardEl = document.getElementById('sliding-board');
    if (!boardEl) return;

    const size = 3;
    let grid = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    const shuffleGrid = () => {
      for (let i = 0; i < 60; i++) {
        const blankIdx = grid.indexOf(8);
        const validMoves = [];
        const r = Math.floor(blankIdx / size);
        const c = blankIdx % size;

        if (r > 0) validMoves.push(blankIdx - size);
        if (r < size - 1) validMoves.push(blankIdx + size);
        if (c > 0) validMoves.push(blankIdx - 1);
        if (c < size - 1) validMoves.push(blankIdx + 1);

        const move = validMoves[Math.floor(Math.random() * validMoves.length)];
        [grid[blankIdx], grid[move]] = [grid[move], grid[blankIdx]];
      }
    };

    shuffleGrid();

    const renderBoard = () => {
      boardEl.innerHTML = '';
      const blankIdx = grid.indexOf(8);

      grid.forEach((tileVal, currentIdx) => {
        const tile = document.createElement('div');
        tile.className = tileVal === 8 ? 'sliding-tile empty' : 'sliding-tile';
        
        if (tileVal !== 8) {
          tile.style.backgroundImage = `url("${imgSrc}")`;
          const origC = tileVal % size;
          const origR = Math.floor(tileVal / size);
          tile.style.backgroundPosition = `${(origC / (size - 1)) * 100}% ${(origR / (size - 1)) * 100}%`;
        }

        tile.onclick = () => {
          if (tileVal === 8) return;

          const rCurrent = Math.floor(currentIdx / size);
          const cCurrent = currentIdx % size;
          const rBlank = Math.floor(blankIdx / size);
          const cBlank = blankIdx % size;

          const isAdjacent = (Math.abs(rCurrent - rBlank) + Math.abs(cCurrent - cBlank)) === 1;

          if (isAdjacent) {
            [grid[currentIdx], grid[blankIdx]] = [grid[blankIdx], grid[currentIdx]];
            if (window.soundEngine) window.soundEngine.playClick();
            renderBoard();

            let isSolved = true;
            for (let i = 0; i < 9; i++) {
              if (grid[i] !== i) {
                isSolved = false;
                break;
              }
            }

            if (isSolved) {
              this.showSuccessBanner("🎉 ยอดเยี่ยมเหลือล้น! เลื่อนบล็อคเรียงรูปภาพสำเร็จเรียบร้อย!", () => {
                this.finishMiniGame(false);
              });
            }
          }
        };

        boardEl.appendChild(tile);
      });
    };

    renderBoard();
  }

  // ==========================================================================
  // STATE 5: FIFA Ultimate Team Style Card Reveal (10 Rated Photos)
  // ==========================================================================
  initFIFACardRevealState5() {
    if (this.titleEl) this.titleEl.innerText = "🏆 ภารกิจด่านที่ 5: สรุปผลรีวิวรูปภาพ (FIFA Ultimate Team Cards)";
    if (this.subtitleEl) this.subtitleEl.innerText = "เรียงลำดับการ์ดรูปภาพตามคะแนนดาวสูงไปหาน้อย และตามลำดับการให้คะแนน!";

    if (this.giveUpBtn) this.giveUpBtn.style.display = 'none';

    const sortedPhotos = [...this.ratedPhotos].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.orderIndex - b.orderIndex;
    });

    let currentCardIndex = 0;

    const fifaHTML = `
      <div class="fifa-reveal-wrapper">
        <div id="fifa-card-container" class="fifa-card-container"></div>
        <button id="fifa-confirm-btn" class="fifa-confirm-btn">
          ✨ ยืนยันการเปิดการ์ดใบนี้ (ดูใบถัดไป) [1 / ${sortedPhotos.length}]
        </button>
      </div>
    `;
    this.containerEl.innerHTML = fifaHTML;

    const cardContainer = document.getElementById('fifa-card-container');
    const confirmBtn = document.getElementById('fifa-confirm-btn');

    const renderCard = (index) => {
      if (index >= sortedPhotos.length) {
        this.finishMiniGame(false);
        return;
      }

      const photo = sortedPhotos[index];
      const starsStr = '⭐'.repeat(photo.score);
      const overallRating = 90 + photo.score * 2;

      if (cardContainer) {
        cardContainer.innerHTML = `
          <div class="fifa-gold-card flip-in">
            <div class="fifa-badge-rating">
              <div class="fifa-score">${overallRating}</div>
              <div class="fifa-pos">HERO</div>
            </div>
            <img src="${encodeURI(photo.imagePath)}" class="fifa-photo-img" alt="FIFA Photo">
            <div class="fifa-card-info">
              <div class="fifa-photo-title">${photo.cleanTitle}</div>
              <div class="fifa-stars-row">${starsStr}</div>
              <div class="fifa-rank-tag">ลำดับความเท่ที่ #${index + 1}</div>
            </div>
          </div>
        `;
      }

      if (confirmBtn) {
        confirmBtn.innerText = index === sortedPhotos.length - 1 
          ? "🎉 เปิดครบ 10 ใบแล้ว! เข้าสู่คัทซีนแฮปปี้เบิร์ดเดย์กับ Bank ✨" 
          : `✨ ยืนยันการเปิดการ์ดใบนี้ (ดูใบถัดไป) [${index + 1} / ${sortedPhotos.length}]`;
      }
    };

    renderCard(0);

    if (confirmBtn) {
      confirmBtn.onclick = () => {
        if (window.soundEngine) window.soundEngine.playQuestComplete();
        currentCardIndex++;
        if (currentCardIndex < sortedPhotos.length) {
          renderCard(currentCardIndex);
        } else {
          this.finishMiniGame(false);
        }
      };
    }
  }
}

window.MiniGameEngine = MiniGameEngine;
