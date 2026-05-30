# Button JSON examples

All examples are valid `ButtonItem` fragments. Wrap in a parent layout when building full pages.

## Basic

```json
{
  "type": "button",
  "id": "btn-primary",
  "label": "Continue",
  "variant": "default",
  "action": "continue"
}
```

```json
{
  "type": "button",
  "id": "btn-cancel",
  "label": "Cancel",
  "variant": "outline",
  "action": "cancel"
}
```

## Sizes and variants

```json
{
  "type": "button",
  "id": "btn-sm-ghost",
  "label": "More",
  "variant": "ghost",
  "size": "sm"
}
```

```json
{
  "type": "button",
  "id": "btn-lg-cta",
  "label": "Get started",
  "variant": "default",
  "size": "lg",
  "action": "signup"
}
```

```json
{
  "type": "button",
  "id": "btn-destructive",
  "label": "Remove account",
  "variant": "destructive",
  "action": "removeAccount",
  "actionParams": { "scope": "account" }
}
```

## Form submit

```json
{
  "type": "button",
  "id": "form-submit",
  "label": "Save changes",
  "buttonType": "submit",
  "variant": "default",
  "disabled": false
}
```

## Conditional visibility

```json
{
  "type": "button",
  "id": "btn-admin-only",
  "label": "Admin panel",
  "variant": "secondary",
  "condition": "data.user.role === 'admin'",
  "action": "openAdmin"
}
```

## Button group in a div

```json
{
  "type": "div",
  "id": "actions-row",
  "className": "flex gap-2 justify-end",
  "children": [
    {
      "type": "button",
      "id": "actions-cancel",
      "label": "Cancel",
      "variant": "outline",
      "action": "cancel"
    },
    {
      "type": "button",
      "id": "actions-save",
      "label": "Save",
      "variant": "default",
      "action": "save"
    }
  ]
}
```

## Dialog trigger (legacy dialog)

```json
{
  "type": "dialog",
  "id": "confirm-dialog",
  "trigger": [
    {
      "type": "button",
      "id": "confirm-open",
      "label": "Delete item",
      "variant": "destructive",
      "action": "noop"
    }
  ],
  "title": "Are you sure?",
  "children": []
}
```

## Dialog footer actions (legacy)

```json
"footer": [
  {
    "type": "button",
    "id": "dlg-cancel",
    "label": "Cancel",
    "variant": "outline",
    "action": "noop"
  },
  {
    "type": "button",
    "id": "dlg-confirm",
    "label": "Confirm",
    "variant": "default",
    "action": "confirmDelete",
    "actionParams": { "itemId": "{{ data.selectedId }}" }
  }
]
```

## Composed dialog trigger

```json
{
  "type": "dialog-trigger",
  "id": "dlg-tr",
  "children": [
    {
      "type": "button",
      "id": "dlg-tr-btn",
      "label": "Settings",
      "variant": "outline",
      "action": "noop"
    }
  ]
}
```

## Card footer

```json
{
  "type": "card-footer",
  "id": "card-f",
  "children": [
    {
      "type": "button",
      "id": "card-view",
      "label": "View details",
      "variant": "link",
      "action": "viewDetails"
    }
  ]
}
```

## Children instead of label

Use when the button must contain nested layout items (rare; prefer `label` for text):

```json
{
  "type": "button",
  "id": "btn-with-children",
  "variant": "outline",
  "children": [
    {
      "type": "div",
      "id": "btn-inner",
      "className": "flex items-center gap-1",
      "children": []
    }
  ]
}
```

## Disabled state

```json
{
  "type": "button",
  "id": "btn-disabled",
  "label": "Processing…",
  "disabled": true,
  "variant": "default"
}
```
