(function maze() {
  const Api = (function api() {
    async function getRandom() {
      let url = "https://api.noopschallenge.com/mazebot/random";
      //url = "360.json";
      const res = await fetch(url);
      return await res.json();
    }

    async function solve(mazePath, directions) {
      const res = await fetch("https://api.noopschallenge.com" + mazePath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          directions: directions
        })
      });

      return await res.json();
    }

    return {
      getRandom,
      solve
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
      const maze = mazeData.map(r => r.map(c => (c !== "X" ? 1 : 0)));
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
        state.maze[state.position[0]][state.position[1]] = 0;
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

  const View = (function() {
    const canvas = document.getElementById("stage");
    canvas.width = 800;

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
      canvas.width = document.body.clientWidth * 0.91;
      const w = canvas.width / data[0].length;
      canvas.height = w * data.length;

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

  const pathToDirections = path => {
    let res = "";
    let prev = path[0];
    for (let i = 1; i < path.length; i++) {
      const cur = path[i];
      if (cur[0] > prev[0]) {
        res += "S";
      } else if (cur[0] < prev[0]) {
        res += "N";
      } else if (cur[1] > prev[1]) {
        res += "E";
      } else {
        res += "W";
      }
      prev = cur;
    }
    return res;
  };
  async function run() {
    const getRes = await Api.getRandom();
    const map = getRes.map;
    const sol = Model.solve(map);
    const directions = pathToDirections(sol.path);
    const solRes = await Api.solve(getRes.mazePath, directions);
    console.log(solRes.message);
    View.render(map, sol.path);

  }

  run();
})();
