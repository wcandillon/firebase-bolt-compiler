import * as _ from "lodash";

import { ExpType, ExpGenericType, ExpUnionType, ExpSimpleType, Schema } from "./AST";

/*
    static isGeneric(schema: Schema): boolean {
        return schema.params !== undefined && schema.params.length > 0;
    }
 */
const BuiltinMapping: { [name: string]: string } = {
    Any: "any",
    Boolean: "boolean",
    Number: "number",
    Null: "undefined",
    Object: "Object",
    String: "string"
};

/* tslint:disable:no-use-before-declare */
const serialize = (type: ExpType): string => {
    if ((type as ExpGenericType).params) {
        return serializeGenericType(type as ExpGenericType);
    } else if ((type as ExpUnionType).types) {
        return serializeUnionType(type as ExpUnionType);
    } else {
        return serializeSimpleType(type as ExpSimpleType);
    }
};
/* tslint:enable:no-use-before-declare */

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

export default function(schema: { [name: string]: Schema }): string {
        const header = `type Map<K extends String, V> = { K: V };`;
        return header + "\n" + _.map(schema, (type, name) => `
export interface ${name} ${derives(type)}{
${_.map(type.properties, (property, propertyName) => `    ${propertyName}: ${serialize(property)};
`).join("")} 
}`).join("");
}
