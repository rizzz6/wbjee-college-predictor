# Sanity Studio Documentation

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Dashboard Widgets](#dashboard-widgets)
4. [Content Management](#content-management)
5. [Workflows](#workflows)
6. [Troubleshooting](#troubleshooting)

---

## Overview

The WBJEE College Predictor Sanity Studio is a comprehensive content management system designed to manage college data, cutoffs, blog posts, and site settings. It features 10 custom dashboard widgets that provide powerful tools for data management, validation, and deployment.

### Key Features
- ✅ 10 specialized dashboard widgets
- ✅ Smart data validation with auto-fix
- ✅ Duplicate detection and merging
- ✅ Bulk operations (SEO, media, visibility)
- ✅ Analytics and insights
- ✅ Multi-target deployment
- ✅ Custom import/export templates

---

## Getting Started

### Accessing the Studio

1. **Local Development**: Navigate to `http://localhost:3000/studio`
2. **Production**: Navigate to `https://your-domain.com/studio`
3. **Login**: Use your Sanity account credentials

### Studio Layout

The studio consists of three main areas:

1. **Dashboard** (Home): Overview with all widgets
2. **Content** (Left Sidebar): Document types and content management
3. **Vision** (Tools): GROQ query playground

---

## Dashboard Widgets

### 1. Analytics Dashboard

**Purpose**: View comprehensive metrics and insights about your college data.

**Features**:
- Total colleges count
- Visible vs Hidden breakdown
- Average quality score
- Recent activity (30 days added, 7 days updated)
- Data completion rate with progress bar
- Distribution by type (Government, Private, Semi-Govt)
- Top 5 locations

**How to Use**:
1. Widget loads automatically on dashboard
2. Metrics update in real-time
3. Use insights to identify areas needing attention

**Key Metrics**:
- **Quality Score**: Based on logo, description, details, and highlights (0-100%)
- **Completion Rate**: Percentage of colleges with all required fields
- **Activity**: Track recent additions and updates

---

### 2. Data Quality Widget

**Purpose**: Monitor and fix data quality issues across all colleges.

**Features**:
- Overall quality score (0-100%)
- Expandable issue categories:
  - Recently Synced (7 days)
  - Never Synced
  - Missing Detail Source
  - No Highlights
  - Incomplete Data
  - Missing Images (Logo/Cover)
- Search functionality to filter colleges
- Direct navigation to college editor

**How to Use**:
1. Review the quality score (aim for 80%+)
2. Click on issue categories to expand
3. Use search box to find specific colleges
4. Click college names to edit directly
5. Click "Edit" button to navigate to college

**Best Practices**:
- Check quality score weekly
- Prioritize fixing "Missing Detail Source" issues
- Ensure visible colleges have logos

---

### 3. Deploy Production Widget

**Purpose**: Deploy your site to Vercel with multiple deployment targets.

**Features**:
- Multiple deployment targets (Production, Staging, etc.)
- Branch-specific deployments
- Last deployed timestamp
- Secure webhook URL storage (localStorage only)

**How to Use**:

**Adding a Deploy Target**:
1. Click "Add Deploy Target"
2. Enter target name (e.g., "Production")
3. Paste Vercel webhook URL
4. (Optional) Specify branch (e.g., "main")
5. Click "Add Target"

**Deploying**:
1. Click "Deploy" button on desired target
2. Wait for confirmation
3. Check "Last deployed" timestamp

**Getting Webhook URL**:
1. Go to Vercel Dashboard → Your Project
2. Settings → Git → Deploy Hooks
3. Create new hook
4. Copy the webhook URL

**Security Note**: Webhook URLs are stored in browser localStorage only, never in Sanity database.

---

### 4. Actions Widget

**Purpose**: Perform bulk operations on college data.

**Features**:
- **Publishing & Rebuild**:
  - Publish All Drafts
  - Rebuild with options (colleges, cutoffs, indexes, mobile)
- **Import/Export**:
  - Import from CSV
  - Export as JSON or CSV
- **Danger Zone**:
  - Update Visibility Tags

**How to Use**:

**Publishing Drafts**:
1. Click "Publish All Drafts"
2. Confirm action
3. Wait for completion

**Rebuilding Data**:
1. Select rebuild options (checkboxes)
2. Click "Rebuild Selected"
3. Confirm action
4. Monitor progress

**Importing CSV**:
1. Click "Import CSV"
2. Select CSV file
3. Review import results
4. Check for errors

**CSV Format**:
```csv
name,location,type,estYear,website,shortName,isVisible,description
"Jadavpur University","Kolkata","Government","1955","https://jadavpuruniversity.in","JU","true","Top engineering college"
```

**Exporting Data**:
1. Click "Export JSON" or "Export CSV"
2. File downloads automatically
3. Use for backups or external processing

---

### 5. Bulk SEO Widget

**Purpose**: Update SEO descriptions for multiple colleges using templates.

**Features**:
- Template-based description generation
- Variable substitution (college.name, college.location, etc.)
- Preview before applying
- Quick template presets
- Bulk update with progress tracking

**How to Use**:

**Using Quick Templates**:
1. Select a preset from "Quick Templates" dropdown
2. Template populates automatically
3. Click "Preview (10)" to see examples
4. Click "Apply to X Colleges" to update all

**Creating Custom Template**:
1. Use available variables (click badges to insert):
   - `{college.name}` - College name
   - `{college.location}` - Location
   - `{college.type}` - Type (Government/Private)
   - `{college.shortName}` - Acronym
   - `{college.estYear}` - Established year
2. Example: `"{college.name} - Best {college.type} College in {college.location} | WBJEE 2026"`
3. Check length indicator (aim for 150-160 chars)
4. Preview with sample colleges
5. Apply to all matching filter

**Filtering**:
- **All Colleges**: Update all colleges
- **Visible Only**: Update only visible colleges
- **Hidden Only**: Update only hidden colleges

**Best Practices**:
- Keep descriptions between 150-160 characters
- Include college name and location
- Add year for freshness
- Preview before applying
- Use variables for consistency

---

### 6. Visibility Widget

**Purpose**: Manage which colleges are visible on the website.

**Features**:
- Filter by visibility status (All/Visible/Hidden)
- Bulk show/hide operations
- Clickable rows for selection
- Stats display (total, visible, hidden)

**How to Use**:

**Showing Colleges**:
1. Filter to "Hidden" or "All"
2. Click rows to select colleges
3. Click "Show Selected"
4. Colleges become visible on website

**Hiding Colleges**:
1. Filter to "Visible" or "All"
2. Click rows to select colleges
3. Click "Hide Selected"
4. Colleges removed from website

**Best Practices**:
- Only show colleges with complete data
- Ensure colleges have logos before showing
- Verify details are accurate
- Use filters to manage large lists

---

### 7. Smart Validation Widget

**Purpose**: Automatically detect and fix data quality issues.

**Features**:
- 9 validation rules
- Auto-fix suggestions
- Quality scoring (0-100)
- Severity levels (Error, Warning, Info)
- One-click fixes

**Validation Rules**:
1. **Name**: Whitespace, ALL CAPS detection
2. **Slug**: Auto-generation from name
3. **Location**: Format suggestions
4. **Website**: URL protocol, typo detection
5. **Established Year**: Range validation
6. **SEO Description**: Length optimization
7. **Logo**: Required for visible colleges
8. **Visibility**: Prerequisites checking
9. **Short Name**: Acronym formatting

**How to Use**:

**Running Validation**:
1. Click "Validate All"
2. Review colleges with issues (sorted by score)
3. Check issue details

**Auto-Fixing Issues**:
1. Review suggested fixes
2. Click "Auto-Fix (X)" button
3. System applies all fixable issues
4. Re-validate to confirm

**Manual Fixes**:
1. Click "Edit" button
2. Navigate to college editor
3. Fix issues manually
4. Save changes

**Example Auto-Fixes**:
- `"JADAVPUR UNIVERSITY  "` → `"Jadavpur University"`
- `"jadavpuruniversity.in"` → `"https://jadavpuruniversity.in"`
- `"htpp://example.com"` → `"https://example.com"`
- Description too long → Truncated to 197 chars + "..."

---

### 8. Duplicate Detection Widget

**Purpose**: Find and merge duplicate college entries.

**Features**:
- Fuzzy name matching (Levenshtein distance)
- Multi-factor similarity scoring
- Intelligent grouping
- Safe merging with data preservation
- Similarity percentage display

**Detection Criteria**:
1. Name similarity (70%+ threshold)
2. Location matching
3. Same college type
4. Matching acronyms
5. Same website domain

**How to Use**:

**Scanning for Duplicates**:
1. Click "Scan for Duplicates"
2. Wait for analysis
3. Review duplicate groups

**Understanding Results**:
- **Primary**: Suggested college to keep (✓)
- **Duplicates**: Colleges to be deleted (✗)
- **Similarity**: Match percentage
- **Reasons**: Why they're considered duplicates

**Merging Duplicates**:
1. Review duplicate group
2. Verify primary selection is correct
3. Click "Merge X Duplicate(s)"
4. Confirm action
5. System:
   - Keeps primary college
   - Merges missing data from duplicates
   - Deletes duplicate entries

**Best Practices**:
- Review matches carefully before merging
- Check that primary has best data
- Verify similarity reasons make sense
- Merge one group at a time
- Re-scan after merging to find new matches

---

### 9. Bulk Media Upload Widget

**Purpose**: Upload multiple college logos at once with auto-matching.

**Features**:
- Multi-file selection
- Automatic college matching
- Progress tracking
- Detailed results reporting
- Supported formats: JPG, PNG, GIF, WebP

**How to Use**:

**Preparing Files**:
1. Name files with college names
   - Good: `"Jadavpur University.jpg"`
   - Good: `"IEM Kolkata.png"`
   - Good: `"jadavpur-university.jpg"`
2. Ensure images are high quality
3. Recommended: 512×512px, transparent background

**Uploading**:
1. Click "Select Images"
2. Choose multiple image files
3. Wait for upload and matching
4. Review results

**Results**:
- ✓ **Success**: File uploaded and associated
- ✗ **Failed**: No match found or upload error

**Troubleshooting**:
- **No match found**: Rename file to exact college name
- **Multiple matches**: Use more specific name
- **Upload failed**: Check file size and format

---

### 10. Export Templates Widget

**Purpose**: Create custom export formats with selected fields.

**Features**:
- 15 available fields
- Multiple formats (JSON, CSV)
- Template saving and loading
- Filter by visibility
- Custom field selection

**Available Fields**:
- Document ID, College Name, URL Slug
- Short Name, Location, Type
- Established Year, Website
- Visibility Status, Priority
- SEO Description, Cutoff Identifier
- Created Date, Updated Date, Last Synced

**How to Use**:

**Quick Export**:
1. Select fields (checkboxes)
2. Choose format (JSON/CSV)
3. Select filter (All/Visible/Hidden)
4. Click "Export Now"

**Saving Templates**:
1. Select desired fields
2. Choose format
3. Click "Save as Template"
4. Enter template name
5. Click "Save"

**Using Saved Templates**:
1. Click template name
2. Fields and format load automatically
3. Modify if needed
4. Click "Export Now"

**Example Templates**:
- **Basic Info**: Name, Location, Type, Visibility
- **SEO Export**: Name, Slug, Description, Website
- **Full Export**: All fields
- **Public Data**: Name, Location, Type, Website (visible only)

---

## Content Management

### Managing Colleges

**Creating a College**:
1. Click "College" in sidebar
2. Click "Create" button
3. Fill required fields:
   - Name
   - Slug (auto-generated)
   - Location
   - Type
4. Add optional fields:
   - Logo, Cover Image
   - Description, Highlights
   - Details Reference
5. Set visibility to `false` initially
6. Click "Publish"

**Editing a College**:
1. Find college in list or use search
2. Click college name
3. Make changes
4. Click "Publish" to save

**Best Practices**:
- Always add logo before making visible
- Write SEO description (150-160 chars)
- Add college details reference
- Include at least 3 highlights
- Verify all data before publishing

### Managing Blog Posts

**Creating a Post**:
1. Click "Post" in sidebar
2. Click "Create"
3. Fill required fields:
   - Title
   - Slug
   - Author
   - Categories
   - Main Image
   - Body Content
4. Set publish date
5. Click "Publish"

**Using Block Content**:
- **Headings**: H2, H3, H4
- **Text**: Normal, Bold, Italic
- **Lists**: Bullet, Numbered
- **Links**: Internal, External
- **Images**: Inline images
- **Code**: Code blocks

---

## Workflows

### Adding a New College (Complete Workflow)

1. **Create College Document**:
   - Name, Location, Type
   - Generate slug
   - Set visibility = false

2. **Add Media**:
   - Upload logo (512×512px)
   - Upload cover image (1920×1080px)

3. **Add Details**:
   - Create College Detail document
   - Link to college

4. **Add Content**:
   - Write SEO description
   - Add 3-5 highlights
   - Add facilities, placements data

5. **Validate**:
   - Run Smart Validation
   - Fix any issues
   - Ensure quality score > 80%

6. **Make Visible**:
   - Set visibility = true
   - Verify on website
   - Monitor analytics

### Bulk SEO Update Workflow

1. **Prepare**:
   - Decide on template
   - Choose filter (all/visible/hidden)

2. **Preview**:
   - Use Bulk SEO Widget
   - Select/create template
   - Preview 10 samples

3. **Apply**:
   - Click "Apply to X Colleges"
   - Monitor progress
   - Review results

4. **Verify**:
   - Check sample colleges
   - Ensure descriptions are correct
   - Fix any issues

### Data Quality Improvement Workflow

1. **Assess**:
   - Check Analytics Dashboard
   - Review Data Quality Widget
   - Note quality score

2. **Validate**:
   - Run Smart Validation
   - Review all issues
   - Prioritize fixes

3. **Fix**:
   - Use auto-fix for simple issues
   - Manually fix complex issues
   - Add missing data

4. **Verify**:
   - Re-run validation
   - Check quality score improvement
   - Monitor analytics

### Deployment Workflow

1. **Prepare**:
   - Ensure all changes are published
   - Run validation
   - Check for duplicates

2. **Deploy**:
   - Use Deploy Widget
   - Click appropriate target
   - Wait for completion

3. **Verify**:
   - Check website
   - Test changed content
   - Monitor for errors

---

## Troubleshooting

### Common Issues

**Issue**: Widget not loading
- **Solution**: Refresh page, check console for errors

**Issue**: CSV import fails
- **Solution**: Check CSV format, ensure headers match expected format

**Issue**: Duplicate detection finds no matches
- **Solution**: Lower threshold (default 70%), check college names

**Issue**: Auto-fix doesn't work
- **Solution**: Some issues require manual fixing, check error messages

**Issue**: Export template fails
- **Solution**: Ensure at least one field is selected

**Issue**: Bulk media upload no matches
- **Solution**: Rename files to match exact college names

### Getting Help

**Error Messages**:
- Read error message carefully
- Check console (F12) for details
- Note which widget/action caused error

**Data Issues**:
- Use Smart Validation to identify
- Check Data Quality Widget
- Review Analytics Dashboard

**Performance Issues**:
- Limit bulk operations to 100 colleges
- Use filters to reduce data load
- Clear browser cache

---

## Best Practices

### Data Quality
- ✅ Run validation weekly
- ✅ Maintain 80%+ quality score
- ✅ Fix errors before warnings
- ✅ Use auto-fix when available

### Content Management
- ✅ Always preview before publishing
- ✅ Use consistent naming
- ✅ Add complete data before making visible
- ✅ Regular backups via export

### Bulk Operations
- ✅ Preview before applying
- ✅ Start with small batches
- ✅ Monitor progress
- ✅ Verify results

### Deployment
- ✅ Test in staging first
- ✅ Deploy during low-traffic periods
- ✅ Verify after deployment
- ✅ Keep deployment history

---

## Keyboard Shortcuts

- `Ctrl/Cmd + S`: Save/Publish
- `Ctrl/Cmd + K`: Command palette
- `Ctrl/Cmd + /`: Toggle sidebar
- `Esc`: Close dialogs

---

## Support

For technical issues or questions:
1. Check this documentation
2. Review error messages
3. Check browser console
4. Contact development team

---

**Last Updated**: January 2026  
**Version**: 2.0
