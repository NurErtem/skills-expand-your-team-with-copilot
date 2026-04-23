/**
 * Animated Git-style branch lines background for Mergington High School.
 * Draws slowly-moving commit nodes and branch lines on a canvas element.
 */
(function () {
  const canvas = document.getElementById("git-bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // School colors: lime green palette
  const BRANCH_COLORS = [
    "rgba(90, 158, 47, 0.45)",   // primary lime green
    "rgba(124, 179, 66, 0.35)",  // lighter lime green
    "rgba(51, 105, 30, 0.30)",   // dark green
    "rgba(174, 229, 113, 0.30)", // very light lime
    "rgba(90, 158, 47, 0.20)",   // faint lime
  ];

  const NUM_LANES = 5;        // vertical "branch lanes"
  const NODE_SPACING = 90;    // px between commit nodes
  const SCROLL_SPEED = 0.35;  // px per frame (slow drift upward)

  let width, height;
  let offset = 0; // animation scroll offset

  /** One lane holds a series of commit nodes. */
  function makeLane(laneIndex) {
    const color = BRANCH_COLORS[laneIndex % BRANCH_COLORS.length];
    const nodes = [];
    // How many nodes we need to fill the screen top-to-bottom
    const count = Math.ceil(2000 / NODE_SPACING) + 4;
    for (let i = 0; i < count; i++) {
      nodes.push({
        // Random horizontal jitter so branches don't sit perfectly vertical
        jitter: (Math.random() - 0.5) * 18,
        // Whether this commit has a branch-off
        hasBranch: Math.random() < 0.25,
        branchDir: Math.random() < 0.5 ? -1 : 1,
        branchLen: 40 + Math.random() * 50,
      });
    }
    return { color, nodes };
  }

  let lanes = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    // Recalculate lane x positions based on new width
    lanes = [];
    for (let i = 0; i < NUM_LANES; i++) {
      // Spread lanes evenly across the width with some randomness
      const base = (width / (NUM_LANES + 1)) * (i + 1);
      const lane = makeLane(i);
      lane.x = base + (Math.random() - 0.5) * (width / NUM_LANES) * 0.4;
      lanes.push(lane);
    }
  }

  function drawLane(lane) {
    const x = lane.x;
    const { color, nodes } = lane;

    // How many nodes fill one screen-height
    const firstNodeIndex = Math.floor(offset / NODE_SPACING);
    const yBase = -(offset % NODE_SPACING);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillStyle = color;

    let prevX = x + nodes[firstNodeIndex % nodes.length].jitter;
    let prevY = yBase - NODE_SPACING;

    for (let i = 0; i * NODE_SPACING < height + NODE_SPACING * 2; i++) {
      const ni = (firstNodeIndex + i) % nodes.length;
      const node = nodes[ni];
      const nx = x + node.jitter;
      const ny = yBase + i * NODE_SPACING;

      // Draw line from previous node to this one
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      // Draw commit dot
      ctx.beginPath();
      ctx.arc(nx, ny, 4, 0, Math.PI * 2);
      ctx.fill();

      // Optionally draw a short branch-off line
      if (node.hasBranch) {
        const bx = nx + node.branchDir * node.branchLen;
        const by = ny - NODE_SPACING * 0.6;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(bx, by);
        ctx.stroke();
        // Small dot at branch tip
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      prevX = nx;
      prevY = ny;
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    offset += SCROLL_SPEED;

    for (const lane of lanes) {
      drawLane(lane);
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  resize();
  animate();
})();
