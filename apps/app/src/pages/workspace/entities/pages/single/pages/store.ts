import { create } from "zustand";

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
  dataType: DataType;
  primaryKey?: boolean;
  notNull?: boolean;
  unique?: boolean;
  defaultValue?: string;
  generated?: boolean;
}

export interface Constraint {
  id: string;
  name: string;
  definition: string;
}

export interface IndexDef {
  id: string;
  name: string;
  unique?: boolean;
  columns: string[];
}

export interface Policy {
  id: string;
  name: string;
  command: string;
  using: string;
}

export type Row = Record<string, string | boolean | null>;

export type FilterOperator =
  | "="
  | "<>"
  | ">"
  | "<"
  | ">="
  | "<="
  | "~~"
  | "~~*"
  | "in"
  | "is";

export interface Filter {
  id: string;
  column: string;
  operator: FilterOperator;
  value: string;
}

export interface Sort {
  column: string;
  direction: "asc" | "desc";
}

export type SchemaKind = "columns" | "constraints" | "indexes" | "policies";

interface DatabaseState {
  tableName: string;
  schema: string;
  rls: boolean;
  columns: Column[];
  constraints: Constraint[];
  indexes: IndexDef[];
  policies: Policy[];
  rows: Row[];
  pendingRows: Row[];
  page: number;
  pageSize: number;

  // selection
  selectedRows: Record<number, boolean>;
  selectedSchema: Record<SchemaKind, Record<string, boolean>>;

  // data view
  filters: Filter[];
  sorts: Sort[];

  setTableName: (n: string) => void;
  setSchema: (s: string) => void;
  toggleRLS: () => void;

  addColumn: () => void;
  updateColumn: (id: string, patch: Partial<Column>) => void;
  removeColumn: (id: string) => void;

  addConstraint: () => void;
  removeConstraint: (id: string) => void;
  addIndex: () => void;
  removeIndex: (id: string) => void;
  addPolicy: () => void;
  removePolicy: (id: string) => void;

  addRow: () => void;
  updateCell: (rowIdx: number, col: string, value: string | boolean | null) => void;
  removeRow: (rowIdx: number) => void;
  saveRows: () => void;
  discardRows: () => void;

  setPage: (p: number) => void;
  setPageSize: (s: number) => void;

  // selection actions
  toggleRowSelection: (idx: number) => void;
  clearRowSelection: () => void;
  toggleSchemaSelection: (kind: SchemaKind, id: string) => void;
  clearSchemaSelection: () => void;
  deleteSelectedSchema: () => void;

