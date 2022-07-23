import { existsSync, renameSync } from 'fs';
import { Config, ConfigKey, ConfigProperties } from '../src/utils';

describe('Tests for config', () => {
    let configProps: ConfigProperties;
    let keys: ConfigKey[];
    const backupConfigName = './config.backup.json';

    beforeAll(() => {
        configProps = new ConfigProperties();
        keys = Object.keys(Config.Instance.Properties) as ConfigKey[];
        if (existsSync('./config.json')) {
            renameSync('./config.json', backupConfigName);
        }
    });

    afterAll(() => {
        if (existsSync(backupConfigName)) {
            renameSync(backupConfigName, './config.json');
        }
    });

    it('Config exists', () => {
        Config.Instance.LoadConfig();
        const exists = existsSync('./config.json');
        expect(exists).toBeTruthy();
    });

    it('All values are default', () => {
        for (const key of keys) {
            expect(Config.Instance.Properties[key]).toEqual(configProps[key]);
        }
    });

    it('New value is set', () => {
        const key = keys[0];
        const newValue = Math.random().toString(36).substring(2, 15);

        expect(Config.Instance.Properties[key]).toEqual(configProps[key]);

        Config.Instance.SetProperty(key, newValue);

        expect(Config.Instance.Properties[key]).toEqual(newValue);
    });
});
