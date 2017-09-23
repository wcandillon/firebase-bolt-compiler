import * as program from "commander";
import * as getStdin from "get-stdin";
import * as bolt from "firebase-bolt";

import Template from "../ts/Template";

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
        console.log(Template.get(schema));
    })
    .catch(error => console.log(error));
;