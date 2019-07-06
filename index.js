(function app(params) {
  const Api = (function api() {
    async function getRandom() {
      const res = await fetch(
        //"api/1404.json"
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

    x = 0;
    const moveNext = state => {
      while (true) {
        x++;
        state.maze[state.position[0]][state.position[1]] = false;
        try {
          const next = nextAvaliablePosition(state.maze, state.position);
          if (!next) {
            if (posEq(state.position, state.startPosition)) {
              return { success: false };
            }
            state.position = state.prev.pop();
          } else if (posEq(next, state.endPosition)) {
            state.prev.push(state.position);
            return { success: true, path: state.prev };
          } else {
            state.prev.push(state.position);
            state.position = next;
          }
        } catch (error) {
          console.error(error);
          console.log(state);
          return null;
        }
      }
    };

    const solve = mazeData => {
      const maze = mazeData.map(r => r.map(c => c !== "X"));

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
      const startPosition = findPosition(mazeData, "A");
      const endPosition = findPosition(mazeData, "B");

      const state = {
        prev: [],
        startPosition,
        endPosition,
        position: startPosition,
        maze
      };

      return moveNext(state);
    };

    return {
      solve
    };
  })();

  const ReactView = (function view() {
    var e = React.createElement;

    const cellClassNames = {
      " ": "empty",
      X: "wall",
      A: "player",
      B: "target",
      P: "path"
    };

    const render = grid => {
      let id = 0;
      const items = [];
      const gridE = e(
        "div",
        {
          className: "maze",
          style: { gridTemplateColumns: "repeat(" + grid.length + ", 1fr)" }
        },
        items
      );
      for (const row of grid) {
        for (const cell of row) {
          const className = cellClassNames[cell];
          const item = e("div", { key: ++id, className });
          items.push(item);
        }
      }

      return gridE;
    };
    const root = document.getElementById("root");
    return {
      render: data => {
        const x = ReactDOM.render(render(data), root);
        console.log(x);
      }
    };
  })();

  const CanvasView = (function() {
    const canvas = document.getElementById("stage");
    canvas.width = 500;
    canvas.height = 1000;
    ctx = canvas.getContext("2d");

    const styles = {
      " ": "white",
      X: "black",
      A: "green",
      B: "red",
      P: "blue"
    };
    const render = data => {
      const w = canvas.width / data[0].length;
      console.log(w)
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        for (let j = 0; j < row.length; j++) {
          const col = row[j];
          ctx.fillStyle = styles[col]
          ctx.stroke();
          ctx.fillRect(w*i,w*j,w,w)
        }
      }
    };
    return {
      render
    };
  })();

  async function run() {
    const data = await Api.getRandom();

    try {
      const sol = Model.solve(data);
      for (let i = 1; i < sol.path.length; i++) {
        const [a, b] = sol.path[i];
        data[a][b] = "P";
      }
    } catch (error) {
      console.log(error);
    }

    //ReactView.render(data);
    CanvasView.render(data);
  }

  run();
})();
