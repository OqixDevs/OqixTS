import * as fs from 'fs';

export class ConfigProperties {
    DefaultColor = '#0099ff';
    SubjectChannelGroupIDs: Array<string> = [];
}

export type ConfigKey = keyof ConfigProperties;
export type ConfigValue =
    | string
    | string[]
    | number
    | number[]
    | boolean
    | boolean[];

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

    public SetProperty(property: ConfigKey, value: ConfigValue) {
        this.Properties[property] = value as never;
        this.SaveConfig();
    }

    public GetPropertySerialized(property: ConfigKey): string {
        const value = this.Properties[property];
        if (typeof value === 'object') {
            return JSON.stringify(this.Properties[property]);
        }
        return value.toString();
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
            this.Properties = new ConfigProperties();
        }
    }
}
