/*
 * @Author: Lee Sen.J
 * @Date: 2025-02-16 23:53:29
 * @LastEditors: Senj Lee lisj24@mails.tsinghua.edu.cn
 * @LastEditTime: 2025-03-09 00:23:25
 * @FilePath: \quartz\quartz.layout.ts
 * @Description: 
 * 
 */
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
        // from giscus config's data-repo
        repo: "chestNutLsj/senjl-quartz-space",
        // from giscus config's data-repo-id
        repoId: "R_kgDOK_jAvg",
        // from giscus config's data-category
        category: "Announcements",
        // from giscus config's data-category-id
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
      "RSS Feed": "https://chestNutLsj.github.io/senjl-quartz-space/index.xml",
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
    Component.RecentNotes({
      title: "Recent writing",
      limit: 3,
      showTags: false,
      // linkToMore: ""
    }),
    Component.Explorer(),
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
    Component.Explorer(),
  ],
  right: [
    Component.RecentNotes(),
  ],
}
