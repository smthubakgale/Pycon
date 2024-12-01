// Get all navigation links
const navLinks = document.querySelectorAll('.nav-link');

// Get all sections
const sections = document.querySelectorAll('.section');

// Add event listener to navigation links
navLinks.forEach(link => {
  link.addEventListener('click', event => {
    // Prevent default link behavior
    event.preventDefault();

    // Get target section ID
    const targetId = link.getAttribute('href').slice(1);

    // Hide all sections
    sections.forEach(section => {
      section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(targetId);
    targetSection.classList.add('active');
  });
});

// Initialize first section as active
document.addEventListener('DOMContentLoaded', () => {
  const firstSection = document.querySelector('.section');
  firstSection.classList.add('active');
});

// Dropdown menu functionality
const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach(dropdown => {
  dropdown.addEventListener('mouseover', () => {
    const submenu = dropdown.querySelector('ul');
    submenu.style.display = 'block';
  });

  dropdown.addEventListener('mouseout', () => {
    const submenu = dropdown.querySelector('ul');
    submenu.style.display = 'none';
  });
});

// Scroll to section smoothly
navLinks.forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const targetId = link.getAttribute('href').slice(1);
    const targetSection = document.getElementById(targetId);
    targetSection.scrollIntoView({ behavior: 'smooth' });
  });
});
