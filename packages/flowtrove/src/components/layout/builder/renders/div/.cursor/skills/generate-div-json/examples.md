# Div JSON examples

## Empty section placeholder

```json
{
  "type": "div",
  "id": "section-empty",
  "className": "min-h-[120px] rounded-md border border-dashed",
  "children": []
}
```

## Vertical stack (page layout)

```json
{
  "type": "div",
  "id": "page-root",
  "className": "space-y-6 p-4",
  "children": [
    {
      "type": "card",
      "id": "card-hero",
      "title": "Welcome",
      "children": []
    },
    {
      "type": "card",
      "id": "card-details",
      "title": "Details",
      "children": []
    }
  ]
}
```

## Flex row — action bar

```json
{
  "type": "div",
  "id": "actions-bar",
  "className": "flex items-center justify-end gap-2",
  "children": [
    {
      "type": "button",
      "id": "btn-cancel",
      "label": "Cancel",
      "variant": "outline"
    },
    {
      "type": "button",
      "id": "btn-save",
      "label": "Save",
      "variant": "default",
      "action": "save"
    }
  ]
}
```

## Responsive grid

```json
{
  "type": "div",
  "id": "stats-grid",
  "className": "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
  "children": [
    { "type": "div", "id": "stat-1", "className": "rounded-lg border p-4", "children": [] },
    { "type": "div", "id": "stat-2", "className": "rounded-lg border p-4", "children": [] }
  ]
}
```

## Muted helper text

```json
{
  "type": "div",
  "id": "help-text",
  "className": "text-sm text-muted-foreground",
  "children": []
}
```

## Conditional section

```json
{
  "type": "div",
  "id": "admin-banner",
  "className": "rounded-md bg-muted p-3",
  "condition": "data.user.role === 'admin'",
  "children": []
}
```

## Accessible landmark

```json
{
  "type": "div",
  "id": "main-content",
  "role": "main",
  "aria-label": "Main content",
  "className": "flex-1",
  "children": []
}
```

## Dialog body wrapper

```json
{
  "type": "div",
  "id": "dlg-body-wrap",
  "className": "space-y-4 py-2",
  "children": [
    {
      "type": "div",
      "id": "dlg-msg",
      "className": "text-sm",
      "children": []
    }
  ]
}
```

## Two-column layout

```json
{
  "type": "div",
  "id": "two-col",
  "className": "flex flex-col gap-4 md:flex-row",
  "children": [
    {
      "type": "div",
      "id": "col-left",
      "className": "flex-1",
      "children": []
    },
    {
      "type": "div",
      "id": "col-right",
      "className": "flex-1",
      "children": []
    }
  ]
}
```
