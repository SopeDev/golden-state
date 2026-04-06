---
name: Plan de entrega en 10 pagos
overview: "Plan en español: pago 2 = Quiénes somos + pulido + arquitectura; pago 3 = landing, idioma, FAQ, contacto y resto de navegación; analítica y publicación en pago 10."
todos:
  - id: payment-2
    content: "Página Quiénes somos (About) bilingüe; pulido de pantallas ya existentes; arquitectura front + shadcn/Magic alineados a reglas Cursor"
    status: pending
  - id: payment-3
    content: "Landing bilingüe; idioma por ubicación; FAQ y contacto con formulario; menú y pie sin enlaces rotos; terminados vs en desarrollo si aplica"
    status: pending
  - id: payment-4
    content: Registro e inicio de sesión listos para producción (correo y/o aprobación del admin)
    status: pending
  - id: payment-5
    content: Estado del proyecto, porcentaje de avance y fechas en la web y en el panel admin
    status: pending
  - id: payment-6
    content: Subida real de imágenes y documentos; descarga segura para inversionistas
    status: pending
  - id: payment-7
    content: "Herramientas admin para asignar inversiones: depósito bancario y confirmación manual"
    status: pending
  - id: payment-8
    content: Notificaciones de avances (en plataforma; correo opcional)
    status: pending
  - id: payment-9
    content: Pagos a inversionistas, historial y base para reinversión (versión inicial)
    status: pending
  - id: payment-10
    content: "Publicación / salida del sitio: Google Analytics (u otra analítica), métricas, SEO y metadatos para compartir en redes alineados al go-live"
    status: pending
  - id: stretch-roles
    content: "Opcional: roles contador y moderador con permisos distintos"
    status: pending
---

# Plan de trabajo — Plataforma de inversiones Golden State

Copia viva del plan de entregas mensuales (pagos 2–10). Actualizar este archivo en el repo cuando cambie el alcance o el orden.

Este documento resume **qué se acordó en la cotización**, **qué cubre el primer anticipo** (base del producto por detrás del sitio público) y **cómo organizamos el resto en nueve entregas mensuales** (pagos 2 a 10). La página **Quiénes somos** corresponde al **pago 2**. La **página de inicio** pública, **FAQ**, **contacto**, **navegación completa** e **idioma sugerido por ubicación** corresponden al **pago 3**. El **pago 10** agrupa **analítica** (p. ej. Google Analytics), **métricas**, **SEO** y **metadatos para redes**, junto con el **cierre de publicación** del sitio.

El precio total y la forma de pago que firmamos no cambian: lo que sigue es **cómo repartimos el alcance** en esas nueve entregas.

---

## Lo que contempla el proyecto (recordatorio)

Según lo acordado, la plataforma debe permitir que los inversionistas:

- conozcan el modelo y los proyectos disponibles;
- consulten el avance de cada proyecto;
- tengan un **tablero personal** con su portafolio;
- reciban **actualizaciones** y, en su momento, vean **pagos / historial** y opciones ligadas a **reinvertir**.

Y el equipo administrativo debe poder:

- crear y editar proyectos, con imágenes y documentos, **estado** y **porcentaje de avance**;
- administrar inversionistas, **asignar proyectos**, ver portafolios y **ajustar montos** cuando corresponda;
- **notificar** sobre cambios o avances.

Además: los depósitos se registran **por transferencia bancaria** y la **confirmación es manual** (sin pasarela de pago en línea).

---

## Lo que ya quedó cubierto (equivale al primer pago)

El **primer pago** cubrió la **base del producto** en código: pantallas recorribles, APIs y base de datos. **Todas estas piezas siguen abiertas a refinamiento** según feedback del cliente (copy, flujo, diseño y prioridades); el **pago 2** incluye explícitamente **pulido** de lo existente.

### Inventario alineado con el repositorio actual

**Público / inversionista**

- **Listado de proyectos** (`/projects`) — galería alimentada por base de datos.
- **Ficha de propiedad / proyecto** (`/properties/[id]`) — detalle por `investmentId`.
- **Registro** (`/register`) — **formulario placeholder**; falta experiencia de **onboarding** completa (**pago 4** en este plan).
- **Inicio de sesión** — NextAuth (credenciales y, si está configurado, Google); flujo estándar de sesión.
- **Tablero del inversionista** (`/dashboard`) — entrada mínima al área privada.
- **Portafolio** (`/dashboard/portfolio`) — listado de inversiones del usuario y totales (aparte del tablero resumen).
- **Inicio del sitio** (`/`) bajo `/{locale}` — contenido en plantilla; la **landing definitiva** y el resto de **sitio informativo** van en **pagos 2 y 3** según este calendario.

