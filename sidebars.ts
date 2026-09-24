import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// The sidebar is the information architecture. A feature earns a category of
// its own exactly when it has an index (PRD) plus an architecture or spec
// page; everything else stays a flat page.
const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Product',
      items: ['product/vision', 'product/principles', 'product/concept-map', 'product/personas'],
    },
    {
      type: 'category',
      label: 'Privacy',
      link: { type: 'doc', id: 'privacy/index' },
      items: ['privacy/data-inventory', 'privacy/threat-model', 'privacy/disclosure-policy'],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/repo-dependency-map',
        'architecture/tech-stack',
        'architecture/data-model',
        'architecture/auth-and-sessions',
        {
          type: 'category',
          label: 'ADRs',
          link: { type: 'doc', id: 'architecture/adrs/index' },
          items: [
            'architecture/adrs/adr-0001-polyrepo',
            'architecture/adrs/adr-0002-backend-hosting',
            'architecture/adrs/adr-0003-auth',
            'architecture/adrs/adr-0004-profiles-never-public',
            'architecture/adrs/adr-0005-data-minimization',
            'architecture/adrs/adr-0006-maps',
            'architecture/adrs/adr-0007-no-third-party-analytics',
            'architecture/adrs/adr-0008-database',
            'architecture/adrs/adr-0009-public-repos',
            'architecture/adrs/adr-0010-account-deletion',
            'architecture/adrs/adr-0011-messages-encryption',
            'architecture/adrs/adr-0012-companion',
            'architecture/adrs/adr-0013-media-pipeline',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Backend',
      items: [
        'backend/overview',
        'backend/api-endpoints',
        'backend/database',
        'backend/configuration',
        'backend/testing',
      ],
    },
    {
      type: 'category',
      label: 'Mobile',
      items: [
        'mobile/overview',
        'mobile/navigation',
        'mobile/state-and-data',
        'mobile/api-client',
        'mobile/build-and-release',
      ],
    },
    {
      type: 'category',
      label: 'Web',
      items: ['web/overview', 'web/routes', 'web/auth-and-sessions', 'web/amplify-deploy'],
    },
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/overview',
        {
          type: 'category',
          label: 'Places',
          link: { type: 'doc', id: 'features/places/index' },
          items: ['features/places/data-sources', 'features/places/verification'],
        },
        {
          type: 'category',
          label: 'Events',
          link: { type: 'doc', id: 'features/events/index' },
          items: ['features/events/rsvp-privacy'],
        },
        'features/groves',
        'features/friends',
        'features/feed',
        'features/messages',
        'features/media',
        'features/guides',
        'features/companion',
        'features/notifications',
        'features/action-log',
      ],
    },
    {
      type: 'category',
      label: 'Engineering',
      items: [
        'engineering/overview',
        'engineering/development-workflow',
        'engineering/linting-formatting',
        'engineering/testing',
        'engineering/pre-commit-hooks',
        'engineering/error-handling',
        'engineering/logging',
        'engineering/agent-guide',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      link: { type: 'doc', id: 'deployment/index' },
      items: [
        'deployment/backend',
        'deployment/web-app',
        'deployment/mobile',
        'deployment/docs',
        'deployment/cost-sheet',
      ],
    },
    {
      type: 'category',
      label: 'Roadmap',
      items: ['roadmap/milestones', 'roadmap/open-questions'],
    },
    {
      type: 'category',
      label: 'Releases',
      items: ['releases/index'],
    },
  ],
};

export default sidebars;
