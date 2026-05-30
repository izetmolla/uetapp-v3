# Select — JSON examples

Copy-paste patterns for MCP / AI layout generation.

## Minimal

```json
{
  "type": "select",
  "id": "select-example",
  "name": "example",
  "label": "Example"
}
```

## Select with static options

```json
{
  "type": "select",
  "id": "country",
  "name": "country",
  "label": "Country",
  "options": [
    {
      "value": "al",
      "label": "Albania"
    },
    {
      "value": "de",
      "label": "Germany"
    }
  ]
}
```

## Select with HTTP options

```json
{
  "type": "select",
  "id": "country-api",
  "name": "country",
  "label": "Country",
  "options": {
    "url": "/api/countries",
    "method": "get"
  }
}
```

