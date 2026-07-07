/* Sri Umiya Timber — subtle motion: scroll reveal + hero parallax.
   Progressive enhancement: if this file fails or motion is reduced,
   content still shows normally (reveal classes are added here, not in HTML). */
(function () {
    "use strict";

    var reduceMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    /* 1. Scroll reveal — fade + rise as sections enter the viewport */
    var targets = document.querySelectorAll(
        ".story-container, .service-card, .stats-intro, .stat-item, " +
        ".door-section-container, .wood-species-intro, .wood-list-item, " +
        ".frames-col, .process-step, .cnc-works-container, " +
        ".find-us-container, .page-cta h2, .page-cta p"
    );

    if ("IntersectionObserver" in window && targets.length) {
        for (var i = 0; i < targets.length; i++) {
            targets[i].classList.add("reveal");
        }
        var observer = new IntersectionObserver(function (entries) {
            for (var e = 0; e < entries.length; e++) {
                if (entries[e].isIntersecting) {
                    entries[e].target.classList.add("is-visible");
                    observer.unobserve(entries[e].target);
                }
            }
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

        for (var j = 0; j < targets.length; j++) {
            observer.observe(targets[j]);
        }
    }

    /* 2. Subtle hero parallax — image drifts slower than the page scroll */
    var heroImgs = document.querySelectorAll(
        ".hero-img, .page-hero-bg-img, .cnc-hero-img"
    );
    if (heroImgs.length) {
        var ticking = false;
        var update = function () {
            var offset = window.pageYOffset * 0.18;
            for (var k = 0; k < heroImgs.length; k++) {
                heroImgs[k].style.transform =
                    "translate3d(0," + offset + "px,0) scale(1.08)";
            }
            ticking = false;
        };
        window.addEventListener("scroll", function () {
            if (!ticking) {
                window.requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
        update();
    }
})();
