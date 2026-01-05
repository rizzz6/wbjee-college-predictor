// Type definitions for College Detail sync component

export interface PlacementStats {
    highestPackage?: string
    averagePackage?: string
    nirfMedianSalary?: string
    topRecruiters?: string[]
    sourceReliability?: string
    dataSource?: string
}

export interface FeeStats {
    tuitionFee?: string
    totalCost?: string
    scholarships?: string
}

export interface AboutParagraphs {
    para1?: string
    para2?: string
    para3?: string
    para4?: string
}

export interface CollegeDetailDoc {
    highlights: string[]
    about: AboutParagraphs
    location?: string
    type?: string
    website?: string
    seoDescription?: string
    placementStats?: PlacementStats
    feesStats?: FeeStats
}

export interface TableRow {
    _key: string
    cells: string[]
}

export interface TableData {
    rows: TableRow[]
}

export interface CollegeDoc {
    highlights?: string[]
    placements?: TableData
    feeStructure?: TableData
    body?: PortableTextBlock[]
    location?: string
    type?: string
    website?: string
    description?: string
    estYear?: number
}

export interface PortableTextBlock {
    _type: 'block'
    _key: string
    style: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote'
    children: PortableTextChild[]
}

export interface PortableTextChild {
    _type: 'span'
    text: string
    marks?: string[]
}
