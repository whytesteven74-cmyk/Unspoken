const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
    const fileStream = fs.createReadStream('node_modules/ai/dist/index.d.ts');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let valid = false;
    let count = 0;
    for await (const line of rl) {
        if (line.includes('interface StreamTextResult')) {
            valid = true;
        }
        if (valid) {
            count++;
            // Skip first 150 lines
            if (count > 150) {
                console.log(line);
            }
            if (count > 250) break;
        }
    }
}

processLineByLine();
