// Import document schemas
import { collegeType } from './documents/college'
import { collegeCutoffType } from './documents/collegeCutoff'
import { collegeDetailType } from './documents/collegeDetail'
import { postType } from './documents/postType'
import { authorType } from './documents/authorType'
import { categoryType } from './documents/categoryType'
import { siteSettingsType } from './documents/siteSettings'
import { timelineType } from './documents/timeline'

// Import object schemas
import { blockContentType } from './objects/blockContentType'

// Export schema configuration
export const schema = {
  types: [
    // Documents
    collegeType,
    collegeCutoffType,
    collegeDetailType,
    postType,
    authorType,
    categoryType,
    siteSettingsType,
    timelineType,

    // Objects
    blockContentType,
  ],
}
