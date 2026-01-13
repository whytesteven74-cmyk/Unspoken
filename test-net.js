
const tls = require('tls');

function test(host) {
    const socket = tls.connect(443, host, { servername: host, rejectUnauthorized: false }, () => {
        console.log(`Successfully connected to ${host}`);
        socket.end();
    });
    socket.on('error', err => console.error(`Failed to connect to ${host}:`, err.message));
}

console.log("Testing generic internet access...");
test('google.com');

console.log("Testing specific target...");
test('hermes.ai.unturf.com');
