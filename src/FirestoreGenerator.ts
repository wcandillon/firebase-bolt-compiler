import * as _ from "lodash";

import {
    Path, Exp, Schemas, ExpType, ExpGenericType, ExpOp, ExpUnionType, ExpSimpleType, ExpCall, Schema, Method,
    ExpReference, ExpVariable, ExpValue, Functions
} from "firebase-bolt";

type NamedType = ExpSimpleType | ExpGenericType;

const isIdentifierStringExp = (exp: Exp) =>
    exp.type === "String" && /^[a-zA-Z_$][a-zA-Z0-9_]*$/.test((exp as ExpValue).value);

export default class FirestoreGenerator {

    private schemas: Schemas;
    private paths: Path[];
    private functions: Functions;

    constructor(schemas: Schemas, paths: Path[], functions: Functions) {
        this.schemas = schemas;
        this.paths = paths;
        this.functions = functions;
    }

    generate(): string {
       return `service cloud.firestore {
  match /databases/{database}/documents {
    ${this.paths.map(path => this.serializePath(path)).join("\n")}
  }
}`;
    }

    private serializePath(path: Path): string {
        const url = path.template.parts.map(
            part => part.variable ? `{${part.variable}}` : part.label
        ).join("/");
        return `match /${url} {
            allow read: if ${this.serializeExp(path.methods.read.body)};
            allow write: if ${this.serializeExp(path.methods.write.body)};
}`;
    }

    private serializeExp(expr: Exp): string {
        if (expr.type === "call") {
            const callExpr = expr as ExpCall;
            if ((callExpr.ref as ExpVariable).name) {
                const fnName = (callExpr.ref as ExpVariable).name;
                const fn = this.functions[fnName];
                return this.serializeExp(fn.body);
            } else {
                const ref = callExpr.ref as ExpReference;
                return this.serializeExp(ref);
            }
        } else if (expr.type === "String") {
            return `"${(expr as ExpValue).value}"`;
        } else if (expr.type === "Null") {
            return "null";
        } else if (expr.type === "Boolean") {
            return (expr as ExpValue).value;
        } else if (expr.type === "ref") {
            const ref = expr as ExpReference;
            if (isIdentifierStringExp(ref.accessor)) {
                return this.serializeExp(ref.base) + "." + (ref.accessor as ExpValue).value;
            } else {
                return `${this.serializeExp(ref.base)}[${this.serializeExp(ref.accessor)}]`;
            }
            /*
            if (isIdentifierStringExp(expRef.accessor)) {
                result = decodeExpression(expRef.base, innerPrecedence) + '.' + (<ExpValue> expRef.accessor).value;
            } else {
                result = decodeExpression(expRef.base, innerPrecedence) +
                    '[' + decodeExpression(expRef.accessor) + ']';
            }
            */
        } else if (expr.type === "var") {
            return (expr as ExpVariable).name;
        } else if (expr.type === "op") {
            const op = expr as ExpOp;
            if (op.args.length === 1) {
                return `${op.op}${this.serializeExp(op.args[0])}`;
            } else if (op.args.length === 2) {
                return `${this.serializeExp(op.args[0])} ${op.op} ${this.serializeExp(op.args[1])}`;
            } else if (op.args.length === 3) {
                const a = this.serializeExp(op.args[0]);
                const b = this.serializeExp(op.args[1]);
                const c = this.serializeExp(op.args[2]);
                return `${a} ? ${b} : ${c}`;
            }
        }
        throw new Error(`Unknow expression type ${expr.type}`);
    }
}
