# Plan — Fase 2: arquitectura, shadcn y cimientos (Pago 2)

Documento de trabajo **interno** para ejecutar la parte técnica del **pago 2** del [plan de entregas](PLAN_ENTREGA_10_PAGOS.md): convenciones, alineación con **shadcn** y reglas de Cursor (incl. referencia **Magic MCP**), sin mezclar todavía FAQ, contacto ni landing definitiva (eso es **pago 3**).

---

## 1. Objetivo

- Tener una **base de UI y carpetas** coherente para todo lo que venga después.
- Evitar rehacer pantallas: lo nuevo (empezando por **Quiénes somos**) y el **pulido** incremental usan el mismo sistema.
- **No** migrar el repo entero de golpe: **cimientos + primer consumidor** (About), luego **página a página** según prioridad.

---

## 2. Alcance de este documento

| Entra | Fuera (otros pagos / ya planificado) |
|--------|--------------------------------------|
| Decisión de estructura y convenciones | FAQ, contacto, landing nueva → **pago 3** |
| `components.json`, UI shadcn mínima | Analítica y SEO de lanzamiento → **pago 10** |
| Layout / shell común alineado donde toque | Flujo completo de onboarding/registro → **pago 4** |
| Página **Quiénes somos** como primera vertical | CRUD de inversiones en admin → **pago 7** |
| Pulido **acotado** de pantallas existentes (por lista priorizada) | Subida real de archivos → **pago 6** |

---

## 3. Principios

1. **Cimientos antes que maquetar todo:** primitivos + `cn()` + alias; luego About.
2. **Una vertical completa (About)** valida el sistema antes de tocar diez rutas.
3. **Legacy permitido:** componentes viejos siguen existiendo hasta que esa ruta entre en “pulido”.
4. **Magic MCP** como referencia de layout/composición, no como sustituto del design system (shadcn).

---

## 4. Orden de implementación recomendado

### Fase A — Auditoría (0.5 día)

- [x] Revisar `package.json`, Tailwind, `jsconfig`/`tsconfig` paths, `globals.css`.
- [x] Listar `src/app/components` y patrones actuales (`Button`, formularios admin, etc.).
- [x] Comprobar si ya existe `components.json` o carpeta `components/ui`.

#### Hallazgos Fase A (29 mar 2026)

**Stack**

| Ítem | Estado |
|------|--------|
| Next.js | `15.3.4`, App Router, `next.config.mjs` + plugin `next-intl` |
| React | `19.x` |
| Tailwind | **v4** vía `tailwindcss` + `@tailwindcss/postcss` en `postcss.config.mjs`; **no** hay `tailwind.config.js` — tema en CSS-first: `@import "tailwindcss"` + `@theme inline` en `src/app/[locale]/globals.css` |
| Path alias | `jsconfig.json`: `@/*` → `./src/*` |
| TypeScript | No hay `tsconfig` en raíz; proyecto **JavaScript** |

**Tokens de marca (globals.css)**

- Colores CSS: `--main-blue`, `--main-gold`, `--off-white`, `--secondary-blue`, `--secondary-gold`, `--main-text`, `--secondary-text`; expuestos a Tailwind como `--color-*`.
- Fuentes: `@font-face` Senlot + Gotham; clase `.font-senlot`.
- **Nota:** `body` usa `color: var(--foreground)` pero **`:root` no define `--foreground`** — posible fallo de estilo heredado (texto podría no verse según el navegador). Conviene definir `--foreground` o usar `var(--main-text)` en Fase B/D.

**shadcn / UI compartida**

- **No** existe `components.json`.
- **No** existe `src/components/ui` ni `src/lib/utils.js` (`cn`).
- Próximo paso obligatorio: init shadcn compatible con **Tailwind v4** (seguir documentación actual de shadcn; puede requerir flags o versión reciente del CLI).

**Componentes en `src/app/components/`** (10 archivos)

| Archivo | Rol |
|---------|-----|
| `Button.jsx` | Cliente; variantes por mapa de clases Tailwind; `href` renderiza `<Link><button>` (HTML inválido anidado — mejora futura con `Link` estilizado o shadcn `Button` + `asChild`). |
| `NavMenu.jsx` / `NavMenuServer.jsx` / `DropdownNavItem.jsx` | Navegación + menú móvil. |
| `Footer.jsx` | Pie + enlaces. |
| `AuthButton.jsx` | Entrada sesión / registro. |
| `LocaleToggle.jsx` | Idioma (`@/i18n/*`). |
| `PropertyCard.jsx` | Tarjeta de proyecto. |
| `SessionProvider.js` | NextAuth wrapper. |

**Admin**

- `src/app/[locale]/admin/components/AdminNav.jsx`.
- Formularios grandes en `UsersAdminClient.jsx` y `PropertiesAdminClient.jsx`: `<input>` / `<label>` nativos + clases Tailwind repetidas + `Button` de app; candidatos claros a `Input`, `Label`, `Card`, `Dialog` shadcn en Fase F.

