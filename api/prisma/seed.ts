import { prisma } from "../src/config/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("Iniciando seed Serena...");

  const models = [
    prisma.bitacora,
    prisma.notificacion,
    prisma.asistenciaCita,
    prisma.resena,
    prisma.historialEstadoCita,
    prisma.cita,

    prisma.solicitudProfesionalEspecialidad,
    prisma.solicitudProfesional,

    prisma.servicioEspecialidad,
    prisma.servicio,

    prisma.profesionalEspecialidad,

    prisma.especialidad,
    prisma.tipoEspecialidad,
    prisma.estadoTipoEspecialidad,

    prisma.perfilProfesional,
    prisma.usuario,
    prisma.ubicacion,
    prisma.estadoServicio,
    prisma.estadoEspecialidad,
    prisma.estadoCita,

    prisma.modalidad,
    prisma.estadoUsuario,
    prisma.rol,
  ];

  for (const model of models) {
    await (model as any).deleteMany();
  }

  await prisma.rol.createMany({
    data: [
      { nombre: "Administrador", descripcion: "Gestiona todo el sistema Serena" },
      { nombre: "Profesional", descripcion: "Ofrece servicios de salud y bienestar femenino" },
      { nombre: "Cliente", descripcion: "Agenda citas y consulta servicios" },
    ],
  });

  await prisma.estadoUsuario.createMany({
    data: [
      { nombre: "Activo", descripcion: "Usuario habilitado" },
      { nombre: "Inactivo", descripcion: "Usuario deshabilitado" },
    ],
  });

  await prisma.estadoServicio.createMany({
    data: [
      { nombre: "Activo", descripcion: "Servicio disponible" },
      { nombre: "Inactivo", descripcion: "Servicio no disponible" },
    ],
  });

  await prisma.estadoEspecialidad.createMany({
    data: [
      { nombre: "Activa", descripcion: "Especialidad disponible" },
      { nombre: "Inactiva", descripcion: "Especialidad no disponible" },
    ],
  });

  await prisma.estadoCita.createMany({
    data: [
      { nombre: "Pendiente", descripcion: "Cita registrada pendiente de aprobación" },
      { nombre: "Aceptada", descripcion: "Cita aceptada por el profesional" },
      { nombre: "Rechazada", descripcion: "Cita rechazada por el profesional" },
      { nombre: "Cancelada", descripcion: "Cita cancelada" },
      { nombre: "Completada", descripcion: "Cita finalizada" },
    ],
  });

  await prisma.modalidad.createMany({
    data: [
      { nombre: "Virtual", descripcion: "Atención en línea" },
      { nombre: "Presencial", descripcion: "Atención en consultorio" },
      { nombre: "Mixta", descripcion: "Atención virtual y presencial" },
    ],
  });

  // 1. Crear estados
  await prisma.estadoTipoEspecialidad.createMany({
    data: [
      { nombre: "Activa", descripcion: "Tipo de especialidad disponible" },
      { nombre: "Inactiva", descripcion: "Tipo de especialidad no disponible" },
    ],
  });

  // 2. Recuperar estados
  const estadosTipoEspecialidad = await prisma.estadoTipoEspecialidad.findMany();

  // 3. Crear mapa
  const estadoTipoEspecialidadMap = Object.fromEntries(
    estadosTipoEspecialidad.map((estado) => [estado.nombre, estado.id])
  );

  // 4. Crear tipos (categorías)
  await prisma.tipoEspecialidad.createMany({
    data: [
      {
        nombre: "Salud femenina",
        descripcion:
          "Áreas de acompañamiento relacionadas con la salud física, hormonal y reproductiva de la mujer",
        estadoTipoEspecialidadId: estadoTipoEspecialidadMap["Activa"],
      },
      {
        nombre: "Bienestar emocional",
        descripcion:
          "Acompañamiento psicológico y emocional para fortalecer la salud mental y el bienestar personal",
        estadoTipoEspecialidadId: estadoTipoEspecialidadMap["Activa"],
      },
      {
        nombre: "Nutrición y hábitos saludables",
        descripcion:
          "Orientación nutricional y acompañamiento para desarrollar hábitos saludables adaptados a cada mujer",
        estadoTipoEspecialidadId: estadoTipoEspecialidadMap["Activa"],
      },
      {
        nombre: "Fertilidad y maternidad",
        descripcion:
          "Acompañamiento durante procesos de fertilidad, embarazo, maternidad y etapas relacionadas",
        estadoTipoEspecialidadId: estadoTipoEspecialidadMap["Activa"],
      },
      {
        nombre: "Bienestar integral",
        descripcion:
          "Servicios enfocados en el equilibrio físico, emocional y personal mediante enfoques complementarios",
        estadoTipoEspecialidadId: estadoTipoEspecialidadMap["Activa"],
      },
      {
        nombre: "Educación femenina",
        descripcion:
          "Información y orientación sobre salud reproductiva, sexualidad y desarrollo femenino",
        estadoTipoEspecialidadId: estadoTipoEspecialidadMap["Activa"],
      },
    ],
  });

  const [tiposEspecialidad, estadosEspecialidad] = await Promise.all([
    prisma.tipoEspecialidad.findMany(),
    prisma.estadoEspecialidad.findMany(),
  ]);

  const tipoEspecialidadMap = Object.fromEntries(
    tiposEspecialidad.map((tipo) => [tipo.nombre, tipo.id])
  );

  const estadoEspecialidadMap = Object.fromEntries(
    estadosEspecialidad.map((estado) => [estado.nombre, estado.id])
  );

  await prisma.especialidad.createMany({
    data: [
      {
        nombre: "Ginecología",
        descripcion: "Atención especializada en salud integral femenina",
        tipoEspecialidadId: tipoEspecialidadMap["Salud femenina"],
        estadoEspecialidadId: estadoEspecialidadMap["Activa"],
      },
      {
        nombre: "Obstetricia",
        descripcion: "Control y acompañamiento durante el embarazo",
        tipoEspecialidadId: tipoEspecialidadMap["Salud femenina"],
        estadoEspecialidadId: estadoEspecialidadMap["Activa"],
      },
      {
        nombre: "Psicología",
        descripcion: "Acompañamiento emocional y psicológico",
        tipoEspecialidadId: tipoEspecialidadMap["Bienestar emocional"],
        estadoEspecialidadId: estadoEspecialidadMap["Activa"],
      },
      {
        nombre: "Nutrición",
        descripcion: "Orientación nutricional para el bienestar integral",
        tipoEspecialidadId: tipoEspecialidadMap["Bienestar integral"],
        estadoEspecialidadId: estadoEspecialidadMap["Activa"],
      },
      {
        nombre: "Endocrinología",
        descripcion: "Atención de condiciones hormonales y metabólicas",
        tipoEspecialidadId: tipoEspecialidadMap["Salud femenina"],
        estadoEspecialidadId: estadoEspecialidadMap["Activa"],
      },
      {
        nombre: "Fisioterapia de piso pélvico",
        descripcion: "Prevención y rehabilitación del piso pélvico",
        tipoEspecialidadId: tipoEspecialidadMap["Bienestar integral"],
        estadoEspecialidadId: estadoEspecialidadMap["Activa"],
      },
      {
        nombre: "Asesoría en lactancia",
        descripcion: "Orientación y acompañamiento durante la lactancia",
        tipoEspecialidadId: tipoEspecialidadMap["Bienestar integral"],
        estadoEspecialidadId: estadoEspecialidadMap["Activa"],
      },
      {
        nombre: "Sexología",
        descripcion: "Acompañamiento profesional en salud sexual femenina",
        tipoEspecialidadId: tipoEspecialidadMap["Bienestar emocional"],
        estadoEspecialidadId: estadoEspecialidadMap["Inactiva"],
      },
    ],
  });

  await prisma.ubicacion.createMany({
    data: [
      { provincia: "San José", canton: "Central", distrito: "Carmen" },
      { provincia: "Alajuela", canton: "Central", distrito: "Alajuela" },
      { provincia: "Heredia", canton: "Central", distrito: "Heredia" },
      { provincia: "Cartago", canton: "Central", distrito: "Oriental" },
      { provincia: "Puntarenas", canton: "Corredores", distrito: "Paso Canoas" },
      { provincia: "Virtual", canton: "Virtual", distrito: "Virtual" },
    ],
  });

  // ======================================================
  // ROLES Y ESTADOS DE USUARIO
  // ======================================================

  const [roles, estadosUsuario] = await Promise.all([
    prisma.rol.findMany(),
    prisma.estadoUsuario.findMany(),
  ]);

  const rolMap = Object.fromEntries(roles.map((r) => [r.nombre, r.id]));
  const estadoUsuarioMap = Object.fromEntries(estadosUsuario.map((e) => [e.nombre, e.id]));

  const hashPassword = await bcrypt.hash("123456", 10);

  // ======================================================
  // USUARIOS: 1 admin + 10 profesionales + 44 clientes = 55
  // ======================================================

  const adminData = {
    nombre: "Administrador",
    apellidos: "Serena",
    correo: "admin@serena.com",
    password: hashPassword,
    telefono: "88880000",
    edad: 35,
    rolId: rolMap["Administrador"],
    estadoUsuarioId: estadoUsuarioMap["Activo"],
  };

  const profesionalesData = [
    { nombre: "Sofía", apellidos: "Ramírez", correo: "sofia@serena.com", telefono: "88881111", edad: 38 },
    { nombre: "Valeria", apellidos: "Mora", correo: "valeria@serena.com", telefono: "88882222", edad: 32 },
    { nombre: "Camila", apellidos: "Jiménez", correo: "camila@serena.com", telefono: "88883333", edad: 41 },
    { nombre: "Andrea", apellidos: "Vargas", correo: "andrea@serena.com", telefono: "88884444", edad: 45 },
    { nombre: "María", apellidos: "Solís", correo: "maria@serena.com", telefono: "88885555", edad: 36 },
    { nombre: "Gabriela", apellidos: "Castro", correo: "gabriela@serena.com", telefono: "88889001", edad: 34 },
    { nombre: "Fernanda", apellidos: "Rojas", correo: "fernanda@serena.com", telefono: "88889002", edad: 29 },
    { nombre: "Paola", apellidos: "Méndez", correo: "paola@serena.com", telefono: "88889003", edad: 40 },
    { nombre: "Karen", apellidos: "Alvarado", correo: "karen@serena.com", telefono: "88889004", edad: 37 },
    { nombre: "Silvia", apellidos: "Chacón", correo: "silvia@serena.com", telefono: "88889005", edad: 48 },
  ].map((p) => ({
    ...p,
    password: hashPassword,
    rolId: rolMap["Profesional"],
    estadoUsuarioId: estadoUsuarioMap["Activo"],
  }));

