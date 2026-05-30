# Rs Fixed — JSON examples

React-select with static or API-fetched options. Must be nested under a `form` item.

## Static options

```json
{
  "type": "rs-fixed",
  "id": "status",
  "name": "status",
  "label": "Status",
  "placeholder": "Select status…",
  "options": [
    { "value": "active", "label": "Active" },
    { "value": "inactive", "label": "Inactive" }
  ]
}
```

## API options (fetch on mount)

```json
{
  "type": "rs-fixed",
  "id": "department",
  "name": "departmentId",
  "label": "Department",
  "optionsApi": {
    "url": "/api/departments",
    "method": "get",
    "params": { "active": true }
  },
  "onLoadFetch": true,
  "clearable": true,
  "searchable": true
}
```

## Multi-select

```json
{
  "type": "rs-fixed",
  "id": "tags",
  "name": "tagIds",
  "label": "Tags",
  "multi": true,
  "optionsApi": "/api/tags",
  "defaultValue": ["tag-1"]
}
```
