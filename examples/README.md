# JSON Examples for Page Builder Sections

This directory contains high-quality JSON examples for all section types in the Page Builder system.

## Directory Structure

```
examples/
├── sections/          # Individual section JSON examples
├── schemas/           # Schema definitions (future)
├── index.json         # Master index with metadata
└── README.md          # This file
```

## Quick Start

1. **View Examples**: Browse `sections/` directory for JSON examples
2. **Check Index**: See `index.json` for complete section list and metadata
3. **Validate**: Run validation scripts to ensure examples are correct

## Section Examples

All 48+ section types have complete JSON examples:

- **Core Sections**: hero, features, testimonials, stats, faq, cta, gallery, team, pricing, process
- **Visual Sections**: logo-cloud, services-grid, portfolio-grid, video, image-text, timeline
- **Utility Sections**: divider, usp-strip, kpi-strip, counters, newsletter, blog-posts, contact-info
- **Trust Sections**: social-proof-bar, success-metrics, awards-badges, press-mentions, ratings-reviews, trust-badges, differentiators
- **Value Sections**: problem-statement, agitate-solve, value-proposition, elevator-pitch, outcomes-benefits, who-its-for
- **Showcase Sections**: before-after, video-demo, screenshot-gallery, device-frames
- **Feature Sections**: feature-list, feature-highlights
- **CTA Sections**: primary-cta-banner, secondary-cta, exit-intent-cta
- **Company Sections**: about-us, values-culture
- **Form Sections**: form

## Master Index

The `index.json` file contains:
- Version information
- Complete list of all sections
- Metadata for each section (complexity, field count, etc.)
- File paths and component references

## Integration

These examples are used for:
- **Admin Panel**: Load examples, side-by-side JSON editor
- **Documentation**: API docs, user guides
- **Development**: Component testing, schema validation
- **AI Generation**: Training data for content generation

## Maintenance

When updating examples:
1. Follow content quality standards
2. Validate against component schemas
3. Update `index.json` version
4. Document changes in CHANGELOG

## Validation

Run validation to check:
- JSON syntax
- Field names match schemas
- Data types are correct
- Required fields present

```bash
npm run validate-examples
```
