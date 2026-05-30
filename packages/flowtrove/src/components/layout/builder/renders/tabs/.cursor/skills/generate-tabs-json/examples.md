# Tabs — JSON examples

Two modes: **legacy** (`tabs` array) or **composed** (slot children).

## Legacy mode (tabs array)

```json
{
  "type": "tabs",
  "id": "settings-tabs",
  "defaultValue": "general",
  "tabs": [
    {
      "value": "general",
      "label": "General",
      "children": [
        { "type": "long-text", "id": "general-hint", "text": "General settings" }
      ]
    },
    {
      "value": "security",
      "label": "Security",
      "children": [
        { "type": "long-text", "id": "security-hint", "text": "Security settings" }
      ]
    }
  ]
}
```

## Composed mode (slot children)

Use when you need full control over tab list styling.

```json
{
  "type": "tabs",
  "id": "composed-tabs",
  "defaultValue": "tab-a",
  "children": [
    {
      "type": "tabs-list",
      "id": "tab-list",
      "children": [
        { "type": "tabs-trigger", "id": "tr-a", "value": "tab-a", "text": "Tab A" },
        { "type": "tabs-trigger", "id": "tr-b", "value": "tab-b", "text": "Tab B" }
      ]
    },
    {
      "type": "tabs-content",
      "id": "content-a",
      "value": "tab-a",
      "children": [
        { "type": "long-text", "id": "body-a", "text": "Content A" }
      ]
    },
    {
      "type": "tabs-content",
      "id": "content-b",
      "value": "tab-b",
      "children": [
        { "type": "long-text", "id": "body-b", "text": "Content B" }
      ]
    }
  ]
}
```

## Vertical tabs

```json
{
  "type": "tabs",
  "id": "sidebar-tabs",
  "orientation": "vertical",
  "listVariant": "line",
  "defaultValue": "profile",
  "tabs": [
    { "value": "profile", "label": "Profile", "children": [] },
    { "value": "billing", "label": "Billing", "children": [] }
  ]
}
```
