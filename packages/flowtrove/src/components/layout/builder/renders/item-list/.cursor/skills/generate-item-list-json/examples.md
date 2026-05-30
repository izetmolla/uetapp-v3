# Item List — JSON examples

Copy-paste patterns for MCP / AI layout generation.

## Minimal

```json
{
  "type": "item-list",
  "id": "item-list-example"
}
```

## Item list from data

```json
{
  "type": "item-list",
  "id": "rows",
  "source": "items",
  "children": [
    {
      "type": "long-text",
      "id": "row-text",
      "text": "{{ title }}"
    }
  ]
}
```

