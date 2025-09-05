const fs = require('fs');
const path = require('path');

const srcDir = '.'; // Your source files are in the root
const distDir = 'public'; // We'll build the final site into a 'public' folder

// Create the output directory if it doesn't exist
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Read the header and footer templates
const header = fs.readFileSync(path.join(srcDir, 'header.html'), 'utf-8');
const footer = fs.readFileSync(path.join(srcDir, 'footer.html'), 'utf-8');

// Find all HTML files in the source directory (excluding templates)
fs.readdirSync(srcDir)
    .filter(file => file.endsWith('.html') && file !== 'header.html' && file !== 'footer.html')
    .forEach(file => {
        const pagePath = path.join(srcDir, file);
        const pageContent = fs.readFileSync(pagePath, 'utf-8');
        
        // Replace placeholders in the page with the actual header and footer
        const finalHtml = pageContent
            .replace(/<header id="header-placeholder"><\/header>/, header)
            .replace(/<footer id="footer-placeholder"><\/footer>/, footer);

        // Write the final, complete HTML file to the output directory
        fs.writeFileSync(path.join(distDir, file), finalHtml);
        console.log(`Built: ${file}`);
    });

// Copy non-HTML assets (CSS, JS, images) to the output directory
['style.css', 'script.js', 'litchi_thumb.jpg', 'squash_thumb.jpg'].forEach(file => {
    fs.copyFileSync(path.join(srcDir, file), path.join(distDir, file));
    console.log(`Copied: ${file}`);
});

console.log('\nBuild complete!');