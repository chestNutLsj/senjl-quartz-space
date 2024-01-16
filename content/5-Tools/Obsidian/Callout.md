Reference documentation: [Use callouts](https://help.obsidian.md/How+to/Use+callouts)。

## Intro
As of v0.14.0, Obsidian supports callout blocks, sometimes called "admonitions". Callout blocks are written as a blockquote, inspired by the "alert" syntax from Microsoft Docs.

## How to use?
Use the following syntax to denote a callout block: `> [!INFO]`.

```
> [!INFO]
> Here is a callout block.
> It supports **Markdown**, [[Internel link|Wikilinks]], and [[Embed files|embeds]]!
> Use ![[image.png]] to insert images.
```

Such callout block above seems like: 
> [!INFO]
> Here is a callout block.
> It supports **Markdown**, [[Internel link|Wikilinks]], and [[Embed files|embeds]]!
> Use ![[ball.png]] to insert images.

> [!Warning]
> For compatibility reasons, if you're also using the Admonitions plugin, you should update it to at least v8.0.0 to avoid problems with the new callout system.

## Types
By default, Obsidian supports several callout types and aliases. Each type comes with a different background color and icon.

To use these default styles, replace `INFO` in the examples with any of these types. Any unrecognized type will default to the "note" type, unless they are [[Callout#Customize|customized]]. The type identifier is case insensitive (大小写不敏感).

### Note
> [!note]
> In me the tiger sniffs the rose.

*****
### Abstract/summary/tldr
> [!abstract]
> In me the tiger sniffs the rose.

Aliases: `summary`, `tldr`

> [!summary]
> In me the tiger sniffs the rose.

> [!tldr]
> In me the tiger sniffs the rose.

*****
### Info
> [!info]
> In me the tiger sniffs the rose.

*****
### Todo
> [!todo]
> In me the tiger sniffs the rose.

*****
### Tip/hint/important
> [!tip]
> In me the tiger sniffs the rose.

Aliases: `hint`, `important`

*****
### Success/check/done
> [!success]
> In me the tiger sniffs the rose.

Aliases: `check`, `done`

******
### Question/help/faq
> [!question]
> In me the tiger sniffs the rose.

Aliases: `help`, `faq`

*****
### Warning/caution/attention
> [!warning]
> In me the tiger sniffs the rose.

Aliases: `caution`, `attention`

*****
### Failure/fail/missing
> [!failure]
> In me the tiger sniffs the rose.

Aliases: `fail`, `missing`

*****
### Danger/error
> [!danger]
> In me the tiger sniffs the rose.

Aliases: `error`

*****
### Bug
> [!bug]
> In me the tiger sniffs the rose.

*****
### Example
> [!example]
> In me the tiger sniffs the rose.

*****
### Quote
> [!quote]
> In me the tiger sniffs the rose.

## Title custom and empty-body-supported
You can define the title of the callout block, and you can also have a callout without body content.
```
> [!tip] Callouts can have custome titles, which also support ==markdown==!
```

> [!tip] Callouts can have custome titles, which also support ==markdown==!

## Folding
Additionally, you can create a folding callout by adding `+` (default expanded) or `-` (default collapsed) after the block.
```
> [!FAQ]- Are callouts foldable?
> Yes! In a foldable callout, the contents are hidden until it is expanded.
```

> [!FAQ]- Are callouts foldable?
> Yes! In a foldable callout, the contents are hidden until it is expanded.

## Nesting
It is also support nesting callouts multiple layers deep.
```
> [!question] Can callouts be nested?
> > [!todo] Yes! They can .
> > > [!example] You can even use multiple layers of nesting.
```

> [!question] Can callouts be nested?
> > [!todo] Yes! They can .
> > > [!example] You can even use multiple layers of nesting.

## Customize
Snippets and plugins can define custom callouts, too, or overwrite the default options. Callout types and icons are defined in CSS, where the color is an `r, g, b` tuple and the icon is the icon ID from any internally supported icon (like `lucide-info`). Alternatively, you can specify an SVG icon as a string.

```css
.callout[data-callout="my-callout-type"] {
    --callout-color: 0, 0, 0;
    --callout-icon: icon-id;
    --callout-icon: '<svg>...custom svg...</svg>';
}
```