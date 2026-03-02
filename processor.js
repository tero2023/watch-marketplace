const fs = require('fs');
const path = require('path');

const JimpRaw = require('jimp');
const Jimp = JimpRaw.default || JimpRaw.Jimp || JimpRaw;

async function processImage(transparentWatchPath, outputPath) {
    console.log(`Processing: ${path.basename(transparentWatchPath)}`);
    try {
        // Load the original Presage image to use as the EXACT background base
        const bg = await Jimp.read('./public/images/seiko.png');

        // Blur the background heavily. This melts the old watch into a perfect
        // studio light gradient made of the exact same colors and dimensions, 
        // without the old watch edges poking out from behind the new watch.
        bg.blur(40);

        // Load the transparent watch into Jimp
        const fg = await Jimp.read(transparentWatchPath);

        // Resize foreground watch so it occupies a huge portion of the frame (like the Presage does)
        fg.resize({ h: Math.floor(bg.bitmap.height * 0.85) });

        // Calculate center placement
        const x = (bg.bitmap.width - fg.bitmap.width) / 2;
        const y = (bg.bitmap.height - fg.bitmap.height) / 2;

        // Composite the new watch onto the Presage's blurred background
        bg.composite(fg, x, y);

        // Save as High Quality PNG
        await bg.write(outputPath);

        console.log(`Success: saved to ${outputPath}`);
    } catch (e) {
        console.error(`Error processing:`, e.message);
    }
}

async function main() {
    await processImage(
        'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\dfeb8373-1938-490a-874d-b7dfcbcb58be\\media__1772392311880.png',
        './public/images/seiko_prospex_bg.png'
    );
    await processImage(
        'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\dfeb8373-1938-490a-874d-b7dfcbcb58be\\media__1772392311953.png',
        './public/images/seiko_stealth_bg.png'
    );
    console.log("All done.");
}

main();
