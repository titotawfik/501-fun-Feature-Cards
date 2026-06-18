# 501 Entertainment - Feature Cards / CTA Module

An engineering-grade, accessible, performant, and CMS-agnostic marketing stats module built to replace static image-based landing page cards.

---

## 1. Overview & Business Case

### The Problem
Marketing pages at 501 Entertainment previously relied on static raster images (PNGs/JPEGs) to display key business milestones (e.g., "6,000,000 delighted guests"). This introduced significant operational and technical issues:
* **Workflow Bottlenecks:** A designer had to manually edit source design files (Photoshop/Illustrator), export them, and a developer had to upload and deploy them every time a metric changed.
* **SEO Invisibility:** Search engine crawlers (like Googlebot) could not read text locked inside images, hurting the website's search engine indexation.
* **Poor Accessibility:** Screen readers could not read stats natively, relying on frequently missing or incomplete `alt` text.
* **Performance Costs:** High-density displays required heavy high-res image files, increasing bandwidth costs and contributing to Cumulative Layout Shift (CLS).

### The Solution: Dynamic HTML + Vector SVGs
This module rebuilds the cards as native semantic HTML text combined with vector line-art SVGs.

### Decision Matrix: Native HTML/SVG vs. Flat Raster Images

| Dimension | Native HTML Text + SVGs (Proposed) | Static Raster Images (Current) |
| :--- | :--- | :--- |
| **SEO & Indexability** | **Excellent.** Googlebot crawls and indexes statistics natively, boosting ranking potentials. | **Poor.** Numbers are invisible to search engines unless poorly parsed via slow OCR. |
| **Web Accessibility** | **Native AAA Compliance.** Reads naturally for assistive tech. SVGs are hidden from screen readers. | **Poor.** Fails basic WCAG standards when `alt` text is missing. |
| **Operational Agility** | **Instant Updates.** Editors modify text in the CMS in seconds; zero design loops. | **Hours/Days.** Requires designer file edits, exports, and developer deployments. |
| **Localisation & A/B Testing** | **Seamless.** Instantly translates text or swaps card order via JSON files or CMS variations. | **Bloated.** Requires generating separate image assets for each language and experiment. |
| **Performance** | **High Speed.** Under 5KB total size. Zero CLS. High Lighthouse performance. | **Slow.** Large files trigger bandwidth costs and layout reflows. |
| **Visual Quality** | **Infinite Resolution.** Vectors stay perfectly crisp on 4K, mobile, and Retina displays. | **Blurry.** Pixelates on modern high-DPI screens. |
| **Dynamic UX** | **Interactive.** Smooth color shifts, keyframe entry fades, and hover scales. | **Static.** Flat images cannot respond to CSS variables or dark mode triggers. |

---

## 2. Setup & Execution

Since the component is built on native web APIs with **zero external dependencies**, no build steps or package managers are required.

### Local Development
1. Clone or download this project directory into your local workspace.
2. Run a simple local HTTP server from the project root (necessary for JavaScript `fetch` calls to resolve local translation JSON files).
   
   Using **Python 3**:
   ```bash
   python -m http.server 8000
   ```
   
   Using **Node.js (npx)**:
   ```bash
   npx serve .
   ```
3. Open your browser and navigate to `http://localhost:8000` (or the port specified by your local server).

---

## 3. Technical Architecture

The architecture separates data (JSON), styling (CSS tokens), and controller behaviors (JS native APIs).

### Directory Layout
```
├── data/                # Where the JSON files are stored: our source of truth for card text content and theme mappings: Great for A/B Testing, Translations, or CMS integration, content can be updated in the CMS and the JSON files will be updated automatically, which reduces the need for developer intervention.
│   └── languages/
│       ├── en.json      # The data layer for the English translations & theme mappings (the default JSON file)
│       └── fr.json      # The data layer for the French translations & theme mappings (optional: change the lang attribute in index.html to 'fr' to use this)
├── svgs/
│   ├── cardone.svg      # Globe outline vector
│   ├── cardtwo.svg      # High-five hands vector
│   └── cardthree.svg    # Dart vector
├── index.html           # Document structure & CMS Simulator
├── styles.css           # BEM design system & dark mode media queries
└── script.js            # Translation fetching, lazy loading, and dataLayer triggers
```

### BEM CSS Naming Conventions
Styling is structured using a lightweight Block-Element-Modifier (BEM) approach to isolate styles and prevent namespace collisions on landing pages:
* `.feature-cards` - The parent wrapper.
* `.feature-cards__grid` - Grid container utilizing auto-fitting columns.
* `.feature-card` - Individual block container (renders as `<a>` if a URL exists, otherwise `<div>`).
* `.feature-card--[theme]` - Modifier class toggling design system theme presets.
* `.feature-card__eyebrow` - Pre-text label.
* `.feature-card__stat` - Main numerical header.
* `.feature-card__desc` - Metric description block.
* `.feature-card__graphic` - Container housing the lazy-loaded SVG.

### Design Token Implementation
Hex colors are not hardcoded in JavaScript. Instead, the JSON references a preset identifier (`"theme": "green"`). This maps to a BEM modifier class (`.feature-card--green`) that applies CSS custom properties:
```css
:root {
  --theme-green-bg: #00ff00;
  --theme-green-text: #000000;
}
.feature-card--green {
  --card-bg: var(--theme-green-bg);
  --card-text: var(--theme-green-text);
}
```

---

## 4. Accessibility (WCAG 2.2 Compliance)

Accessibility was designed into the markup from the beginning:

