import { CollectionConfig } from 'payload'

export const CollegePlacementReports: CollectionConfig = {
  slug: 'college_placement_reports',
  admin: {
    useAsTitle: 'academicYearLabel',
    defaultColumns: ['college', 'reportYear', 'highestPackageLpa', 'averagePackageLpa'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'college',
      type: 'relationship',
      relationTo: 'colleges',
      required: true,
      index: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'reportYear',
          type: 'number',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'academicYearLabel',
          type: 'text',
          required: true,
          admin: { 
            width: '50%',
            placeholder: 'e.g. 2023-24' 
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'highestPackageLpa',
          type: 'number',
          admin: { width: '33%' },
        },
        {
          name: 'averagePackageLpa',
          type: 'number',
          admin: { width: '33%' },
        },
        {
          name: 'medianPackageLpa',
          type: 'number',
          admin: { width: '34%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'placementPercentage',
          type: 'number',
          admin: { width: '33%' },
        },
        {
          name: 'studentsEligible',
          type: 'number',
          admin: { width: '33%' },
        },
        {
          name: 'studentsPlaced',
          type: 'number',
          admin: { width: '34%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'companiesVisited',
          type: 'number',
          admin: { width: '50%' },
        },
        {
          name: 'offersCount',
          type: 'number',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'topRecruiters',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'sourceType',
      type: 'select',
      options: [
        { label: 'Official Report', value: 'official' },
        { label: 'Estimated', value: 'estimated' },
        { label: 'Media/News', value: 'media' },
        { label: 'Unverified/Direct', value: 'unverified' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'sourceName',
          type: 'text',
          admin: { width: '50%' },
        },
        {
          name: 'sourceUrl',
          type: 'text',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'sourceReliability',
      type: 'select',
      options: [
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
