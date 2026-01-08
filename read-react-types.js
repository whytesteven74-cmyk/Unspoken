const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
    const fileStream = fs.createReadStream('node_modules/@ai-sdk/react/dist/index.d.ts');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let valid = false;
    let count = 0;
    for await (const line of rl) {
        if (line.includes('function useChat')) {
            valid = true;
        }
        if (valid) {
            console.log(line);
            count++;
            if (count > 50) break;
        }
    }
}

processLineByLine();
