# 🚀 Guía Definitiva de Despliegue: The Forge en Vercel

Has construido una aplicación gamificada increíble con React y Supabase. Ahora es momento de ponerla en internet de manera gratuita y profesional usando **Vercel**.

Sigue estos pasos precisos:

## Paso 1: Sube tu código a GitHub (Si no lo has hecho)
Vercel se conecta directamente a tu repositorio de GitHub para publicar el código cada vez que haces un cambio.
1. Asegúrate de haber hecho `git add .`, `git commit` y `git push` de tu código más reciente.

## Paso 2: Importar a Vercel
1. Ve a [vercel.com](https://vercel.com/) e inicia sesión con Github.
2. Dale al botón negro **"Add New Project"**.
3. Verás una lista con tus repositorios de Github. Busca `ProyectoU1` (o el nombre de tu repo) y dale a **Import**.

## Paso 3: Configurar el Entorno (¡El paso más importante!)
Antes de darle a Deploy, tienes que decirle a Vercel cómo conectarse a la nube de base de datos segura.
1. En la pantalla de importación, abre la pestaña que dice **"Environment Variables"** (Variables de Entorno).
2. Debes agregar EXACTAMENTE las dos llaves maestras que tienes guardadas en tu archivo local `.env.local` en tu Visual Studio Code.
   - **Name**: `VITE_SUPABASE_URL` | **Value**: *(Pega aquí la URL de tu proyecto de Supabase)*
   - Dale a "Add".
   - **Name**: `VITE_SUPABASE_ANON_KEY` | **Value**: *(Pega aquí la clave larga ANON KEY de tu Supabase)*
   - Dale a "Add".

> ⚠️ **NUNCA** subas el archivo `.env.local` a Github, es por eso que lo configuramos manualmente dentro del servidor de Vercel en este paso.

## Paso 4: ¡Desplegar!
1. Deja todo lo demás (Framework: Vite, Build Command: `npm run build`) en sus ajustes predeterminados.
2. Presiona el botón **Deploy**. 
3. Vercel comenzará a construir tu página web. En 1-2 minutos la pantalla se llenará de confeti virtual y te dará un Link Oficial (Ej: `https://the-forge-app.vercel.app`).

---

## Paso 5: Configuración Final de Seguridad en Supabase
Si intentas iniciar sesión desde el nuevo link de Vercel, ¡Supabase asustado te va a bloquear por seguridad! Supabase solo confía en `localhost:5173`. Debemos autorizar a Vercel:

1. Ve a la consola de [Supabase](https://supabase.com).
2. Ve al menú lateral izquierdo, haz clic en **Authentication**.
3. Entra a **URL Configuration**.
4. En **Site URL**, cambia `http://localhost:5173` por el nuevo link completo que te dio Vercel (Ej: `https://tu-proyecto.vercel.app`).
5. Baja a **Redirect URLs** y dale a *Add URL*. Agrega de nuevo exactamente el link de Vercel. Guarda los cambios.

¡FIN! 🎉 
Tu aplicación ya es pública, segura, su base de datos está protegida por políticas criptográficas (RLS) y está lista para añadir usuarios reales al tablero Kanban.
