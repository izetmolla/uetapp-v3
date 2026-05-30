# Repeatable — JSON examples

Dynamic array of rows; each row has columns defined in `fields`. Output is an array of objects. Must be nested under a `form` item.

## Two-column row (input + select)

```json
{
  "type": "repeatable",
  "id": "line-items",
  "name": "lineItems",
  "label": "Line items",
  "addButtonLabel": "Add row",
  "fields": [
    {
      "type": "input",
      "name": "description",
      "label": "Description",
      "placeholder": "Item name"
    },
    {
      "type": "select",
      "name": "unit",
      "label": "Unit",
      "options": [
        { "value": "pcs", "label": "Pieces" },
        { "value": "kg", "label": "Kilograms" }
      ]
    }
  ]
}
```

## Numeric input row

```json
{
  "type": "repeatable",
  "id": "contacts",
  "name": "contacts",
  "label": "Contacts",
  "fields": [
    {
      "type": "input",
      "name": "email",
      "label": "Email",
      "inputType": "email",
      "placeholder": "name@example.com"
    },
    {
      "type": "input",
      "name": "phone",
      "label": "Phone",
      "inputType": "text"
    }
  ]
}
```
