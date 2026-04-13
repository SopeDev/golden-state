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

- [x] Inicializar o alinear **shadcn** con la versión de Tailwind del proyecto (`components.json`, `tailwind.config`).
- [x] Definir carpeta canónica para primitivos: p. ej. `src/components/ui` (recomendado) o documentar si se queda bajo `app`.
- [x] Añadir **solo** lo necesario al inicio, por ejemplo:
  - `button`, `input`, `label`, `textarea`
  - `card`
  - `separator` (opcional)
  - `sheet` o `dialog` (si el nav móvil o modales lo van a usar pronto) — *deferido a Fase D/F si hace falta*
- [x] Una sola forma de importar utilidades (`cn` desde `@/lib/utils` o equivalente).

#### Fase B ejecutada (abr 2026)

- **CLI:** `npx shadcn@latest init -d` sobre Next 15 + Tailwind v4.
- **`components.json`:** estilo `base-nova`, `rsc: true`, JS (no TSX), CSS en `src/app/[locale]/globals.css`, alias `@/components`, `@/components/ui`, `@/lib/utils`.
- **Dependencias añadidas:** `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `tw-animate-css`; imports en CSS: `tw-animate-css`, `shadcn/tailwind.css`. Paquete **`shadcn`** en **devDependencies** (solo CLI).
- **Archivos:** `src/lib/utils.js` (`cn`), `src/components/ui/` → `button`, `input`, `label`, `textarea`, `card`, `separator`.
- **Tema:** variables shadcn en `:root` + `@layer base`; **`--primary`** mapeado a **`--main-blue`**; **`--foreground`** ya definido por el preset (corrige el hueco detectado en Fase A).
- **Fuentes:** corregido `--font-sans` / `--font-heading` circulares → **Gotham** + **SenlotSerif**; retiradas fuentes **Geist** del `layout.js` para no duplicar con la marca.
- **Legacy:** `src/app/components/Button.jsx` sigue siendo el botón usado en toda la app; el **Button** shadcn vive en `@/components/ui/button` para **Fase E** (About) y refactors.

### Fase C — Convenciones por escrito (en código / comentario breve en este doc)

- [x] Regla: **pantallas nuevas y refactors** importan desde `@/components/ui/*` (o el alias acordado).
- [x] Regla: **un componente por carpeta** para piezas de dominio (`About`, `PropertyCard` refactor) cuando crezcan; shadcn en `ui/` sin wrapper salvo que haya token de marca fuerte.
- [x] Decidir destino de **`Button.jsx` legacy:** delegar en shadcn, deprecar gradualmente, o mantener hasta último — **una decisión** y aplicarla en About primero.

#### Convenciones acordadas (Fase C)

**Alias y primitivos**

- Pantallas **nuevas** y **refactors** de pantallas existentes: importar primitivos desde `@/components/ui/*` y utilidades desde `@/lib/utils` (`cn`). Evitar nuevos `<button>` / `<input>` “sueltos” con Tailwind repetido salvo caso puntual (p. ej. nativo por accesibilidad muy específica).
- La lista oficial de piezas shadcn del repo es la de **`components.json`** y la carpeta **`src/components/ui/`** (añadir componentes con el CLI, no copiar a mano sin alinear con el CLI).

**Dominio vs `ui/`**

- Piezas de **dominio** (páginas compuestas como About, tarjetas como `PropertyCard`, secciones de marketing): **`src/components/<Nombre>/`** con **`<Nombre>.jsx`** como entrada; si el archivo crece (orientativo **~150 líneas**), extraer subcomponentes en el **mismo directorio** (`AboutHero.jsx`, etc.), no en `ui/`.
- **`src/components/ui/`**: solo primitivos del sistema (shadcn). **Sin** wrappers de marca por defecto; si hace falta un variant de marca reutilizable, valorar un componente fino bajo `src/components/` (no dentro de `ui/`) o `className` + tokens en la vista.

**`Button.jsx` legacy (`src/app/components/Button.jsx`)**

- **Decisión:** **deprecación gradual** (no sustituir todo el repo en un solo PR).
- **About (Fase E) y cualquier pantalla nueva:** usar **`Button`** desde **`@/components/ui/button`**. Para enlaces internos, preferir **`Link`** de **`@/i18n/navigation`** + **`buttonVariants`** (o estilos acordados), ya que el `Button` actual no expone `asChild`.
- **Rutas que aún no se tocan:** pueden seguir importando **`../components/Button`** hasta su refactor en **Fase F**; al **editar** una pantalla, migrar sus botones al primitivo shadcn en el mismo cambio cuando sea razonable.
- **No** eliminar `Button.jsx` en Fase C; cuando no queden importaciones, borrar o archivar en un PR dedicado.

### Fase D — Shell del sitio (0.5–1 día)

- [x] Ajustar **layout** / **NavMenu** / **Footer** lo mínimo para usar tokens y primitivos nuevos donde no rompa todo.
- [x] Objetivo: marco visual consistente para About y pulidos posteriores, no rediseño completo del nav en este documento salvo que esté en la lista del cliente.

#### Fase D ejecutada

- **`layout`:** `marginTop` inline sustituido por **`mt-[76px]`** (Tailwind).
- **Navegación localizada:** `NavMenu`, `DropdownNavItem`, `Footer` y **`AuthButton`** usan **`Link` / `usePathname` / `useRouter`** desde **`@/i18n/navigation`** (`createNavigation`) en rutas internas — coherente con **`/[locale]`**.
- **Tokens:** nav con **`bg-background`**, **`border-border`**, texto **`text-primary`**; footer con **`bg-primary`**, **`text-primary-foreground`** y acentos **`main-gold`** donde ya estaban.
- **Primitivos:** **`buttonVariants`** + **`cn`** para admin (nav), CTA pie, enlace registro; **`Button`** shadcn en auth (sign in / out).
- **Accesibilidad / marcado:** primer ítem del nav desktop como **`<li><Link>`**; menú móvil cierra al navegar **`onClick`**; botón hamburguesa con **`type="button"`**.

### Fase E — Quiénes somos (vertical completa, 1–2 días)

- [x] Ruta `/{locale}/about` (o la acordada), mensajes en `messages/en.json` y `messages/es.json`.
- [x] Composición solo con sistema nuevo (+ tailwind existente donde aplique).
- [x] Enlace desde menú y pie ya apunta a página real (cierra el agujero de `/about`).

#### Fase E ejecutada

- **Ruta:** `src/app/[locale]/about/page.js` con **`generateMetadata`** (`About.metaTitle` / `metaDescription`).
- **Vista:** `src/components/About/AboutPage.jsx` (server): **`getTranslations('About')`**, **`Card`** (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`), CTAs con **`Link`** + **`buttonVariants`** (sin `asChild` en el primitivo actual).
- **i18n:** claves bajo **`About`** en **`messages/en.json`** y **`messages/es.json`**.

### Fase F — Pulido incremental (resto del tiempo del pago 2)

Orden sugerido (ajustar con el cliente):

1. [x] **Registro** — `Card` + `Label` + `Input` + `Button` shadcn, copy bajo **`Register`** (EN/ES); flujo de negocio sin cambios.
2. [x] **Proyectos** + **PropertyCard** / detalle — **`Link`** `@/i18n/navigation`, `Card`, `buttonVariants` / `Button`; listado y ficha alineados con tokens.
3. [x] **Dashboard** + **portafolio** — mismos primitivos; dashboard con **`Dashboard`** i18n; portfolio header/summary/list con `Card`.
4. [x] **Admin** — `UsersAdminClient` / `PropertiesAdminClient` con `Input`/`Label`/`Card`/`Button`; **`AdminNav`** con `Link`/`usePathname` `@/i18n/navigation`; páginas **data** y **schema** con `Card`; errores de carga con `Card` + `AdminNav`; `redirect` admin desde `@/i18n/navigation`.

En cada ítem: **solo** sustitución de primitivos y espaciado/tipografía; **no** abrir reglas de negocio nuevas.

#### Fase F (2026)

- **Hecho:** registro, proyectos, tarjeta y detalle de propiedad, dashboard, portafolio, **admin** (CRUD usuarios/propiedades, data, schema, nav).

---

## 5. Definición de “hecho” para la parte arquitectura del pago 2

- [x] `components.json` + al menos **5 primitivos** shadcn en uso real (no solo instalados) — *About + shell usan `card`, `button` / `buttonVariants`; resto disponible para Fase F.*
- [x] **About** publicado en ambos idiomas y enlazado.
- [x] Documento de convenciones: **este archivo** actualizado con rutas finales (`ui/`, alias) si cambiaron durante la implementación.
- [x] **Al menos dos** pantallas del inventario F pasan por pulido con el nuevo sistema (además de About) — *registro, proyectos, detalle, dashboard, portafolio.*
- [x] Build y lint sin errores nuevos relacionados con la migración.

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
| 2026-04-06 | **Fase B completada.** `shadcn init` + UI `button|input|label|textarea|card|separator`; tema y fuentes ajustados; build OK. Siguiente: Fase C (convenciones + decisión `Button` legacy) → Fase E About. |
| 2026-04-07 | **Fase C completada.** Convenciones y decisión `Button` legacy en §4 (“Convenciones acordadas”); puntero breve en `src/app/components/Button.jsx`. Siguiente: Fase D (shell), luego Fase E (About con `@/components/ui/button`). |
| 2026-04-08 | **Fases D y E completadas.** Shell: nav/footer/auth con `@/i18n/navigation` + tokens y `buttonVariants`/`Button`; layout `mt-[76px]`. About: `/{locale}/about`, `AboutPage` con `Card` + CTAs, mensajes EN/ES. Pendiente pago 2: **Fase F** (≥2 pantallas) y cierre de checklist §5. |
| 2026-04-09 | **Fase F (mayoría).** Registro, proyectos, `PropertyCard`, `PropertyDetailsClient`, dashboard y portafolio migrados a `@/components/ui` + `Link` i18n; namespaces `Register` y `Dashboard` en mensajes. |
| 2026-03-29 | **Fase F — admin.** Clientes admin + páginas `data`/`schema` con `Card` y tokens; errores server con `Card`; `adminFormClasses` para `<select>`; `redirect` localizado en rutas admin. |
