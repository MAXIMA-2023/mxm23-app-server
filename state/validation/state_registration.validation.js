const z = require("zod");

const nimValidator = z.preprocess(
  (a) => parseInt(z.string().parse(a)),
  z
    .number("NIM kosong! Harap diisi terlebih dahulu")
    .min(10000, "NIM harus 5 sampai 6 digit")
    .max(999999, "NIM tidak boleh lebih besar dari 6 digit")
);

const stateIDValidator = z.preprocess(
  (a) => parseInt(z.string().parse(a)),
  z
    .number("STATE ID kosong! Harap diisi terlebih dahulu")
    .positive("StateID tidak valid")
);

const dayValidator = z
  .string("DAY tidak boleh kosong! Harap diisi terlebih dahulu")
  .min(2, "DAY tidak valid")
  .max(2, "DAY tidak valid")
  .startsWith("D", "DAY tidak valid");

module.exports = {
  nimValidator,
  stateIDValidator,
  dayValidator,
};
