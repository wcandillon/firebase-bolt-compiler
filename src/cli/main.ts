import * as program from "commander";
import * as getStdin from "get-stdin";
import * as bolt from "firebase-bolt";

import TypeScriptGenerator from "../TypeScriptGenerator";

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
        const generator = new TypeScriptGenerator(schema);
        process.stdout.write(generator.generate());
    })
    .catch(error => process.stderr.write(error + "\n"))
;