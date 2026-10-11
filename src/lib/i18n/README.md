# Application localization

The persisted `useThemeStore.locale` is the single language preference. `LocaleProvider` applies the HTML language/direction and waits for client hydration before displaying the application, preventing a flash of Turkish on reload.

Translate UI copy during React render:

```tsx
const localizeText = useLocaleRender();
return <button title={localizeText('Kaydet')}>{localizeText('Kaydet')}</button>;
```

Use canonical Turkish source copy for all languages. Do not introduce Turkish/English ternaries, DOM text mutations, or English fallbacks for supported locales. User-written messages, names, email addresses, exam answers, and profile text must remain untouched. Product names and currency/identity abbreviations stay invariant.

`catalog.json` contains the offline translations; `overrides.json` contains local corrections and reviewed additions. Existing dictionaries remain available through `useTranslation`. Dynamic messages use `{0}`, `{1}`, etc. in the catalog and preserve inserted values. Formatting uses `getFormattingLocale()`. When formatting inside a memoized callback, include the subscribed translation function in its dependencies.

English-origin application names are localizable UI copy, not invariant brands. Turkish overrides cover both standalone names and references inside headings, help text, and back buttons. Keep only the core LifeOS name and third-party product names invariant. New canonical Turkish names and legacy English aliases must resolve to the same locale table.

After adding UI copy, run `node scripts/localization-catalog.cjs` and `npm run test:i18n`. The tests check all 20 languages, interpolation tokens, language switching, hydration snapshots, inline spacing, invariant abbreviations, and batch-output contamination. Add missing translations before shipping. Automated translations still benefit from language-specific editorial review.

`scripts/translate-catalog.cjs` is an optional, manual build-time utility. It sends source phrases to Google Translate, so it requires explicit approval for the exact outbound text. Never run it automatically during development, builds, tests, or application use. The application makes no translation-service requests.
