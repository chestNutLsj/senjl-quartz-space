## how to escape the pipe character in a markdown table?
Reference: https://www.designcise.com/web/tutorial/how-to-escape-the-pipe-character-in-a-markdown-table

Let's suppose we have the following table of params and values in markdown where we want to use the "" (pipe) character inside a table cell: `|`

param    | value
---------|---------------------
`format` | `json`|`xml`|`html`

### escaping the Pipe Character

In some platforms you can directly escape the pipe character in markdown using a backslash `\` like so:

param    | value
---------|----------------------
`format` | `json`\|`xml`\|`html`

### Using the ASCII Code in Place of the Pipe Character

The pipe character is represented by (or ) in ASCII, which you can use in place of the pipe character like so: `&vert;` or  `&#124;`(do not foget the ";" char)

param    | value
---------|----------------------
`format` | `json`&vert;`xml`&vert;`html`

However, this won't work if the pipe character is used inside backticks. To demonstrate this, let's consider the following table of regular expressions as an example:

type         | regex pattern
-------------|----------------------------
`first_name` | `[a-zA-Z]`
`job_role`   | `manager|designer|internee`

To correctly render the pattern for "" we can replace the backticks with "" in the following way: `job_role``<code></code>`

type         | regex pattern
-------------|----------------------------
`first_name` | `[a-zA-Z]`
`job_role`   | <code>manager&vert;designer&vert;internee</code>

Although, it might look a little messy, it solves the problem. Before using this method though, be sure to try and see if the platform you're using markdown in supports [escaping the pipe character](https://www.designcise.com/web/tutorial/how-to-escape-the-pipe-character-in-a-markdown-table#escaping-the-pipe-character) or not (as that would be a better way).