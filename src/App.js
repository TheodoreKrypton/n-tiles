import React, { useCallback, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';

const ItemTypes = {
  SQUARE: 'square',
};

// Square component
const Square = ({ frontValue, backValue, onClick, index, moveSquare, flipped, disableAnimation }) => {
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

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`square ${flipped ? 'flipped' : ''} ${disableAnimation ? 'no-animation' : ''}`} // Disable animation while dragging
      style={{
        opacity: isDraggingTile ? 0.5 : 1,
        cursor: 'move',
      }}
      onClick={() => onClick(index)}
    >
      {flipped ? backValue : frontValue}
    </div>
  );
};

// Grid component
const Grid = ({ m, n }) => {
  const initialGrid = Array.from({ length: m * n }, (_, i) => ({
    frontValue: i + 1,    // Front face value
    backValue: i + 101,   // Back face value
    flipped: false,       // Initially, the front is showing
    disableAnimation: false,  // Track if flip animation should be disabled
  }));

  const [grid, setGrid] = useState(initialGrid);

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
    <div className="grid">
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
        />
      ))}
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <h1>Drag & Flip Squares</h1>
        <Grid m={4} n={4} /> {/* Replace m and n as per your need */}
      </div>
    </DndProvider>
  );
};

export default App;
