# 🌸 Serena — Plataforma de Salud y Bienestar Femenino

![Angular](https://img.shields.io/badge/Angular-21.2-DD0031?style=flat-square&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9%20%7C%206.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=flat-square&logo=node.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?style=flat-square&logo=prisma&logoColor=white)
![MariaDB](https://img.shields.io/badge/Database-MariaDB%20%2F%20MySQL-003545?style=flat-square&logo=mariadb&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-green?style=flat-square)

Una solución integral diseñada para conectar a mujeres con profesionales de la salud y el bienestar femenino, facilitando la orientación personalizada, gestión de citas, seguimiento clínico y administración de servicios.

---

## 📑 Tabla de Contenidos

1. [Acerca del Proyecto](#-acerca-del-proyecto)
2. [Características Principales](#-características-principales)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Requisitos Previos](#-requisitos-previos)
6. [Instalación y Configuración](#-instalación-y-configuración)
7. [Cuentas de Demostración (Seed Data)](#-cuentas-de-demostración-seed-data)
8. [Endpoints de la API](#-endpoints-de-la-api)
9. [Scripts Disponibles](#-scripts-disponibles)
10. [Flujo del Sistema](#-flujo-del-sistema)

---

## 🌸 Acerca del Proyecto

**Serena** es una plataforma web integral enfocada en la salud física, hormonal, reproductiva y el bienestar emocional de las mujeres. Conecta usuarias con especialistas en áreas como:

- 🩺 **Ginecología y Obstetricia**
- 🧠 **Psicología y Bienestar Emocional**
- 🥗 **Nutrición y Hábitos Saludables**
- 🧘‍♀️ **Fisioterapia de Piso Pélvico**
- 👶 **Asesoría en Lactancia y Maternidad**
- 🔬 **Endocrinología y Sexología**

El sistema cuenta con tres perfiles de usuario (**Administrador**, **Profesional** y **Cliente**), cada uno con paneles, permisos y herramientas adaptadas a sus necesidades.

---

## ✨ Características Principales

### 🎯 1. Algoritmo de Coincidencia (Quiz "Profesional Ideal")
- Cuestionario guiado interactivo para identificar necesidades (edad, área de interés, presupuesto, ubicación y modalidad).
- Algoritmo de ponderación inteligente (`matching-algorithm.ts`) que evalúa y califica a los profesionales disponibles según especialidades, tarifas y localización, detallando las razones de la recomendación.

### 📅 2. Gestión Integral de Citas y Agenda Interactiva
- Calendario dinámico con integración de **FullCalendar** (vistas mensual, semanal, diaria y lista).
- Ciclo de vida de citas: *Pendiente* ➔ *Aceptada / Rechazada* ➔ *Completada / Cancelada*.
- **Control de Asistencia**: Registro de estados (*Asistió*, *No Asistió*, *Tardanza*, *Cancelada a última hora*).
- Historial de cambios de estado con trazabilidad y comentarios de auditoría.

### 👩‍⚕️ 3. Perfiles Profesionales y Catálogo de Servicios
- Búsqueda, filtrado por especialidad/categoría y detalle público de profesionales.
- Gestión de servicios por parte de los profesionales (precios, duración estimada, modalidad virtual/presencial/mixta).
- Generación y descarga de **fichas técnicas de servicios en PDF** mediante `pdfmake`.

### 🛡️ 4. Proceso de Acreditación y Validación Profesional
- Los usuarios con rol Cliente pueden postularse para ser Profesionales.
- Carga segura de atestados, credenciales y títulos (PDF o imágenes) procesados con `multer`.
- Panel para Administradores con visor de credenciales, aprobación o rechazo justificado.

### 📊 5. Panel de Reportes Estadísticos y Métricas
- Dashboard analítico con gráficos interactivos (**Chart.js**).
- Filtrado multidimensional por rangos de fecha, profesional y especialidad.
- Exportación formal de **reportes ejecutivos en PDF**.

### ⭐ 6. Reseñas, Calificaciones y Notificaciones
- Sistema de valoraciones con puntaje y comentarios posteriores a la atención.
- Centro de notificaciones en tiempo real para confirmaciones, reprogramaciones y avisos del sistema.

---

## 🛠️ Stack Tecnológico

### Backend (`/api`)
- **Entorno:** Node.js (v20+) con TypeScript
- **Framework Web:** Express.js (v5)
- **ORM & Base de Datos:** Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-mariadb`) con MariaDB / MySQL
- **Autenticación & Seguridad:** JWT (`jsonwebtoken`), Passport (`passport-jwt`, `passport-local`), Bcrypt
- **Validación:** Zod
- **Gestión de Archivos:** Multer
- **Logging:** Winston con rotación diaria (`winston-daily-rotate-file`) y Morgan

### Frontend (`/app`)
- **Framework:** Angular 21 (Arquitectura Standalone con Signals y Reactividad moderna)
- **Componentes UI:** Angular Material 21, CDK, SCSS personalizado
- **Calendario:** FullCalendar 7 (`@fullcalendar/angular`)
- **Gráficos & Visualización:** Chart.js
- **Generación de Documentos:** PDFMake
- **Alertas y Notificaciones:** ngx-sonner
- **Testing:** Vitest con JSDOM

---

## 📂 Estructura del Proyecto

```text
serena/
├── api/                             # Backend (Node.js + Express + Prisma)
│   ├── prisma/
│   │   ├── migrations/              # Migraciones de base de datos
│   │   ├── schema.prisma            # Modelo entidad-relación de Prisma
│   │   └── seed.ts                  # Datos iniciales y usuarios de prueba
│   ├── src/
│   │   ├── config/                  # Configuración de BD, Prisma y Logger
│   │   ├── controllers/             # Controladores REST
│   │   ├── dtos/                    # Esquemas Zod y DTOs
│   │   ├── middlewares/             # Autenticación, errores, subida de archivos
│   │   ├── routes/                  # Enrutamiento de endpoints
│   │   ├── services/                # Lógica de negocio
│   │   ├── utils/                   # Utilidades (JWT, respuestas HTTP, logs)
│   │   └── server.ts                # Servidor Express principal
│   ├── uploads/                     # Imágenes públicas
│   ├── uploadsPrivados/             # Documentos y credenciales de profesionales
│   └── package.json
│
├── app/                             # Frontend (Angular 21)
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                # Guards, interceptores, modelos y servicios base
│   │   │   ├── layout/              # Header, footer y layout principal
│   │   │   ├── pages/               # Vistas principales (Agenda, Auth, Citas, Home, etc.)
│   │   │   ├── services/            # Servicios de generación PDF
│   │   │   ├── shared/              # Componentes reutilizables (Notificaciones, etc.)
│   │   │   └── app.routes.ts        # Definición de rutas protegidas por roles
│   │   ├── environments/            # Variables de entorno
│   │   └── styles.css               # Estilos globales
│   ├── angular.json
│   └── package.json
└── README.md
