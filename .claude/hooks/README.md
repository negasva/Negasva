# Ponytail (vendored)

Plugin Ponytail vendorizado en el repo. Modo activo: **full**.

- Skills: `.claude/skills/ponytail*/` → `/ponytail`, `/ponytail-review`, `/ponytail-audit`, `/ponytail-debt`, `/ponytail-gain`, `/ponytail-help`. Funcionan sin más.
- Hooks (auto-activación por sesión): NO cableados por defecto. El harness bloquea editar `settings.json` para auto-ejecutar JS. Para activarlos, añade a mano a `.claude/settings.json`:

```json
"env": { "PONYTAIL_DEFAULT_MODE": "full" },
"hooks": {
  "SessionStart": [{ "matcher": "startup|resume|clear|compact", "hooks": [
    { "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/ponytail-activate.js\"; exit 0", "timeout": 5 }]}],
  "SubagentStart": [{ "hooks": [
    { "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/ponytail-subagent.js\"; exit 0", "timeout": 5 }]}],
  "UserPromptSubmit": [{ "hooks": [
    { "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/ponytail-mode-tracker.js\"; exit 0", "timeout": 5 }]}]
}
```

Requiere `node` en el PATH. Fuente: https://github.com/DietrichGebert/ponytail
