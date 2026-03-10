# Sanity Studio Documentation

Welcome to the WBJEE College Predictor Sanity Studio documentation!

## 📚 Documentation Files

### For Content Editors & Administrators

**[Sanity Studio Guide](./SANITY_STUDIO_GUIDE.md)** - Complete user guide

- Detailed widget documentation
- Step-by-step workflows
- Best practices
- Troubleshooting

**[Quick Reference](./SANITY_QUICK_REFERENCE.md)** - Cheat sheet

- Widget summaries
- Common tasks
- Keyboard shortcuts
- Pro tips

### For Developers

**[Technical Reference](./SANITY_TECHNICAL_REFERENCE.md)** - Developer guide

- Architecture overview
- API reference
- Widget development
- Testing & deployment

---

## 🚀 Quick Start

### For Content Editors

1. **Access Studio**: Navigate to `/studio` on your domain
2. **Login**: Use your Sanity credentials
3. **Explore Dashboard**: Review the 10 dashboard widgets
4. **Read Guide**: Check [SANITY_STUDIO_GUIDE.md](./SANITY_STUDIO_GUIDE.md)
5. **Use Quick Reference**: Keep [SANITY_QUICK_REFERENCE.md](./SANITY_QUICK_REFERENCE.md) handy

### For Developers & Admins

1. **Setup Environment**: Configure `.env.local` with Sanity credentials
2. **Install Dependencies**: `npm install`
3. **Start Dev Server**: `npm run dev`
4. **Access Studio**: `http://localhost:3000/studio`
5. **Read Technical Docs**: Review [SANITY_TECHNICAL_REFERENCE.md](./SANITY_TECHNICAL_REFERENCE.md)

---

## 📊 Dashboard Widgets Overview

| Widget | Purpose | For |
| --- | --- | --- |
| **Analytics Dashboard** | View metrics and insights | Everyone |
| **Data Quality** | Monitor and fix data issues | Editors |
| **Deploy Production** | Deploy to Vercel | Admins |
| **Actions** | Bulk operations | Editors |
| **Bulk SEO** | Update descriptions | Editors |
| **Visibility** | Show/hide colleges | Editors |
| **Smart Validation** | Auto-fix issues | Editors |
| **Duplicate Detection** | Find and merge duplicates | Admins |
| **Bulk Media Upload** | Upload multiple logos | Editors |
| **Export Templates** | Custom data exports | Everyone |

---

## 🎯 Common Use Cases

