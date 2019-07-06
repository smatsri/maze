(function maze() {
  const Api = (function api() {
    async function getRandom() {
      const res = await fetch(
        "https://api.noopschallenge.com/mazebot/random?mazSize=10"
      );
      const data = await res.json();
      return data.map;
    }
    return {
      getRandom
    };
  })();

  const Model = (function model() {
    const positionIsAvailble = (maze, [i, j]) => {
      return maze[i] && maze[i][j];
    };

    const avaliablePositions = (maze, arr) => {
      const i = arr[0];
      const j = arr[1];
      return [[i, j + 1], [i, j - 1], [i + 1, j], [i - 1, j]].filter(p =>
        positionIsAvailble(maze, p)
      );
    };

    const nextAvaliablePosition = (maze, pos) => {
      const poss = avaliablePositions(maze, pos);
      return poss[0];
    };

    const posEq = ([i1, j1], [i2, j2]) => i1 === i2 && j1 === j2;

    const findPosition = (grid, value) => {
      for (let i = 0; i < grid.length; i++) {
        const row = grid[i];
        for (let j = 0; j < row.length; j++) {
          const col = row[j];
          if (col === value) {
            return [i, j];
          }
        }
      }

      return [0, 0];
    };

    const solve = mazeData => {
      const maze = mazeData.map(r => r.map(c => c !== "X"));

      const startPosition = findPosition(mazeData, "A");
      const endPosition = findPosition(mazeData, "B");

      const state = {
        prev: [],
        startPosition,
        endPosition,
        position: startPosition,
        maze
      };

      while (true) {
        state.maze[state.position[0]][state.position[1]] = false;
        const next = nextAvaliablePosition(state.maze, state.position);
        if (!next) {
          if (posEq(state.position, state.startPosition)) {
            return { success: false };
          }
          state.position = state.prev.pop();
        } else if (posEq(next, state.endPosition)) {
          state.prev.push(state.position);
          state.prev.push(next);
          return { success: true, path: state.prev };
        } else {
          state.prev.push(state.position);
          state.position = next;
        }
      }
    };

    return {
      solve
    };
  })();

  const CanvasView = (function() {
    const canvas = document.getElementById("stage");
    canvas.width = 800;
    canvas.height = 1000;
    ctx = canvas.getContext("2d");
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "white";

    const styles = {
      " ": "white",
      X: "black",
      A: "green",
      B: "red"
    };
    const render = (data, path) => {
      const w = canvas.width / data[0].length;

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        for (let j = 0; j < row.length; j++) {
          const col = row[j];
          ctx.fillStyle = styles[col];
          ctx.fillRect(w * i, w * j, w, w);
        }
      }

      ctx.beginPath();
      ctx.moveTo(path[0][0] * w + w / 2, path[0][1] * w + w / 2);
      console.log(path);
      for (let i = 1; i < path.length; i++) {
        const pos = path[i];
        ctx.lineTo(pos[0] * w + w / 2, pos[1] * w + w / 2);
      }
      ctx.lineWidth = "3";
      ctx.strokeStyle = "blue";
      ctx.stroke();
    };
    return {
      render
    };
  })();

  async function run() {
    const data = await Api.getRandom();

    const sol = Model.solve(data);
    // for (let i = 1; i < sol.path.length; i++) {
    //   const [a, b] = sol.path[i];
    //   data[a][b] = "P";
    // }

    CanvasView.render(data, sol.path);
  }

  run();
})();
