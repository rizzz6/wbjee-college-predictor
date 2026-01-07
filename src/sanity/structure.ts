import type { StructureResolver } from 'sanity/structure'
import {
  BookOpen, CheckCircle, AlertTriangle, XCircle,
  AlertOctagon, Building2, GraduationCap, Eye
} from 'lucide-react'
import { CollegePreviewPane } from './components/CollegePreviewPane'

// Docs: https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('college')
        .title('Colleges')
        .child(
          S.list()
            .title('College Views')
            .items([
              // All colleges with sorting
              S.listItem()
                .title('All Colleges')
                .icon(BookOpen)
                .child(
                  S.documentTypeList('college')
                    .title('All Colleges')
                    .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                    .child((documentId) =>
                      S.document()
                        .documentId(documentId)
                        .schemaType('college')
                        .views([
                          S.view.form(),
                          S.view
                            .component(CollegePreviewPane)
                            .title('Preview')
                            .icon(Eye)
                        ])
                    )
                ),

              S.divider(),

              // Quick Filters
              S.listItem()
                .title('Recently Synced (24h)')
                .icon(CheckCircle)
                .child(
                  S.documentList()
                    .title('Recently Synced Colleges')
                    .filter('_type == "college" && lastSyncedAt > $yesterday')
                    .params({
                      yesterday: new Date(Date.now() - 86400000).toISOString()
                    })
                    .defaultOrdering([{ field: 'lastSyncedAt', direction: 'desc' }])
                ),

              S.listItem()
                .title('Outdated Sync (>24h)')
                .icon(AlertTriangle)
                .child(
                  S.documentList()
                    .title('Outdated Colleges')
                    .filter('_type == "college" && defined(lastSyncedAt) && lastSyncedAt < $yesterday')
                    .params({
                      yesterday: new Date(Date.now() - 86400000).toISOString()
                    })
                ),

              S.listItem()
                .title('No Detail Reference')
                .icon(XCircle)
                .child(
                  S.documentList()
                    .title('Colleges Without Detail Reference')
                    .filter('_type == "college" && !defined(detailsIdentifier)')
                ),

              S.listItem()
                .title('Missing Highlights')
                .icon(AlertOctagon)
                .child(
                  S.documentList()
                    .title('Colleges Without Highlights')
                    .filter('_type == "college" && (!defined(highlights) || count(highlights) == 0)')
                ),

              S.divider(),

              // By Type
              S.listItem()
                .title('Government Colleges')
                .icon(Building2)
                .child(
                  S.documentList()
                    .title('Government Colleges')
                    .filter('_type == "college" && type == "Government"')
                ),

              S.listItem()
                .title('Private Colleges')
                .icon(GraduationCap)
                .child(
                  S.documentList()
                    .title('Private Colleges')
                    .filter('_type == "college" && type == "Private"')
                ),
            ])
        ),

      S.documentTypeListItem('collegeCutoff').title('College Cutoffs'),
      S.divider(),
      S.documentTypeListItem('post').title('Blog Posts'),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('author').title('Authors'),
      S.divider(),
      S.documentTypeListItem('timeline').title('Timeline Events'),
      S.documentTypeListItem('siteSettings').title('Site Settings'),
      // collegeDetail is intentionally hidden - only accessible via college reference
    ])