**Administración**

- **Usuarios / inversionistas** — alta, edición y baja desde el panel admin + API.
- **Propiedades / proyectos** — alta, edición y baja desde el panel admin + API (imágenes hoy como URLs en formulario; archivos reales en **pago 6**).
- **Vista de datos** (`/admin/data`) — resumen legible de propiedades, usuarios e inversiones existentes en BD (no sustituye herramientas de **asignación de inversiones** del **pago 7**).
- **Esquema / documentación interna** (`/admin/schema`) — referencia del modelo de datos para el equipo.

**Detrás de escena**

- **PostgreSQL + Prisma** — modelos `User`, `Property`, `Investment` y relaciones.
- Rutas API de **registro**, **admin/usuarios** y **admin/propiedades**.

**Qué todavía no hay como producto (y está en pagos posteriores del plan)**

- Crear o editar **inversiones** (asignar proyecto + monto a un usuario) desde el admin — hoy suele depender de **datos semilla** u operación directa en BD; **pago 7**.
- **Quiénes somos**, **FAQ**, **contacto**, **navegación cerrada** en menú/pie, enlaces huérfanos — **pagos 2 y 3**.

La página **Quiénes somos** se entrega en el **pago 2**. La **landing principal** (inicio del sitio público, cotizada en la Fase 1) **aún no forma parte de lo recibido**: va en el **pago 3**, junto con **FAQ**, **contacto** y el cierre de **navegación**; allí también va **idioma sugerido por ubicación**. **Analítica, métricas y el paquete SEO / redes para el lanzamiento** se entregan en el **pago 10**, con el cierre de **publicación** del sitio.

En conjunto: ya existe la **base técnica** y el recorrido de proyectos y panel; falta el **sitio informativo completo** (incluida la home pública), el resto de la **Fase 1** en la página y, más adelante, lo de la cotización como **producto terminado** y **operación diaria**.

---

## Qué es lo que aún falta (resumen claro)

El **inventario superior** ya refleja lo construido; puede **cambiar de forma y prioridad** con el cliente. Lo que sigue es lo que **aún no cierra** el alcance de la cotización u ordena los siguientes pagos:

- **Quiénes somos:** página **About** pública, **en español e inglés** (**pago 2**).
- **Página de inicio (landing):** primera versión en el entorno acordado, con contenido y línea visual de Golden State, **bilingüe** (**pago 3**).
- **FAQ, contacto y navegación:** enlaces del **menú y pie** sin rutas rotas, sección de **preguntas frecuentes** y **formulario de contacto** (**pago 3**). **Proyectos terminados vs en desarrollo** (filtros o secciones) también en el **pago 3**, junto con lo anterior.
- **Pulido de lo ya construido** (proyectos, detalle, registro, tablero, portafolio, admin): **pago 2**.
- **Base de implementación:** alinear el front con **shadcn**, **Magic MCP** y las **reglas de Cursor** del proyecto (**pago 2**).
- **Idioma (por ubicación):** además de la selección manual que ya existe, el comportamiento de **idioma sugerido según ubicación** (**pago 3**, junto con la landing).
- **Publicación, analítica y visibilidad en buscadores y redes:** **Google Analytics** u otra herramienta de **métricas**, **títulos y descripción**, **SEO** y **vista al compartir** en redes, en el marco del **cierre de publicación** (**pago 10**).
- **Registro:** formulario y proceso de alta **pulidos** y acordes a “validación por correo o por administrador”.
- **Seguimiento del proyecto:** **estado** (planeación, desarrollo, completado), **porcentaje de avance** y **fechas** visibles para el inversionista.
- **Archivos reales:** subida de **documentos** (no solo textos en formulario) y **descargas** seguras desde el portafolio o la ficha del proyecto.
- **Operación de inversiones:** desde el admin, **asignar** un proyecto a un inversionista y **registrar o editar montos** sin depender solo de datos de prueba.
- **Depósitos:** flujo de “**avisé mi depósito**” y **confirmación manual por el admin**.
- **Notificaciones:** avisos de actualización a los inversionistas.
- **Dividendos e historial** (y base para **reinvertir** en una primera versión).
- **Roles extra** (contador, moderador) con permisos distintos, si se mantienen en el alcance; puede programarse al final o como extensión.

---

## Calendario sugerido: nueve entregas mensuales (pagos 2 a 10)

