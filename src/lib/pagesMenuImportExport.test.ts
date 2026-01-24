import { describe, it, expect, vi } from 'vitest';
import {
  parsePagesMenuFile,
  validatePagesMenuImportData,
  exportPagesMenuToFile,
  type PagesMenuExportData,
  type MenuItemFlat,
} from './pagesMenuImportExport';

function createFile(json: unknown): File {
  return new File([JSON.stringify(json)], 'test.json', { type: 'application/json' });
}

function validMinimal(): PagesMenuExportData {
  return {
    version: '1.0',
    entity_type: 'pages_and_menu',
    exported_at: new Date().toISOString(),
    pages: [{ slug: 'home', title: 'Home', display_order: 0 }],
    menu_items: [
      {
        key: 'nav-home',
        menu_location: 'header',
        label: 'Home',
        url: '/',
        page_slug: null,
        parent_key: null,
        display_order: 0,
        target: '_self',
        is_active: true,
      },
    ],
  };
}

describe('parsePagesMenuFile', () => {
  it('parses valid JSON and returns normalized data', async () => {
    const file = createFile({
      version: '1.0',
      entity_type: 'pages_and_menu',
      exported_at: new Date().toISOString(),
      pages: [{ slug: 'home', title: 'Home' }],
      menu_items: [
        { key: 'k1', menu_location: 'header', label: 'Home', url: '/', parent_key: null },
      ],
    });
    const data = await parsePagesMenuFile(file);
    expect(data.entity_type).toBe('pages_and_menu');
    expect(data.pages).toHaveLength(1);
    expect(data.pages[0].slug).toBe('home');
    expect(data.menu_items).toHaveLength(1);
    expect(data.menu_items[0].key).toBe('k1');
    expect(data.menu_items[0].menu_location).toBe('header');
  });

  it('rejects invalid entity_type', async () => {
    const file = createFile({
      version: '1.0',
      entity_type: 'other',
      pages: [],
      menu_items: [],
    });
    await expect(parsePagesMenuFile(file)).rejects.toThrow('Invalid entity type');
  });

  it('rejects missing pages array', async () => {
    const file = createFile({
      version: '1.0',
      entity_type: 'pages_and_menu',
      menu_items: [],
    });
    await expect(parsePagesMenuFile(file)).rejects.toThrow('pages');
  });

  it('rejects invalid JSON', async () => {
    const file = new File(['{ invalid }'], 'x.json', { type: 'application/json' });
    await expect(parsePagesMenuFile(file)).rejects.toThrow('parse');
  });
});

