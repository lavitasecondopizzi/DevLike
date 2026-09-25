# DevLike leaderboard backend

Backend previsto per la classifica online tramite Supabase.

## Setup

1. Crea un progetto Supabase.
2. Esegui schema.sql nell'SQL Editor.
3. Crea la Edge Function leaderboard usando functions/leaderboard/index.ts.
4. Imposta i secret della function:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
5. Imposta nel build environment di DevLike:
   VITE_LEADERBOARD_API_URL=https://<project-ref>.supabase.co/functions/v1/leaderboard

La tabella non consente INSERT pubblici: la scrittura passa dalla Edge Function, che esegue una validazione minima prima dell'inserimento.

La chiave service role non deve mai essere inserita nel repository o nel frontend.
