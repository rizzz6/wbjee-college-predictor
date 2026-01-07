// TabbedDashboard - Main dashboard component that groups all widgets
// This is registered as a single "full" width widget in sanity.config.ts

'use client'

import { Box } from '@sanity/ui'
import { DashboardTabs } from './DashboardTabs'

// Import all widgets
import { AnalyticsDashboardWidget } from '../AnalyticsDashboardWidget'
import { QuickActionsWidget } from '../QuickActionsWidget'
import { ActivityLogWidget } from '../ActivityLogWidget'
import { DataQualityWidget } from '../DataQualityWidget'
import { SmartValidationWidget } from '../SmartValidationWidget'
import { SeoAnalyzerWidget } from '../SeoAnalyzerWidget'
import { BrokenLinkCheckerWidget } from '../BrokenLinkCheckerWidget'
import { DuplicateDetectionWidget } from '../DuplicateDetectionWidget'
import { BatchOperationsWidget } from '../BatchOperationsWidget'
import { VisibilityWidget } from '../VisibilityWidget'
import { BulkSeoWidget } from '../BulkSeoWidget'
import { BulkMediaUploadWidget } from '../BulkMediaUploadWidget'
import { ExportTemplatesWidget } from '../ExportTemplatesWidget'
import { BackupRestoreWidget } from '../BackupRestoreWidget'
import { CustomDeployWidget } from '../CustomDeployWidget'
import { ActionsWidget } from '../ActionsWidget'

// Widget map - maps widget IDs to their components
const WIDGET_MAP: Record<string, React.ReactNode> = {
    // Overview tab
    'analytics': <AnalyticsDashboardWidget />,
    'quick-actions': <QuickActionsWidget />,
    'activity-log': <ActivityLogWidget />,

    // Quality tab
    'data-quality': <DataQualityWidget />,
    'smart-validation': <SmartValidationWidget />,
    'seo-analyzer': <SeoAnalyzerWidget />,
    'link-checker': <BrokenLinkCheckerWidget />,
    'duplicate-detection': <DuplicateDetectionWidget />,

    // Operations tab
    'batch-operations': <BatchOperationsWidget />,
    'visibility': <VisibilityWidget />,
    'bulk-seo': <BulkSeoWidget />,
    'bulk-media-upload': <BulkMediaUploadWidget />,

    // Data tab
    'export-templates': <ExportTemplatesWidget />,
    'backup-restore': <BackupRestoreWidget />,

    // Deploy tab
    'deploy-production': <CustomDeployWidget />,
    'actions': <ActionsWidget />
}

export function TabbedDashboard() {
    return (
        <Box padding={4}>
            <DashboardTabs widgetMap={WIDGET_MAP} />
        </Box>
    )
}
