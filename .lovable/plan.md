
Objetivo: hacer que el GIF del golfista sea el loader visible real en la app, porque hoy el cambio quedó aplicado solo en un loader secundario.

Diagnóstico
- El GIF sí está integrado en `src/components/ui/AppLoadingScreen.tsx`.
- Pero la pantalla que vos estás viendo en `/auth` no usa ese componente.
- En `/auth`, el loader visible sale de `index.html` (`#initial-loader`), y ahí todavía está hardcodeado el logo PNG viejo con los puntitos.
- Además, el loader de refresco interno sigue usando `GolfAnimationLoader` → `CustomGolfAnimation`, que hoy muestra spinner + “Loading…”.

Plan de implementación
1. Reemplazar el loader estático inicial en `index.html`
- Cambiar la imagen PNG vieja por el GIF `golfswing.gif`.
- Mantener fondo verde oscuro y centrar el jugador completo.
- Eliminar los puntitos de carga para que no compitan con el GIF.
- Ajustar tamaño y `object-fit: contain` para que no se corte en mobile.

2. Unificar el loader React con el mismo estilo
- Reutilizar el mismo diseño del GIF en `AppLoadingScreen.tsx`.
- Si hace falta, quitar el texto “GolfIt” para que quede solo el jugador, como pediste.

3. Reemplazar también los loaders secundarios
- Actualizar `GolfAnimationLoader.tsx` / `CustomGolfAnimation.tsx` para que usen el mismo GIF en vez del spinner actual.
- Esto hará consistente:
  - carga inicial
  - chequeo de auth
  - refresh / pull-to-refresh
  - loaders administrativos que dependen de `GolfAnimationLoader`

4. Ajustar la experiencia visual para mobile
- Revisar safe areas y centrado vertical.
- Usar dimensiones responsivas para que el jugador se vea completo en pantallas chicas.
- Mantener transición suave al desmontar el loader desde `main.tsx`.

Detalles técnicos
- Archivos a tocar:
  - `index.html`
  - `src/components/ui/AppLoadingScreen.tsx`
  - `src/components/ui/GolfAnimationLoader.tsx`
  - `src/components/ui/CustomGolfAnimation.tsx`
- No hace falta cambiar la lógica de autenticación.
- El problema no es el asset, sino qué loader se muestra en cada etapa.

Resultado esperado
- Cuando abras la app o entres en una carga real, vas a ver el GIF del golfista en el centro.
- No se verá más el logo viejo ni el spinner legacy.
- La experiencia de carga quedará consistente en toda la app.

Verificación al implementar
- Probar carga inicial en `/auth`
- Probar carga por `AuthGuard`
- Probar loader de refresh dentro de `Layout`
- Confirmar en viewport mobile que el jugador se vea completo y no cortado
