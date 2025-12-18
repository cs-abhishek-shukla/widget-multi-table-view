# Release Information

- **Version**: 1.0.0
- **Certified**: No
- **Publisher**: Fortinet
- **Compatible Version**: 7.4.3 or Later

# Overview

The **Multi-table view** widget renders **accordion sections containing tables** (collapsible table groups) based on a configurable JSON field in a FortiSOAR module. Each table supports **row-level checkbox selection**, allowing users to update boolean state directly from the UI without editing raw JSON.

The widget reads structured data from a module field, dynamically generates **tables under accordion sections**, and persists user selections back to the same JSON field, ensuring consistency between the UI and stored data.

## What This Widget Does

- Reads a JSON object from a module field
- Groups data into **accordion sections**
- Renders a **table under each accordion**
- Displays a checkbox per row driven by a `selected` boolean
- Writes updated selections back to the original JSON field

## Key Capabilities

- Dynamic rendering driven entirely by configuration
- Accordion sections for logical grouping
- Auto-generated tables from nested arrays
- Per-row checkbox selection
- Two-way data binding with module JSON
- Reusable across multiple modules and schemas

## Brief JSON Sample

```json
{
  "products": [
    {
      "productName": "Product A",
      "versions": [
        {
          "versionId": "v1.0",
          "releaseDate": "2023-01-01",
          "selected": false
        },
        {
          "versionId": "v1.1",
          "releaseDate": "2023-03-15",
          "selected": true
        }
      ]
    }
  ]
}
```

In this example:

- `productName` renders accordion sections
- Each product contains a table
    - Each table has rows with `releaseDate` and `versionId` as columns
- The `selected` field controls checkbox state and is mandatory

## Next Steps

| [Installation](./docs/setup.md#installation) | [Configuration](./docs/setup.md#configuration) | [Usage](./docs/usage.md) |
|----------------------------------------------|------------------------------------------------|--------------------------|

