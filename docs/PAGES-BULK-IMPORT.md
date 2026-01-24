# Pages & Menu Bulk Import / Export

The admin **Pages** module supports **Bulk Import** and **Export** of pages plus navigation menu items. Use this to build or restore the Mega Menu quickly from a JSON file.

## Where to use it

- **Admin → Pages**: Use **Bulk Import** and **Export** in the toolbar.
- **Import**: Upload a JSON file, choose mode (Skip / Overwrite / Merge), then run import.
- **Export**: Download current pages + menu structure as JSON for backup or reuse.

## JSON format

Import/export files use this shape:

```json
{
  "version": "1.0",
  "entity_type": "pages_and_menu",
  "exported_at": "2025-01-24T12:00:00.000Z",
  "menu_locations": ["header", "footer", "mobile"],
  "pages": [
    {
      "slug": "home",
      "title": "Home",
      "parent_slug": null,
      "display_order": 0,
      "is_active": true,
      "show_in_nav": true,
      "show_in_navigation": true
    }
  ],
  "menu_items": [
    {
      "key": "nav-home",
      "menu_location": "header",
      "label": "Home",
      "url": "/",
      "page_slug": "home",
      "parent_key": null,
      "display_order": 0,
      "target": "_self",
      "is_active": true
    }
  ]
}
```

### Pages

- **Required:** `slug`, `title`.
- **Optional:** `description`, `meta_title`, `meta_description`, `template`, `parent_slug`, `is_active`, `show_in_nav`, `show_in_navigation`, `display_order`, `content`.
- Use `parent_slug` to reference another page’s `slug` for hierarchy. Top-level pages use `null` or omit it.

### Menu items

- **Required:** `key`, `menu_location`, `label`.
- **Optional:** `url`, `page_slug`, `parent_key`, `display_order`, `target`, `is_active`.
- **Link:** Provide either `page_slug` (internal page) or `url` (external). If both exist, `page_slug` is preferred for resolving the href.
- **Hierarchy:** Use `parent_key` to reference another item’s `key` in the same `menu_location`. Root items use `null` or omit it.
- **`key`:** Must be unique per `menu_location`. Used only for import/export and parent-child references.

### Menu locations

Supported `menu_location` values: **`header`**, **`footer`**, **`mobile`**.

- **Header** nav is used when `VITE_USE_DB_NAVIGATION=true` and `useNavigationMenu("header")` loads menu items. The Menus admin uses the same locations.
- Use these values in your JSON so imported items appear in the correct menus.

## Import modes

- **Skip:** Do not change existing pages or menu items; only add new ones.
- **Overwrite:** Update existing (matched by `slug` for pages, `menu_location` + `label` + parent for items) and create new.
- **Merge:** Same as Overwrite but only updates provided fields, leaving others unchanged.

## Validation

Before import, the file is validated for:

- Root structure (`version`, `entity_type`, `pages`, `menu_items`).
- Duplicate `slug` (pages) and duplicate `(menu_location, key)` (menu items).
- Valid references: `parent_slug` in `pages`, `parent_key` and `page_slug` in `menu_items`.
- No cycles in `parent_slug` or `parent_key`.

Errors are shown in the Bulk Import modal; fix the file and re-upload if needed.

## Mega Menu

The **Mega Menu** dropdown content is driven by `megaMenuConfig` (code), keyed by page **slug** (e.g. `services`). Import only creates/updates **pages** and **menu_items**. For rich dropdowns, use slugs that match those config keys (e.g. `/services` → `services`).

## Example: minimal import

```json
{
  "version": "1.0",
  "entity_type": "pages_and_menu",
  "exported_at": "2025-01-24T12:00:00.000Z",
  "pages": [
    { "slug": "home", "title": "Home", "display_order": 0 },
    { "slug": "about", "title": "About", "display_order": 1 },
    { "slug": "contact", "title": "Contact", "display_order": 2 }
  ],
  "menu_items": [
    { "key": "m1", "menu_location": "header", "label": "Home", "page_slug": "home", "parent_key": null, "display_order": 0 },
    { "key": "m2", "menu_location": "header", "label": "About", "page_slug": "about", "parent_key": null, "display_order": 1 },
    { "key": "m3", "menu_location": "header", "label": "Contact", "page_slug": "contact", "parent_key": null, "display_order": 2 }
  ]
}
```

Export from **Pages** to see the exact format produced from your current data.
