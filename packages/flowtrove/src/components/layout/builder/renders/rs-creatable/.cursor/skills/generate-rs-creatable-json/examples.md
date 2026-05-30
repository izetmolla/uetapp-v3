# Rs Creatable — JSON examples

Select with “create new option”. Must be nested under a `form` item.

## Static + create

```json
{
  "type": "rs-creatable",
  "id": "category",
  "name": "category",
  "label": "Category",
  "placeholder": "Select or create…",
  "options": [
    { "value": "news", "label": "News" },
    { "value": "blog", "label": "Blog" }
  ],
  "clearable": true
}
```

## API options + persist new option

```json
{
  "type": "rs-creatable",
  "id": "tag",
  "name": "tagId",
  "label": "Tag",
  "optionsApi": { "url": "/api/tags", "method": "get" },
  "onLoadFetch": true,
  "onCreateConfigAPI": {
    "url": "/api/tags",
    "method": "POST",
    "body": { "name": "{{ inputValue }}" },
    "successMessage": "Tag created",
    "errorMessage": "Could not create tag"
  }
}
```

## Multi creatable

```json
{
  "type": "rs-creatable",
  "id": "labels",
  "name": "labelIds",
  "label": "Labels",
  "multi": true,
  "optionsApi": "/api/labels",
  "searchable": true
}
```
