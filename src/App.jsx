import React, { useState, useEffect, useRef, useCallback } from 'react';

const SLAB_HEIGHT = 35;
const CONTAINER_WIDTH = 400;
const INITIAL_WIDTH = 200;

function App() {
  const [stack, setStack] = useState([{ id: 0, width: INITIAL_WIDTH, x: 100, color: 'hsl(280, 80%, 60%)' }]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // High-Performance Refs
  const movingSlabRef = useRef(null);
  const currentXRef = useRef(0);
  const directionRef = useRef(1);
  const requestRef = useRef();

  // 1. Optimized Game Loop (Direct DOM updates = Zero Latency)
  const animate = useCallback(() => {
    const topSlab = stack[stack.length - 1];
    const speed = 2 + (score * 0.1); // Gets slightly faster as you play

    currentXRef.current += speed * directionRef.current;

    // Bounce logic
    if (currentXRef.current + topSlab.width >= CONTAINER_WIDTH) directionRef.current = -1;
    if (currentXRef.current <= 0) directionRef.current = 1;

    // Apply position via CSS Variable for GPU acceleration
    if (movingSlabRef.current) {
      movingSlabRef.current.style.setProperty('--x', `${currentXRef.current}px`);
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [stack, score]);

  useEffect(() => {
    if (!isGameOver) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate, isGameOver]);

  const handleDrop = () => {
    if (isGameOver) return;

    const topSlab = stack[stack.length - 1];
    const x = currentXRef.current;
    
    const leftEdge = Math.max(x, topSlab.x);
    const rightEdge = Math.min(x + topSlab.width, topSlab.x + topSlab.width);
    const newWidth = rightEdge - leftEdge;

    if (newWidth <= 0) {
      setIsGameOver(true);
      return;
    }

    const newSlab = {
      id: Date.now(),
      width: newWidth,
      x: leftEdge,
      color: `hsl(${(280 + stack.length * 15) % 360}, 80%, 60%)`
    };

    setStack([...stack, newSlab]);
    setScore(s => s + 1);
    currentXRef.current = leftEdge; // Reset start pos for next slab
  };

  return (
    <div className="game-viewport" onClick={handleDrop}>
      <div className="hud">
        <span className="score-label">SCORE</span>
        <span className="score-number">{score}</span>
      </div>

      {/* Camera-controlled container */}
      <div 
        className="stack-container" 
        style={{ transform: `translateY(${score * SLAB_HEIGHT}px)` }}
      >
        {stack.map((slab, index) => (
          <div key={slab.id} className="slab" style={{
            bottom: index * SLAB_HEIGHT,
            left: slab.x,
            width: slab.width,
            height: SLAB_HEIGHT - 2,
            backgroundColor: slab.color,
            boxShadow: `0 10px 20px ${slab.color}44`
          }} />
        ))}

        {!isGameOver && (
          <div 
            ref={movingSlabRef}
            className="slab moving" 
            style={{
              bottom: stack.length * SLAB_HEIGHT,
              width: stack[stack.length - 1].width,
              height: SLAB_HEIGHT - 2,
              backgroundColor: `hsl(${(280 + stack.length * 15) % 360}, 80%, 60%)`,
              left: 'var(--x)' // Driven by the Ref
            }} 
          />
        )}
      </div>

      {isGameOver && (
        <div className="glass-overlay">
          <h2>TOWER COLLAPSED</h2>
          <p>You reached floor {score}</p>
          <button onClick={() => window.location.reload()}>REBUILD</button>
        </div>
      )}
    </div>
  );
}

export default App;