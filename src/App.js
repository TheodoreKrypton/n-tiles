import React, { useCallback, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import "./App.css";

const splitmix32 = (a) => () => {
  a |= 0;
  a = (a + 0x9e3779b9) | 0;
  let t = a ^ (a >>> 16);
  t = Math.imul(t, 0x21f0aaad);
  t = t ^ (t >>> 15);
  t = Math.imul(t, 0x735a2d97);
  return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
};

// if the url paramter has a seed, use that seed
const urlParams = new URLSearchParams(window.location.search);
const seed = urlParams.get("seed");
const randomSeed = parseInt(seed);
if (!randomSeed) {
  const seed = (Math.random() * 2 ** 32) >>> 0;
  window.location.search = window.location.search
    ? `${window.location.search}&seed=${seed}`
    : `?seed=${seed}`;
}
const random = splitmix32(randomSeed);

const m = urlParams.get("m") || 3;
const n = urlParams.get("n") || 3;

const randomIcon = (front) => {
  if (!front) {
    front = Math.floor(random() * 2 * m * n) + 1;
  }
  while (true) {
    const back = Math.floor(random() * 2 * m * n) + 1;
    if (front !== back) {
      return [front, back];
    }
  }
};

const ItemTypes = {
  SQUARE: "square",
};

// Square component
const Square = ({
  frontValue,
  backValue,
  onClick,
  index,
  moveSquare,
  flipped,
  disableAnimation,
  clickable,
}) => {
  const [{ isDraggingTile }, drag] = useDrag({
    type: ItemTypes.SQUARE,
    item: { index },
    collect: (monitor) => ({
      isDraggingTile: !!monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.SQUARE,
    drop: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveSquare(draggedItem.index, index);
      }
    },
  });

  if (clickable) {
    return (
      <div
        ref={(node) => drag(drop(node))}
        className={`square ${flipped ? "flipped" : ""} ${
          disableAnimation ? "no-animation" : ""
        }`}
        style={{
          opacity: isDraggingTile ? 0.5 : 1,
          cursor: "move",
          backgroundImage: flipped
            ? `url(${process.env.PUBLIC_URL}/tiles/${backValue}.png)`
            : `url(${process.env.PUBLIC_URL}/tiles/${frontValue}.png)`,
          backgroundSize: "cover",
          // generate a color based on the tile value
          backgroundColor: flipped
            ? `hsl(${(backValue * 50) % 360}, 70%, 80%)`
            : `hsl(${(frontValue * 50) % 360}, 70%, 80%)`,
        }}
        onClick={() => onClick(index)}
      />
    );
  } else {
    return (
      <div
        className={`square ${flipped ? "flipped" : ""} ${
          disableAnimation ? "no-animation" : ""
        }`}
        style={{
          backgroundImage: flipped
            ? `url(${process.env.PUBLIC_URL}/tiles/${backValue}.png)`
            : `url(${process.env.PUBLIC_URL}/tiles/${frontValue}.png)`,
          backgroundSize: "cover",
          // generate a color based on the tile value
          backgroundColor: flipped
            ? `hsl(${(backValue * 50) % 360}, 70%, 80%)`
            : `hsl(${(frontValue * 50) % 360}, 70%, 80%)`,
        }}
      />
    );
  }
};

// Grid component
const Grid = () => {
  const answer = React.useMemo(() => {
    // generate m * n random numbers under 2 * m * n
    return Array.from({ length: m * n }).map(() => randomIcon()[0]);
  }, []);

  const answerGrid = React.useMemo(() => {
    return answer.map((value, index) => ({
      frontValue: value,
      backValue: 0,
      flipped: false,
      disableAnimation: false,
    }));
  }, [answer]);

  const [grid, setGrid] = useState(() => {
    // shuffle the answer
    const shuffled = [...answer].sort(() => random() - 0.5);
    // create a grid of m * n tiles
    return shuffled.map((value, index) => ({
      frontValue: value, // Front face value
      backValue: randomIcon(value)[1], // Back face value
      flipped: random() * 2 < 1,
      disableAnimation: false, // Track if flip animation should be disabled
    }));
  }, [answer]);

  // Move tiles and preserve their flipped state
  const moveSquare = useCallback(
    (fromIndex, toIndex) => {
      const newGrid = [...grid];
      [newGrid[fromIndex], newGrid[toIndex]] = [
        newGrid[toIndex],
        newGrid[fromIndex],
      ];
      newGrid[fromIndex].disableAnimation = true;
      newGrid[toIndex].disableAnimation = true;
      setGrid(newGrid);

      // Re-enable the animation after the tiles are swapped
      setTimeout(() => {
        newGrid[fromIndex].disableAnimation = false;
        newGrid[toIndex].disableAnimation = false;
        setGrid([...newGrid]);
      }, 0); // Run after render
    },
    [grid]
  );

  // Toggle the flipped state of a tile
  const handleClick = (index) => {
    const newGrid = [...grid];
    newGrid[index].flipped = !newGrid[index].flipped;
    setGrid(newGrid);
  };

  return (
    <>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${n}, 1fr)`,
          gridTemplateRows: `repeat(${m}, 1fr)`,
        }}
      >
        {grid.map((tile, index) => (
          <Square
            key={index}
            index={index}
            frontValue={tile.frontValue}
            backValue={tile.backValue}
            moveSquare={moveSquare}
            flipped={tile.flipped}
            disableAnimation={tile.disableAnimation}
            onClick={handleClick}
            clickable
          />
        ))}
      </div>
      Answer
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${n}, 1fr)`,
          gridTemplateRows: `repeat(${m}, 1fr)`,
        }}
      >
        {answerGrid.map((tile, index) => (
          <Square
            key={index}
            index={index}
            frontValue={tile.frontValue}
            disableAnimation={true}
          />
        ))}
      </div>
    </>
  );
};

// Main App component
const App = () => {
  return (
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
      <div className="app">
        <Grid /> {/* Change m and n as needed */}
      </div>
    </DndProvider>
  );
};

export default App;
