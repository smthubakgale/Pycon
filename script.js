// Get elements
const topNav = document.querySelector('.top-nav');
const sideNav = document.querySelector('.side-nav');
const mainContent = document.querySelector('.main-content');
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');
const subNavTriggers = document.querySelectorAll('.dropdown');
const subNavs = document.querySelectorAll('.sub-nav');
const modals = document.querySelectorAll('.modal');
const accordionTriggers = document.querySelectorAll('.accordion');
const alertCloseButtons = document.querySelectorAll('.alert .close-button');

// Add event listeners
navLinks.forEach(link => link.addEventListener('click', handleNavLinkClick));
subNavTriggers.forEach(trigger => trigger.addEventListener('mouseover', handleSubNavTrigger));
subNavTriggers.forEach(trigger => trigger.addEventListener('mouseout', handleSubNavTrigger));
mobileNavToggle.addEventListener('click', handleMobileNavToggle);
accordionTriggers.forEach(trigger => trigger.addEventListener('click', handleAccordionTrigger));
alertCloseButtons.forEach(button => button.addEventListener('click', handleAlertClose));

// Functions
function handleNavLinkClick(event) {
    event.preventDefault();
    const targetSection = document.querySelector(`#${event.target.getAttribute('href').substring(1)}`);
    sections.forEach(section => section.classList.remove('active'));
    targetSection.classList.add('active');
}

function handleSubNavTrigger(event) {
    const subNav = event.target.querySelector('.sub-nav');
    if (event.type === 'mouseover') {
        subNav.style.display = 'block';
    } else {
        subNav.style.display = 'none';
    }
}

function handleMobileNavToggle() {
    mobileNav.classList.toggle('active');
}

function handleAccordionTrigger(event) {
    const accordionContent = event.target.nextElementSibling;
    accordionContent.classList.toggle('show');
}

function handleAlertClose() {
    const alert = event.target.parentElement;
    alert.remove();
}

function init() {
    // Initialize modals
    modals.forEach(modal => {
        const closeButton = modal.querySelector('.close-button');
        closeButton.addEventListener('click', () => modal.style.display = 'none');
    });

    // Initialize tooltips
    const tooltips = document.querySelectorAll('.tooltip');
    tooltips.forEach(tooltip => {
        const trigger = tooltip.querySelector('.tooltip-trigger');
        trigger.addEventListener('mouseover', () => tooltip.classList.add('show'));
        trigger.addEventListener('mouseout', () => tooltip.classList.remove('show'));
    });
}

// Initialize
init();

// Add event listener for window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        mobileNav.classList.remove('active');
    }
});

// Mobile navigation
document.addEventListener('click', event => {
    if (event.target.classList.contains('mobile-nav-link')) {
        mobileNav.classList.remove('active');
    }
});

// Scroll to top
const scrollToTopButton = document.querySelector('.scroll-to-top');
scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Dark mode toggle
const darkModeToggle = document.querySelector('.dark-mode-toggle');
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Search functionality
const searchInput = document.querySelector('.search-input');
const searchResults = document.querySelector('.search-results');
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const searchResultsList = searchResults.querySelector('ul');
    searchResultsList.innerHTML = '';
    sections.forEach(section => {
        const sectionTitle = section.querySelector('h1').textContent.toLowerCase();
        if (sectionTitle.includes(searchTerm)) {
            const searchResult = document.createElement('li');
            searchResult.innerHTML = `<a href="#${section.id}">${sectionTitle}</a>`;
            searchResultsList.appendChild(searchResult);
        }
    });
});
