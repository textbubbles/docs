import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span style={{ fontWeight: 800, fontSize: '1.2em' }}>TextBubbles</span>,
  project: {
    link: 'https://github.com/textbubbles',
  },
  docsRepositoryBase: 'https://github.com/textbubbles/docs',
  footer: {
    content: <span>© {new Date().getFullYear()} TextBubbles. All rights reserved.</span>,
  },
  darkMode: true,
  nextThemes: {
    defaultTheme: 'dark',
  },
  color: {
    hue: 211,
    saturation: 100,
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="TextBubbles Documentation" />
      <meta property="og:description" content="API documentation for TextBubbles messaging service" />
    </>
  ),
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  toc: {
    backToTop: true,
  },
}

export default config
