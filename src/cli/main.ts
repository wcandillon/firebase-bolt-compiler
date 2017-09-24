import * as program from "commander";
import * as getStdin from "get-stdin";
import * as bolt from "firebase-bolt";

import generateTs from "../TypeScriptGenerator";

const pkg = require("../../package.json");

program
    .version(pkg.version)
    .parse(process.argv)
;

getStdin()
    .then(source => {
        if (!source) {
            throw new Error("No input file.");
        }
        const {schema} = bolt.parse(source);
        process.stdout.write(generateTs(schema) + "\n");
    })
    .catch(error => process.stderr.write(error + "\n"))
;