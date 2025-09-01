// This function should be defined in the global scope
// so it can be called after the header is dynamically loaded.
function navSlide() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav-links');
    
    // Check if hamburger and nav exist before adding listeners
    if (hamburger && nav) {
        // Select only direct children 'li' to avoid animating dropdown items
        const navLinks = document.querySelectorAll('.nav-links > li');

        hamburger.addEventListener('click', () => {
            // Toggle Nav
            nav.classList.toggle('nav-active');

            // Animate Links
            navLinks.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });

            // Hamburger Animation
            hamburger.classList.toggle('toggle');
        });
    }
}

// Initial call for non-templated pages (or as a fallback)
navSlide();
