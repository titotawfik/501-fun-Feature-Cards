/**
 * 501 Entertainment – Feature Cards: Analytics
 *
 * Single responsibility: measure how long each stat card
 * stays in the user's viewport and push that to the dataLayer.
 */

(function () {
  'use strict';

  // Time (ms) a card must be visible before we start counting it as a view.
  // Filters out accidental scroll-throughs.
  var THRESHOLD_MS = 1000;

  // Track when each card entered the viewport
  var viewStartTimes = {};

  /**
   * Push a card_view_time event to the GTM dataLayer.
   *
   * @param {string} cardId   - value of data-card-id attribute
   * @param {number} seconds  - rounded seconds the card was in view
   */
  function pushViewTime(cardId, seconds) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event:      'card_view_time',
      card_id:    cardId,
      seconds_in_view: seconds
    });
  }

  /**
   * IntersectionObserver callback.
   * When a card enters the viewport → record start time.
   * When a card leaves the viewport → calculate duration and push.
   */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var cardId = entry.target.dataset.cardId;

      if (entry.isIntersecting) {
        // Card has entered the viewport – start the clock
        viewStartTimes[cardId] = Date.now();
      } else if (viewStartTimes[cardId]) {
        // Card has left the viewport – calculate and push
        var durationMs = Date.now() - viewStartTimes[cardId];
        var seconds    = Math.round(durationMs / 1000);

        // Only push if the card was visible for longer than our threshold
        if (durationMs >= THRESHOLD_MS) {
          pushViewTime(cardId, seconds);
        }

        delete viewStartTimes[cardId];
      }
    });
  }, {
    // Card must be at least 50% visible to count as "in view"
    threshold: 0.5
  });

  // Observe every card on the page
  document.querySelectorAll('[data-card-id]').forEach(function (card) {
    observer.observe(card);
  });

  // Flush any cards still in view when the user navigates away
  window.addEventListener('pagehide', function () {
    Object.keys(viewStartTimes).forEach(function (cardId) {
      var durationMs = Date.now() - viewStartTimes[cardId];
      var seconds    = Math.round(durationMs / 1000);
      if (durationMs >= THRESHOLD_MS) {
        pushViewTime(cardId, seconds);
      }
    });
  });

}());
