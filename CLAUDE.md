@AGENTS.md

# Flujo de trabajo de Git (instrucción permanente)

Estas reglas aplican SIEMPRE, en cada sesión, sin necesidad de que el usuario
las repita:

1. **Commit automático.** Al terminar una tarea (cambios completos y, cuando
   aplique, con el build pasando), haz `git commit` con un mensaje claro y
   descriptivo en presente. No preguntes para commitear.

2. **Push automático.** Después de commitear, haz `git push` a la rama de
   trabajo de la sesión sin preguntar. Usa `git push -u origin <rama>`.

3. **Pull request + auto-merge a `main`.** Tras el push, si no existe ya un PR
   para la rama, crea uno hacia `main` **siempre como *ready for review* (NO
   draft)** y habilita el **auto-merge** del PR (`enable_pr_auto_merge`, método
   `squash`). Así, cuando CI pase en verde, el PR se funde solo a `main` sin
   intervención manual.

4. **Mensajes de commit.** Claros, concisos, en presente (p. ej.
   `fix(navbar): ...`, `perf: ...`). Una línea de resumen y, si hace falta,
   cuerpo explicando el porqué.

5. **Seguridad.** No commitear secretos, `.env`, claves ni el identificador de
   modelo. Nunca forzar push (`--force`) sobre `main`.
