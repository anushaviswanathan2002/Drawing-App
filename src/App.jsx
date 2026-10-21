import { useRef, useState, useEffect } from 'react';

const MAX_HISTORY = 20;

export default function App() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const currentStroke = useRef(null); // segments of the active stroke
  // Stack of completed strokes (each stroke is an array of segments)
  const strokesRef = useRef([]);
  const [strokeCount, setStrokeCount] = useState(0);

  const [color, setColor] = useState('#4f46e5');
  const [size, setSize] = useState(4);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;
  }, []);

  function pointerPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x, y };
  }

  function redraw() {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokesRef.current) {
      for (const seg of stroke) {
        ctx.strokeStyle = seg.color;
        ctx.lineWidth = seg.size;
        ctx.beginPath();
        ctx.moveTo(seg.from.x, seg.from.y);
        ctx.lineTo(seg.to.x, seg.to.y);
        ctx.stroke();
      }
    }
    // In-progress stroke
    if (currentStroke.current) {
      for (const seg of currentStroke.current) {
        ctx.strokeStyle = seg.color;
        ctx.lineWidth = seg.size;
        ctx.beginPath();
        ctx.moveTo(seg.from.x, seg.from.y);
        ctx.lineTo(seg.to.x, seg.to.y);
        ctx.stroke();
      }
    }
  }

  function start(e) {
    e.preventDefault();
    drawing.current = true;
    const pos = pointerPos(e);
    last.current = pos;
    currentStroke.current = [];
  }

  function move(e) {
    if (!drawing.current) return;
    e.preventDefault();
    const { x, y } = pointerPos(e);
    const seg = { from: last.current, to: { x, y }, color, size };
    currentStroke.current.push(seg);

    const ctx = ctxRef.current;
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(seg.from.x, seg.from.y);
    ctx.lineTo(seg.to.x, seg.to.y);
    ctx.stroke();
    last.current = { x, y };
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    if (currentStroke.current && currentStroke.current.length > 0) {
      strokesRef.current.push(currentStroke.current);
      if (strokesRef.current.length > MAX_HISTORY) {
        strokesRef.current.shift(); // drop oldest
      }
      setStrokeCount(strokesRef.current.length);
    }
    currentStroke.current = null;
  }

  function clearCanvas() {
    strokesRef.current = [];
    currentStroke.current = null;
    setStrokeCount(0);
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function undo() {
    if (strokesRef.current.length === 0) return;
    strokesRef.current.pop();
    setStrokeCount(strokesRef.current.length);
    redraw();
  }

  function download() {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div>
      <h1>🎨 Drawing App</h1>
      <div className="toolbar">
        <label>
          Color
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
        <label>
          Size
          <input
            type="range"
            min="1"
            max="40"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
        </label>
        <button
          disabled={strokeCount === 0}
          onClick={undo}
          title="Undo last stroke"
        >
          ↶ Undo
        </button>
        <button className="secondary" onClick={clearCanvas}>Clear</button>
        <button className="success" onClick={download}>⬇ Download</button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
    </div>
  );
}