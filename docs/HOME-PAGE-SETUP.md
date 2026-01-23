# Home Page Content Setup Guide

This guide explains how to use the JSON files to populate your home page with all sections in the admin panel.

## Files Created

1. **`home-page-sections.json`** - Wrapped format with metadata
2. **`home-page-sections-admin-ready.json`** - Direct array format ready for admin panel import

## What's Included

The home page JSON includes **16 comprehensive sections**:

1. **Hero Section** - Main headline with AI-first messaging
2. **Problem Statement** - Addresses common business pain points
3. **Value Proposition** - Why DOTR is different (AI-first approach)
4. **Services Grid** - All 9 pillars (Designing, Development, E-Commerce, Marketing, Content, AI & Automation, Cloud/DevOps, Security, Consulting)
5. **Feature Highlights** - AI capabilities showcase
6. **Process** - 4-step workflow (AI-Powered Discovery → Rapid Planning → AI-Enhanced Development → Automated Launch)
7. **Differentiators** - Comparison table (DOTR vs Traditional Agencies)
8. **Stats** - Key metrics (9 Pillars, 48 Section Types, 100% AI-Powered, 24/7 Support)
9. **Success Metrics** - Client results (40% Revenue Increase, 20+ Hours Saved, 3x Faster, 98% Satisfaction)
10. **Testimonials** - 4 client testimonials
11. **CTA Section** - Mid-page call-to-action
12. **About Us** - Company story, mission, vision
13. **Values & Culture** - 6 core values
14. **Trust Badges** - Technology and security badges
15. **FAQ** - 8 frequently asked questions
16. **Primary CTA Banner** - Final conversion section

## How to Use in Admin Panel

### Option 1: Import via Admin Panel (Recommended)

1. Open your admin panel
2. Navigate to **Page Sections** or **Content Management**
3. Select **Home Page** (`page_type: "home"`)
4. Look for **Import** or **Bulk Upload** option
5. Upload `home-page-sections-admin-ready.json`
6. The system should automatically create all 16 sections

### Option 2: Manual Section-by-Section Entry

If bulk import isn't available:

1. Open your admin panel
2. Navigate to **Page Sections** → **Home Page**
3. For each section in `home-page-sections-admin-ready.json`:
   - Click **Add New Section**
   - Select the `section_type` (e.g., "hero", "services-grid")
   - Copy the `title` and `subtitle` fields
   - Paste the `content` JSON into the content editor
   - Set `display_order` to match the order in the file
   - Enable `is_active`
   - Save

### Option 3: Direct Database Import (Advanced)

If you have database access:

```sql
-- Import sections from JSON file
-- Note: Adjust based on your actual database structure
INSERT INTO page_sections (page_type, section_type, title, subtitle, content, display_order, is_active)
SELECT 
  'home',
  section->>'section_type',
  section->>'title',
  section->>'subtitle',
  section->'content',
  (section->>'display_order')::integer,
  (section->>'is_active')::boolean
FROM json_array_elements(
  pg_read_file('path/to/home-page-sections-admin-ready.json')::json
) AS section;
```

## Section Order

The sections are ordered from 1-16 to create a logical flow:

1. **Hero** - First impression
2. **Problem** - Identify pain points
3. **Value Prop** - Present solution
4. **Services** - Show what you offer
5. **Features** - Highlight AI capabilities
6. **Process** - Explain how you work
7. **Differentiators** - Why choose you
8. **Stats** - Build credibility
9. **Success Metrics** - Show results
10. **Testimonials** - Social proof
11. **CTA** - First conversion point
12. **About** - Company story
13. **Values** - Culture & principles
14. **Trust Badges** - Credibility
15. **FAQ** - Address concerns
16. **Final CTA** - Last conversion push

## Customization Tips

### Icons
All icons use **Lucide React** icon names. Common icons used:
- `Brain`, `Code`, `Palette`, `ShoppingCart`, `TrendingUp`, `Video`, `Cloud`, `Shield`, `Lightbulb`
- `MessageSquare`, `Filter`, `Sparkles`, `FileText`, `BarChart`, `Workflow`
- `Search`, `PenTool`, `Rocket`, `Zap`, `Clock`, `Heart`, `Target`, `Layers`

### Links
Update service links to match your actual routes:
- `/services/designing`
- `/services/development`
- `/services/e-commerce`
- etc.

### Images
Currently set to `null`. Add image URLs when you have:
- Background images for hero section
- Testimonial author photos
- Founder/team photos
- Trust badge logos

### Content Updates
All content is tailored to DOTR's:
- AI-first philosophy
- 9 specialized pillars
- Modern tech stack (Lovable, Supabase, n8n)
- Fast delivery promise
- End-to-end solutions

## Testing After Import

1. **Preview the home page** to ensure all sections render correctly
2. **Check section order** - sections should appear in display_order sequence
3. **Verify links** - all CTA buttons and service links should work
4. **Test responsiveness** - ensure sections look good on mobile/tablet/desktop
5. **Check icons** - verify all Lucide icons display correctly
6. **Review content** - ensure messaging aligns with your brand

## Next Steps

After importing:

1. **Add images** - Replace `null` image values with actual URLs
2. **Update testimonials** - Replace placeholder testimonials with real client quotes
3. **Customize stats** - Update numbers with actual metrics when available
4. **Adjust colors** - Match CTA colors to your brand palette
5. **SEO optimization** - Add meta descriptions and keywords for each section
6. **A/B testing** - Test different headlines and CTAs for conversion optimization

## Troubleshooting

### Sections not appearing?
- Check `is_active` is set to `true`
- Verify `page_type` matches "home"
- Ensure section types exist in your `section_types` table

### Icons not showing?
- Verify Lucide React is installed
- Check icon names match Lucide icon library
- Ensure icon component is properly imported

### JSON import fails?
- Validate JSON syntax using a JSON validator
- Check for required fields in your schema
- Ensure `content` field matches section type schema

### Content not rendering?
- Verify section type components exist
- Check component props match content structure
- Review browser console for errors

## Support

If you encounter issues:
1. Check the section inventory (`section-inventory.md`) for available section types
2. Review example JSON files in `examples/sections/`
3. Verify your admin panel supports the section types used
4. Check database schema matches the expected structure

---

**Created:** January 23, 2026  
**For:** DOTR Digital Nexus Home Page  
**Total Sections:** 16  
**Total Content Items:** 100+ (across all sections)
