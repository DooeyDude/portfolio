(() => {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = { x: -1000, y: -1000 };
  let points = [];
  let frame;

  function resize() {
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    const count = Math.max(22, Math.min(54, Math.round((window.innerWidth * window.innerHeight) / 26000)));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - .5) * .16, vy: (Math.random() - .5) * .16, r: Math.random() * 1.2 + .5
    }));
  }

  function draw() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    context.clearRect(0, 0, width, height);
    points.forEach(point => {
      if (!reduceMotion.matches) {
        point.x += point.vx; point.y += point.vy;
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;
      }
      const dx = point.x - pointer.x;
      const dy = point.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 190) { point.x += (dx / Math.max(distance, 1)) * .45; point.y += (dy / Math.max(distance, 1)) * .45; }
    });
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i]; const b = points[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < 150) {
          context.strokeStyle = `rgba(148, 247, 207, ${.10 * (1 - distance / 150)})`;
          context.lineWidth = 1; context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
        }
      }
    }
    points.forEach(point => {
      const active = Math.hypot(point.x - pointer.x, point.y - pointer.y) < 190;
      context.fillStyle = active ? 'rgba(148, 247, 207, .6)' : 'rgba(148, 247, 207, .2)';
      context.beginPath(); context.arc(point.x, point.y, point.r, 0, Math.PI * 2); context.fill();
    });
    if (!reduceMotion.matches) frame = requestAnimationFrame(draw);
  }

  window.addEventListener('pointermove', event => { pointer.x = event.clientX; pointer.y = event.clientY; });
  window.addEventListener('pointerleave', () => { pointer.x = -1000; pointer.y = -1000; });
  window.addEventListener('resize', () => { resize(); if (reduceMotion.matches) draw(); });
  reduceMotion.addEventListener('change', () => { cancelAnimationFrame(frame); draw(); });
  resize(); draw();
})();
