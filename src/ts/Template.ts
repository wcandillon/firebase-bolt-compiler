import * as _ from "lodash";

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

export interface TypeParams { [name: string]: ExpType; };

export interface Schema {
    derivedFrom: ExpType;
    properties: TypeParams;
    // Generic parameters - if a Generic schema
    params?: string[];
};

/*

    static isGeneric(schema: Schema): boolean {
        return schema.params !== undefined && schema.params.length > 0;
    }
 */
const BuiltinMapping: { [name: string]: string } = {
    Any: 'any',
    Boolean: 'boolean',
    Number: 'number',
    Null: 'undefined',
    Object: 'Object',
    String: 'string'
};

const serializeTypeName = (name: string) => BuiltinMapping[name] || name;

const serializeSimpleType = (type: ExpSimpleType) => serializeTypeName(type.name);

const serializeUnionType = (type: ExpUnionType) => type.types.map(serialize).join(" | ");

const serializeGenericType = (type: ExpGenericType) =>
    type.name === "Map"
        ?
            `{ [key: ${serialize(type.params[0])}]: ${serialize(type.params[1])} }`
        :
            `${serializeTypeName(type.name)}<${type.params.map(serialize).join(", ")}>`;


const serializeGenericTypeRef = (type: ExpGenericType) =>
    `${serializeTypeName(type.name)}<${type.params.map(serialize).join(", ")}>`;

const serialize = (type: ExpType): string => {
    if ((type as ExpGenericType).params) {
        return serializeGenericType(type as ExpGenericType);
    } else if ((type as ExpUnionType).types) {
        return serializeUnionType(type as ExpUnionType);
    } else {
       return  serializeSimpleType(type as ExpSimpleType);
    }
};

const serializeRef = (type: ExpType): string => {
    if ((type as ExpGenericType).params) {
        return serializeGenericTypeRef(type as ExpGenericType);
    } else if ((type as ExpUnionType).types) {
        throw new Error();
    } else {
        return (type as ExpSimpleType).name;
    }
};
const derives = (schema: Schema): string =>  {
    const type = serializeRef(schema.derivedFrom);
    if (type !== "Object") {
        return `extends ${type} `;
    } else {
        return ``;
    }
};

export default class TypeScriptTemplate {
    static get(schema: { [name: string]: Schema }): string {
        const header = `type Map<K extends string, V> = { K: V };`
        return header + "\n" + _.map(schema, (type, name) => `
export interface ${name} ${derives(type)}{
${_.map(type.properties, (property, name) => `    ${name}: ${serialize(property)};
`).join("")} 
}`).join("");
    }
}