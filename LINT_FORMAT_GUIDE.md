# Guia d'ús de Lint i Format

Aquest projecte té configurat ESLint i Prettier per mantenir un codi net i consistent.

## Scripts disponibles

### Lint (ESLint)
- `npm run lint` - Comprova errors de lint sense corregir-los
- `npm run lint:fix` - Comprova i corregeix automàticament els errors de lint que es poden solucionar

### Format (Prettier)
- `npm run format:check` - Comprova si el format és correcte sense modificar fitxers
- `npm run format:fix` - Formata automàticament tots els fitxers
- `npm run format` - Alias per `format:fix`

### Combinat
- `npm run lint:format` - Executa primer `lint:fix` i després `format:fix`

## Ús recomanat

### Per desenvolupament diari
```bash
# Abans de fer commit, executa:
npm run lint:format
```

### Per comprovar errors sense corregir
```bash
npm run lint
npm run format:check
```

### Per corregir només format
```bash
npm run format:fix
```

### Per corregir només lint
```bash
npm run lint:fix
```

## Configuració

### Prettier
- Fitxer de configuració: `.prettierrc`
- Fitxers ignorats: `.prettierignore`
- Plugins instal·lats:
  - `prettier-plugin-tailwindcss` - Per Tailwind CSS
  - `prettier-plugin-gherkin` - Per fitxers .feature

### ESLint
- Fitxer de configuració: `.eslintrc.json`
- Integrat amb Prettier per evitar conflictes
- Regles específiques per Angular

## Errors comuns i solucions

### Errors que es solucionen automàticament
- Format de codi (espais, comes, etc.)
- Imports no utilitzats
- Variables no utilitzades
- Puntuació i espaiat

### Errors que requereixen intervenció manual
- Tipus `any` explícits
- Problemes d'accessibilitat en templates
- Selectors de components que no segueixen el prefix "pelu"
- Mètodes de lifecycle buits

## Integració amb IDE

### VS Code
Instal·la les extensions:
- ESLint
- Prettier - Code formatter

Configura el format automàtic al guardar:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Altres IDEs
Configura l'editor per utilitzar Prettier com a formatter per defecte i ESLint per a la validació de codi. 
