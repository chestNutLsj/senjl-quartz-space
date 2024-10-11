import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.Comments({
      provider: "giscus",
      options: {
        // from giscu config's data-repo
        repo: "chestNutLsj/senjl-quartz-space",
        // from giscu config's data-repo-id
        repoId: "R_kgDOK_jAvg",
        // from giscu config's data-category
        category: "Announcements",
        // from giscu config's data-category-id
        categoryId: "DIC_kwDOK_jAvs4CjRYH",

        // how to map pages -> discussions
        // defaults to 'pathname'
        mapping: "pathname",

        // use strict title matching
        // defaults to true
        strict: false,

        // whether to enable reactions for the main post
        // defaults to true
        reactionsEnabled: true,

        // where to put the comment input box relative to the comments
        // defaults to 'bottom'
        inputPosition: "bottom",
      }

    }),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/chestNutLsj",
      // "Discord Community": "https://discord.gg/cRFFHYye7t",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [],
}
