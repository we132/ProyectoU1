# 🚀 Guía de Despliegue en Vercel + Supabase

¡Hola David! Si estás viendo un error de `Failed to fetch` al intentar iniciar sesión en tu página web ya subida a internet (Vercel), eso significa que **la versión en la Nube de tu código no sabe con quién conectarse**. 

En tu computadora local, la aplicación sabe conectarse a tu base de datos gracias al archivo secreto llamado `.env.local`. Por seguridad, Git **nunca** sube ese archivo a la nube, así que Vercel está ciego y cuando intenta "hacer fetch" para iniciar sesión, truena.

A continuación, sigue estos pasos exactos para arreglar tanto Vercel como Supabase y dejar tu app 100% funcional en internet.

---

## Misión 1: Darle las "Llaves" a Vercel 🔑

Tenemos que enseñarle manualmente a Vercel tus códigos secretos.

1. Entra a tu panel de **Vercel** (`https://vercel.com/dashboard`) y haz clic en tu proyecto (`ProyectoU1`).
2. Ve a la pestaña de **Settings** de tu proyecto (está arriba en el menú horizontal).
3. En la barra lateral izquierda, busca la sección **Environment Variables** (o Variables de Entorno).
4. Aquí vas a añadir **DOS** variables exactas tal cual como las tienes en tu archivo `.env.local` en tu compu.
    - Donde dice `Key`, escribe: `VITE_SUPABASE_URL`
    - Donde dice `Value`, pega el enlace de tu base de datos (Ej: `https://[tu-id-supabase].supabase.co`)
    - Dale al botón **Save**.
5. Ahora agrega la otra:
    - Donde dice `Key`, escribe: `VITE_SUPABASE_ANON_KEY`
    - Donde dice `Value`, pega esa llave hiper larga que parece un montón de números y letras al azar (tu API KEY).
    - Dale al botón **Save**.
6. **MUY IMPORTANTE:** Para que Vercel agarre estas nuevas llaves, tienes que forzarlo a reconstruir la página web. 
   - Ve a la pestaña **Deployments** en el menú de arriba.
   - Dale clic a los tres puntitos (`...`) en el cuadro de tu último despliegue (arribita de tu código).
   - Haz clic en **Redeploy**.
   - Espera a que termine. ¡Boom! Vercel ahora sí tiene conexión con Supabase.

---

## Misión 2: Darle permiso a tu App Web en Supabase 🛡️

Ahora Supabase te va a bloquear por un error nuevo (CORS). Supabase tiene mucha seguridad y por defecto solo te deja iniciar sesión desde la computadora local (`localhost`). Como ahora mandaremos señales de login *desde el link de Vercel*, tenemos que registrar ese dominio en la lista blanca de la bóveda.

1. Copia tu URL pública de Vercel (Ej. `https://proyectou1-david.vercel.app`).
2. Ve al panel de **Supabase** (`https://supabase.com/dashboard/`).
3. En el menú de la izquierda, entra al apartado de **Authentication** (ícono de dos personas).
4. En el sub-menú de Auth (bajo Configuration), entra a **URL Configuration**.
5. En la sección de **Site URL**, asegúrate de que esté tu URL de Vercel (y de no tener una diagonal `/` al final).
6. Ahora, un poco más abajo verás **Redirect URLs**. Asegúrate de agregar tu URL de Vercel ahí dándole al botón verde "Add URL" (ej. `https://proyectou1-[...].vercel.app/**`). También asegúrate de que `http://localhost:5173/**` siga en esa lista para que tu entorno de pruebas local no se rompa.

¡Aplica ambos cambios! Espera 1 minutito a que los servidores conecten todo, abre el link de Vercel... ¡Y tu login pasará perfectamente! 🚀
