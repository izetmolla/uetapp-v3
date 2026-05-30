# Card JSON examples

## Legacy — simple

```json
{
  "type": "card",
  "id": "card-1",
  "title": "Card title",
  "description": "Card description.",
  "children": [
    {
      "type": "div",
      "id": "card-1-body",
      "className": "text-sm text-muted-foreground",
      "children": []
    }
  ]
}
```

## Legacy — header action and footer

```json
{
  "type": "card",
  "id": "card-2",
  "className": "w-full max-w-sm",
  "size": "sm",
  "title": "Settings",
  "description": "Manage your preferences.",
  "headerAction": [
    {
      "type": "button",
      "id": "card-2-edit",
      "label": "Edit",
      "variant": "ghost",
      "size": "sm"
    }
  ],
  "children": [
    {
      "type": "div",
      "id": "card-2-main",
      "className": "space-y-2",
      "children": []
    }
  ],
  "footer": [
    {
      "type": "button",
      "id": "card-2-save",
      "label": "Save",
      "variant": "default"
    },
    {
      "type": "button",
      "id": "card-2-cancel",
      "label": "Cancel",
      "variant": "outline"
    }
  ]
}
```

## Composed — full slots

```json
{
  "type": "card",
  "id": "card-3",
  "className": "max-w-md",
  "size": "default",
  "children": [
    {
      "type": "card-header",
      "id": "card-3-h",
      "children": [
        { "type": "card-title", "id": "card-3-t", "text": "Title" },
        { "type": "card-description", "id": "card-3-d", "text": "Description" },
        {
          "type": "card-action",
          "id": "card-3-a",
          "children": [
            {
              "type": "button",
              "id": "card-3-btn",
              "label": "Action",
              "action": "example"
            }
          ]
        }
      ]
    },
    {
      "type": "card-content",
      "id": "card-3-c",
      "children": [
        {
          "type": "div",
          "id": "card-3-inner",
          "className": "text-sm",
          "children": []
        }
      ]
    },
    {
      "type": "card-footer",
      "id": "card-3-f",
      "children": [
        {
          "type": "button",
          "id": "card-3-ok",
          "label": "OK",
          "variant": "default"
        }
      ]
    }
  ]
}
```

## Composed — content only (no header)

```json
{
  "type": "card",
  "id": "card-4",
  "children": [
    {
      "type": "card-content",
      "id": "card-4-c",
      "paddingTopWhenNoHeader": true,
      "children": [
        { "type": "div", "id": "card-4-body", "children": [] }
      ]
    }
  ]
}
```

## Conditional card

```json
{
  "type": "card",
  "id": "card-admin",
  "condition": "data.showAdminCard === true",
  "title": "Admin",
  "children": []
}
```

## Nested in div

```json
{
  "type": "div",
  "id": "page-grid",
  "className": "grid gap-4 md:grid-cols-2",
  "children": [
    {
      "type": "card",
      "id": "card-a",
      "title": "Card A",
      "children": []
    },
    {
      "type": "card",
      "id": "card-b",
      "title": "Card B",
      "children": []
    }
  ]
}
```
