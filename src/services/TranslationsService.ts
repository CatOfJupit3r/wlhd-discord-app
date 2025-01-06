import i18next, { ResourceLanguage } from 'i18next';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { enums } from 'typing';

class TranslationsService {
    private readonly _translationsPath: string;

    constructor(alternativePath?: string) {
        if (alternativePath) {
            this._translationsPath = alternativePath;
        } else {
            this._translationsPath = path.join(__dirname, '../locales');
        }
    }

    public init = async () => {
        return i18next.init({
            lng: 'ru-RU',
            resources: {
                'en-US': await this.createLanguageResource('en-US'),
                'ru-RU': await this.createLanguageResource('ru-RU'),
            },
            fallbackLng: 'en-US',
        });
    };

    private createLanguageResource = async (language: string): Promise<ResourceLanguage> => {
        const discordOnlyTranslations = this.readLanguage(language);
        this.logMissingOrExtraKeys(language, discordOnlyTranslations);
        const gameData = await this.readGameTranslations(language);

        return {
            ...discordOnlyTranslations,
            ...gameData,
        };
    };

    private readLanguage = (language: string): ResourceLanguage => {
        let languageData = {};
        try {
            const raw = fs.readFileSync(path.join(this._translationsPath, `${language}.json`), 'utf8');
            languageData = JSON.parse(raw);
        } catch (err: unknown) {
            console.error(err);
        }
        return languageData;
    };

    private readGameTranslations = async (language: string): Promise<ResourceLanguage> => {
        return {};
    };

    private logMissingOrExtraKeys = (language: string, languageData: ResourceLanguage) => {
        const declaredKeys = Object.keys(enums.i18n);
        const languageKeys = Object.keys(languageData);

        const missingKeys = declaredKeys.filter((key) => !languageKeys.includes(key));
        const extraKeys = languageKeys.filter((key) => !declaredKeys.includes(key));

        if (missingKeys.length > 0) {
            console.error(`Missing keys in ${language}: ${missingKeys.join(', ')}`);
        }

        if (extraKeys.length > 0) {
            console.error(`Extra keys in ${language}: ${extraKeys.join(', ')}`);
        }
    };
}

export default new TranslationsService();
