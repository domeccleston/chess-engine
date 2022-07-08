let board = null;
let game = new Chess();
const $gameOverText = document.querySelector(".game-over-text");

// CONFIG

var config = {
  draggable: true,
  position: "start",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
};

// GAME UTILITIES

function reverse(array) {
  return array.map((_, idx) => array[array.length - 1 - idx]);
}

const pieceValues = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

const PAWN_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_PST = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const BISHOP_PST = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const QUEEN_PST = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const KING_PST = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

const KING_ENDGAME_PST = [
  [-50, -40, -30, -20, -20, -30, -40, -50],
  [-30, -20, -10, 0, 0, -10, -20, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -30, 0, 0, 0, 0, -30, -30],
  [-50, -30, -30, -30, -30, -30, -30, -50],
];

const positionValues = {
  p: PAWN_PST,
  n: KNIGHT_PST,
  b: BISHOP_PST,
  r: ROOK_PST,
  q: QUEEN_PST,
  k: KING_PST,
};

function onDrop(source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: "q", // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return "snapback";

  // make random legal move for black
  window.setTimeout(makeRandomMove, 250);
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
  board.position(game.fen());
}

function onDragStart(source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false;

  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false;
}

function splitStringByCase(string) {
  const lowerCase = [];
  const upperCase = [];
  for (const char of string) {
    if (isNaN(parseInt(char)) && char !== "/") {
      if (char === char.toLowerCase()) lowerCase.push(char);
      else if (char === char.toUpperCase()) upperCase.push(char);
    }
  }
  return [upperCase, lowerCase];
}

// ALGORITHM

function evaluatePieces(pieces) {
  let sum = 0;
  for (const piece of pieces) {
    const pieceValue = pieceValues[piece.toLowerCase()];
    sum = sum + pieceValue;
  }
  return sum;
}

function getEvaluation(game) {
  let whiteEval = 0;
  let blackEval = 0;
  const board = game.board();
  for (const [rowIndex, row] of board.entries()) {
    for (const [colIndex, square] of row.entries()) {
      if (square) {
        const pieceValue = pieceValues[square.type];
        let positionValue;
        if (square.color === "w") {
          positionValue = positionValues[square.type][rowIndex][colIndex];
          whiteEval += pieceValue;
          whiteEval += positionValue;
        }
        if (square.color === "b") {
          const blackPositionValue = reverse(positionValues[square.type]);
          positionValue = blackPositionValue[rowIndex][colIndex];
          blackEval += pieceValue;
          blackEval += positionValue;
        }
      }
    }
  }
  console.log({ whiteEval, blackEval });
  const evaluation = whiteEval - blackEval;
  return evaluation;
}

function minimax(position, depth, alpha, beta, player) {
  // Base case: just return the evaluation of the position
  if (depth === 0) {
    return getEvaluation(position);
  }

  // If the white player, find the move with the highest eval
  if (player) {
    let maxEval = -Infinity;
    for (const move of position.moves()) {
      position.move(move);
      maxEval = Math.max(
        maxEval,
        minimax(position, depth - 1, alpha, beta, false)
      );
      position.undo();
      alpha = Math.max(alpha, maxEval);
      if (alpha >= beta) {
        return maxEval;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of position.moves()) {
      position.move(move);
      minEval = Math.min(
        minEval,
        minimax(position, depth - 1, alpha, beta, true)
      );
      position.undo();
      beta = Math.min(beta, minEval);
      if (alpha >= beta) {
        return minEval;
      }
    }
    return minEval;
  }
}

/* As the black player, find the move that leads to the worst position for
 * white. To do that, make every possible move, response, response-response
 * up to a specified depth. Assume white will choose the move with the
 * best evaluation each time.
 */
function minimaxRoot(player = true, depth = 2) {
  const moves = game.moves();
  let bestMove = Infinity;
  let bestMoveFound;

  // Iterate over every possible move and pick the one that leads
  // to the lowest evaluation
  for (const [i, move] of moves.entries()) {
    console.log({ i, move });
    game.move(move);
    let value = minimax(game, depth - 1, -Infinity, Infinity, player);
    game.undo();
    if (value <= bestMove) {
      bestMove = value;
      bestMoveFound = moves[i];
    }
  }

  return bestMoveFound;
}

function makeRandomMove() {
  // chess.js gives us all the possible moves in an array
  // [ move1, move2, move3 ... ]
  var possibleMoves = game.moves();

  // exit if the game is over
  if (game.game_over()) {
    $gameOverText.classList.remove("hidden");
    return;
  }

  console.log("calling minimaxRoot");
  const bestMove = minimaxRoot();
  console.log({ bestMove });
  game.move(bestMove);

  // changes html board state
  board.position(game.fen());
}

board = Chessboard("myBoard", config);
