import { useCallback, useEffect, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import Controls from "./components/controls";
import MovableSquare from "./components/movable-square";
import Square from "./components/square";
import utils from "./utils";

import "./App.css";

const randomIcon = (max, avoid) => {
  while (true) {
    const value = Math.floor(utils.random.next() * max) + 1;
    if (value !== avoid) {
      return value;
    }
  }
};

const AnswerGrid = ({ answer, m, n }) => (
  <div
    className="grid"
    style={{
      width: "50%",
      left: 0,
      gridTemplateColumns: `repeat(${n}, 1fr)`,
      gridTemplateRows: `repeat(${m}, 1fr)`,
    }}
  >
    {answer.map((value, index) => (
      <Square key={index} value={value} />
    ))}
  </div>
);

// Grid component
const Grid = ({ answer, m, n }) => {
  const [grid, setGrid] = useState([]);

  useEffect(() => {
    // shuffle the answer
    const shuffled = [...answer].sort(() => utils.random.next() - 0.5);
    // create a grid of m * n tiles
    setGrid(
      shuffled.map((value, _) => ({
        frontValue: value, // Front face value
        backValue: randomIcon(2 * m * n, value), // Back face value
        flipped: utils.random.next() * 2 < 1,
      }))
    );
  }, [answer, m, n]);

  // Move tiles and preserve their flipped state
  const moveSquare = useCallback(
    (fromIndex, toIndex) => {
      const newGrid = [...grid];
      [newGrid[fromIndex], newGrid[toIndex]] = [
        newGrid[toIndex],
        newGrid[fromIndex],
      ];
      setGrid(newGrid);
    },
    [grid]
  );

  // Toggle the flipped state of a tile
  const handleClick = useCallback(
    (index) => {
      const newGrid = [...grid];
      newGrid[index].flipped = !newGrid[index].flipped;
      setGrid(newGrid);
    },
    [grid]
  );

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${n}, 1fr)`,
        gridTemplateRows: `repeat(${m}, 1fr)`,
      }}
    >
      {grid.map((tile, index) => (
        <MovableSquare
          key={index}
          index={index}
          frontValue={tile.frontValue}
          backValue={tile.backValue}
          moveSquare={moveSquare}
          flipped={tile.flipped}
          onClick={handleClick}
        />
      ))}
    </div>
  );
};

// Main App component
const App = () => {
  const [states, setStates] = useState({});
  const m = useMemo(() => Math.min(states.m, 5), [states.m]);
  const n = useMemo(() => Math.min(states.n, 5), [states.n]);

  const answer = useMemo(() => {
    utils.random.setSeed(states.seed);
    // generate m * n random numbers under 2 * m * n
    return Array.from({ length: m * n }).map(() => randomIcon(2 * m * n));
  }, [m, n, states.seed]);

  return (
    <div className="app">
      <Controls states={states} setStates={setStates} />
      <AnswerGrid answer={answer} m={m} n={n} />
      <br />
      <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
        <Grid answer={answer} m={m} n={n} />
      </DndProvider>
    </div>
  );
};

export default App;
