import { install, Browser, resolveBuildId, detectBrowserPlatform } from '@puppeteer/browsers';
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

const cacheDir = resolve('.cache');
if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
}

const platform = detectBrowserPlatform();
if (!platform) {
    console.error('No se pudo detectar la plataforma.');
    process.exit(1);
}

const toInstall = [
    { browser: Browser.CHROME, name: 'Chrome' },
    { browser: Browser.CHROMEHEADLESSSHELL, name: 'Chrome Headless Shell' },
];

let anySuccess = false;

for (const { browser, name } of toInstall) {
    try {
        const buildId = await resolveBuildId(browser, platform, 'latest');
        const result = await install({
            browser,
            cacheDir,
            platform,
            buildId,
            downloadProgressCallback: () => {},
        });
        console.log(`✅ ${name} descargado: ${result.path}`);
        anySuccess = true;
    } catch (e) {
        console.warn(`⚠️ ${name} no se pudo descargar: ${e.message}`);
    }
}

if (!anySuccess) {
    console.error('No se pudo descargar ningún navegador.');
    process.exit(1);
}
