# fonts/

The site uses three typefaces:

| Role | Typeface | How it loads |
|---|---|---|
| Display / headlines (`class="display"`) | **Cal Sans** | Self-hosted variable file preferred; Google Fonts fallback |
| Body / UI | **Inter** | Google Fonts (variable 100–900) |
| Serif italic ("RESHAPED" + the three card taglines) | **Lora** italic 700 | Google Fonts |

Inter and Lora come straight from Google Fonts (declared in `index.html`) —
nothing to copy.

## Cal Sans — optional self-hosting for exact fidelity

The studio's design system ships Cal Sans as a **variable** file (weight
axis 400–700). Google Fonts only serves Cal Sans as a single weight, so for
a pixel-exact match, drop the variable file in here:

```
fonts/CalSansVF.woff2
```

`css/style.css` declares `@font-face { font-family: 'Cal Sans Local'; … }`
pointing at that path, and the display stack is:

```
'Cal Sans Local'  →  'Cal Sans' (Google Fonts)  →  'Inter'  →  system-ui
```

So the cascade is automatic:

- **File present** → your exact variable Cal Sans is used.
- **File absent** → Google Fonts Cal Sans (same typeface, single weight) —
  the site still looks right, nothing to do.
- **Neither reachable** → Inter, then system sans.

Copy `CalSansVF.woff2` out of the original design system at
`_ds/…/fonts/CalSansVF.woff2`. If your source file is `.woff`/`.ttf`
instead of `.woff2`, either convert it or update the `src:` URL in
`css/style.css` to match.

> Note: if you were told the fonts are "Space Grotesk / Lora substitutes",
> that was the throwaway substitution from the prototyping environment. The
> real stack is Cal Sans / Inter / Lora, wired up above.
