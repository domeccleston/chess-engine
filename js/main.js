var board = null;
var game = new Chess();

function makeRandomMove() {
  // chess.js gives us all the possible moves in an array
  // [ move1, move2, move3 ... ]
  var possibleMoves = game.moves();

  // exit if the game is over
  if (game.game_over()) return;

  // check for possible captures
  const possibleCaptures = possibleMoves.filter((move) => {
    return move.includes("x");
  });

  let randomMove;

  if (possibleCaptures.length) {
    // if there are captures, pick one at random
   randomMove = possibleCaptures[Math.floor(Math.random() * possibleCaptures.length)];
  } else {
    // if there are no captures, pick a random move
    randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }

  // updates javascript board state
  game.move(randomMove);

  // changes html board state
  board.position(game.fen());

  // call this function again in 5 secs
  window.setTimeout(makeRandomMove, 500);
}

board = Chessboard("myBoard", "start");

window.setTimeout(makeRandomMove, 500);
