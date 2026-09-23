import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "perfiles"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const originalName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();

    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;

    callback(
      null,
      `${originalName}-${uniqueName}${extension}`
    );
  },
});

const fileFilter: multer.Options["fileFilter"] = (
  _request,
  file,
  callback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    callback(
      new Error(
        "Solo se permiten imágenes JPG, PNG o WEBP"
      )
    );

    return;
  }

  callback(null, true);
};

export const uploadPerfilImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});