Cada bloque está pensado para **un mes y un pago**, en el orden que permite ir construyendo sin bloqueos técnicos.

### Pago 2 — Quiénes somos, pulido de lo existente y base de arquitectura

**Qué entregamos (lado cliente / producto)**

- **Quiénes somos:** página **About** acorde a la cotización, **en español e inglés**, con ruta enlazada desde el menú y el pie (p. ej. `/about`).
- **Afinado de pantallas que ya existen:** revisión de UX/UI y consistencia en páginas como **proyectos**, **detalle de propiedad**, **registro**, **tablero**, **portafolio** y **admin**, sin abrir todavía funcionalidades grandes de fases posteriores.

**Trabajo técnico (equipo de desarrollo)**

- **Arquitectura del proyecto:** repaso y ajuste de la estructura del front para que lo nuevo y lo retocado sigan un mismo criterio (componentes, carpetas, patrones de datos y estilos).
- **Herramientas actuales del equipo:** uso de **shadcn** y referencias **Magic MCP** según las **reglas de Cursor** vigentes del proyecto (las que no existían al arranque de este repo), de forma que el código quede alineado con ese estándar antes de seguir construyendo pantallas grandes.
- Plan operativo detallado (fases, checklist, definición de hecho): [FASE_2_ARQUITECTURA_SHADCN.md](FASE_2_ARQUITECTURA_SHADCN.md).

**Qué verán ustedes**

La sección **Quiénes somos** ya publicada y las pantallas existentes **más consistentes**. **FAQ**, **contacto**, **landing**, **resto de enlaces del sitio** y **terminados / en desarrollo** forman parte del **pago 3**.

---

### Pago 3 — Landing, FAQ, contacto, navegación e idioma

**Qué entregamos**

- **Página de inicio:** la **primera versión** de la landing principal que ustedes verán en la web pública, alineada a la cotización (captación, mensaje claro del modelo, llamados a la acción), **en español e inglés**, publicada bajo `/{idioma}` en el entorno en vivo acordado.
- **Preguntas frecuentes (FAQ)** y **Contacto** con formulario (aviso por correo o guardado en sistema según lo definamos), **bilingües**.
- **Enlaces y rutas:** el resto de enlaces del **menú y pie** que sigan pendientes (páginas reales o redirecciones acordadas) quedan **operativos**, sin rutas rotas.
- **Proyectos terminados vs en desarrollo:** filtros, pestañas o secciones en el listado público, cuando aplique.
- **Idioma inicial según ubicación** (respetando la elección manual del visitante).

**Qué verán ustedes**

**Home** pública, secciones de **FAQ** y **contacto**, **sitio navegable en conjunto** con **Quiénes somos** ya entregado, y comportamiento **bilingüe con sugerencia por ubicación**, según lo prometido en la cotización.

---

### Pago 4 — Registro e inicio de sesión de nivel producción

**Qué entregamos**

- Formulario de registro **completo**: mensajes claros, validaciones y experiencia de usuario profesional.
- Flujo de **validación** acordado: por **correo electrónico** o **aprobación del administrador** antes de que un inversionista opere (o la combinación que definamos).

**Qué verán ustedes**

Un proceso de alta e ingreso **confiable** y alineado con lo descrito en la cotización.

---

### Pago 5 — Estado y avance de cada proyecto

**Qué entregamos**

- En cada proyecto: **estado** (planeación, en desarrollo, completado), **porcentaje de avance** y **fechas** relevantes.
- El administrador podrá actualizar estos datos; el inversionista los verá en la **ficha del proyecto** y en su **portafolio** cuando corresponda.
- Listados públicos que permitan distinguir **terminados** y **en curso**.

**Qué verán ustedes**

Cumplimiento directo de la promesa: **“consultar el progreso de los proyectos”**.

---

### Pago 6 — Imágenes y documentos como archivos reales

**Qué entregamos**

- Posibilidad de **subir archivos** (imágenes y documentos) desde el panel administrativo.
- Enlaces de **descarga seguros** para inversionistas con derecho a esa información (por ejemplo desde el portafolio o la ficha del proyecto).

**Qué verán ustedes**

Misma idea que en la cotización: **material de proyecto** disponible de forma controlada, no solo texto pegado en formularios.

---

### Pago 7 — Asignación de inversiones y depósito bancario con confirmación manual

**Qué entregamos**

- Herramientas para que el administrador **registre o modifique** la relación inversionista–proyecto–monto, con reglas claras (mínimos, duplicados, etc.).
- Flujo para que el inversionista **declare un depósito** (monto, referencia, fecha) y el administrador **confirme** o rechace, **sin integración de pagos en línea**.

