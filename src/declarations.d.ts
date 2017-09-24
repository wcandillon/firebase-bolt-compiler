declare module "firebase-bolt" {
    export interface PathPart {
        label: string;
        variable: string;
    }

    export type PathTemplate = { parts: PathPart[] };

    export interface Path {
        template: PathTemplate;
        isType: ExpType;
    }

    export type Schemas = { [name: string]: Schema };

    export interface Exp {
        type: string;
        valueType: string;
    }

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

    export function parse(source: string): { schema: Schemas, paths: Path[] };
}