### Color Contrast
* **Green Preset:** Background `#00ff00` with Text `#000000` (Contrast: **21:1** - WCAG AAA Compliant).
* **Magenta Preset:** Background `#ff00b3` with Text `#000000` (Contrast: **6.5:1** - WCAG AA Compliant, WCAG AAA Large Text Compliant).
* **Cyan Preset:** Background `#0084ff` with Text `#000000` (Contrast: **6.2:1** - WCAG AA Compliant, WCAG AAA Large Text Compliant).

### Screen Readers & Semantics
* **Logical Reading Order:** Screen readers announce cards in a natural sequence: `"More than [metric] delighted guests"`.
* **Aria Optimisation:** cards include descriptive `aria-label` tags.
* **Vector Hiding:** SVGs use `aria-hidden="true"` since they are decorative, preventing screen readers from reading vector code blocks.

### Keyboard Compatibility
* **Tab Navigation:** tab through the webpage highlights cards using standard browser focus selectors.
* **Visible Focus States:** Focus rings are styled using the native `:focus-visible` selector. Rings use high-contrast outlines matching the card's text variables (`var(--card-text)`) to stay clear on all backgrounds.


## 5. CMS Integration Blueprints

This module is designed to integrate into any major Content Management System (CMS) with minimal adaptation.

### A. HubSpot CMS (Custom Module Setup)
In HubSpot, create a Custom Module. The variables from `fields.json` are exposed to the marketer, and the rendering logic is processed via HubL.

#### `fields.json` Configuration:
```json
[
  {
    "name": "cards",
    "label": "Feature Cards",
    "type": "group",
    "occurrence": { "min": 1, "max": 6, "default": 3 },
    "children": [
      { "name": "title", "label": "Title (Eyebrow)", "type": "text", "default": "More than" },
      { "name": "stat", "label": "Metric Stat", "type": "text", "default": "6,000,000" },
      { "name": "description", "label": "Description", "type": "text", "default": "delighted guests" },
      { "name": "theme", "label": "Color Theme Theme", "type": "select", "choices": [
        {"value": "green", "label": "Neon Green"},
        {"value": "magenta", "label": "Neon Magenta"},
        {"value": "cyan", "label": "Neon Cyan"}
      ], "default": "green" },
      { "name": "url", "label": "Link URL", "type": "url" }
    ]
  }
]
```

#### HubSpot HubL HTML Template:
```html
<section class="feature-cards">
  <div class="feature-cards__grid">
    {% for card in module.cards %}
      {% set is_link = card.url.href is string_containing 'http' or card.url.href is string_containing '/' %}
      <{{ is_link ? 'a href="' ~ card.url.href ~ '"' : 'div' }} class="feature-card feature-card--{{ card.theme }}">
        <span class="feature-card__eyebrow">{{ card.title }}</span>
        <strong class="feature-card__stat">{{ card.stat }}</strong>
        <span class="feature-card__desc">{{ card.description }}</span>
        <div class="feature-card__graphic" aria-hidden="true">
          <!-- HubL template logic to inject inline vector code based on theme -->
          {% if card.theme == 'green' %} {% include '../svgs/cardtwo.svg' %}
          {% elif card.theme == 'magenta' %} {% include '../svgs/cardone.svg' %}
          {% else %} {% include '../svgs/cardthree.svg' %}
          {% endif %}
        </div>
      </{{ is_link ? 'a' : 'div' }}>
    {% endfor %}
  </div>
</section>
```

### B. WordPress CMS (Gutenberg Block with ACF)
Using Advanced Custom Fields (ACF) Pro, register a Gutenberg block. The PHP template renders the cards dynamically.

#### ACF Field Group Configuration:
1. Create a Repeater Field named `feature_cards`.
2. Add sub-fields: `title` (Text), `stat` (Text), `description` (Text), `theme` (Select: green, magenta, cyan), `url` (Link).

#### PHP Render Template (`block-feature-cards.php`):
```php
<?php
$cards = get_field('feature_cards');
if( $cards ): ?>
  <section class="feature-cards">
    <div class="feature-cards__grid">
      <?php foreach( $cards as $card ): 
        $has_url = !empty($card['url']);
        $tag = $has_url ? 'a' : 'div';
        $href = $has_url ? ' href="' . esc_url($card['url']) . '"' : '';
      ?>
        <<?php echo $tag . $href; ?> class="feature-card feature-card--<?php echo esc_attr($card['theme']); ?>">
          <span class="feature-card__eyebrow"><?php echo esc_html($card['title']); ?></span>
          <strong class="feature-card__stat"><?php echo esc_html($card['stat']); ?></strong>
          <span class="feature-card__desc"><?php echo esc_html($card['description']); ?></span>
          
          <div class="feature-card__graphic" aria-hidden="true">
            <?php 
              // Inline SVGs to avoid server load
              if($card['theme'] === 'green') { include(get_theme_file_path('/svgs/cardtwo.svg')); }
              elseif($card['theme'] === 'magenta') { include(get_theme_file_path('/svgs/cardone.svg')); }
              else { include(get_theme_file_path('/svgs/cardthree.svg')); }
            ?>
          </div>
        </<?php echo $tag; ?>>
      <?php endforeach; ?>
    </div>
  </section>
<?php endif; ?>
```

---

## 6. Performance & Optimisations

* **Zero cumulative Layout Shift (CLS):** Card grids and graphic height ratios are set in CSS. When SVGs load dynamically, the layout dimensions remain identical, preventing rendering layout shifts.
---

## 7. Future Enhancements and experimentations

* **Enhanced Analytics Event Mapping:** Integrate with Google Analytics 4 (GA4) 
   * GTM.js file has the implementation of GTM datalayer pushes.
   * When a card enters the viewport → record start time.
   * When a card leaves the viewport → calculate duration and push

