document.addEventListener('DOMContentLoaded', async () => {
  const lang = document.documentElement.lang || 'en';
  const container = document.getElementById('feature-cards-container');
  const seoSchemaScript = document.getElementById('seo-schema');

  try {
    // 1. Fetch the JSON data based on the language
    const response = await fetch(`data/languages/${lang}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // 2. Generate and inject SEO schema
    const seoSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "501 Entertainment Milestones",
      "numberOfItems": data.length,
      "itemListElement": data.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": `${item.title} ${item.stat} ${item.description}`
      }))
    };
    if (seoSchemaScript) {
      seoSchemaScript.textContent = JSON.stringify(seoSchema, null, 2);
    }

    // 3. Render Cards
    if (container) {
      for (const item of data) {
        // Create the card element
        // CMS integration note:
          // Each .feature-card is a self-contained block. To integrate with
          // a CMS (HubSpot, WordPress, Contentful, etc.) treat each card
          // as a repeatable component/module. The only editable fields are:
          //   • .feature-card__eyebrow  — pre-stat label    (e.g. "More than")
          //   • .feature-card__stat     — the headline figure (e.g. "6,000,000")
          //   • .feature-card__desc     — supporting label   (e.g. "delighted guests")
          //   • .feature-card theme modifier — controls colour  (--green | --magenta | --cyan)
          //   • data-card-id            — unique ID used for analytics tracking
        const card = document.createElement('div');
        card.className = `feature-card feature-card--${item.theme}`;
        card.setAttribute('data-card-id', item.id);
        card.setAttribute('tabindex', '0');

        // Build the HTML structure. We set the initial stat to 0 for the counter animation.
        card.innerHTML = `
          <span class="feature-card__eyebrow">${item.title}</span>
          <strong class="feature-card__stat" data-target="${item.stat}">0</strong>
          <span class="feature-card__desc">${item.description}</span>
          <div class="feature-card__graphic" aria-hidden="true"></div>
        `;

        // Fetch and inject the SVG to preserve currentColor styling
        try {
          const svgResponse = await fetch(item.svgUrl);
          if (svgResponse.ok) {
            const svgContent = await svgResponse.text();
            card.querySelector('.feature-card__graphic').innerHTML = svgContent;
          } else {
            console.warn(`Failed to load SVG: ${item.svgUrl}`);
          }
        } catch (err) {
          console.error(`Error fetching SVG for ${item.id}`, err);
        }

        container.appendChild(card);
      }

      // 4. Initialize Counter Animation
      initCounterAnimation();
    }

  } catch (error) {
    console.error('Failed to initialize feature cards:', error);
  }
});

/**
 * Initializes an IntersectionObserver to trigger the counter animation
 * when the statistics become visible on the screen.
 */
function initCounterAnimation() {
  const statsElements = document.querySelectorAll('.feature-card__stat');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1 // Trigger when 10% of the element is visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateValue(entry.target);
        observer.unobserve(entry.target); // Only animate once per element
      }
    });
  }, observerOptions);

  statsElements.forEach(el => observer.observe(el));
}

/**
 * Animates a number from 0 to its target value.
 * @param {HTMLElement} obj - The DOM element containing the number.
 */
function animateValue(obj) {
  const targetStr = obj.getAttribute('data-target');
  if (!targetStr) return;

  // Parse the target number, removing commas
  const targetNumber = parseInt(targetStr.replace(/,/g, ''), 10);
  if (isNaN(targetNumber)) {
    obj.innerHTML = targetStr; // Fallback if it's not a valid number
    return;
  }
  
  let startTimestamp = null;
  const duration = 2000; // Animation duration in milliseconds

  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    // Ease-out quadratic function for a smoother finish
    const easeProgress = progress * (2 - progress);
    
    const currentNumber = Math.floor(easeProgress * targetNumber);
    // Format back with commas
    obj.innerHTML = currentNumber.toLocaleString('en-UK');

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      // Ensure the final value perfectly matches the target at the end
      obj.innerHTML = targetNumber.toLocaleString('en-UK'); 
    }
  };
  
  window.requestAnimationFrame(step);
}
