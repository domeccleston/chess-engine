const cmd = require("node-cmd");

cmd.runSync("mkdir -p dist/img/chesspieces");
cmd.runSync("cp -r img/chesspieces/wikipedia dist/img/chesspieces");
