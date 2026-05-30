# Dialog JSON examples

## Legacy — simple

```json
{
  "type": "dialog",
  "id": "dlg-1",
  "trigger": [
    { "type": "button", "id": "dlg-1-open", "label": "Open dialog", "action": "noop" }
  ],
  "title": "Dialog",
  "children": [
    {
      "type": "div",
      "id": "dlg-1-body",
      "className": "text-sm text-muted-foreground",
      "children": []
    }
  ]
}
```

## Legacy — confirm with footer

```json
{
  "type": "dialog",
  "id": "dlg-2",
  "trigger": [
    { "type": "button", "id": "dlg-2-open", "label": "Open", "variant": "outline", "action": "noop" }
  ],
  "title": "Confirm",
  "description": "This action cannot be undone.",
  "showCloseButton": true,
  "children": [
    { "type": "div", "id": "dlg-2-msg", "className": "text-sm", "children": [] }
  ],
  "footer": [
    { "type": "button", "id": "dlg-2-cancel", "label": "Cancel", "variant": "outline", "action": "noop" },
    { "type": "button", "id": "dlg-2-ok", "label": "Confirm", "variant": "default", "action": "confirm" }
  ]
}
```

## Composed — full slots

```json
{
  "type": "dialog",
  "id": "dlg-3",
  "className": "inline-block",
  "children": [
    {
      "type": "dialog-trigger",
      "id": "dlg-3-tr",
      "children": [
        {
          "type": "button",
          "id": "dlg-3-btn",
          "label": "Open",
          "variant": "outline",
          "action": "noop"
        }
      ]
    },
    {
      "type": "dialog-content",
      "id": "dlg-3-co",
      "showCloseButton": true,
      "children": [
        {
          "type": "dialog-header",
          "id": "dlg-3-h",
          "children": [
            { "type": "dialog-title", "id": "dlg-3-t", "text": "Title" },
            { "type": "dialog-description", "id": "dlg-3-d", "text": "Description" }
          ]
        },
        {
          "type": "div",
          "id": "dlg-3-body",
          "className": "text-sm",
          "children": []
        },
        {
          "type": "dialog-footer",
          "id": "dlg-3-f",
          "children": [
            {
              "type": "button",
              "id": "dlg-3-close",
              "label": "Close",
              "variant": "outline",
              "action": "noop"
            }
          ]
        }
      ]
    }
  ]
}
```

## Legacy — styling hooks

```json
{
  "type": "dialog",
  "id": "dlg-styled",
  "className": "inline-block",
  "triggerClassName": "w-full",
  "contentClassName": "sm:max-w-lg",
  "headerClassName": "space-y-1",
  "titleClassName": "text-lg",
  "footerClassName": "gap-2",
  "trigger": [
    { "type": "button", "id": "dlg-styled-open", "label": "Settings", "action": "noop" }
  ],
  "title": "Settings",
  "children": []
}
```

## Conditional dialog

```json
{
  "type": "dialog",
  "id": "dlg-admin",
  "condition": "data.isAdmin === true",
  "trigger": [
    { "type": "button", "id": "dlg-admin-open", "label": "Admin tools", "action": "noop" }
  ],
  "title": "Admin",
  "children": []
}
```

## Dialog inside card footer

```json
{
  "type": "card",
  "id": "card-with-dlg",
  "title": "Actions",
  "footer": [
    {
      "type": "dialog",
      "id": "card-dlg",
      "trigger": [
        { "type": "button", "id": "card-dlg-open", "label": "Details", "variant": "link", "action": "noop" }
      ],
      "title": "Details",
      "children": []
    }
  ],
  "children": []
}
```
