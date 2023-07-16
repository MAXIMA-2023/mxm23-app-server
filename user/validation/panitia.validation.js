const z = require("zod");

const registerValidator = z.object({
  nim: z
    .number()
    .min(1000, "NIM harus 5 digit")
    .max(99999, "NIM harus 5 digit"),
  name: z.string(),
  password: z.string().min(8, "Password harus lebih dari 8 karakter"),
  email: z
    .string()
    .email("Format email tidak valid")
    .endsWith("@student.umn.ac.id", "Email harus menggunakan email student"),
  divisiID: z
    .string()
    .min(3, "ID divisi harus berupa 3 karakter")
    .max(3, "ID divisi harus berupa 3 karakter"),
});

const nimValidator = z.preprocess(
  (a) => parseInt(z.string().parse(a)),
  z.number().min(10000, "NIM harus 5 digit").max(99999, "NIM harus 5 digit")
);

const verifyValidator = z.object({
  isverified: z.boolean(),
});

module.exports = {
  registerValidator,
  nimValidator,
  verifyValidator,
};
