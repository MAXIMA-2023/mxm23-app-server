const z = require("zod");

const registerValidator = z.object({
  name: z.string(),
  email: z
    .string()
    .email("Format email tidak valid"), 
});

module.exports = {
    registerValidator
}