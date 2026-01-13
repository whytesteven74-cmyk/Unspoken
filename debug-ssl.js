
const tls = require('tls');
const https = require('https');

const HOST = 'hermes.ai.unturf.com';
const PORTS = [443];

function testTls(port, options = {}) {
    return new Promise((resolve, reject) => {
        console.log(`\nTesting connection to ${HOST}:${port} with options:`, options);
        const socket = tls.connect(port, HOST, {
            rejectUnauthorized: false,
            servername: HOST, // strict SNI might be required
            ...options
        }, () => {
            console.log('  [OK] Connected!');
            console.log('  Protocol:', socket.getProtocol());
            console.log('  Cipher:', socket.getCipher());
            socket.end();
            resolve(true);
        });

        socket.on('error', (err) => {
            console.error('  [ERR] Connection failed:', err.message);
            resolve(false);
        });
    });
}

async function runDiagnostics() {
    console.log(`Node Version: ${process.version}`);
    console.log(`OpenSSL Version: ${process.versions.openssl}`);

    // Test 1: Standard Connection
    await testTls(443);

    // Test 2: Force TLS 1.2
    await testTls(443, { minVersion: 'TLSv1.2', maxVersion: 'TLSv1.2' });

    // Test 3: Force TLS 1.3
    await testTls(443, { minVersion: 'TLSv1.3', maxVersion: 'TLSv1.3' });

    // Test 4: No Servername (old clients sometimes omit this, though rare now)
    await testTls(443, { servername: undefined });
}

runDiagnostics();
