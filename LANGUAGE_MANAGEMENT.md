# Gestió d'Idiomes per Usuari (Simplificada)

## Funcionament

- **Al canviar idioma:**
  - Es guarda automàticament la preferència de l'usuari al localStorage.

- **Al login:**
  - Si l'usuari té una preferència d'idioma guardada, s'aplica automàticament.
  - Si no, es manté l'idioma actual.

- **Al logout:**
  - No es fa res especial amb l'idioma.

## Implementació

### TranslationService

```typescript
saveUserLanguagePreference(userId: string, language: string): void {
  if (this.isLanguageAvailable(language)) {
    const userLanguageKey = `userLanguage_${userId}`;
    localStorage.setItem(userLanguageKey, language);
  }
}

restoreUserLanguagePreference(userId: string): void {
  const savedLanguage = this.getUserLanguagePreference(userId);
  if (savedLanguage && this.isLanguageAvailable(savedLanguage)) {
    this.setLanguage(savedLanguage);
  }
}
```

### AuthService

```typescript
logout() {
  return signOut(this.auth);
}

// Al login (onAuthStateChanged):
if (user?.uid) {
  this.translationService.restoreUserLanguagePreference(user.uid);
}
```

## Flux resumit

1. **Canviar idioma:** Es guarda la preferència de l'usuari
2. **Login:** Es restaura l'idioma guardat (si existeix)
3. **Logout:** No es fa res especial

## Beneficis
- Lògica molt simple i clara
- Sense resets ni complicacions
- Cada usuari manté la seva preferència

## Prova
1. Entra, canvia d'idioma → es guarda automàticament
2. Fes logout i login → es posa l'idioma que tenies guardat

## Idiomes Suportats

- **Català (ca)** - Idioma per defecte
- **Español (es)**
- **English (en)**
- **العربية (ar)** - Suport RTL

## Almacenament

Les preferències d'idioma es guarden al localStorage amb les següents claus:

- `preferredLanguage` - Idioma general de l'aplicació (esborrat al logout)
- `userLanguage_{userId}` - Preferència específica de cada usuari

## Beneficis

1. **Experiència personalitzada**: Cada usuari veu l'aplicació en el seu idioma preferit
2. **Persistència**: La preferència es manté entre sessions
3. **Fallback intel·ligent**: Si no hi ha preferència, utilitza l'idioma del navegador
4. **Reset automàtic**: Al logout, torna a l'idioma del navegador o català
5. **Suport multi-idioma**: Funciona amb tots els idiomes suportats

## Testing

Per provar la funcionalitat:

1. **Login amb usuari nou**: Hauria d'utilitzar l'idioma del navegador o català
2. **Canviar idioma**: Hauria de guardar la preferència
3. **Logout i login**: Hauria de restaurar l'idioma que tenies abans
4. **Logout**: Hauria de tornar a l'idioma del navegador o català 
