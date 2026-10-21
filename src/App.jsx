import { useRef, useState, useEffect } from 'react';

export default function App() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);

  const [color, setColor] = useState('#4f46e5');
  const [size, setSize] = useState(4);
  const [canUndo, setCanUndo] = useState(false);

  const history = useRef([]);

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

  function start(e) {
    e.preventDefault();
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    drawing.current = true;
    last.current = pointerPos(e);
    setCanUndo(true);
  }

  function move(e) {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = ctxRef.current;
    const { x, y } = pointerPos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    last.current = { x, y };
  }

  function end() {
    drawing.current = false;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setCanUndo(true);
  }

  function undo() {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (history.current.length === 0) return;
    const previous = history.current.pop();
    ctx.putImageData(previous, 0, 0);
    setCanUndo(history.current.length > 0);
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
        <button onClick={undo} disabled={!canUndo}>
          ↶ Undo
        </button>
        <button className="secondary" onClick={clearCanvas}>
          Clear
        </button>
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
