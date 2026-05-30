# Form — JSON examples

Copy-paste patterns for MCP / AI layout generation.

## Minimal

```json
{
  "type": "form",
  "id": "form-example",
  "children": []
}
```

## Form with fields and HTTP submit

```json
{
  "type": "form",
  "id": "example-form",
  "action": "/api/submit",
  "method": "POST",
  "showSuccessToast": true,
  "successMessage": "Saved successfully",
  "onSubmitAction": "reset",
  "children": [
    {
      "type": "input",
      "id": "email",
      "name": "email",
      "label": "Email",
      "validation": { "required": true, "email": true }
    },
    {
      "type": "select",
      "id": "country",
      "name": "country",
      "label": "Country",
      "options": { "url": "/api/countries", "method": "get" }
    },
    {
      "type": "button",
      "id": "submit",
      "label": "Submit",
      "buttonType": "submit"
    }
  ]
}
```

## Prefill from layout data

Use `source` to read `data[source]` and merge over field defaults. Pass `value` as static fallback.

```json
{
  "type": "form",
  "id": "edit-profile",
  "source": "profile",
  "value": { "displayName": "Guest" },
  "action": "/api/profile",
  "method": "PATCH",
  "children": [
    {
      "type": "input",
      "id": "displayName",
      "name": "displayName",
      "label": "Display name"
    }
  ]
}
```

## Redirect after submit

```json
{
  "type": "form",
  "id": "signup-form",
  "action": "/api/signup",
  "method": "POST",
  "onSubmitAction": "redirect",
  "redirectUrl": "/welcome",
  "children": [
    { "type": "input", "id": "email", "name": "email", "label": "Email" },
    { "type": "button", "id": "go", "label": "Sign up", "buttonType": "submit" }
  ]
}
```

## Nested fields in card / tabs

Any `BaseFormFieldItem` under `form.children` binds to the form — including fields inside `card`, `tabs`, `div`, etc.

```json
{
  "type": "form",
  "id": "nested-form",
  "children": [
    {
      "type": "card",
      "id": "section",
      "title": "Account",
      "children": [
        {
          "type": "input",
          "id": "username",
          "name": "username",
          "label": "Username"
        }
      ]
    }
  ]
}
```
