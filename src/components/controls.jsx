import { useEffect } from "react";

import utils from "../utils";

const Controls = ({ states, setStates }) => {
  useEffect(() => {
    const { m, n, seed } = states;
    if (m === undefined || n === undefined || seed === undefined) {
      const searchParams = new URLSearchParams(window.location.search);
      setStates({
        m: searchParams.get("m") || 4,
        n: searchParams.get("n") || 4,
        seed: searchParams.get("seed") || 1,
      });
    }
    utils.random.setSeed(states.seed);
  }, [states, setStates]);

  return (
    <div className="controls">
      <label>
        Rows:
        <input
          type="number"
          value={states.m}
          onChange={(e) => setStates({ ...states, m: e.target.value })}
          size="sm"
        />
      </label>
      <br />
      <label>
        Columns:
        <input
          type="number"
          value={states.n}
          onChange={(e) => setStates({ ...states, n: e.target.value })}
          size="sm"
        />
      </label>
      <br />
      <label>
        Seed:
        <input
          type="number"
          value={states.seed}
          onChange={(e) => setStates({ ...states, seed: e.target.value })}
          size="sm"
        />
      </label>
      <br />
      <button
        onClick={() => {
          const seed = (Math.random() * 2 ** 32) >>> 0;
          setStates({ ...states, seed });
        }}
      >
        New Game
      </button>
      <button
        onClick={() => {
          const url = `${window.location.origin}${window.location.pathname}`;
          const search = `?m=${states.m}&n=${states.n}&seed=${states.seed}`;
          navigator.clipboard.writeText(`${url}${search}`);
          window.location.search = search;
        }}
      >
        Share Game
      </button>
    </div>
  );
};

export default Controls;
