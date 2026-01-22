# Section JSON Examples

This directory contains example JSON structures for all section types in the Page Builder system.

## Usage

These examples are automatically loaded in the admin panel when editing sections. They appear in the "Example JSON Structure" panel to help guide content creation.

## File Naming

- Files are named using the section slug (e.g., `hero.json`, `features.json`)
- All files use lowercase, kebab-case naming
- Each file matches exactly with the `section_types.slug` from the database

## Structure

Each JSON file contains a complete, realistic example that:
- Matches the section's schema exactly
- Uses professional, SEO-friendly content
- Includes all required fields
- Includes optional fields that enhance the example
- Uses realistic data types and formats

## Adding New Sections

When adding a new section type:
1. Create a new JSON file with the section slug as the filename
2. Add the example to `src/lib/sectionExamples.ts`
3. Update `examples/index.json` with the new section metadata

## Validation

All examples are validated against their section schemas. If a section shows an empty example `{}`, it means:
- The example file doesn't exist
- The section slug doesn't match the filename
- The example needs to be added to `sectionExamples.ts`
