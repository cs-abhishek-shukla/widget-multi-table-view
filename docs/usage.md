| [Home](../README.md) |
|----------------------|

# Usage

This section explains how **Multi-table view** widget renders data from a configured JSON field, and how user interactions update the underlying module data.

## Runtime Behavior Overview

At runtime, the widget performs the following steps:

1. Reads the configured **JSON Field** from specified module.
2. Extracts the top-level array using **Top Level Array Key** field.
3. Renders each object in the top-level array as an **accordion section**.
4. Displays a **table under each accordion section** using the configured **Nested Array Key** field.
5. Binds row-level checkboxes to the `selected` boolean field.
6. Persists updated selections back to the same JSON field when the action button is clicked.

___

### Widget Title

- Displayed at the top of the widget
- Sourced from the **Title** configuration field
- Purely informational and does not affect behavior

___

### Accordion Sections

- Each object inside **Top Level Array Key** field renders as one **accordion section**
- Accordion sections act as *collapsible table groups*
- The accordion header text is derived from the field specified in **Accordion Heading Key** field

#### Example

```json
{
  "productName": "Product A"
}
```

If **Accordion Heading Key** field is set to `productName`, the accordion title will be **Product A**.

---

### Tables Within Accordion Sections

- Each accordion section contains **one table**
- Table rows are rendered from the array defined by **Nested Array Key** field
- Table columns are automatically generated from object keys

#### Column Rendering Rules

- All keys except `selected` are rendered as table columns
- Column order follows the object key order in the JSON
- Nested objects are not supported and should be flattened upstream

---

### Row Selection (Checkboxes)

- Each table row includes a checkbox
- Checkbox state is driven by the `selected` boolean field

| `selected` Value | Checkbox State |
|------------------|----------------|
| `true`           | Checked        |
| `false`          | Unchecked      |

Users can toggle checkboxes directly in the UI.

---

### Action Button

- Displayed at the bottom of the widget
- Label is configured using **Button Label**
- Clicking the button commits all checkbox changes

On click:

- The widget updates the in-memory JSON
- All `selected` values are overwritten based on UI state
- The **entire JSON object** is written back to the module field

---

## Full JSON Example

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
    },
    {
      "productName": "Product B",
      "versions": [
        {
          "versionId": "v2.0",
          "releaseDate": "2024-05-01",
          "selected": true
        }
      ]
    }
  ]
}
```

### How This Renders

- Two accordion sections: **Product A** and **Product B**
- Each accordion contains a table of versions
- Each version row has a checkbox bound to `selected`

---

## Data Persistence Model

- The widget performs **in-place updates** on the JSON field
- No new keys are added
- No data outside `selected` is modified
- Updates are atomic — partial writes are not performed

---

## Validation Requirements

To ensure correct rendering and behavior:

- **Top Level Array Key** field must exist and point to an array
- **Nested Array Key** field must exist and point to an array for every top-level object
- Every row object must contain:

```json
"selected": true | false
```

### Failure Scenarios

- Missing `selected` field may result in:

  * Checkbox not rendering
  * Incorrect default state
- Non-boolean `selected` values may cause UI inconsistencies
- Invalid JSON will prevent widget rendering

---

## Usage Recommendations

- Validate JSON schema before rendering
- Avoid deeply nested objects in table rows
- Keep row objects flat and consistent
- Use meaningful fields for **Accordion Heading Key** field to improve readability

---
