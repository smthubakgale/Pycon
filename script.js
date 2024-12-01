// Get elements
const minimizeBtn = document.querySelector('.minimize-btn');
const expandBtn = document.querySelector('.expand-btn');
const sideNav = document.querySelector('.side-nav');
const topNav = document.querySelector('.top-nav');
const mainContent = document.querySelector('.main-content');
const sections = document.querySelectorAll('.section');

// Minimize/Expand side nav
minimizeBtn.addEventListener('click', () => {
    sideNav.classList.toggle('minimized');
    sideNav.classList.toggle('expanded');
});

expandBtn.addEventListener('click', () => {
    sideNav.classList.toggle('minimized');
    sideNav.classList.toggle('expanded');
});

// Active section
const setActiveSection = (sectionId) => {
    sections.forEach((section) => {
        section.classList.remove('active');
    });
    const activeSection = document.querySelector(`#${sectionId}`);
    activeSection.classList.add('active');
};

// Top nav links
topNav.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
        const sectionId = e.target.getAttribute('href').slice(1);
        setActiveSection(sectionId);
    }
});

// Side nav links
sideNav.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
        const sectionId = e.target.getAttribute('href').slice(1);
        setActiveSection(sectionId);
    }
});

// Initialize active section
setActiveSection('home');

// Scroll to section
const scrollToSection = (sectionId) => {
    const section = document.querySelector(`#${sectionId}`);
    section.scrollIntoView({ behavior: 'smooth' });
};

// Scroll to top
const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Add event listeners for scroll to top
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('scroll-to-top')) {
        scrollToTop();
    }
});

// Add event listeners for scroll to section
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('scroll-to-section')) {
        const sectionId = e.target.getAttribute('href').slice(1);
        scrollToSection(sectionId);
    }
});

// Toggle dark mode
const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
};

// Add event listener for dark mode toggle
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('dark-mode-toggle')) {
        toggleDarkMode();
    }
});

// Initialize dark mode
const initDarkMode = () => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
        toggleDarkMode();
    }
};

initDarkMode();

// Dropdown menu
const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector('.nav-link');
    const menu = dropdown.querySelector('.sub-nav');

    toggle.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });
});

// Tabbed content
const tabs = document.querySelectorAll('.tab');

tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        const tabContent = document.querySelector(`#${tabId}`);

        tabs.forEach((t) => {
            t.classList.remove('active');
        });

        tab.classList.add('active');

        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach((content) => {
            content.classList.remove('active');
        });

        tabContent.classList.add('active');
    });
});

// Modal window
const modals = document.querySelectorAll('.modal');

modals.forEach((modal) => {
    const toggle = modal.querySelector('.modal-toggle');
    const closeButton = modal.querySelector('.close-button');

    toggle.addEventListener('click', () => {
        modal.classList.toggle('hidden');
    });

    closeButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
});

// Accordion
const accordions = document.querySelectorAll('.accordion');

accordions.forEach((accordion) => {
    const toggle = accordion.querySelector('.accordion-toggle');
    const content = accordion.querySelector('.accordion-content');

    toggle.addEventListener('click', () => {
        content.classList.toggle('hidden');
    });
});

// Mobile navigation
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');

mobileNavToggle.addEventListener('click', () => {
    mobileNav.classList.toggle('hidden');
});
