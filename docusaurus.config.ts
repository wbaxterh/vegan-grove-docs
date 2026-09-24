import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import type { PokedocsPresetOptions } from '@pokedocs/preset';

const config: Config = {
  title: 'Vegan Grove Docs',
  tagline: 'How the Vegan Grove platform works, in the open',
  favicon: 'img/favicon.svg',

  // Cascade layers: without this the preset's compiled brand ladder loses to
  // the CSS bundle and the site silently renders stock Infima blue.
  future: { v4: true },

  // Overridable per environment; a production build with a placeholder url
  // warns, and POKEDOCS_STRICT_URL=true makes it an error.
  url: process.env.POKEDOCS_URL || 'https://docs.vegangrove.org',
  baseUrl: process.env.POKEDOCS_BASE_URL || '/',
  organizationName: 'wbaxterh',
  projectName: 'vegan-grove-docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // The landing page (src/pages/index.tsx) renders these cards.
  customFields: {
    landing: {
      cards: [
        {
          title: 'Product',
          description:
            'What Vegan Grove is, the loop it runs on, and how Trick Book concepts map over.',
          to: '/product/vision',
        },
        {
          title: 'Privacy',
          description: 'The promise, the field-by-field data inventory, and the threat model.',
          to: '/privacy',
        },
        {
          title: 'Architecture',
          description: 'Four repos, one API, and the decisions recorded as ADRs.',
          to: '/architecture/overview',
        },
        {
          title: 'Features',
          description: 'Places, Events, Groves, Friends, Feed, Messages, Media, Guides, and Ivy.',
          to: '/features/overview',
        },
        {
          title: 'Deployment',
          description:
            'EC2 and PM2 for the API, Amplify for the web, EAS for mobile, Pages for docs.',
          to: '/deployment',
        },
        {
          title: 'Roadmap',
          description:
            'Milestones from scaffold to the first mobile release, and the open questions.',
          to: '/roadmap/milestones',
        },
      ],
    },
  },

  presets: [
    [
      '@pokedocs/preset',
      {
        branding: {
          // Deep green on light, neon green on dark. The full Infima ladder is
          // compiled from these two values; never hand-write --ifm-color-primary.
          brandColor: { light: '#0E7C3A', dark: '#3DFF8A' },
          logo: 'img/logo.svg',
        },
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/wbaxterh/vegan-grove-docs/tree/main/',
        },
        // Every page needs a description: the agent surface (llms.txt, the
        // .md twins) and search read it before the body. The preset will enforce
        // this through `frontmatterSchema` once the published build implements
        // it (0.2.0 accepts the key but throws); until then `pokedocs check`
        // and review enforce it.
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies PokedocsPresetOptions,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Vegan Grove',
      logo: {
        alt: 'Vegan Grove logo',
        src: 'img/logo.svg',
      },
      items: [
        { type: 'docSidebar', sidebarId: 'docsSidebar', position: 'left', label: 'Documentation' },
        { to: '/privacy', label: 'Privacy', position: 'left' },
        { href: 'https://vegangrove.org', label: 'vegangrove.org', position: 'right' },
        { href: 'https://github.com/wbaxterh', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Product', to: '/product/vision' },
            { label: 'Privacy', to: '/privacy' },
            { label: 'Architecture', to: '/architecture/overview' },
            { label: 'Engineering', to: '/engineering/overview' },
          ],
        },
        {
          title: 'Repositories',
          items: [
            { label: 'vegan-grove-api', href: 'https://github.com/wbaxterh/vegan-grove-api' },
            { label: 'vegan-grove-web', href: 'https://github.com/wbaxterh/vegan-grove-web' },
            { label: 'vegan-grove-mobile', href: 'https://github.com/wbaxterh/vegan-grove-mobile' },
            { label: 'vegan-grove-docs', href: 'https://github.com/wbaxterh/vegan-grove-docs' },
          ],
        },
        {
          title: 'Links',
          items: [
            { label: 'vegangrove.org', href: 'https://vegangrove.org' },
            { label: 'Built with PokeDocs', href: 'https://github.com/wbaxterh/pokedocs' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Wes Huber. Public docs, private members.`,
    },
    prism: {
      additionalLanguages: ['bash', 'json', 'yaml', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
