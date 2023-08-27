const z = require("zod");

const loginValidator = z.object({
  nim: z
    .number()
    .min(10000, "NIM harus 5 sampai 6 digit")
    .max(999999, "NIM tidak boleh lebih besar dari 6 digit"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

module.exports = {
  loginValidator,
};
