# LAN.BIC - LAZOARCE NEXUS

**Sistema Integral de Gestión Empresarial (SaaS Multi-Tenant)**  
**Propiedad de:** GRUPO LAZO ARCE SAS DE CV  
**Definición clave:** "SISTEMA DE GESTIÓN BIC" (CONEXIÓN DE INTELIGENCIA DE NEGOCIOS)

---

## 🚀 Descripción

**LAN.BIC** es una plataforma SaaS modular, segura y escalable que conecta todos los procesos empresariales en un solo lugar. Diseñada para micro, medianas y grandes empresas, permite personalizar dominio web y logotipo, con aislamiento total de datos entre inquilinos (multi-tenant).

---

## ✅ Características Principales

- **Multi-tenant:** Aislamiento total de datos con `tenant_id` en todas las tablas.
- **Dominio personalizado:** Cada empresa puede usar su propio dominio (ej: sistema.tuempresa.com).
- **Logotipo personalizado:** Carga de logotipo para mantener la identidad de marca.
- **Suscripciones por módulo:** Pago mensual o anual por módulos activos.
- **Prueba gratuita:** 15 días o 1 mes para evaluar el sistema.
- **Modelo On-Premise:** Opción de instalación local con licencia.
- **Integración con IA y automatización:** Compatible con n8n y Make.
- **Soporte regional:** Adaptado a normativas de El Salvador, Guatemala, Honduras, México y Colombia.

---

## 📦 Módulos Disponibles

La plataforma incluye **80 módulos funcionales**, entre los que destacan:

- **LAN-GP1:** Gestor de Préstamos
- **LAN-NR4:** Nómina Regional
- **LAN-F2C:** Formulación de Contratos (nuevo módulo)
- **LAN-FE2:** Facturación Electrónica
- **LAN-AGT5:** Asistente Multifuncional con n8n
- **LAN-FEV8:** Firma Electrónica Avanzada
- ... y muchos más.

> Para la lista completa de módulos, ver [docs/modules.md](docs/modules.md)

---

## 🛠️ Tecnologías

- **Backend:** Node.js, Express, PostgreSQL
- **Frontend:** React, Next.js
- **Mobile:** React Native (opcional)
- **Autenticación:** JWT, OAuth2
- **Base de datos:** PostgreSQL (con extensión UUID)
- **Infraestructura:** Docker, Kubernetes (opcional)
- **IA y automatización:** n8n, Make, OpenAI
- **Firma electrónica:** Certificados válidos por ley regional

---

## 📁 Estructura del Proyecto

```text
lan.bic/
├── backend/
│   ├── core/
│   ├── modules/
│   ├── shared/
│   └── database/
├── frontend/
├── mobile/
├── docs/
└── docker/