const clientesData = [
  { nombre: "Laura", apellidos: "Chacón", correo: "laura.chacon@serena.com", password: hashPassword, telefono: "88991000", edad: 20, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Daniela", apellidos: "Solano", correo: "daniela.solano@serena.com", password: hashPassword, telefono: "88991001", edad: 21, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Melissa", apellidos: "Brenes", correo: "melissa.brenes@serena.com", password: hashPassword, telefono: "88991002", edad: 22, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Natalia", apellidos: "Quirós", correo: "natalia.quiros@serena.com", password: hashPassword, telefono: "88991003", edad: 23, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Carolina", apellidos: "Salazar", correo: "carolina.salazar@serena.com", password: hashPassword, telefono: "88991004", edad: 24, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Adriana", apellidos: "Cordero", correo: "adriana.cordero@serena.com", password: hashPassword, telefono: "88991005", edad: 25, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Vanessa", apellidos: "Villalobos", correo: "vanessa.villalobos@serena.com", password: hashPassword, telefono: "88991006", edad: 26, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Priscilla", apellidos: "Fallas", correo: "priscilla.fallas@serena.com", password: hashPassword, telefono: "88991007", edad: 27, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Mariana", apellidos: "Araya", correo: "mariana.araya@serena.com", password: hashPassword, telefono: "88991008", edad: 28, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Ivannia", apellidos: "Miranda", correo: "ivannia.miranda@serena.com", password: hashPassword, telefono: "88991009", edad: 29, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Xinia", apellidos: "Zúñiga", correo: "xinia.zuniga@serena.com", password: hashPassword, telefono: "88991010", edad: 30, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Yendry", apellidos: "Sánchez", correo: "yendry.sanchez@serena.com", password: hashPassword, telefono: "88991011", edad: 31, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Grettel", apellidos: "Barrantes", correo: "grettel.barrantes@serena.com", password: hashPassword, telefono: "88991012", edad: 32, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Tatiana", apellidos: "Loría", correo: "tatiana.loria@serena.com", password: hashPassword, telefono: "88991013", edad: 33, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Wendy", apellidos: "Guzmán", correo: "wendy.guzman@serena.com", password: hashPassword, telefono: "88991014", edad: 34, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Rebeca", apellidos: "Espinoza", correo: "rebeca.espinoza@serena.com", password: hashPassword, telefono: "88991015", edad: 35, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Marcela", apellidos: "Rojas", correo: "marcela.rojas@serena.com", password: hashPassword, telefono: "88991016", edad: 36, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Diana", apellidos: "Castro", correo: "diana.castro@serena.com", password: hashPassword, telefono: "88991017", edad: 37, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Johanna", apellidos: "Méndez", correo: "johanna.mendez@serena.com", password: hashPassword, telefono: "88991018", edad: 38, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Kimberly", apellidos: "Alvarado", correo: "kimberly.alvarado@serena.com", password: hashPassword, telefono: "88991019", edad: 39, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Rebecca", apellidos: "Nuñez", correo: "rebecca.nuñez@serena.com", password: hashPassword, telefono: "88991020", edad: 40, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Annie", apellidos: "Gomez", correo: "annie.gomez@serena.com", password: hashPassword, telefono: "88991021", edad: 41, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Victoria", apellidos: "Fallas", correo: "victoria.fallas@serena.com", password: hashPassword, telefono: "88991022", edad: 42, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Andrea", apellidos: "Barrantes", correo: "andrea.barrantes@serena.com", password: hashPassword, telefono: "88991023", edad: 43, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Kiara", apellidos: "Vargas", correo: "kiara.vargas@serena.com", password: hashPassword, telefono: "88991024", edad: 44, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Juliana", apellidos: "Piza", correo: "juliana.piza@serena.com", password: hashPassword, telefono: "88991025", edad: 45, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Maria Jose", apellidos: "Viquez", correo: "mariajose.viquez@serena.com", password: hashPassword, telefono: "88991026", edad: 46, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Priscilla", apellidos: "Sibaja", correo: "priscilla.sibaja@serena.com", password: hashPassword, telefono: "88991027", edad: 47, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Mary", apellidos: "Alfaro", correo: "mary.alfaro@serena.com", password: hashPassword, telefono: "88991028", edad: 48, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Ivannia", apellidos: "Miranda", correo: "ivannia.miranda2@serena.com", password: hashPassword, telefono: "88991029", edad: 49, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Mariana", apellidos: "Aragón", correo: "mariana.aragon@serena.com", password: hashPassword, telefono: "88991030", edad: 50, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Adeline", apellidos: "Espinoza", correo: "adeline.espinoza@serena.com", password: hashPassword, telefono: "88991031", edad: 51, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Grettel", apellidos: "Barrantes", correo: "grettel.barrantes2@serena.com", password: hashPassword, telefono: "88991032", edad: 52, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Susan", apellidos: "Melendez", correo: "susan.melendez@serena.com", password: hashPassword, telefono: "88991033", edad: 53, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Mariangel", apellidos: "Alfaro", correo: "mariangel.alfaro2@serena.com", password: hashPassword, telefono: "88991034", edad: 54, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Paula", apellidos: "Jinesta", correo: "paula.jinesta@serena.com", password: hashPassword, telefono: "88991035", edad: 20, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Alejandra", apellidos: "Diaz", correo: "alejandra.diaz@serena.com", password: hashPassword, telefono: "88991036", edad: 21, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Karla", apellidos: "Murillo", correo: "karla.murillo@serena.com", password: hashPassword, telefono: "88991037", edad: 22, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Adriana", apellidos: "Diaz", correo: "adriana.diaz@serena.com", password: hashPassword, telefono: "88991038", edad: 23, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Katherine", apellidos: "Alvarado", correo: "katherine.alvarado@serena.com", password: hashPassword, telefono: "88991039", edad: 24, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Albani", apellidos: "Rivas", correo: "albani.rivas@serena.com", password: hashPassword, telefono: "88991040", edad: 25, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Amira", apellidos: "Gutierrez", correo: "amira.gutierrez@serena.com", password: hashPassword, telefono: "88991041", edad: 26, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Yerlin", apellidos: "Badilla", correo: "yerlin.badilla@serena.com", password: hashPassword, telefono: "88991042", edad: 27, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
  { nombre: "Zeidy", apellidos: "Fernandez", correo: "zeidy.fernandez@serena.com", password: hashPassword, telefono: "88991043", edad: 28, rolId: rolMap["Cliente"], estadoUsuarioId: estadoUsuarioMap["Activo"] },
];

await prisma.usuario.createMany({
  data: [adminData, ...profesionalesData, ...clientesData],
});
  // ======================================================
  // RECUPERAR DATOS PARA RELACIONES
  // ======================================================

  const [usuarios, ubicaciones, especialidades] = await Promise.all([
    prisma.usuario.findMany(),
    prisma.ubicacion.findMany(),
    prisma.especialidad.findMany(),
  ]);

  const usuarioMap = Object.fromEntries(usuarios.map((u) => [u.correo, u.id]));
  const ubicacionMap = Object.fromEntries(ubicaciones.map((u) => [u.provincia, u.id]));
  const especialidadMap = Object.fromEntries(especialidades.map((e) => [e.nombre, e.id]));

  const clienteCorreos = clientesData.map((c) => c.correo);

  // ======================================================
  // PERFILES PROFESIONALES (10)
  // ======================================================

  await prisma.perfilProfesional.createMany({
    data: [
      {
        usuarioId: usuarioMap["sofia@serena.com"],
        ubicacionId: ubicacionMap["San José"],
        tituloProfesional: "Médica Especialista en Ginecología",
        descripcion: "Especialista en salud integral femenina, prevención y control ginecológico.",
        aniosExperiencia: 10,
        tarifaBase: 35000,
        imagenPerfil: "sofia.jpg",
        disponible: true,
      },
      {
        usuarioId: usuarioMap["valeria@serena.com"],
        ubicacionId: ubicacionMap["Virtual"],
        tituloProfesional: "Licenciada en Nutrición",
        descripcion: "Nutricionista enfocada en salud hormonal, SOP y alimentación consciente.",
        aniosExperiencia: 7,
        tarifaBase: 30000,
        imagenPerfil: "valeria.jpg",
        disponible: true,
      },
      {
        usuarioId: usuarioMap["camila@serena.com"],
        ubicacionId: ubicacionMap["Virtual"],
        tituloProfesional: "Psicóloga Clínica",
        descripcion: "Especialista en ansiedad, autoestima, infertilidad y acompañamiento emocional.",
        aniosExperiencia: 8,
        tarifaBase: 28000,
        imagenPerfil: "camila.jpg",
        disponible: true,
      },
      {
        usuarioId: usuarioMap["andrea@serena.com"],
        ubicacionId: ubicacionMap["Cartago"],
        tituloProfesional: "Endocrinóloga",
        descripcion: "Atención de trastornos hormonales, metabolismo y síndrome de ovario poliquístico.",
        aniosExperiencia: 12,
        tarifaBase: 42000,
        imagenPerfil: "andrea.jpg",
        disponible: false,
      },
      {
        usuarioId: usuarioMap["maria@serena.com"],
        ubicacionId: ubicacionMap["Puntarenas"],
        tituloProfesional: "Fisioterapeuta Especialista",
        descripcion: "Rehabilitación del piso pélvico y acompañamiento durante el embarazo y postparto.",
        aniosExperiencia: 6,
        tarifaBase: 32000,
        imagenPerfil: "maria.jpg",
        disponible: true,
      },
      {
        usuarioId: usuarioMap["gabriela@serena.com"],
        ubicacionId: ubicacionMap["Heredia"],
        tituloProfesional: "Médica Especialista en Ginecología",
        descripcion: "Consulta ginecológica general y preventiva.",
        aniosExperiencia: 9,
        tarifaBase: 30000,
        imagenPerfil: "gabriela.jpg",
        disponible: true,
      },
      {
        usuarioId: usuarioMap["fernanda@serena.com"],
        ubicacionId: ubicacionMap["Virtual"],
        tituloProfesional: "Psicóloga Clínica",
        descripcion: "Manejo de ansiedad, estrés y bienestar emocional femenino.",
        aniosExperiencia: 5,
        tarifaBase: 27000,
        imagenPerfil: "fernanda.jpg",
        disponible: true,
      },
      {
        usuarioId: usuarioMap["paola@serena.com"],
        ubicacionId: ubicacionMap["Alajuela"],
        tituloProfesional: "Licenciada en Nutrición",
        descripcion: "Nutrición general y hábitos saludables.",
        aniosExperiencia: 6,
        tarifaBase: 29000,
        imagenPerfil: "paola.jpg",
        disponible: true,
      },
      {
        usuarioId: usuarioMap["karen@serena.com"],
        ubicacionId: ubicacionMap["San José"],
        tituloProfesional: "Médica Especialista en Obstetricia",
        descripcion: "Control y acompañamiento del embarazo.",
        aniosExperiencia: 11,
        tarifaBase: 40000,
        imagenPerfil: "karen.jpg",
        disponible: true,
      },
      {
        usuarioId: usuarioMap["silvia@serena.com"],
        ubicacionId: ubicacionMap["Cartago"],
        tituloProfesional: "Endocrinóloga",
        descripcion: "Atención de tiroides y trastornos metabólicos.",
        aniosExperiencia: 15,
        tarifaBase: 43000,
        imagenPerfil: "silvia.jpg",
        disponible: true,
      },
    ],
  });

  const perfiles = await prisma.perfilProfesional.findMany({ include: { usuario: true } });
  const perfilMap = Object.fromEntries(perfiles.map((p) => [p.usuario.correo, p.id]));
  const profesionalCorreos = profesionalesData.map((p) => p.correo);

  // ======================================================
  // PROFESIONAL - ESPECIALIDAD
  // ======================================================

  await prisma.profesionalEspecialidad.createMany({
    data: [
      { perfilProfesionalId: perfilMap["sofia@serena.com"], especialidadId: especialidadMap["Ginecología"] },
      { perfilProfesionalId: perfilMap["sofia@serena.com"], especialidadId: especialidadMap["Obstetricia"] },
      { perfilProfesionalId: perfilMap["valeria@serena.com"], especialidadId: especialidadMap["Nutrición"] },
      { perfilProfesionalId: perfilMap["camila@serena.com"], especialidadId: especialidadMap["Psicología"] },
      { perfilProfesionalId: perfilMap["andrea@serena.com"], especialidadId: especialidadMap["Endocrinología"] },
      { perfilProfesionalId: perfilMap["maria@serena.com"], especialidadId: especialidadMap["Fisioterapia de piso pélvico"] },
      { perfilProfesionalId: perfilMap["maria@serena.com"], especialidadId: especialidadMap["Asesoría en lactancia"] },
      { perfilProfesionalId: perfilMap["gabriela@serena.com"], especialidadId: especialidadMap["Ginecología"] },
      { perfilProfesionalId: perfilMap["fernanda@serena.com"], especialidadId: especialidadMap["Psicología"] },
      { perfilProfesionalId: perfilMap["paola@serena.com"], especialidadId: especialidadMap["Nutrición"] },
      { perfilProfesionalId: perfilMap["karen@serena.com"], especialidadId: especialidadMap["Obstetricia"] },
      { perfilProfesionalId: perfilMap["silvia@serena.com"], especialidadId: especialidadMap["Endocrinología"] },
    ],
  });

  // ======================================================
  // RECUPERAR DATOS PARA SERVICIOS
  // ======================================================

  const [modalidades, estadosServicio] = await Promise.all([
    prisma.modalidad.findMany(),
    prisma.estadoServicio.findMany(),
  ]);

  const modalidadMap = Object.fromEntries(modalidades.map((m) => [m.nombre, m.id]));
  const estadoServicioMap = Object.fromEntries(estadosServicio.map((e) => [e.nombre, e.id]));

  // ======================================================
  // SERVICIOS
  // ======================================================

  await prisma.servicio.createMany({
    data: [
      // ================= SOFÍA =================
      {
        perfilProfesionalId: perfilMap["sofia@serena.com"],
        modalidadId: modalidadMap["Presencial"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Consulta ginecológica general",
        descripcion: "Valoración integral de la salud ginecológica femenina.",
        precio: 35000,
        duracionEstimada: 60,
        imagenServicio: "consulta-ginecologica.jpg",
      },
      {
        perfilProfesionalId: perfilMap["sofia@serena.com"],
        modalidadId: modalidadMap["Virtual"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Control de síndrome de ovario poliquístico",
        descripcion: "Seguimiento y tratamiento del SOP.",
        precio: 40000,
        duracionEstimada: 60,
        imagenServicio: "sop.jpg",
      },
      {
        perfilProfesionalId: perfilMap["sofia@serena.com"],
        modalidadId: modalidadMap["Presencial"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Control prenatal",
        descripcion: "Seguimiento del embarazo desde las primeras semanas.",
        precio: 45000,
        duracionEstimada: 60,
        imagenServicio: "prenatal.jpg",
      },

      // ================= VALERIA =================
      {
        perfilProfesionalId: perfilMap["valeria@serena.com"],
        modalidadId: modalidadMap["Virtual"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Plan nutricional para SOP",
        descripcion: "Plan alimenticio personalizado para mujeres con SOP.",
        precio: 30000,
        duracionEstimada: 60,
        imagenServicio: "nutricion-sop.jpg",
      },
      {
        perfilProfesionalId: perfilMap["valeria@serena.com"],
        modalidadId: modalidadMap["Mixta"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Nutrición para fertilidad",
        descripcion: "Mejora de hábitos alimenticios para favorecer la fertilidad.",
        precio: 32000,
        duracionEstimada: 60,
        imagenServicio: "fertilidad.jpg",
      },

      // ================= CAMILA =================
      {
        perfilProfesionalId: perfilMap["camila@serena.com"],
        modalidadId: modalidadMap["Virtual"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Terapia psicológica individual",
        descripcion: "Sesión personalizada de apoyo emocional.",
        precio: 28000,
        duracionEstimada: 60,
        imagenServicio: "psicologia.jpg",
      },
      {
        perfilProfesionalId: perfilMap["camila@serena.com"],
        modalidadId: modalidadMap["Mixta"],
        estadoServicioId: estadoServicioMap["Inactivo"],
        nombre: "Acompañamiento emocional en infertilidad",
        descripcion: "Apoyo psicológico para procesos de fertilidad.",
        precio: 32000,
        duracionEstimada: 60,
        imagenServicio: "infertilidad.jpg",
      },

      // ================= ANDREA =================
      {
        perfilProfesionalId: perfilMap["andrea@serena.com"],
        modalidadId: modalidadMap["Presencial"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Consulta endocrinológica",
        descripcion: "Evaluación hormonal y metabólica femenina.",
        precio: 45000,
        duracionEstimada: 60,
        imagenServicio: "endocrino.jpg",
      },

      // ================= MARÍA =================
      {
        perfilProfesionalId: perfilMap["maria@serena.com"],
        modalidadId: modalidadMap["Presencial"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Rehabilitación de piso pélvico",
        descripcion: "Fortalecimiento y recuperación del piso pélvico.",
        precio: 35000,
        duracionEstimada: 60,
        imagenServicio: "pelvico.jpg",
      },
      {
        perfilProfesionalId: perfilMap["maria@serena.com"],
        modalidadId: modalidadMap["Virtual"],
        estadoServicioId: estadoServicioMap["Inactivo"],
        nombre: "Asesoría en lactancia materna",
        descripcion: "Orientación personalizada para madres en etapa de lactancia.",
        precio: 28000,
        duracionEstimada: 45,
        imagenServicio: "lactancia.jpg",
      },

      // ================= GABRIELA =================
      {
        perfilProfesionalId: perfilMap["gabriela@serena.com"],
        modalidadId: modalidadMap["Presencial"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Consulta ginecológica de rutina",
        descripcion: "Chequeo ginecológico preventivo anual.",
        precio: 30000,
        duracionEstimada: 45,
        imagenServicio: "gabriela.jpg",
      },

      // ================= FERNANDA =================
      {
        perfilProfesionalId: perfilMap["fernanda@serena.com"],
        modalidadId: modalidadMap["Virtual"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Terapia de manejo de ansiedad",
        descripcion: "Sesión enfocada en el manejo de ansiedad y estrés.",
        precio: 27000,
        duracionEstimada: 50,
        imagenServicio: "fernanda.jpg",
      },

      // ================= PAOLA =================
      {
        perfilProfesionalId: perfilMap["paola@serena.com"],
        modalidadId: modalidadMap["Mixta"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Asesoría nutricional general",
        descripcion: "Orientación en hábitos alimenticios saludables.",
        precio: 29000,
        duracionEstimada: 50,
        imagenServicio: "paola.jpg",
      },

      // ================= KAREN =================
      {
        perfilProfesionalId: perfilMap["karen@serena.com"],
        modalidadId: modalidadMap["Presencial"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Control obstétrico",
        descripcion: "Seguimiento del embarazo y desarrollo fetal.",
        precio: 40000,
        duracionEstimada: 60,
        imagenServicio: "karen.jpg",
      },

      // ================= SILVIA =================
      {
        perfilProfesionalId: perfilMap["silvia@serena.com"],
        modalidadId: modalidadMap["Presencial"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Consulta de tiroides y metabolismo",
        descripcion: "Evaluación especializada de la función tiroidea.",
        precio: 43000,
        duracionEstimada: 60,
        imagenServicio: "silvia.jpg",
      },

      // ================= SERVICIOS ADICIONALES (más variedad de especialidad) =================
      {
        perfilProfesionalId: perfilMap["sofia@serena.com"],
        modalidadId: modalidadMap["Presencial"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Colposcopia diagnóstica",
        descripcion: "Examen detallado del cuello uterino ante resultados anormales.",
        precio: 38000,
        duracionEstimada: 45,
        imagenServicio: "colposcopia.jpg",
      },
      {
        perfilProfesionalId: perfilMap["karen@serena.com"],
        modalidadId: modalidadMap["Presencial"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Ecografía obstétrica",
        descripcion: "Seguimiento del desarrollo fetal mediante ultrasonido.",
        precio: 42000,
        duracionEstimada: 45,
        imagenServicio: "ecografia.jpg",
      },
      {
        perfilProfesionalId: perfilMap["camila@serena.com"],
        modalidadId: modalidadMap["Virtual"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Taller de manejo del estrés",
        descripcion: "Sesión grupal o individual para gestionar el estrés diario.",
        precio: 25000,
        duracionEstimada: 50,
        imagenServicio: "estres.jpg",
      },
      {
        perfilProfesionalId: perfilMap["valeria@serena.com"],
        modalidadId: modalidadMap["Mixta"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Nutrición deportiva femenina",
        descripcion: "Plan nutricional orientado al rendimiento físico y hormonal.",
        precio: 31000,
        duracionEstimada: 60,
        imagenServicio: "nutricion-deportiva.jpg",
      },
      {
        perfilProfesionalId: perfilMap["andrea@serena.com"],
        modalidadId: modalidadMap["Presencial"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Manejo de diabetes gestacional",
        descripcion: "Control endocrinológico especializado durante el embarazo.",
        precio: 44000,
        duracionEstimada: 60,
        imagenServicio: "diabetes-gestacional.jpg",
      },
      {
        perfilProfesionalId: perfilMap["maria@serena.com"],
        modalidadId: modalidadMap["Presencial"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Fisioterapia postparto",
        descripcion: "Recuperación física y fortalecimiento tras el parto.",
        precio: 33000,
        duracionEstimada: 60,
        imagenServicio: "postparto.jpg",
      },
      {
        perfilProfesionalId: perfilMap["paola@serena.com"],
        modalidadId: modalidadMap["Virtual"],
        estadoServicioId: estadoServicioMap["Activo"],
        nombre: "Asesoría en lactancia y nutrición",
        descripcion: "Orientación nutricional combinada con acompañamiento en lactancia.",
        precio: 27000,
        duracionEstimada: 50,
        imagenServicio: "lactancia-nutricion.jpg",
      },
      {
        perfilProfesionalId: perfilMap["fernanda@serena.com"],
        modalidadId: modalidadMap["Virtual"],
        estadoServicioId: estadoServicioMap["Inactivo"],
        nombre: "Consulta de sexología clínica",
        descripcion: "Acompañamiento profesional en salud sexual femenina.",
        precio: 26000,
        duracionEstimada: 50,
        imagenServicio: "sexologia.jpg",
      },
    ],
  });

  const servicios = await prisma.servicio.findMany();
  const servicioMap = Object.fromEntries(servicios.map((s) => [s.nombre, s.id]));

  // ======================================================
  // SERVICIO - ESPECIALIDAD
  // ======================================================

  await prisma.servicioEspecialidad.createMany({
    data: [
      { servicioId: servicioMap["Consulta ginecológica general"], especialidadId: especialidadMap["Ginecología"] },
      { servicioId: servicioMap["Control de síndrome de ovario poliquístico"], especialidadId: especialidadMap["Ginecología"] },
      { servicioId: servicioMap["Control prenatal"], especialidadId: especialidadMap["Obstetricia"] },
      { servicioId: servicioMap["Plan nutricional para SOP"], especialidadId: especialidadMap["Nutrición"] },
      { servicioId: servicioMap["Nutrición para fertilidad"], especialidadId: especialidadMap["Nutrición"] },
      { servicioId: servicioMap["Terapia psicológica individual"], especialidadId: especialidadMap["Psicología"] },
      { servicioId: servicioMap["Acompañamiento emocional en infertilidad"], especialidadId: especialidadMap["Psicología"] },
      { servicioId: servicioMap["Consulta endocrinológica"], especialidadId: especialidadMap["Endocrinología"] },
      { servicioId: servicioMap["Rehabilitación de piso pélvico"], especialidadId: especialidadMap["Fisioterapia de piso pélvico"] },
      { servicioId: servicioMap["Asesoría en lactancia materna"], especialidadId: especialidadMap["Asesoría en lactancia"] },
      { servicioId: servicioMap["Consulta ginecológica de rutina"], especialidadId: especialidadMap["Ginecología"] },
      { servicioId: servicioMap["Terapia de manejo de ansiedad"], especialidadId: especialidadMap["Psicología"] },
      { servicioId: servicioMap["Asesoría nutricional general"], especialidadId: especialidadMap["Nutrición"] },
      { servicioId: servicioMap["Control obstétrico"], especialidadId: especialidadMap["Obstetricia"] },
      { servicioId: servicioMap["Consulta de tiroides y metabolismo"], especialidadId: especialidadMap["Endocrinología"] },
      { servicioId: servicioMap["Colposcopia diagnóstica"], especialidadId: especialidadMap["Ginecología"] },
      { servicioId: servicioMap["Ecografía obstétrica"], especialidadId: especialidadMap["Obstetricia"] },
      { servicioId: servicioMap["Taller de manejo del estrés"], especialidadId: especialidadMap["Psicología"] },
      { servicioId: servicioMap["Nutrición deportiva femenina"], especialidadId: especialidadMap["Nutrición"] },
      { servicioId: servicioMap["Manejo de diabetes gestacional"], especialidadId: especialidadMap["Endocrinología"] },
      { servicioId: servicioMap["Fisioterapia postparto"], especialidadId: especialidadMap["Fisioterapia de piso pélvico"] },
      { servicioId: servicioMap["Asesoría en lactancia y nutrición"], especialidadId: especialidadMap["Asesoría en lactancia"] },
      { servicioId: servicioMap["Consulta de sexología clínica"], especialidadId: especialidadMap["Sexología"] },
    ],
  });

  // ======================================================
  // CITAS - crecimiento mes a mes (enero a noviembre 2026)
  // clientes, profesionales y servicios se repiten y varían
  // ======================================================

    const estadosCita = await prisma.estadoCita.findMany();
  const estadoCitaMap = Object.fromEntries(estadosCita.map((e) => [e.nombre, e.id]));
  const modalidadNombres = ["Virtual", "Presencial", "Mixta"];

  // Pseudoaleatorio determinístico: reproducible entre corridas del seed,
  // pero sin el patrón cíclico que generaba usar idx % n directamente
  // (evita que el estado quede correlacionado con el profesional o el servicio).
  function pseudoRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  const hoy = new Date();

  // Servicios agrupados por profesional, para que las citas varíen entre
  // todos los servicios que ofrece cada quien (no solo uno fijo)
  const serviciosPorPerfilId = servicios.reduce<Record<number, typeof servicios>>((acc, s) => {
    if (!acc[s.perfilProfesionalId]) acc[s.perfilProfesionalId] = [];
    acc[s.perfilProfesionalId].push(s);
    return acc;
  }, {});

  const mesesRango = 11;
  const citasBase = 10;
  const citasIncremento = 3;
  const citasPorMes = Array.from({ length: mesesRango }, (_, m) => citasBase + m * citasIncremento);

  const citasData: any[] = [];
  let idx = 0;

  for (let mes = 0; mes < mesesRango; mes++) {
    const cantidadDelMes = citasPorMes[mes];

    for (let d = 0; d < cantidadDelMes; d++) {
      const clienteCorreo = clienteCorreos[idx % clienteCorreos.length];
      const profesionalCorreo = profesionalCorreos[idx % profesionalCorreos.length];
      const profesionalId = perfilMap[profesionalCorreo];
      const modalidadNombre = modalidadNombres[idx % modalidadNombres.length];

      const serviciosDelProfesional = serviciosPorPerfilId[profesionalId];
      const servicio = serviciosDelProfesional[idx % serviciosDelProfesional.length];

      const dia = 1 + (d % 27);
      const fecha = new Date(2026, mes, dia);
      const horaBase = 8 + (idx % 8);

      const horaInicio = new Date(fecha);
      horaInicio.setHours(horaBase, 0, 0, 0);
      const horaFin = new Date(horaInicio);
      horaFin.setMinutes(horaFin.getMinutes() + 60);

      // Estado según si la cita ya pasó o todavía está por venir
      const esPasado = horaInicio < hoy;

      let estadoNombre: string;
      if (esPasado) {
        // Citas pasadas: la mayoría se completó, algunas se cancelaron
        estadoNombre = pseudoRandom(idx) < 0.75 ? "Completada" : "Cancelada";
      } else {
        // Citas futuras: todavía no fueron atendidas
        estadoNombre = pseudoRandom(idx + 500) < 0.55 ? "Pendiente" : "Aceptada";
      }

      citasData.push({
        clienteId: usuarioMap[clienteCorreo],
        servicioId: servicio.id,
        profesionalId,
        estadoCitaId: estadoCitaMap[estadoNombre],
        modalidadId: modalidadMap[modalidadNombre],
        fechaCita: fecha,
        horaInicio,
        horaFin,
        montoEstimado: servicio.precio,
      });

      idx++;
    }
  }

  // Cita preparada para probar el flujo Aceptada -> Completada.
  // Se genera siempre ayer para que continúe siendo una cita pasada
  // cada vez que se vuelva a ejecutar el seeder.
  const perfilSofiaId = perfilMap["sofia@serena.com"];
  const servicioSofia = serviciosPorPerfilId[perfilSofiaId][0];
  const inicioCitaAdriana = new Date(hoy);
  inicioCitaAdriana.setDate(inicioCitaAdriana.getDate() - 1);
  inicioCitaAdriana.setHours(18, 0, 0, 0);

  const finCitaAdriana = new Date(inicioCitaAdriana);
  finCitaAdriana.setMinutes(
    finCitaAdriana.getMinutes() + servicioSofia.duracionEstimada
  );

  citasData.push({
    clienteId: usuarioMap["adriana.diaz@serena.com"],
    servicioId: servicioSofia.id,
    profesionalId: perfilSofiaId,
    estadoCitaId: estadoCitaMap["Aceptada"],
    modalidadId: servicioSofia.modalidadId,
    fechaCita: inicioCitaAdriana,
    horaInicio: inicioCitaAdriana,
    horaFin: finCitaAdriana,
    montoEstimado: servicioSofia.precio,
  });

  await prisma.cita.createMany({ data: citasData });
  // ======================================================
  // BITÁCORAS
  // ======================================================

  await prisma.bitacora.createMany({
    data: [
      {
        usuarioId: usuarioMap["admin@serena.com"],
        accion: "Inicio de sesión",
        descripcion: "El administrador ingresó al sistema.",
      },
      {
        usuarioId: usuarioMap["admin@serena.com"],
        accion: "Registro de profesional",
        descripcion: "Se registró el perfil profesional de Sofía Ramírez.",
      },
      {
        usuarioId: usuarioMap["admin@serena.com"],
        accion: "Creación de servicio",
        descripcion: "Se creó el servicio Consulta ginecológica general.",
      },
      {
        usuarioId: usuarioMap["laura.chacon@serena.com"],
        accion: "Solicitud de cita",
        descripcion: "La usuaria solicitó una consulta ginecológica.",
      },
      {
        usuarioId: usuarioMap["daniela.solano@serena.com"],
        accion: "Solicitud de cita",
        descripcion: "La usuaria solicitó una consulta nutricional.",
      },
      {
        usuarioId: usuarioMap["sofia@serena.com"],
        accion: "Actualización de perfil",
        descripcion: "Se actualizó la información profesional.",
      },
      {
        usuarioId: usuarioMap["camila@serena.com"],
        accion: "Cambio de disponibilidad",
        descripcion: "La profesional actualizó su disponibilidad.",
      },
      {
        usuarioId: usuarioMap["maria@serena.com"],
        accion: "Actualización de servicio",
        descripcion: "Se modificó la descripción de un servicio.",
      },
    ],
  });

  // ======================================================
  // RESEÑAS
  // Solo el 90% de los clientes totales deja reseña (10% no reseña,
  // ya que es opcional). De ese 90%, se reseñan sus citas "Completada".
  // ======================================================

  const comentarios = [
    "Excelente atención y mucha empatía durante toda la consulta.",
    "Muy profesional y resolvió todas mis dudas.",
    "El plan fue claro y fácil de seguir.",
    "Me sentí escuchada y acompañada durante toda la sesión.",
    "Explicó todo con paciencia, totalmente recomendada.",
    "La consulta fue puntual y muy completa.",
    "Un ambiente cómodo y de confianza en todo momento.",
    "Gran calidez humana y conocimiento profesional.",
    "Resolvió mis dudas con mucha claridad.",
    "Superó mis expectativas, volveré a agendar.",
  ];

  // 90% de los clientes totales (44) deja reseña -> se redondea al entero más cercano
  const porcentajeQueResena = 0.9;
  const cantidadClientesQueResenan = Math.round(clientesData.length * porcentajeQueResena);
  const idsClientesQueResenan = new Set(
    clienteCorreos.slice(0, cantidadClientesQueResenan).map((correo) => usuarioMap[correo])
  );

  // ======================================================
  // HISTORIAL INICIAL DE ESTADOS
  // ======================================================

  const citasParaHistorial = await prisma.cita.findMany();

  await prisma.historialEstadoCita.createMany({
    data: citasParaHistorial.map((cita) => ({
      citaId: cita.id,
      estadoAnteriorId: null,
      estadoNuevoId: cita.estadoCitaId,
      usuarioId: cita.clienteId,
      comentario: "Estado inicial generado por el seeder",
      fechaCambio: cita.createdAt,
    })),
  });

  // Solo las citas "Completada" son elegibles para reseña
  const citasCompletadas = await prisma.cita.findMany({
    where: { estadoCitaId: estadoCitaMap["Completada"] },
    orderBy: { id: "asc" },
  });

  const citasParaResena = citasCompletadas.filter((cita) => idsClientesQueResenan.has(cita.clienteId));

  const resenasData = citasParaResena.map((cita, i) => ({
    citaId: cita.id,
    clienteId: cita.clienteId,
    profesionalId: cita.profesionalId,
    puntuacion: 3 + (i % 3), // valores entre 3 y 5
    comentario: comentarios[i % comentarios.length],
  }));

  await prisma.resena.createMany({ data: resenasData });

  console.log("Seed base Serena completado.");
  console.log(`Usuarios creados: ${usuarios.length} (1 admin, ${profesionalesData.length} profesionales, ${clientesData.length} clientes)`);
  console.log(`Citas creadas: ${citasData.length} (crecientes de enero a noviembre 2026)`);
  console.log(`Clientes que dejan reseña: ${cantidadClientesQueResenan} de ${clientesData.length} (90%)`);
  console.log(`Reseñas creadas: ${resenasData.length} (sobre citas Completada de esos clientes)`);
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
