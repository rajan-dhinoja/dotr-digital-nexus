# Section JSON Examples

This directory contains JSON examples for all section types in the Page Builder system.

## Overview

Each JSON file represents a complete, realistic example of content for a specific section type. These examples are designed to:

- Match the exact field structure expected by section components
- Use realistic, professional content (not placeholder text)
- Be SEO-friendly and UI-safe
- Serve as templates for content creation

## Usage

### In Admin Panel
- Load examples via "Load Example" button
- Use for side-by-side JSON editor reference
- Import/export functionality

### For Development
- Reference when building new sections
- Test component rendering
- Validate schema structures

### For Documentation
- Include in API documentation
- Reference in user guides
- Use in training materials

## File Naming

Files are named using the section slug (kebab-case) to match `section_types.slug` from the database:
- `hero.json` → Hero section
- `logo-cloud.json` → Logo Cloud section
- `primary-cta-banner.json` → Primary CTA Banner section

## Content Standards

All examples follow these guidelines:

1. **Realistic Content**: Professional copy, not "test" or "lorem ipsum"
2. **Complete Fields**: All required fields present, optional fields included where they enhance the example
3. **Proper Types**: Correct data types (strings, numbers, booleans, arrays, objects)
4. **Valid URLs**: Properly formatted URLs and paths
5. **Valid Icons**: Lucide icon names that exist in the component icon maps
6. **Array Length**: 2-6 items for arrays (realistic, not overwhelming)

## Structure

Each JSON file contains the `content` object that would be stored in `page_sections.content` JSONB field. The structure matches what the corresponding React component expects.

## Validation

Run validation scripts to ensure examples are correct:
```bash
npm run validate-examples
```

## Updates

When section schemas change:
1. Update the corresponding JSON example
2. Re-validate
3. Update version in `examples/index.json`
4. Document changes in `CHANGELOG.md`
