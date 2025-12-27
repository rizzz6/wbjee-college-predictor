import type { StructureResolver } from 'sanity/structure'
import { School, FileText, Settings } from 'lucide-react'
import { Iframe } from 'sanity-plugin-iframe-pane'
import React from 'react'

// Icon wrappers with custom sizes
const SettingsIcon = () => React.createElement(Settings, { size: 18 })
const SchoolIcon = () => React.createElement(School, { size: 18 })
const FileTextIcon = () => React.createElement(FileText, { size: 18 })

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Site Settings (Singleton)
      S.listItem()
        .title('Site Settings')
        .icon(SettingsIcon)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),

      S.divider(),

      // WBJEE Data Group
      S.listItem()
        .title('WBJEE Data')
        .icon(SchoolIcon)
        .child(
          S.list()
            .title('WBJEE Data')
            .items([
              // Colleges with Live Preview
              S.listItem()
                .title('Colleges')
                .schemaType('college')
                .child(
                  S.documentTypeList('college')
                    .title('Colleges')
                    .child((documentId) =>
                      S.document()
                        .documentId(documentId)
                        .schemaType('college')
                        .views([
                          S.view.form(),
                          S.view
                            .component(Iframe)
                            .options({
                              url: (doc: { slug?: { current?: string } }) => {
                                if (!doc?.slug?.current) {
                                  return `http://localhost:3000/colleges`
                                }
                                return `http://localhost:3000/colleges/${doc.slug.current}`
                              },
                              reload: { button: true },
                            })
                            .title('Live Preview'),
                        ])
                    )
                ),
              S.documentTypeListItem('collegeCutoff').title('College Cutoffs'),
              S.documentTypeListItem('timeline').title('Timeline Events'),
            ])
        ),

      // Blog & Content Group
      S.listItem()
        .title('Blog & Content')
        .icon(FileTextIcon)
        .child(
          S.list()
            .title('Blog & Content')
            .items([
              S.documentTypeListItem('post').title('Blog Posts'),
              S.documentTypeListItem('category').title('Categories'),
              S.documentTypeListItem('author').title('Authors'),
            ])
        ),

      S.divider(),

      // Everything else (if any future types are added)
      ...S.documentTypeListItems().filter(
        (item) =>
          !['college', 'collegeCutoff', 'timeline', 'post', 'category', 'author', 'siteSettings'].includes(
            item.getId() || ''
          )
      ),
    ])