**Qué verán ustedes**

El **núcleo operativo**: el portafolio refleja la realidad negocial que ustedes validen manualmente.

---

### Pago 8 — Notificaciones de avances

**Qué entregamos**

- Un sistema de **avisos** cuando haya novedades en un proyecto o para un grupo de inversionistas.
- **Centro de notificaciones** (o similar) para el inversionista y herramienta para el admin para **publicar actualizaciones**.
- Opcional en esta etapa: que el mismo aviso **también llegue por correo**, si lo incluimos en el mismo entregable o como complemento.

**Qué verán ustedes**

Cumplimiento de **“notificar a los usuarios sobre avances o cambios”**.

---

### Pago 9 — Pagos al inversionista, historial y base para reinvertir

**Qué entregamos**

- Registro de **distribuciones o pagos** asociados a cada inversión (monto, fecha, concepto).
- Pantallas para que el inversionista vea **historial** y resúmenes en su tablero.
- **Primera versión** de lo relativo a **reinvertir**: por ejemplo solicitud registrada o anotación administrativa (la versión totalmente automática puede quedar como evolución futura si así lo acordamos).

**Qué verán ustedes**

Transparencia en **resultados e historial**, y punto de partida para **reinversión** según la cotización.

---

### Pago 10 — Publicación del sitio, analítica y métricas

**Qué entregamos**

- **Google Analytics** (GA4 u otra analítica acordada), configurada para medir visitas y comportamiento en la **publicación** del sitio.
- Cualquier otro **tag o panel de métricas** que acordemos para ese mismo cierre de **lanzamiento**.
- Ajustes finales de **títulos, descripción, SEO** y **vista al compartir en redes** (Open Graph, etc.) alineados a la **salida oficial** del producto.
- Revisión breve de **checklist de publicación** (entorno de producción, dominio, etc.) en la medida que corresponda al contrato.

**Qué verán ustedes**

El sitio **medible** para el público y **presentado de forma profesional** en buscadores y redes, en el momento en que el proyecto se considera **publicado**, después de cerrar las funcionalidades de los pagos anteriores.

---

## Opcional (alcance adicional o mes siguiente)

- **Roles de contador y moderador** con permisos distintos al administrador principal, si se mantienen en el contrato y se reserva tiempo o presupuesto.

---

## Cómo se agrupan las entregas (visión por etapas de la cotización original)

- **Pagos 2 y 3:** **Fase 1** en sitio visible (**pago 2:** **Quiénes somos**, pulido de lo existente, base shadcn/Magic/reglas Cursor; **pago 3:** landing, **FAQ**, **contacto**, menú y pie **sin enlaces rotos**, terminados/en desarrollo, idioma por ubicación).
- **Pagos 4 a 7:** núcleo de la **Fase 2** (acceso seguro, avance de proyectos, archivos, operación de inversiones y depósitos).
- **Pagos 8 y 9:** **comunicación** y **visibilidad financiera** (notificaciones, historial, base de reinversión).
- **Pago 10:** **cotización / extensión de Fase 1** en su parte de **analítica**: mediciones y metadatos de **lanzamiento**, junto con el cierre orientado a **publicación**.

---

## Nota comercial breve

La cotización original describía dos fases grandes y un calendario distinto; el acuerdo actual (**diez pagos**) es una **forma de pago** para facilitar el flujo de caja. Este plan **no sustituye el contrato ni el monto cerrado**; solo ordena el trabajo pendiente para que mes a mes haya entregas claras y verificables.

Si desean, en la siguiente reunión podemos **marcar con fecha** cada pago 2–10 o ajustar el orden de un mes según prioridad de negocio, siempre que no rompa dependencias (por ejemplo, el registro sólido antes de flujos sensibles de dinero).

```mermaid
flowchart LR
  subgraph entregado [Pago1_completado]
    A[Base_tecnica]
    B[Proyectos_y_fichas]
    C[Acceso_y_portafolio_basico]
    D[Admin_usuarios_y_proyectos]
  end
  subgraph pendiente [Pagos2_al_10]
    E[Quienes_somos_pulido_arch]
    F[Landing_FAQ_contacto_nav_idioma]
    G[Registro_produccion]
    H[Estado_y_avance]
    I[Archivos_y_descargas]
    J[Inversiones_y_depositos]
    K[Notificaciones]
    L[Historial_y_reinvertir]
    M[Publicacion_analitica_SEO]
  end
  entregado --> pendiente
```
