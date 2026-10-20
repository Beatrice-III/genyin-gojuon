// ============================================================================
// 《源音·五十音》—— 毛笔书法临摹与字源叠影画板 (HTML5 Canvas)
// 支持：1. 压感/速度感应毛笔笔触  2. 汉字草书本字叠影对比  3. 临摹与盲写默写双模式
// ============================================================================

class CalligraphyPad {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.targetChar = options.targetChar || 'あ';
    this.originKanji = options.originKanji || '安';
    this.showGhost = options.showGhost !== false;
    this.showOriginOverlay = options.showOriginOverlay || false;
    this.isMemoryMode = options.isMemoryMode || false;
    this.revealedInMemory = false;

    this.isDrawing = false;
    this.strokes = []; // Array of stroke point arrays: [{x, y, time, width}]
    this.currentStroke = [];
    this.activePointerId = null;

    if (this.canvas) {
      this.setupEvents();
      this.render();
    }
  }

  setCharacter(targetChar, originKanji) {
    this.cancelCurrentStroke();
    this.targetChar = targetChar;
    this.originKanji = originKanji || '';
    this.strokes = [];
    this.currentStroke = [];
    this.revealedInMemory = false;
    this.render();
  }

  setMode({ showGhost, showOriginOverlay, isMemoryMode }) {
    if (typeof showGhost === 'boolean') this.showGhost = showGhost;
    if (typeof showOriginOverlay === 'boolean') this.showOriginOverlay = showOriginOverlay;
    if (typeof isMemoryMode === 'boolean') {
      this.isMemoryMode = isMemoryMode;
      this.revealedInMemory = false;
    }
    this.render();
  }

  revealAnswer() {
    this.revealedInMemory = true;
    this.render();
  }

  clear() {
    this.cancelCurrentStroke();
    this.strokes = [];
    this.currentStroke = [];
    this.revealedInMemory = false;
    this.render();
  }

  undo() {
    this.cancelCurrentStroke();
    this.strokes.pop();
    this.render();
  }

  hasUserWritten() {
    // 单点误触不作为一次临写；累计运笔达到画板宽度的 3% 才可自评完成。
    const distance = this.strokes.reduce((sum, stroke) => sum + stroke.reduce((length, point, index) =>
      index ? length + Math.hypot(point.x - stroke[index - 1].x, point.y - stroke[index - 1].y) : length, 0), 0);
    return !!this.canvas && distance >= this.canvas.width * 0.03;
  }

  cancelCurrentStroke() {
    const pointerId = this.activePointerId;
    this.isDrawing = false;
    this.activePointerId = null;
    this.currentStroke = [];
    if (this.canvas && pointerId !== null && this.canvas.releasePointerCapture) {
      try { this.canvas.releasePointerCapture(pointerId); } catch (_) { /* capture 已由系统释放。 */ }
    }
  }

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      time: performance.now()
    };
  }

  setupEvents() {
    const startDraw = (e) => {
      if (this.isDrawing || (e.isPrimary === false) || (e.button !== undefined && e.button !== 0)) return;
      e.preventDefault();
      this.isDrawing = true;
      this.activePointerId = e.pointerId === undefined ? null : e.pointerId;
      if (this.activePointerId !== null && this.canvas.setPointerCapture) {
        try { this.canvas.setPointerCapture(this.activePointerId); } catch (_) { /* 旧 WebView 使用窗口抬笔兜底。 */ }
      }
      const pt = this.getPos(e);
      pt.width = 12;
      this.currentStroke = [pt];
      this.render();
    };

    const moveDraw = (e) => {
      if (!this.isDrawing) return;
      if (this.activePointerId !== null && e.pointerId !== this.activePointerId) return;
      e.preventDefault();
      const pt = this.getPos(e);
      const prev = this.currentStroke[this.currentStroke.length - 1];
      const dist = Math.hypot(pt.x - prev.x, pt.y - prev.y);
      if (dist < 2) return;

      const dt = Math.max(1, pt.time - prev.time);
      const velocity = dist / dt; // px per ms
      // 毛笔笔触：运笔越快线条越细劲，顿笔越慢线条越饱满
      const pressureWidth = e.pointerType === 'pen' && e.pressure > 0 ? 5.5 + e.pressure * 10.5 : null;
      const targetWidth = pressureWidth || Math.max(5.5, Math.min(16, 15 - velocity * 3.8));
      pt.width = prev.width * 0.65 + targetWidth * 0.35;

      this.currentStroke.push(pt);
      this.render();
    };

    const endDraw = (e) => {
      if (!this.isDrawing) return;
      if (e && this.activePointerId !== null && e.pointerId !== undefined && e.pointerId !== this.activePointerId) return;
      if (e && e.cancelable) e.preventDefault();
      this.isDrawing = false;
      if (this.currentStroke.length > 0) {
        this.strokes.push(this.currentStroke);
        this.currentStroke = [];
      }
      const pointerId = this.activePointerId;
      this.activePointerId = null;
      if (pointerId !== null && this.canvas.releasePointerCapture) {
        try { this.canvas.releasePointerCapture(pointerId); } catch (_) { /* 已释放。 */ }
      }
      this.render();
    };

    this.canvas.style.touchAction = 'none';
    if (window.PointerEvent) {
      this.canvas.addEventListener('pointerdown', startDraw);
      this.canvas.addEventListener('pointermove', moveDraw);
      this.canvas.addEventListener('pointerup', endDraw);
      this.canvas.addEventListener('pointercancel', endDraw);
      this.canvas.addEventListener('lostpointercapture', endDraw);
    } else {
      this.canvas.addEventListener('mousedown', startDraw);
      this.canvas.addEventListener('mousemove', moveDraw);
      window.addEventListener('mouseup', endDraw);
      this.canvas.addEventListener('touchstart', e => {
        if (e.touches.length === 1) startDraw(e);
      }, { passive: false });
      this.canvas.addEventListener('touchmove', e => {
        if (e.touches.length === 1) moveDraw(e);
      }, { passive: false });
      window.addEventListener('touchend', endDraw, { passive: false });
      window.addEventListener('touchcancel', endDraw, { passive: false });
    }
    window.addEventListener('blur', () => endDraw());
  }

  drawMiziGrid(ctx, w, h) {
    ctx.save();
    // 宣纸底色
    ctx.fillStyle = '#FCF9F2';
    ctx.fillRect(0, 0, w, h);

    // 外框朱砂细线
    ctx.strokeStyle = 'rgba(185, 64, 52, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, w - 12, h - 12);

    // 米字格虚线
    ctx.strokeStyle = 'rgba(185, 64, 52, 0.18)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    // 横中线 & 竖中线
    ctx.moveTo(6, h / 2);
    ctx.lineTo(w - 6, h / 2);
    ctx.moveTo(w / 2, 6);
    ctx.lineTo(w / 2, h - 6);
    // 对角线
    ctx.moveTo(6, 6);
    ctx.lineTo(w - 6, h - 6);
    ctx.moveTo(w - 6, 6);
    ctx.lineTo(6, h - 6);
    ctx.stroke();

    ctx.restore();
  }

  drawGhostCharacters(ctx, w, h) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 如果开启了汉字本字叠影：在底层显示淡淡的汉字本源（楷/行书感）
    if (this.showOriginOverlay && this.originKanji) {
      ctx.font = `400 ${Math.round(w * 0.54)}px "SourceKana", "STKaiti", "KaiTi", "Yu Mincho", "Noto Serif CJK SC", serif`;
      ctx.fillStyle = 'rgba(196, 75, 53, 0.11)';
      ctx.fillText(this.originKanji, w / 2, h / 2 + 4);
    }

    // 临摹模式下显示浅色假名底稿；默写模式下仅在点击“揭晓”后显示朱砂红标准答案叠影
    const shouldShowTarget = (!this.isMemoryMode && this.showGhost) || (this.isMemoryMode && this.revealedInMemory);
    if (shouldShowTarget && this.targetChar) {
      ctx.font = `500 ${Math.round(w * 0.66)}px "SourceKana", "Yu Kyokasho", "UD Digi Kyokasho N-R", "Hiragino Mincho ProN", "Yu Mincho", "MS Mincho", "STKaiti", serif`;
      if (this.isMemoryMode && this.revealedInMemory) {
        // 默写揭晓：朱砂红半透明叠影，方便对比自己写的黑墨字
        ctx.fillStyle = 'rgba(204, 48, 35, 0.42)';
      } else {
        ctx.fillStyle = 'rgba(40, 38, 35, 0.14)';
      }
      ctx.fillText(this.targetChar, w / 2, h / 2 + 6);
    }

    ctx.restore();
  }

  drawBrushStroke(ctx, points) {
    if (!points || points.length === 0) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1E1B18';
    ctx.fillStyle = '#1E1B18';

    if (points.length === 1) {
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, points[0].width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineWidth = (p0.width + p1.width) / 2;
      ctx.stroke();
    }
    ctx.restore();
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.clearRect(0, 0, w, h);
    this.drawMiziGrid(this.ctx, w, h);
    this.drawGhostCharacters(this.ctx, w, h);

    // 绘制已完成的毛笔笔画
    this.strokes.forEach(stroke => this.drawBrushStroke(this.ctx, stroke));
    // 绘制正在书写的当前笔画
    if (this.currentStroke.length > 0) {
      this.drawBrushStroke(this.ctx, this.currentStroke);
    }
  }
}

window.CalligraphyPad = CalligraphyPad;
