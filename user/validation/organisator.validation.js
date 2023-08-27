const z = require("zod");

const registerValidator = z.object({
  name: z.string(),
  nim: z
    .number()
    .min(10000, "NIM harus 5 sampai 6 digit")
    .max(999999, "NIM tidak boleh lebih besar dari 6 digit"),
  email: z
    .string()
    .email()
    .endsWith("@student.umn.ac.id", "Email harus menggunakan email student"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  stateID: z.number().positive(),
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
