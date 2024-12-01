// Get elements
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const aside = document.querySelector('.aside');
const overlay = document.querySelector('.overlay');
const scrollTOTopButton = document.querySelector('.scroll-to-top');
const darkModeToggle = document.querySelector('.dark-mode-toggle');
const searchInput = document.querySelector('.search-input');
const searchResults = document.querySelector('.search-results');

// Add event listeners
mobileNavToggle.addEventListener('click', () => {
    aside.classList.toggle('active');
    overlay.classList.toggle('active');
});

overlay.addEventListener('click', () => {
    aside.classList.remove('active');
    overlay.classList.remove('active');
});

scrollTOTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const searchResultsList = searchResults.querySelector('ul');
    searchResultsList.innerHTML = '';
    const results = fetchSearchResults(searchTerm);
    results.forEach((result) => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = result.url;
        link.textContent = result.title;
        listItem.appendChild(link);
        searchResultsList.appendChild(listItem);
    });
    searchResults.classList.add('active');
});

// Functions
function fetchSearchResults(searchTerm) {
    // Implement your search logic here
    // For demonstration purposes, return some dummy results
    return [
        { url: '#result1', title: 'Result 1' },
        { url: '#result2', title: 'Result 2' },
        { url: '#result3', title: 'Result 3' },
    ];
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize scroll-to-top button visibility
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollTOTopButton.classList.add('visible');
        } else {
            scrollTOTopButton.classList.remove('visible');
        }
    });
});

 Dropdown menu toggling (not required with CSS-only dropdowns)
 const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
 dropdownToggles.forEach((toggle) => {
     toggle.addEventListener('click', () => {
         const dropdownMenu = toggle.nextElementSibling;
         dropdownMenu.classList.toggle('active');
     });
 });
