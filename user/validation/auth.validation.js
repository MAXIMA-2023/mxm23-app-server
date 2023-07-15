const z = require("zod");

const loginValidator = z.object({
  nim: z
    .number()
    .min(10000, "NIM harus 5 digit")
    .max(99999, "NIM harus 5 digit"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

module.exports = {
  loginValidator,
};
