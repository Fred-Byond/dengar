const K = require("./dk.js");
const p = K.deck();
let n = require("./d-a.js")(p);
n = require("./d-b.js")(p, n);
n = require("./d-c.js")(p, n);
n = require("./d-d.js")(p, n);
const out = process.argv[2];
p.writeFile({ fileName: out }).then(() => console.log("wrote", out, "·", n + 1, "slides"));