describe('validatePagesMenuImportData', () => {
  it('accepts valid minimal data', () => {
    const r = validatePagesMenuImportData(validMinimal());
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });

  it('accepts valid data with parent_slug and parent_key', () => {
    const data: PagesMenuExportData = {
      ...validMinimal(),
      pages: [
        { slug: 'parent', title: 'Parent', display_order: 0 },
        { slug: 'child', title: 'Child', parent_slug: 'parent', display_order: 1 },
      ],
      menu_items: [
        {
          key: 'root',
          menu_location: 'header',
          label: 'Root',
          url: '/',
          page_slug: null,
          parent_key: null,
          display_order: 0,
          target: '_self',
          is_active: true,
        },
        {
          key: 'sub',
          menu_location: 'header',
          label: 'Sub',
          url: '/sub',
          page_slug: null,
          parent_key: 'root',
          display_order: 1,
          target: '_self',
          is_active: true,
        },
      ],
    };
    const r = validatePagesMenuImportData(data);
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });

  it('rejects duplicate page slugs', () => {
    const data = validMinimal();
    data.pages = [
      { slug: 'dup', title: 'A', display_order: 0 },
      { slug: 'dup', title: 'B', display_order: 1 },
    ];
    const r = validatePagesMenuImportData(data);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.message.includes('Duplicate slug'))).toBe(true);
  });

  it('rejects duplicate (menu_location, key)', () => {
    const data = validMinimal();
    const item: MenuItemFlat = {
      key: 'dup',
      menu_location: 'header',
      label: 'X',
      url: '/',
      page_slug: null,
      parent_key: null,
      display_order: 0,
      target: '_self',
      is_active: true,
    };
    data.menu_items = [item, { ...item, display_order: 1 }];
    const r = validatePagesMenuImportData(data);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.message.includes('Duplicate') && e.message.includes('menu_location'))).toBe(
      true
    );
  });

  it('rejects unknown parent_slug', () => {
    const data = validMinimal();
    data.pages = [
      { slug: 'a', title: 'A', display_order: 0 },
      { slug: 'b', title: 'B', parent_slug: 'missing', display_order: 1 },
    ];
    const r = validatePagesMenuImportData(data);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.message.includes('parent_slug') && e.message.includes('not found'))).toBe(
      true
    );
  });

  it('rejects unknown page_slug in menu item', () => {
    const data = validMinimal();
    data.menu_items = [
      {
        key: 'm1',
        menu_location: 'header',
        label: 'Link',
        url: null,
        page_slug: 'nonexistent',
        parent_key: null,
        display_order: 0,
        target: '_self',
        is_active: true,
      },
    ];
    const r = validatePagesMenuImportData(data);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.message.includes('page_slug') && e.message.includes('not found'))).toBe(
      true
    );
  });

  it('rejects unknown parent_key in menu item', () => {
    const data = validMinimal();
    data.menu_items = [
      {
        key: 'm1',
        menu_location: 'header',
        label: 'Child',
        url: '/',
        page_slug: null,
        parent_key: 'missing-parent',
        display_order: 0,
        target: '_self',
        is_active: true,
      },
    ];
    const r = validatePagesMenuImportData(data);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.message.includes('parent_key') && e.message.includes('not found'))).toBe(
      true
    );
  });

  it('rejects cycle in parent_slug', () => {
    const data = validMinimal();
    data.pages = [
      { slug: 'a', title: 'A', parent_slug: 'c', display_order: 0 },
      { slug: 'b', title: 'B', parent_slug: 'a', display_order: 1 },
      { slug: 'c', title: 'C', parent_slug: 'b', display_order: 2 },
    ];
    const r = validatePagesMenuImportData(data);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.message.includes('Cycle') && e.message.includes('parent_slug'))).toBe(
      true
    );
  });

  it('rejects cycle in parent_key', () => {
    const data = validMinimal();
    data.menu_items = [
      {
        key: 'a',
        menu_location: 'header',
        label: 'A',
        url: '/',
        page_slug: null,
        parent_key: 'c',
        display_order: 0,
        target: '_self',
        is_active: true,
      },
      {
        key: 'b',
        menu_location: 'header',
        label: 'B',
        url: '/',
        page_slug: null,
        parent_key: 'a',
        display_order: 1,
        target: '_self',
        is_active: true,
      },
      {
        key: 'c',
        menu_location: 'header',
        label: 'C',
        url: '/',
        page_slug: null,
        parent_key: 'b',
        display_order: 2,
        target: '_self',
        is_active: true,
      },
    ];
    const r = validatePagesMenuImportData(data);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.message.includes('Cycle') && e.message.includes('parent_key'))).toBe(
      true
    );
  });

  it('rejects missing slug or title', () => {
    const data = validMinimal();
    data.pages = [{ slug: '', title: 'X', display_order: 0 }];
    let r = validatePagesMenuImportData(data);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.path.includes('slug'))).toBe(true);

    data.pages = [{ slug: 'x', title: '', display_order: 0 }];
    r = validatePagesMenuImportData(data);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.path.includes('title'))).toBe(true);
  });

  it('rejects missing key or label in menu item', () => {
    const data = validMinimal();
    data.menu_items = [
      {
        key: '',
        menu_location: 'header',
        label: 'X',
        url: '/',
        page_slug: null,
        parent_key: null,
        display_order: 0,
        target: '_self',
        is_active: true,
      },
    ];
    let r = validatePagesMenuImportData(data);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.path.includes('key'))).toBe(true);

    data.menu_items = [
      {
        key: 'k',
        menu_location: 'header',
        label: '',
        url: '/',
        page_slug: null,
        parent_key: null,
        display_order: 0,
        target: '_self',
        is_active: true,
      },
    ];
    r = validatePagesMenuImportData(data);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.path.includes('label'))).toBe(true);
  });

  it('allows empty pages and menu_items', () => {
    const data: PagesMenuExportData = {
      version: '1.0',
      entity_type: 'pages_and_menu',
      exported_at: new Date().toISOString(),
      pages: [],
      menu_items: [],
    };
    const r = validatePagesMenuImportData(data);
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });
});

describe('exportPagesMenuToFile', () => {
  it('produces valid JSON and does not throw', async () => {
    const createObjectURL = URL.createObjectURL;
    const revokeObjectURL = URL.revokeObjectURL;
    let blob: Blob | null = null;
    URL.createObjectURL = (b: Blob) => {
      blob = b;
      return 'blob:mock';
    };
    URL.revokeObjectURL = () => {};

    const createElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = createElement(tagName);
      if (tagName.toLowerCase() === 'a') {
        el.click = vi.fn();
      }
      return el;
    });

    exportPagesMenuToFile(
      [
        {
          id: 'p1',
          slug: 'home',
          title: 'Home',
          display_order: 0,
          parent_id: null,
        },
      ],
      [
        {
          id: 'm1',
          menu_location: 'header',
          label: 'Home',
          url: '/',
          page_id: 'p1',
          parent_id: null,
          display_order: 0,
        },
      ]
    );

    expect(blob).not.toBeNull();
    const text =
      blob != null
        ? await new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.onerror = () => reject(r.error);
            r.readAsText(blob);
          })
        : '';
    const parsed = JSON.parse(text);
    expect(parsed.entity_type).toBe('pages_and_menu');
    expect(parsed.pages).toHaveLength(1);
    expect(parsed.pages[0].slug).toBe('home');
    expect(parsed.menu_items).toHaveLength(1);
    expect(parsed.menu_items[0].label).toBe('Home');
    expect(parsed.menu_items[0].menu_location).toBe('header');

    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    vi.restoreAllMocks();
  });
});
