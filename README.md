# participa-core
Shared Library of Participa Spaces

The shared design system for participa.design and participa.studio.
This repository is not a website. Both sites load its files from:

    https://participa-studio.github.io/participa-core/core.css

## Structure

    core.css             the single file each site links to
    css/tokens.css       design decisions: colours, fonts, spacing
    css/base.css         page basics for every page
    css/components.css   reusable pieces (holding page, later header, hero, cases)

## How a site uses it

In each site's `index.html`, inside `<head>`, in this order:

    <link rel="stylesheet" href="https://participa-studio.github.io/participa-core/core.css">
    <link rel="stylesheet" href="/site.css">

`site.css` comes second, so a site can override any token for itself,
for example a different accent colour.

## Rule of thumb

- Shared by both sites → change it here.
- Specific to one site → change it in that site's `site.css`.

## Preview (test area)

New components are tried here first, never on the live sites:

    https://participa-studio.github.io/participa-core/preview/design.html
    https://participa-studio.github.io/participa-core/preview/studio.html

The preview pages are hidden from search engines (`noindex`).
Only when a component works here is it added to the live sites.
