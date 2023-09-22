const z = require("zod");

const registerValidator = z.object({
  name: z.string(),
  email: z
    .string()
    .email("Format email tidak valid"),
  whatsapp: z
    .string()
    .min(10, "Nomor Whatsapp harus diatas 10 digit")
    .max(15, "Nomor Whatsapp harus dibawah 15 digit"),   
});

module.exports = {
    registerValidator
}