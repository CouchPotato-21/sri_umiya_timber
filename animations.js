/* Sri Umiya Timber — cinematic scroll motion.
   Progressive enhancement + no-flash: reveal attributes are added here (not in
   HTML), and anything already in view on load is shown immediately so it never
   flickers. Everything is skipped entirely under prefers-reduced-motion. */
(function () {
    "use strict";

    var reduceMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    var hasIO = "IntersectionObserver" in window;

    /* ---- 1. Assign reveal variants ---------------------------------- */
    function tag(selector, variant) {
        var els = document.querySelectorAll(selector);
        for (var i = 0; i < els.length; i++) {
            if (!els[i].hasAttribute("data-reveal")) {
                els[i].setAttribute("data-reveal", variant);
            }
        }
    }

    // Single elements
    tag(".story-text", "left");
    tag(".story-image", "mask");
    tag(".services-tag", "up");
    tag(".services-heading", "up");
    tag(".wood-species-intro", "up");
    tag(".stats-intro", "left");
    tag(".find-us-text", "left");
    tag(".find-us-map", "right");
    tag(".page-cta h2", "up");
    tag(".page-cta p", "up");
    tag(".door-section-text", "up");
    tag(".door-section-images", "mask");
    tag(".frames-col-text", "up");
    tag(".frames-col-img", "mask");

    // Staggered groups: reveal children one after another
    var groups = [
        [".services-grid", ".service-card"],
        [".stats-grid", ".stat-item"],
        [".wood-list", ".wood-list-item"],
        [".process-grid", ".process-step"]
    ];
    for (var g = 0; g < groups.length; g++) {
        var parents = document.querySelectorAll(groups[g][0]);
        for (var p = 0; p < parents.length; p++) {
            var kids = parents[p].querySelectorAll(groups[g][1]);
            for (var k = 0; k < kids.length; k++) {
                if (!kids[k].hasAttribute("data-reveal")) {
                    kids[k].setAttribute("data-reveal", "up");
                }
                kids[k].style.transitionDelay = (k * 0.09) + "s";
            }
        }
    }

    /* ---- 2. Reveal on scroll (no flash for in-view elements) --------- */
    var revealEls = document.querySelectorAll("[data-reveal]");
    var io = hasIO ? new IntersectionObserver(function (entries) {
        for (var e = 0; e < entries.length; e++) {
            if (entries[e].isIntersecting) {
                entries[e].target.classList.add("is-visible");
                io.unobserve(entries[e].target);
            }
        }
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }) : null;

    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var r = 0; r < revealEls.length; r++) {
        var rect = revealEls[r].getBoundingClientRect();
        // Already visible (or above) on load → show now, synchronously, no flicker
        if (rect.top < vh * 0.9 || !io) {
            revealEls[r].classList.add("is-visible");
        } else {
            io.observe(revealEls[r]);
        }
    }

    /* ---- 3. Count-up stat numbers ----------------------------------- */
    function countUp(el) {
        var raw = el.getAttribute("data-count");
        if (raw === null) {
            raw = el.textContent.trim();
            el.setAttribute("data-count", raw);
        }
        var m = raw.match(/^(\D*)([\d,]+)(.*)$/);
        if (!m) return;
        var pre = m[1], numStr = m[2], suf = m[3];
        var target = parseInt(numStr.replace(/,/g, ""), 10);
        if (isNaN(target)) return;
        var hasComma = numStr.indexOf(",") > -1;
        var dur = 1600, startTs = null;
        function fmt(n) { return hasComma ? n.toLocaleString("en-IN") : String(n); }
        function step(ts) {
            if (!startTs) startTs = ts;
            var prog = Math.min((ts - startTs) / dur, 1);
            var eased = 1 - Math.pow(1 - prog, 3);
            el.textContent = pre + fmt(Math.round(target * eased)) + suf;
            if (prog < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = pre + fmt(target) + suf;
            }
        }
        requestAnimationFrame(step);
    }

    var nums = document.querySelectorAll(".stat-number");
    if (nums.length && hasIO) {
        var io2 = new IntersectionObserver(function (entries) {
            for (var e = 0; e < entries.length; e++) {
                if (entries[e].isIntersecting) {
                    countUp(entries[e].target);
                    io2.unobserve(entries[e].target);
                }
            }
        }, { threshold: 0.6 });
        for (var n = 0; n < nums.length; n++) io2.observe(nums[n]);
    }

    /* ---- 4. Parallax: hero drift + CTA background drift -------------- */
    var heroImgs = document.querySelectorAll(
        ".hero-img, .page-hero-bg-img, .cnc-hero-img"
    );
    var ctas = document.querySelectorAll(".page-cta");
    var ticking = false;

    function onScroll() {
        var y = window.pageYOffset || document.documentElement.scrollTop;
        for (var i = 0; i < heroImgs.length; i++) {
            heroImgs[i].style.transform = "translate3d(0," + (y * 0.18) + "px,0)";
        }
        var winH = window.innerHeight;
        for (var c = 0; c < ctas.length; c++) {
            var rect = ctas[c].getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > winH) continue;
            var frac = ((rect.top + rect.height / 2) - winH / 2) / winH;
            ctas[c].style.backgroundPositionY = (50 + frac * 14) + "%";
        }
        ticking = false;
    }

    if (heroImgs.length || ctas.length) {
        window.addEventListener("scroll", function () {
            if (!ticking) {
                window.requestAnimationFrame(onScroll);
                ticking = true;
            }
        }, { passive: true });
        onScroll();
    }
})();
