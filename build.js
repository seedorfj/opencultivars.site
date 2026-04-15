const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const srcDir = '.'; // Your source files are in the root
const distDir = 'public'; // We'll build the final site into a 'public' folder

// Image optimization configuration
const imageConfig = {
    // Thumbnails display at 300x200, so 600px wide gives 2x retina quality
    thumbnails: {
        width: 600,
        quality: 80,
        files: ['squash_thumb.jpg', 'litchi_thumb.jpg', 'purple_tomato_thumb.png']
    },
    // Headshot is displayed larger, 500px wide is plenty
    headshots: {
        width: 500,
        quality: 80,
        files: ['images/founder_headshot.png']
    }
};

async function build() {
    // Clean and recreate the output directory for a fresh build
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true });
    }
    fs.mkdirSync(distDir);

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

    // Copy non-image assets to the output directory
    ['style.css', 'script.js', 'robots.txt', 'sitemap.xml', 'favicon.svg', 'logo.svg'].forEach(file => {
        fs.copyFileSync(path.join(srcDir, file), path.join(distDir, file));
        console.log(`Copied: ${file}`);
    });

    // Ensure output images directory exists
    const imgDistDir = path.join(distDir, 'images');
    if (!fs.existsSync(imgDistDir)) {
        fs.mkdirSync(imgDistDir, { recursive: true });
    }

    // Optimize images: convert to WebP with resizing
    console.log('\nOptimizing images...');

    for (const [category, config] of Object.entries(imageConfig)) {
        for (const srcFile of config.files) {
            const srcPath = path.join(srcDir, srcFile);
            if (!fs.existsSync(srcPath)) {
                console.warn(`  Warning: ${srcFile} not found, skipping.`);
                continue;
            }

            // Change extension to .webp
            const destFile = srcFile.replace(/\.(png|jpg|jpeg)$/i, '.webp');
            const destPath = path.join(distDir, destFile);

            // Ensure destination subdirectory exists
            const destSubDir = path.dirname(destPath);
            if (!fs.existsSync(destSubDir)) {
                fs.mkdirSync(destSubDir, { recursive: true });
            }

            const originalSize = fs.statSync(srcPath).size;

            await sharp(srcPath)
                .resize({ width: config.width, withoutEnlargement: true })
                .webp({ quality: config.quality })
                .toFile(destPath);

            const optimizedSize = fs.statSync(destPath).size;
            const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
            console.log(`  ${srcFile} → ${destFile}  (${formatBytes(originalSize)} → ${formatBytes(optimizedSize)}, -${savings}%)`);
        }
    }

    // Copy publications directory
    const pubSrc = path.join(srcDir, 'publications');
    if (fs.existsSync(pubSrc)) {
        copyDirSync(pubSrc, path.join(distDir, 'publications'));
        console.log('\nCopied: publications/');
    }

    console.log('\nBuild complete!');
}

// Recursively copy a directory
function copyDirSync(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(entry => {
        const srcPath = path.join(src, entry);
        const destPath = path.join(dest, entry);
        if (fs.statSync(srcPath).isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

// Format bytes to a human-readable string
function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Run the build
build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});