import multer from "multer";
import path from "path";
import fs from "fs";

// IMPORTANTE: esta carpeta vive FUERA de "uploads/", que en server.ts está
// montada como pública con express.static. Las credenciales profesionales
// nunca deben quedar expuestas por una URL pública directa; solo se sirven
// mediante el endpoint protegido GET /solicitudes-profesional/:id/credencial.
const uploadDirectory = path.join(
  process.cwd(),
  "uploadsPrivados",
  "credenciales"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (_request, _file, callback) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}.pdf`;

    callback(null, uniqueName);
  },
});

const fileFilter: multer.Options["fileFilter"] = (
  _request,
  file,
  callback
) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const esPdfPorMimeType = file.mimetype === "application/pdf";
  const esPdfPorExtension = extension === ".pdf";

  if (!esPdfPorMimeType || !esPdfPorExtension) {
    callback(new Error("Solo se permiten archivos PDF"));
    return;
  }

  callback(null, true);
};

export const uploadCredencialProfesional = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export const rutaCredencialesProfesional = uploadDirectory;
