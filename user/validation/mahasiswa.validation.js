const z = require("zod");

// NOTE : blm fix

const registerValidator = z.object({
  nim: z
    .number()
    .min(10000, "NIM harus 5 digit")
    .max(999999, "NIM tidak boleh lebih besar dari 6 digit"),
  name: z.string(),
  email: z
    .string()
    .email()
    .endsWith("@student.umn.ac.id", "Email harus menggunakan email student"),
  whatsapp: z
    .string()
    .min(10, "Nomor Whatsapp harus diatas 10 digit")
    .max(15, "Nomor Whatsapp harus dibawah 15 digit"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  angkatan: z
    .number()
    .min(2023, "Maaf, MAXIMA dibuka hanya untuk mahasiswa angkatan 2023")
    .max(2023, "Maaf, MAXIMA dibuka hanya untuk mahasiswa angkatan 2023"),
  idLine: z.string(),
  prodi: z.string(),
});

const nimValidator = z.preprocess(
  (a) => parseInt(z.string().parse(a)),
  z.number().min(10000, "NIM harus 5 digit").max(99999, "NIM harus 5 digit")
);

module.exports = {
  registerValidator,
  nimValidator,
};
