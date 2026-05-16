export type AttributeType =
    | "string" | "integer" | "float" | "boolean" | "uuid"
    | "date" | "datetime" | "json" | "text" | "enum";

export interface Attribute {
    id: string;
    name: string;
    type: AttributeType;
    constraints: Constraint[];
    defaultValue: string;
    required: boolean;
    isSystem?: boolean;
}

export type Constraint = "unique" | "indexed" | "nullable" | "primary key";

export interface EntitySettings {
    slug: string;
    softDeletes: boolean;
    timestamps: boolean;
    apiAccess: boolean;
}

export interface Entity {
    id: string;
    name: string;
    table_name: string;
    description: string;
    color: string;
    attributes: Attribute[];
    settings: EntitySettings;
}





export interface Entity {
    id: string;
    name: string;
    description: string;
    color: string;
    attributes: Attribute[];
    settings: EntitySettings;
}

export interface EntitySettings {
    slug: string;
    softDeletes: boolean;
    timestamps: boolean;
    apiAccess: boolean;
}

export interface Attribute {
    id: string;
    name: string;
    type: AttributeType;
    constraints: Constraint[];
    defaultValue: string;
    required: boolean;
    isSystem?: boolean;
}




//Single Entity Types
export type DataType =
    | "VARCHAR(50)"
    | "VARCHAR(255)"
    | "TEXT"
    | "BOOLEAN"
    | "INTEGER"
    | "TIMESTAMP WITH TIME ZONE"
    | "UUID";

export interface Column {
    id: string;
    name: string;
    column_name: string;
    dataType: DataType;
    primaryKey?: boolean;
    notNull?: boolean;
    unique?: boolean;
    defaultValue?: string;
    generated?: boolean;
}