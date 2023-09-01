const z = require("zod");

const registerValidator = z.object({
  name: z.string(),
  email: z
    .string()
    .email("Format email tidak valid"),
  whatsapp: z.string(),    
});

module.exports = {
    registerValidator
}