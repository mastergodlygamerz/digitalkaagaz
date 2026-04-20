// Central config for Digital Kaagaz / Acadify
// Keep refactor incremental and beginner-friendly. Avoid over-engineering.
window.AppConfig = {
  // USER FLOW CONFIG
  userFlow: {
    acadifyFlow: {
      usePopupAuth: true,
      redirectAfterLogin: "acadify.html",
      redirectAfterSignup: "acadify.html"
    },
    welcomeFlow: {
      usePopupAuth: true,
      redirectAfterLogin: "index.html",
      redirectAfterSignup: "index.html"
    }
  },

  // NAVIGATION CONFIG
  navigation: {
    // top-level nav groups
    primary: [
      { name: "Home", path: "index.html", enabled: true },
      { name: "Products", enabled: true, children: [
        { name: "Acadify", path: "acadify-entry.html", enabled: true }
      ] },
      { name: "News", path: "#news", enabled: true },
      { name: "Contact", path: "#contact", enabled: true }
    ]
  },

  // CONTENT CONFIG
  content: {
    acadifyHero: {
      title: "Acadify — Smart Management for Modern Coaching Institutes",
      subtitle: "Manage classes, students, and teachers in one place.",
      showCTA: true,
      ctaText: "Get Started"
    },
    welcome: {
      title: "Digital Kaagaz — Learn & Grow",
      heroHtml: "<strong>Affordable coaching for everyone</strong>"
    }
  },

  // FEATURE FLAGS
  features: {
    chat: true,
    calendar: true,
    events: true,
    instituteRegistration: true,
    popupAuth: true
  }
};
