# Astra — website

Static site. No build step, no dependencies. Open `index.html` in a browser and
it runs.

```
index.html          the home page
css/
  tokens.css        colour, type, spacing — change the brand here
  base.css          reset, typography, buttons, form fields
  layout.css        nav, section shells, footer
  home.css          hero, process, "what we're not", contact, newsletter
js/
  main.js           email + newsletter links, nav behaviour, contact form
fonts/              Cortese Light and Heiti SC Light, subset to Latin
img/                photography
```

## The three things to set before launch

All three live at the top of `js/main.js`, in the `SITE` object.

| Key | What it does |
|---|---|
| `email` | The address shown on the page and used by the form. Currently `info@drink-astra.com`. |
| `substack` | Newsletter archive. Currently the Drink Astra section of The Secret Ingredient. |
| `formEndpoint` | Leave empty and the form opens the visitor's mail app. Paste a [Formspree](https://formspree.io) endpoint and messages arrive in an inbox instead. |
| `instagram` | Leave empty and the footer link disappears on its own. |

## The launch-list popup

Lives in `css/popup.css` and `js/popup.js`. It stays hidden until you give it
somewhere to send addresses, so the site never shows a form that goes nowhere.

Set `endpoint` at the top of `js/popup.js` and it switches on. Pick one:

A static site cannot store addresses on its own, so the list lives in
[Kit](https://kit.com) — free to 10,000 subscribers. It is already connected:

```js
endpoint:  "https://app.kit.com/forms/9998092/subscriptions",
fieldName: "email_address",
```

Subscribers appear under **Grow → Subscribers** in Kit. To point at a
different form, swap the seven-digit id for the one in that form's
Embed → HTML snippet.

**That id is not a secret.** Every form endpoint is public by design — it has
to be, since the browser calls it. It accepts signups and nothing else: it
cannot read the list, export addresses, or change the account. Hiding it would
only break the form. Kit's **API key** is the thing that must never appear
here; it lives in Kit's own settings and this site never needs it.

**Double opt-in is off**, so signing up in the popup is the whole step. The
setting lives in Kit → the form → Settings → Confirmation Email → "Send
confirmation email". If you ever switch it back on, reword the confirmation
message in `index.html`, since people will then need to click a link in their
inbox before they are really on the list.

**[Formspree](https://formspree.io)** is the fallback if Kit ever gets in the
way — 50 submissions a month, `fieldName: "email"`. Addresses arrive as emails
rather than a list, so they have to be moved by hand later.

**Buttondown will not work here.** Its embed endpoint has to be posted to as a
real form so the subscriber can clear a CAPTCHA, which means a page navigation
away from the site.

Three other settings in the same block:

- `delaySeconds` — how long before it appears. It also triggers earlier if the
  visitor scrolls a third of the way down or moves to leave the tab.
- `snoozeDays` — how long someone who closed it goes before seeing it again.
  Someone who signed up never sees it again.
- `fieldName` — what the service calls the email field. Most use `email`.

Closing and signing up are both remembered in the visitor's own browser.
Nothing is stored by the site.

## Publishing on GitHub Pages

1. Create a public repository.
2. Upload every file and folder here, keeping the structure intact.
3. Settings → Pages → Source: "Deploy from a branch", `main`, `/ (root)`.
4. The link appears in that panel a minute later.

Later, point a custom domain at it under the same Pages settings.

## Swapping the hero for video

The hero currently cross-fades three stills on a slow drift. When the montage
is ready:

1. Make a `video/` folder with `hero.mp4` and `hero-poster.jpg`.
2. In `index.html`, replace the `.hero__stills` block with the `<video>` snippet
   in the comment directly above it.
3. Delete the `.hero__stills` rules from `css/home.css`.

Export around 1600px wide, 20–30 seconds, no audio, under about 5MB. GitHub
rejects files over 100MB and gets slow well before that.

## Changing the look

Almost everything is in `css/tokens.css`. The colours were sampled from the
photography rather than picked in the abstract:

| Token | Where it came from |
|---|---|
| `--ink` | the shadow of the dark leaf frame |
| `--field` | the mid-green of the same frame |
| `--paper` | the backdrop behind the bottle and the glass |
| `--nasturtium` | the orange flower in the farm beds |

Type scale, gutters and section rhythm are tokens too, so changing `--band`
re-spaces the whole page at once.

## Fonts — check before the site is public

Both faces are embedded as subset `.woff2` files, which is what makes them
load fast. Both also need a licence check first:

- **Cortese** was supplied as a trial file. Trial licences normally cover
  comps only, not a live website. A web licence is needed from the foundry.
- **Heiti SC** is an Apple system font. Redistributing it from a web server is
  generally not permitted.

If either licence does not work out, the fallbacks in `--display` and `--body`
already catch the site, and close free substitutes exist. Nothing else in the
CSS has to change.

## Not built yet

From the original outline: individual flavour pages, cart and checkout,
the stockist map, the "poured at" logo belt, and press quotes. Those want a
store behind them — Shopify handles the commerce half far better than a static
site can.