**Add a new college**
→ See [SANITY_STUDIO_GUIDE.md](./SANITY_STUDIO_GUIDE.md#managing-colleges) - "Creating a College"

**Update SEO descriptions for all colleges**
→ See [SANITY_STUDIO_GUIDE.md](./SANITY_STUDIO_GUIDE.md#5-bulk-seo-widget) - "Bulk SEO Widget"

**Fix data quality issues**
→ See [SANITY_STUDIO_GUIDE.md](./SANITY_STUDIO_GUIDE.md#7-smart-validation-widget) - "Smart Validation Widget"

**Upload multiple college logos**
→ See [SANITY_STUDIO_GUIDE.md](./SANITY_STUDIO_GUIDE.md#9-bulk-media-upload-widget) - "Bulk Media Upload Widget"

**Export college data**
→ See [SANITY_STUDIO_GUIDE.md](./SANITY_STUDIO_GUIDE.md#10-export-templates-widget) - "Export Templates Widget"

**Deploy to production**
→ See [SANITY_STUDIO_GUIDE.md](./SANITY_STUDIO_GUIDE.md#3-deploy-production-widget) - "Deploy Production Widget"

**Find duplicate colleges**
→ See [SANITY_STUDIO_GUIDE.md](./SANITY_STUDIO_GUIDE.md#8-duplicate-detection-widget) - "Duplicate Detection Widget"

**Import CSV data**
→ See [SANITY_STUDIO_GUIDE.md](./SANITY_STUDIO_GUIDE.md#4-actions-widget) - "Importing CSV"

**Create a custom widget**
→ See [SANITY_TECHNICAL_REFERENCE.md](./SANITY_TECHNICAL_REFERENCE.md#widget-development) - "Widget Development"

**Query data with GROQ**
→ See [SANITY_TECHNICAL_REFERENCE.md](./SANITY_TECHNICAL_REFERENCE.md#data-fetching) - "GROQ Query Examples"

---

## 🔧 Features

### Data Management

- ✅ 10 custom dashboard widgets
- ✅ Smart validation with auto-fix
- ✅ Duplicate detection and merging
- ✅ Bulk operations (SEO, visibility, media)
- ✅ CSV import/export
- ✅ Custom export templates

### Quality Assurance

- ✅ 9 validation rules
- ✅ Quality scoring (0-100%)
- ✅ Data completion tracking
- ✅ Issue categorization
- ✅ Auto-fix suggestions

### Analytics

- ✅ Comprehensive metrics
- ✅ Activity tracking
- ✅ Distribution analysis
- ✅ Quality trends

### Deployment

- ✅ Multi-target deployment
- ✅ Vercel integration
- ✅ Deployment history
- ✅ Secure webhook storage

---

## 📖 Documentation Structure

```bash
docs/
├── README.md                          # This file
├── SANITY_STUDIO_GUIDE.md            # Complete user guide
├── SANITY_QUICK_REFERENCE.md         # Quick reference cheat sheet
└── SANITY_TECHNICAL_REFERENCE.md     # Developer technical reference
```

---

## 🎓 Learning Path

### For New Content Editors

1. **Week 1**: Basics
   - Read [Quick Reference](./SANITY_QUICK_REFERENCE.md)
   - Explore dashboard widgets
   - Practice creating/editing colleges
   - Learn search and filtering

2. **Week 2**: Advanced Features
   - Read [Studio Guide](./SANITY_STUDIO_GUIDE.md)
   - Use Smart Validation
   - Try bulk operations
   - Practice workflows

3. **Week 3**: Mastery
   - Create custom export templates
   - Use bulk media upload
   - Optimize data quality
   - Master keyboard shortcuts

### For New Developers

1. **Day 1**: Setup
   - Read [Technical Reference](./SANITY_TECHNICAL_REFERENCE.md)
   - Setup development environment
   - Explore codebase structure
   - Run studio locally

2. **Day 2-3**: Understanding
   - Study widget implementations
   - Review utility functions
   - Understand GROQ queries
   - Test existing features

3. **Day 4-5**: Building
   - Create a simple widget
   - Add custom validation rule
   - Write tests
   - Submit PR

---

## 🚨 Important Notes

### Security

- ⚠️ Never commit API tokens to git
- ⚠️ Store sensitive data in localStorage, not Sanity
- ⚠️ Use environment variables for credentials
- ⚠️ Rotate tokens regularly

### Best Practices

- ✅ Always preview before bulk operations
- ✅ Export backups before major changes
- ✅ Run validation weekly
- ✅ Test in staging before production
- ✅ Monitor quality scores

### Performance

- ⚡ Use filters to reduce data load
- ⚡ Limit bulk operations to 100 items
- ⚡ Project only needed fields in queries
- ⚡ Cache data when appropriate

---

## 📞 Support

### Getting Help

1. **Check Documentation**: Search these docs first
2. **Error Messages**: Read carefully, check console
3. **Common Issues**: See troubleshooting sections
4. **Contact Team**: Reach out to development team

### Reporting Issues

When reporting issues, include:
-What you were trying to do
-What happened instead
-Error messages (if any)
-Steps to reproduce
-Screenshots (if helpful)

---

## 🔄 Updates

### Version History

**v2.0** (January 2026)

- Added 10 dashboard widgets
- Implemented smart validation
- Added duplicate detection
- Created bulk operations
- Added analytics dashboard
- Comprehensive documentation

**v1.0** (October 2025)

- Basic Sanity Studio setup
- Core content types
- Simple dashboard

---

## 📝 Contributing

### Documentation Updates

1. Fork repository
2. Update relevant documentation
3. Test changes
4. Submit pull request

### Code Contributions

See [SANITY_TECHNICAL_REFERENCE.md](./SANITY_TECHNICAL_REFERENCE.md#contributing) for contribution guidelines.

---

## 🎯 Goals & Roadmap

### Current Focus

- Comprehensive documentation
- User training
- Performance optimization
- Bug fixes

### Future Enhancements

- 💡 Advanced analytics with charts
- 💡 Scheduled publishing
- 💡 Automated backups
- 💡 Webhook notifications
- 💡 API rate limiting
- 💡 Batch operations UI

---

## 📚 Additional Resources

### Sanity Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [GROQ Reference](https://www.sanity.io/docs/groq)
- [Sanity UI Components](https://www.sanity.io/ui)
- [Sanity Community](https://www.sanity.io/community)

### Development Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 📄 License

This documentation is part of the WBJEE College Predictor project.

---

**Documentation v2.0** | Last Updated: January 2026

For questions or feedback, contact the development team.
