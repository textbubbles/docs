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
      <meta name="description" content="TextBubbles API documentation — send iMessages with automatic SMS fallback via a unified REST API. Endpoints for messages, webhooks, contacts, group chats, and more." />
      <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable documentation overview" />
      <link rel="alternate" type="text/plain" href="/llms-full.txt" title="LLM-readable full API documentation" />
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
