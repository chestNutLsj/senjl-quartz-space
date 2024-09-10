# <%= it.title %>

>[!info] 
>- **Authors**: <%= it.authors.map(author => ` ${author}`). join (', ')%>
>- **Date**: <%= it.date ?? it.year %>
>- **DOI**: <%= it.DOI %>
>- **Groups**: <%= it.collections %>
>- **Tags**: <%= it.tags.map(tag => '#' + tag.toString (). replaceAll (' ', '-')). join (', ')%>
>- **Links**：[Zotero](<%= it.backlink %>), <%= it.fileLink %>

## Abstract

<%= it.abstractNote %>

## Notes

<% it.notes.forEach(($it, i) => { %>
  <%= $it %>
<% }) %>

## Annotations

[Zotero](<%= it.backlink %>) <%= it.fileLink %>
<%~ include("annots", it.annotations) %>