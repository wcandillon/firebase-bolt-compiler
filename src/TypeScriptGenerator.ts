import * as _ from "lodash";

import { Path, Schemas, ExpType, ExpGenericType, ExpUnionType, ExpSimpleType, Schema } from "firebase-bolt";

type NamedType = ExpSimpleType | ExpGenericType;

export default class TypeScriptGenerator {

    private schemas: Schemas;
    private paths: Path[];

    private atomicTypes: { [type: string]: string } = {
        Any: "any",
        Boolean: "boolean",
        Number: "number",
        Null: "null | undefined",
        Object: "Object",
        String: "string"
    };

    constructor(schemas: Schemas, paths: Path[]) {
        this.schemas = schemas;
        this.paths = paths;
        _.forEach(
            schemas,
            (schema, name) => {
                const type = schema.derivedFrom as ExpSimpleType;
                if (type.name && this.derivesFromAtomic(type)) {
                    this.atomicTypes[name] = this.serializeTypeName(type.name);
                }
            }
        );
    }

    generate(): string {
        // const paths = this.paths.map(path => this.serializePath(path)).join("\n\n") + "\n\n";
        const types = _.map(this.schemas, (schema, name) => this.serializeSchema(name, schema))
            .join("\n\n")
            .trim();
        // return paths + types;
        return types;
    }

    private serializePath(path: Path): string {
        const methodName = _.camelCase(`get ${path.template.parts[0].label}`);
        const params = path.template.parts
            .map(part => part.variable ? `${part.variable}: string` : "")
            .filter(part => part !== "")
            .join(", ");
        return `export function ${methodName}(${params}) {
    return \`${path.template.parts.map(p => p.variable ? `\${${p.variable}}` : p.label).join("/")}\`;
}`;
    }

    private serializeTypeName(name: string): string {
        return this.atomicTypes[name] || name;
    }

    /* tslint:disable:no-use-before-declare */
    private serialize(type: ExpType): string {
        if ((type as ExpGenericType).params) {
            return this.serializeGenericType(type as ExpGenericType);
        } else if ((type as ExpUnionType).types) {
            return this.serializeUnionType(type as ExpUnionType);
        } else {
            return this.serializeSimpleType(type as ExpSimpleType);
        }
    }
    /* tslint:enable:no-use-before-declare */

    private serializeSimpleType(type: ExpSimpleType): string {
        return this.serializeTypeName(type.name);
    }

    private serializeUnionType(type: ExpUnionType): string {
        return type.types.map(t => this.serialize(t)).join(" | ");
    }

    private serializeGenericType(type: ExpGenericType): string {
        return type.name === "Map"
            ?
            `{ [key: string]: ${this.serialize(type.params[1])} }`
            :
            this.serializeGenericTypeRef(type);
    }

    private serializeGenericTypeRef(type: ExpGenericType): string {
        const typeName = this.serializeTypeName(type.name);
        const params = type.params.map(param => this.serialize(param)).join(", ");
        return `${typeName}<${params}>`;
    }

    private serializeRef(type: ExpType): string {
        if ((type as ExpGenericType).params) {
            return this.serializeGenericTypeRef(type as ExpGenericType);
        } else if ((type as ExpUnionType).types) {
            throw new Error();
        } else {
            return (type as ExpSimpleType).name;
        }
    }

    private derivesFromMap(type: ExpGenericType): boolean {
        return type.name === "Map";
    }

    private derivesFromAtomic(type: ExpSimpleType): boolean {
        return this.atomicTypes[type.name] !== undefined && type.name !== "Object";
    }

    private derives(schema: Schema): string  {
        const type = this.serializeRef(schema.derivedFrom);
        if (type !== "Object") {
            return `extends ${type} `;
        } else {
            return ``;
        }
    }

    /*
    private optionalMark(type: ExpType): string {
        if (type.name || !type.params) {

        }
        return "";
    }
    */

    private serializeSchema(name: string, schema: Schema): string {
        if (this.derivesFromMap(schema.derivedFrom as ExpGenericType)) {
            return `export type ${name} = ${this.serializeGenericType(schema.derivedFrom as ExpGenericType)};`;
        } else if (!this.derivesFromAtomic(schema.derivedFrom as ExpSimpleType)) {
            return `export interface ${name} ${this.derives(schema)}{
${
                _.map(
                    schema.properties,
                    (property, propertyName) => `    ${propertyName}: ${this.serialize(property)};`
                ).join("\n")
}
}`;
        } else {
            return "";
        }
    }
}
