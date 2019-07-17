declare module "firebase-bolt" {
    export interface Method {
        params: string[];
        body: Exp;
    }

    export interface PathPart {
        label: string;
        variable: string;
    }

    export type PathTemplate = { parts: PathPart[] };

    export interface Path {
        template: PathTemplate;
        isType: ExpType;
        methods: { [name: string]: Method };
    }

    export type Schemas = { [name: string]: Schema };

    export interface Exp {
        type: string;
        valueType: string;
    }

    export interface ExpValue extends Exp {
        value: string;
    }

    export interface RegExpValue extends ExpValue {
        modifiers: string;
    }

    export interface ExpNull extends Exp {
    }

    export interface ExpOp extends Exp {
        op: string;
        args: Exp[];
    }

    export interface ExpVariable extends Exp {
        name: string;
    }

    export interface ExpLiteral extends Exp {
        name: string;
    }

    export interface ExpReference extends Exp {
        base: Exp;
        accessor: Exp;
    }

    export interface ExpCall extends Exp {
        ref: ExpReference | ExpVariable;
        args: Exp[];
    }

    export interface Params { [name: string]: Exp; }

    export type ExpType = ExpSimpleType | ExpUnionType | ExpGenericType;

    export interface ExpGenericType extends Exp {
        name: string;
        params: ExpType[];
    }

    export interface ExpUnionType extends Exp {
        types: ExpType[];
    }

    export interface ExpSimpleType extends Exp {
        name: string;
    }

    export interface TypeParams {
        [name: string]: ExpType;
    }

    export interface Schema {
        derivedFrom: ExpType;
        properties: TypeParams;
        // Generic parameters - if a Generic schema
        params?: string[];
    }

    export type Functions = { [name: string]: Method };

    export function parse(source: string): { schema: Schemas, paths: Path[], functions: Functions };
}