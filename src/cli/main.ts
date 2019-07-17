import * as program from "commander";
import * as getStdin from "get-stdin";
import * as bolt from "firebase-bolt";

import TypeScriptGenerator from "../TypeScriptGenerator";
import FirestoreGenerator from "../FirestoreGenerator";

const pkg = require("../../package.json");

program
    .version(pkg.version)
    .option("-f, --firestore", "Firestore Generator")
    .parse(process.argv)
;

getStdin()
    .then(source => {
        if (!source) {
            throw new Error("No input file.");
        }
        const {schema, paths, functions} = bolt.parse(source);
        const generator = program.firestore
            ?
                new FirestoreGenerator(schema, paths, functions)
            :
                new TypeScriptGenerator(schema, paths)
        ;
        process.stdout.write(generator.generate());
    })
    .catch(error => process.stderr.write(error + "\n"))
;