# Sanity Studio Quick Reference

## 🚀 Quick Start

**Access Studio**: `http://localhost:3000/studio` (dev) or `https://your-domain.com/studio` (prod)

---

## 📊 Dashboard Widgets Cheat Sheet

### 1. Analytics Dashboard
**Purpose**: View metrics and insights  
**Key Info**: Quality score, completion rate, distributions  
**Action**: Monitor weekly

### 2. Data Quality
**Purpose**: Find and fix data issues  
**Key Info**: Quality score, issue categories  
**Action**: Search → Click → Edit

### 3. Deploy Production
**Purpose**: Deploy to Vercel  
**Setup**: Add target → Paste webhook URL  
**Action**: Click "Deploy"

### 4. Actions
**Purpose**: Bulk operations  
**Options**: Publish, Rebuild, Import, Export  
**Action**: Select → Confirm → Wait

### 5. Bulk SEO
**Purpose**: Update descriptions  
**Steps**: Template → Preview → Apply  
**Tip**: Use quick templates

### 6. Visibility
**Purpose**: Show/hide colleges  
**Steps**: Filter → Select → Show/Hide  
**Tip**: Ensure data complete before showing

### 7. Smart Validation
**Purpose**: Auto-fix issues  
**Steps**: Validate → Review → Auto-Fix  
**Tip**: Fix errors first

### 8. Duplicate Detection
**Purpose**: Find and merge duplicates  
**Steps**: Scan → Review → Merge  
**Tip**: Check primary before merging

### 9. Bulk Media Upload
**Purpose**: Upload multiple logos  
**Steps**: Name files → Select → Upload  
**Format**: "College Name.jpg"

### 10. Export Templates
**Purpose**: Custom exports  
**Steps**: Select fields → Format → Export  
**Tip**: Save templates for reuse

### 11. Quick Actions
**Purpose**: Fast access to common tasks  
**Features**: Search, Recent, Favorites  
**Tip**: Star items for quick access

### 12. Activity Log
**Purpose**: Track recent changes  
**Steps**: Filter → Time Range → Review  
**Tip**: Enable auto-refresh for live updates

### 13. SEO Analyzer
**Purpose**: Optimize content SEO  
**Key Info**: SEO score, issues, suggestions  
**Action**: Analyze → Fix issues → Improve score

### 14. Backup & Restore
**Purpose**: Protect your data  
**Features**: Full/colleges backup, restore, history  
**Tip**: Backup weekly or before major changes

### 15. Link Checker
**Purpose**: Validate website URLs  
**Features**: URL validation, HTTP→HTTPS fix  
**Action**: Check Links → Review → Fix

### 16. Batch Operations
**Purpose**: Bulk edit colleges  
**Operations**: Show, Hide, Set Type, Delete  
**Tip**: Use filters to select groups

---

## 🔧 Common Tasks

### Add New College
```
1. Create college (Name, Location, Type)
2. Upload logo (512×512px)
3. Add details & description
4. Validate (score > 80%)
5. Set visible = true
```

### Bulk Update SEO
```
1. Bulk SEO Widget
2. Select/create template
3. Preview (10 samples)
4. Apply to all
5. Verify results
```

### Fix Data Quality
```
1. Check Analytics (quality score)
2. Run Smart Validation
3. Use Auto-Fix
4. Manual fixes if needed
5. Re-validate
```

### Deploy to Production
```
1. Publish all changes
2. Run validation
3. Deploy Widget → Click target
4. Verify on website
```

### Import CSV Data
```
1. Prepare CSV (correct format)
2. Actions Widget → Import CSV
3. Select file
4. Review results
5. Fix errors if any
```

### Find Duplicates
```
1. Duplicate Detection Widget
2. Scan for Duplicates
3. Review groups
4. Merge duplicates
5. Re-scan
```

---

## 📝 CSV Import Format

```csv
name,location,type,estYear,website,shortName,isVisible,description
"College Name","City","Government","2000","https://example.com","CN","true","Description"
```

**Required**: name, location, type  
**Optional**: estYear, website, shortName, isVisible, description

---

## 🎯 SEO Template Variables

| Variable | Output | Example |
|----------|--------|---------|
| `{college.name}` | College name | "Jadavpur University" |
| `{college.location}` | Location | "Kolkata" |
| `{college.type}` | Type | "Government" |
| `{college.shortName}` | Acronym | "JU" |
| `{college.estYear}` | Year | "1955" |

**Example Template**:
```
"{college.name} - Best {college.type} College in {college.location} | WBJEE 2026"
```

**Output**:
```
"Jadavpur University - Best Government College in Kolkata | WBJEE 2026"
```

---

## ✅ Validation Rules

1. **Name**: No extra whitespace, proper case
2. **Slug**: Auto-generated from name
3. **Location**: Format "Area, City"
4. **Website**: Must start with http:// or https://
5. **Year**: Between 1800 and current year
6. **Description**: 100-200 characters (ideal: 150-160)
7. **Logo**: Required for visible colleges
8. **Visibility**: Check prerequisites
9. **Short Name**: Uppercase for acronyms

---

## 🎨 Image Guidelines

### Logo
- **Size**: 512×512px
- **Format**: PNG (transparent background)
- **Content**: College logo/emblem

### Cover Image
- **Size**: 1920×1080px
- **Format**: JPG or PNG
- **Content**: Campus photo

---

## 🔍 Search Tips

### Data Quality Widget
- Search by college name
- Filters all expandable lists
- Case-insensitive

### Content Search
- Use sidebar search
- Filter by document type
- Search by name or ID

---

## ⚡ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save/Publish |
| `Ctrl/Cmd + K` | Command palette |
| `Ctrl/Cmd + /` | Toggle sidebar |
| `Esc` | Close dialog |

---

## 🚨 Troubleshooting Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Widget not loading | Refresh page (F5) |
| CSV import fails | Check format, headers |
| No duplicates found | Lower threshold |
| Auto-fix not working | Manual fix required |
| Export fails | Select at least 1 field |
| Upload no matches | Rename files exactly |

---

## 📊 Quality Score Targets

| Score | Status | Action |
|-------|--------|--------|
| 90-100% | ✅ Excellent | Maintain |
| 80-89% | ✅ Good | Minor improvements |
| 70-79% | ⚠️ Fair | Needs attention |
| <70% | ❌ Poor | Urgent fixes needed |

---

## 🔄 Recommended Workflows

### Daily
- ✅ Check Analytics Dashboard
- ✅ Review new content

### Weekly
- ✅ Run Smart Validation
- ✅ Check Data Quality score
- ✅ Fix high-priority issues

### Monthly
- ✅ Scan for duplicates
- ✅ Export backup (JSON)
- ✅ Review analytics trends
- ✅ Bulk SEO updates if needed

---

## 💡 Pro Tips

1. **Always preview** before bulk operations
2. **Use filters** to reduce data load
3. **Save templates** for repeated tasks
4. **Auto-fix first**, manual fix later
5. **Export backups** before major changes
6. **Test in staging** before production
7. **Monitor quality score** weekly
8. **Name files correctly** for bulk upload
9. **Use variables** in SEO templates
10. **Check duplicates** after imports

---

## 📞 Need Help?

1. Check full documentation: `docs/SANITY_STUDIO_GUIDE.md`
2. Review error messages carefully
3. Check browser console (F12)
4. Contact development team

---

**Quick Reference v2.0** | January 2026
