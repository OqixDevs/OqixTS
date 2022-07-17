import * as fs from 'fs';

class ConfigProperties {
    DefaultColor = '#0099ff';
}

export type ConfigKey = keyof ConfigProperties;

export class Config {
    private static _instance: Config;
    public Properties!: ConfigProperties;
    private configPath = './config.json';

    public static get Instance(): Config {
        if (!this._instance) {
            this._instance = new Config();
        }

        return this._instance;
    }

    constructor() {
        this.LoadConfig();
    }

    public SetProperty(property: ConfigKey, value: any) {
        this.Properties[property] = value;
        this.SaveConfig();
    }

    public GetProperty(property: ConfigKey) {
        return this.Properties[property];
    }

    private SaveConfig() {
        const configJson = JSON.stringify(this.Properties);
        fs.writeFileSync(this.configPath, configJson);
    }

    public LoadConfig() {
        if (fs.existsSync(this.configPath)) {
            const configFile = fs.readFileSync(this.configPath, 'utf-8');
            const configJson = JSON.parse(configFile);
            this.Properties = configJson as ConfigProperties;
        } else {
            fs.writeFileSync(
                this.configPath,
                JSON.stringify(new ConfigProperties())
            );
            console.log(`${this.configPath} does not exist, creating new file`);
            this.Properties = new ConfigProperties();
        }
    }
}