**Importaciones `@/`**

- Uso parcial: sobre todo `authOptions`, `i18n`. Componentes suelen importar con rutas relativas (`../components/Button`).

**Conclusión Fase A**

- Proyecto listo para **Fase B**: añadir `lib/utils` + shadcn init, mapear tokens de marca a variables que consuma el tema de shadcn (o `cssVariables` según doc oficial v4).

### Fase B — Baseline shadcn (0.5–1.5 días)

- [ ] Inicializar o alinear **shadcn** con la versión de Tailwind del proyecto (`components.json`, `tailwind.config`).
- [ ] Definir carpeta canónica para primitivos: p. ej. `src/components/ui` (recomendado) o documentar si se queda bajo `app`.
- [ ] Añadir **solo** lo necesario al inicio, por ejemplo:
  - `button`, `input`, `label`, `textarea`
  - `card`
  - `separator` (opcional)
  - `sheet` o `dialog` (si el nav móvil o modales lo van a usar pronto)
- [ ] Una sola forma de importar utilidades (`cn` desde `@/lib/utils` o equivalente).

### Fase C — Convenciones por escrito (en código / comentario breve en este doc)

- [ ] Regla: **pantallas nuevas y refactors** importan desde `@/components/ui/*` (o el alias acordado).
- [ ] Regla: **un componente por carpeta** para piezas de dominio (`About`, `PropertyCard` refactor) cuando crezcan; shadcn en `ui/` sin wrapper salvo que haya token de marca fuerte.
- [ ] Decidir destino de **`Button.jsx` legacy:** delegar en shadcn, deprecar gradualmente, o mantener hasta último — **una decisión** y aplicarla en About primero.

### Fase D — Shell del sitio (0.5–1 día)

- [ ] Ajustar **layout** / **NavMenu** / **Footer** lo mínimo para usar tokens y primitivos nuevos donde no rompa todo.
- [ ] Objetivo: marco visual consistente para About y pulidos posteriores, no rediseño completo del nav en este documento salvo que esté en la lista del cliente.

### Fase E — Quiénes somos (vertical completa, 1–2 días)

- [ ] Ruta `/{locale}/about` (o la acordada), mensajes en `messages/en.json` y `messages/es.json`.
- [ ] Composición solo con sistema nuevo (+ tailwind existente donde aplique).
- [ ] Enlace desde menú y pie ya apunta a página real (cierra el agujero de `/about`).

### Fase F — Pulido incremental (resto del tiempo del pago 2)

Orden sugerido (ajustar con el cliente):

1. [ ] **Registro** — alto impacto percibido (sigue siendo placeholder hasta pago 4, pero puede verse profesional).
2. [ ] **Proyectos** + **PropertyCard** / detalle — cara pública principal.
3. [ ] **Dashboard** + **portafolio** — área inversionista.
4. [ ] **Admin** (usuarios, propiedades) — formularios densos; beneficiarse de `input`/`label`/`card` compartidos.

En cada ítem: **solo** sustitución de primitivos y espaciado/tipografía; **no** abrir reglas de negocio nuevas.

---

## 5. Definición de “hecho” para la parte arquitectura del pago 2

- [ ] `components.json` + al menos **5 primitivos** shadcn en uso real (no solo instalados).
- [ ] **About** publicado en ambos idiomas y enlazado.
- [ ] Documento de convenciones: **este archivo** actualizado con rutas finales (`ui/`, alias) si cambiaron durante la implementación.
- [ ] **Al menos dos** pantallas del inventario F pasan por pulido con el nuevo sistema (además de About).
- [ ] Build y lint sin errores nuevos relacionados con la migración.

---

## 6. Riesgos y mitigación

| Riesgo | Mitigación |
|--------|------------|
| Tailwind v4 vs plantillas shadcn antiguas | Seguir docs actuales de shadcn + Tailwind v4; ajustar `globals.css` con calma. |
| Duplicar `Button` / estilos | Decisión explícita en Fase C; About usa una sola fuente de verdad. |
| Scope creep (FAQ/landing en el mismo sprint) | Rechazar en daily; remitir a **pago 3**. |

---

## 7. Después de esta fase

- **Pago 3:** landing, FAQ, contacto, navegación completa, idioma por ubicación ([plan principal](PLAN_ENTREGA_10_PAGOS.md)).
- Seguir pulido de rutas restantes usando el mismo playbook (Fase F).

---

## 8. Bitácora (rellenar al avanzar)

| Fecha | Nota |
|-------|------|
| 2026-03-29 | **Fase A completada.** Hallazgos documentados arriba; sin `components.json`; Tailwind v4 CSS-first; pendiente corregir/definir `--foreground` en `globals.css`. |
