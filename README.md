# fashionsearch

Buscador semántico de ropa que indexa múltiples tiendas argentinas y permite buscar por descripción en lenguaje natural. El backend scrapea los catálogos, clasifica los productos con IA y expone una API de búsqueda. El frontend es una SPA en React.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| Base de datos | PostgreSQL (prod) |
| IA | Claude (Anthropic) |
| Autenticación | JWT manual (stdlib, sin dependencias extra) |

---

## Estructura del proyecto

```
fashionsearch/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py          # JWT + endpoint /auth/login + dependencia require_admin
│   │   │   ├── routes.py        # Endpoints principales
│   │   │   └── ai_routes.py     # Endpoints de clasificación IA
│   │   ├── core/
│   │   │   ├── config.py        # Settings (pydantic-settings, lee del .env)
│   │   │   └── database.py
│   │   ├── models/
│   │   │   ├── models.py
│   │   │   └── schemas.py
│   │   └── services/
│   │       ├── scraping_service.py
│   │       ├── search_service.py
│   │       ├── enrichment_service.py
│   │       └── ai_classifier.py
│   ├── main.py
│   ├── requirements.txt
│   └── .env                     
│
└── frontend/
    └── src/
        ├── App.jsx              
        ├── styles/
        │   └── app.css
        ├── lib/
        │   └── api.js           
        ├── hooks/
        │   ├── useAuth.js       
        │   ├── useToast.js
        │   └── useAutoRefresh.js
        ├── views/
        │   ├── SearchView.jsx
        │   ├── StoresView.jsx   
        │   └── StatsView.jsx
        └── components/
            ├── LoginModal.jsx
            ├── Toast.jsx
            ├── ProductCard.jsx
            ├── ProductModal.jsx
            ├── VariantModal.jsx
            ├── StoreRow.jsx     
            └── AddStoreModal.jsx
```

---

## Instalación

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt


ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=sqlite:///./fashion_search.db


python -c "import secrets; print(secrets.token_hex(32))"
```

Iniciar el servidor:
```bash
uvicorn main:app --reload
# Disponible en http://localhost:8000
# Docs en http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Disponible en http://localhost:5173
```

---

## Autenticación

La app tiene dos niveles de acceso:

**Usuario anónimo** — puede buscar productos, ver tiendas y estadísticas. No ve ningún control de administración.

**Administrador** — accede con usuario y contraseña desde el botón "Administrador" en la barra de navegación. Con sesión activa puede:
- Agregar / eliminar tiendas
- Ejecutar scraping por tienda o de todas a la vez
- Enriquecer (clasificar con IA) productos pendientes

### Cómo funciona

El backend expone `POST /api/auth/login` que valida las credenciales contra `ADMIN_USERNAME` y `ADMIN_PASSWORD` del `.env` y devuelve un JWT con 8 horas de validez.

El JWT se implementa con HMAC-SHA256 usando solo la stdlib de Python — sin dependencias externas como `python-jose` o `passlib`.

El frontend guarda el token **en memoria** (variable de módulo en `api.js`), nunca en `localStorage`. El token se pierde al cerrar la pestaña. Todos los requests al backend incluyen el header `Authorization: Bearer <token>` automáticamente si hay sesión activa.

Los endpoints protegidos usan la dependencia `require_admin`:
```python
@router.post("/scrape/{store_id}")
def scrape_store(store_id: int, db=Depends(get_db), _=Depends(require_admin)):
    ...
```

**Endpoints públicos** (sin autenticación):
- `GET /api/stores`
- `POST /api/search`
- `GET /api/stats`
- `GET /api/enrich/status`
- `GET /api/ai/stats`

**Endpoints protegidos** (requieren token admin):
- `POST /api/stores`
- `DELETE /api/stores/{id}`
- `POST /api/scrape/{id}`
- `POST /api/scrape-all`
- `POST /api/enrich`
- `POST /api/enrich/{id}`
- `POST /api/ai/classify/{id}`
- `POST /api/ai/classify-pending`

---

## Auto-refresh

Las vistas se actualizan solas sin recargar la página. El hook `useAutoRefresh(fn, intervalMs, active)` llama a `fn` al montar y cada `intervalMs` ms mientras `active` sea `true`. Al cambiar de tab, el intervalo anterior se cancela.

| Vista | Qué refresca | Intervalo |
|-------|-------------|-----------|
| Buscar | Productos y tiendas | 60s / 20s |
| Tiendas | Lista de tiendas + estado de enriquecimiento | 20s / 15s |
| Stats | Estadísticas globales | 30s |

---

## Flujo de uso

### Primera vez

1. Iniciar backend y frontend
2. Ir a **Tiendas** → Administrador → iniciar sesión
3. Agregar una tienda con su URL de catálogo
4. Hacer clic en **⟳** para scrapear la tienda
5. Hacer clic en **✦ Enriquecer** para clasificar los productos con IA
6. Ir a **Buscar** y probar con descripciones en lenguaje natural

### Búsqueda

La búsqueda es semántica: funciona con descripciones como "campera de cuero negra para el invierno" o "remera de algodón lisa". Se puede filtrar por categoría, color, género y rango de precio. Al tocar una tienda en el sidebar izquierdo se filtra automáticamente sin necesidad de hacer clic en Buscar.

---

## Deploy a producción

### Backend

```bash
# Con gunicorn
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

Recordá configurar en el `.env` del servidor:
- `DATABASE_URL` apuntando a PostgreSQL
- `ADMIN_PASSWORD` con una contraseña segura
- `SECRET_KEY` generado con `secrets.token_hex(32)`

### Frontend

```bash
npm run build
# Los archivos estáticos quedan en dist/
# Servir con nginx, Caddy, o cualquier CDN
```

Configurar `API_BASE` en `src/lib/api.js` apuntando al dominio del backend en producción.

### CORS

En `main.py` asegurate de configurar los orígenes permitidos:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tu-dominio.com"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## API — referencia rápida

```
POST   /api/auth/login              Login admin → { token, expires_in }
GET    /api/auth/me                 Verificar token activo

GET    /api/stores                  Listar tiendas
POST   /api/stores          🔒      Agregar tienda
DELETE /api/stores/{id}     🔒      Eliminar tienda

POST   /api/search                  Buscar productos
GET    /api/stats                   Estadísticas globales

POST   /api/scrape/{id}     🔒      Scrapear una tienda
POST   /api/scrape-all      🔒      Scrapear todas las tiendas activas

GET    /api/enrich/status           Estado de clasificación (por tienda)
POST   /api/enrich          🔒      Clasificar productos pendientes (batch)
POST   /api/enrich/{id}     🔒      Clasificar pendientes de una tienda

GET    /api/ai/stats                Progreso de clasificación IA
POST   /api/ai/classify/{id} 🔒     Clasificar un producto específico
```

🔒 = requiere `Authorization: Bearer <token>`