  // filter / sort
  addFilter: () => void;
  updateFilter: (id: string, patch: Partial<Filter>) => void;
  removeFilter: (id: string) => void;
  clearFilters: () => void;
  cycleSort: (column: string) => void;
  clearSorts: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const initialColumns: Column[] = [
  { id: uid(), name: "id", dataType: "VARCHAR(50)", primaryKey: true, notNull: true },
  { id: uid(), name: "user_id", dataType: "VARCHAR(50)" },
  { id: uid(), name: "token", dataType: "TEXT" },
  { id: uid(), name: "expired", dataType: "BOOLEAN" },
  { id: uid(), name: "created_at", dataType: "TIMESTAMP WITH TIME ZONE" },
];

const initialRows: Row[] = [
  {
    id: "rrf",
    user_id: "dfg",
    token: "fgdfgsfr",
    expired: true,
    created_at: "2026-05-13 00:00:00",
  },
];

export const useDatabaseStore = create<DatabaseState>((set, get) => ({
  tableName: "refresh_tokens",
  schema: "public",
  rls: false,
  columns: initialColumns,
  constraints: [
    {
      id: uid(),
      name: "fk_users_refresh_tokens",
      definition:
        "FOREIGN KEY (user_id) REFERENCES public.users (id) ON UPDATE CASCADE ON DELETE CASCADE",
    },
    { id: uid(), name: "refresh_tokens_pkey", definition: "PRIMARY KEY (id)" },
  ],
  indexes: [
    { id: uid(), name: "idx_refresh_tokens_user_id", columns: ["user_id"] },
    { id: uid(), name: "refresh_tokens_pkey", unique: true, columns: ["id"] },
  ],
  policies: [],
  rows: initialRows,
  pendingRows: initialRows,
  page: 0,
  pageSize: 50,

  selectedRows: {},
  selectedSchema: { columns: {}, constraints: {}, indexes: {}, policies: {} },

  filters: [],
  sorts: [],

  setTableName: (n) => set({ tableName: n }),
  setSchema: (s) => set({ schema: s }),
  toggleRLS: () => set((s) => ({ rls: !s.rls })),

  addColumn: () =>
    set((s) => ({
      columns: [
        ...s.columns,
        { id: uid(), name: `column_${s.columns.length + 1}`, dataType: "TEXT" },
      ],
    })),
  updateColumn: (id, patch) =>
    set((s) => ({ columns: s.columns.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
  removeColumn: (id) => set((s) => ({ columns: s.columns.filter((c) => c.id !== id) })),

  addConstraint: () =>
    set((s) => ({
      constraints: [
        ...s.constraints,
        { id: uid(), name: `constraint_${s.constraints.length + 1}`, definition: "CHECK (true)" },
      ],
    })),
  removeConstraint: (id) =>
    set((s) => ({ constraints: s.constraints.filter((c) => c.id !== id) })),
  addIndex: () =>
    set((s) => ({
      indexes: [...s.indexes, { id: uid(), name: `idx_${s.indexes.length + 1}`, columns: [] }],
    })),
  removeIndex: (id) => set((s) => ({ indexes: s.indexes.filter((i) => i.id !== id) })),
  addPolicy: () =>
    set((s) => ({
      policies: [
        ...s.policies,
        { id: uid(), name: `policy_${s.policies.length + 1}`, command: "SELECT", using: "true" },
      ],
    })),
  removePolicy: (id) => set((s) => ({ policies: s.policies.filter((p) => p.id !== id) })),

  addRow: () => {
    const cols = get().columns;
    const empty: Row = {};
    cols.forEach((c) => (empty[c.name] = null));
    set((s) => ({ pendingRows: [...s.pendingRows, empty] }));
  },
  updateCell: (rowIdx, col, value) =>
    set((s) => {
      const next = s.pendingRows.map((r, i) => (i === rowIdx ? { ...r, [col]: value } : r));
      return { pendingRows: next };
    }),
  removeRow: (rowIdx) =>
    set((s) => ({ pendingRows: s.pendingRows.filter((_, i) => i !== rowIdx) })),
  saveRows: () => set((s) => ({ rows: s.pendingRows })),
  discardRows: () => set((s) => ({ pendingRows: s.rows, selectedRows: {} })),

  setPage: (p) => set({ page: p }),
  setPageSize: (s) => set({ pageSize: s }),

  toggleRowSelection: (idx) =>
    set((s) => {
      const next = { ...s.selectedRows };
      if (next[idx]) delete next[idx];
      else next[idx] = true;
      return { selectedRows: next };
    }),
  clearRowSelection: () => set({ selectedRows: {} }),

  toggleSchemaSelection: (kind, id) =>
    set((s) => {
      const next = { ...s.selectedSchema, [kind]: { ...s.selectedSchema[kind] } };
      if (next[kind][id]) delete next[kind][id];
      else next[kind][id] = true;
      return { selectedSchema: next };
    }),
  clearSchemaSelection: () =>
    set({ selectedSchema: { columns: {}, constraints: {}, indexes: {}, policies: {} } }),
  deleteSelectedSchema: () =>
    set((s) => {
      const sel = s.selectedSchema;
      return {
        columns: s.columns.filter((c) => !sel.columns[c.id]),
        constraints: s.constraints.filter((c) => !sel.constraints[c.id]),
        indexes: s.indexes.filter((i) => !sel.indexes[i.id]),
        policies: s.policies.filter((p) => !sel.policies[p.id]),
        selectedSchema: { columns: {}, constraints: {}, indexes: {}, policies: {} },
      };
    }),

  addFilter: () =>
    set((s) => {
      const firstCol = s.columns[0]?.name ?? "";
      return {
        filters: [
          ...s.filters,
          { id: uid(), column: firstCol, operator: "=", value: "" },
        ],
      };
    }),
  updateFilter: (id, patch) =>
    set((s) => ({ filters: s.filters.map((f) => (f.id === id ? { ...f, ...patch } : f)) })),
  removeFilter: (id) => set((s) => ({ filters: s.filters.filter((f) => f.id !== id) })),
  clearFilters: () => set({ filters: [] }),

  cycleSort: (column) =>
    set((s) => {
      const existing = s.sorts.find((x) => x.column === column);
      const others = s.sorts.filter((x) => x.column !== column);
      if (!existing) return { sorts: [...others, { column, direction: "asc" }] };
      if (existing.direction === "asc")
        return { sorts: [...others, { column, direction: "desc" }] };
      return { sorts: others };
    }),
  clearSorts: () => set({ sorts: [] }),
}));

export const hasPendingChanges = (s: DatabaseState) =>
  JSON.stringify(s.rows) !== JSON.stringify(s.pendingRows);

export const totalSchemaSelected = (s: DatabaseState) =>
  Object.values(s.selectedSchema).reduce((sum, m) => sum + Object.keys(m).length, 0);

export const selectedRowCount = (s: DatabaseState) => Object.keys(s.selectedRows).length;

export const FILTER_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: "=", label: "[ = ] equals" },
  { value: "<>", label: "[ <> ] not equal" },
  { value: ">", label: "[ > ] greater than" },
  { value: "<", label: "[ < ] less than" },
  { value: ">=", label: "[ >= ] greater than or equal" },
  { value: "<=", label: "[ <= ] less than or equal" },
  { value: "~~", label: "[ ~~ ] like" },
  { value: "~~*", label: "[ ~~* ] ilike" },
  { value: "in", label: "[ in ] one of a list of values" },
  { value: "is", label: "[ is ] checking for (null, not null, true, false)" },
];