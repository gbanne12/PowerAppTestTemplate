import * as fs from 'fs';
import * as path from 'path';


export interface PowerPlatformConfig {
    username: string;
    password: string;
    secret?: string;
    appId: string;
    copilotEnabled?: boolean;
}

// Load credentials from config.json if it exists, otherwise load from environment variables.
function defineConfig(): PowerPlatformConfig {
    const configPath = path.resolve(process.cwd(), 'config.json');

    let config: PowerPlatformConfig;
    if (fs.existsSync(configPath)) {
        console.log('Loading credentials from config.json');
        const configFile = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(configFile);
    } else {
        console.log('Loading credentials from environment variables');
        config = {
            username: process.env.USERNAME || '',
            password: process.env.PASSWORD || '',
            secret: process.env.SECRET || '',
            appId: process.env.APP_ID || '',
            copilotEnabled: process.env.COPILOT_ENABLED === 'false',
        };
    }
    return config;
}

export default defineConfig();