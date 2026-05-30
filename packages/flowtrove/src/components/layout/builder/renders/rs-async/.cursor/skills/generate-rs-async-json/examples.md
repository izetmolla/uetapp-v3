# Rs Async — JSON examples

Async search select — options load from API as the user types. Must be nested under a `form` item.

## Remote search

```json
{
  "type": "rs-async",
  "id": "user-search",
  "name": "userId",
  "label": "User",
  "placeholder": "Search users…",
  "optionsApi": {
    "url": "/api/users/search",
    "method": "get",
    "params": { "limit": 20 }
  },
  "searchable": true,
  "clearable": true
}
```

## With default options seed

```json
{
  "type": "rs-async",
  "id": "assignee",
  "name": "assigneeId",
  "label": "Assignee",
  "optionsApi": "/api/users/search",
  "defaultOptions": [
    { "value": "u-1", "label": "Jane Doe" }
  ],
  "defaultValue": "u-1"
}
```

## Legacy loadOptionsUrl (deprecated)

Prefer `optionsApi`. `loadOptionsUrl` appends `?search=` to a GET URL.

```json
{
  "type": "rs-async",
  "id": "city",
  "name": "cityId",
  "label": "City",
  "loadOptionsUrl": "/api/cities"
}
```
