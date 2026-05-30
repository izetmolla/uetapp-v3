# Content — JSON examples

Copy-paste patterns for MCP / AI layout generation.

## Minimal

```json
{
  "type": "content",
  "id": "content-example"
}
```

## Content scope with interpolation

```json
{
  "type": "content",
  "id": "profile-block",
  "source": "profile",
  "children": [
    {
      "type": "long-text",
      "id": "name-line",
      "text": "{{ displayName }}"
    }
  ]
}
```

