# DevLike

Roguelike deckbuilder a squadre sui developer che combattono deadline e clienti.

## Pubblicazione su GitHub Pages

Il progetto è predisposto per il deploy automatico tramite GitHub Actions.

1. Crea un repository GitHub chiamato `DevLike`.
2. Carica tutti i file di questo progetto nel repository.
3. Vai in **Settings → Pages**.
4. In **Build and deployment → Source** seleziona **GitHub Actions**.
5. Vai in **Actions** e verifica il workflow **Deploy DevLike to GitHub Pages**.
6. Quando il workflow termina, GitHub mostrerà l'URL del gioco.

L'URL sarà normalmente:

`https://TUO-USERNAME.github.io/DevLike/`

Ogni nuovo push sul branch `main` ricostruirà e pubblicherà automaticamente il gioco.

## Sviluppo locale

Il progetto usa Vite + TypeScript.

```bash
npm install
npm run dev
```

Per creare la build:

```bash
npm run build
```

Il deploy su GitHub Actions non richiede che npm funzioni sul PC locale.
