export type AttributeType =
  | "string" | "integer" | "float" | "boolean" | "uuid"
  | "date" | "datetime" | "json" | "text" | "enum";

export type Constraint = "unique" | "indexed" | "nullable" | "primary key";

export interface Attribute {
  id: string;
  name: string;
  type: AttributeType;
  constraints: Constraint[];
  defaultValue: string;
  required: boolean;
  isSystem?: boolean;
}

export type RelationType = "1:1" | "1:N" | "N:M";

export interface Relation {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: RelationType;
  foreignKey: string;
  alias?: string;
  cascadeOnDelete?: boolean;
}

export interface EntitySettings {
  slug: string;
  softDeletes: boolean;
  timestamps: boolean;
  apiAccess: boolean;
}

export interface Entity {
  id: string;
  name: string;
  description: string;
  color: string;
  attributes: Attribute[];
  settings: EntitySettings;
}

export const ENTITY_COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899",
];

export const ATTRIBUTE_TYPES: AttributeType[] = [
  "string", "integer", "float", "boolean", "uuid", "date", "datetime", "json", "text", "enum",
];

export const CONSTRAINT_OPTIONS: Constraint[] = ["unique", "indexed", "nullable", "primary key"];
