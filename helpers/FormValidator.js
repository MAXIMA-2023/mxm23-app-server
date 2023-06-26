const validateEmptyEntries = (body) => {
    const entries = Object.entries(body);
    const emptyEntriesValidation = entries.map(([key, value]) => 
        (value === undefined || value === null || value === false || value === "")
            &&
            {
                error : `EMPTY_${key.toUpperCase()}`,
                message : `Kolom ${key} tidak boleh kosong`
            }
    ).filter(value => value !== false && value !== null && value !== undefined || value === "");
    return emptyEntriesValidation;
}

module.exports = { validateEmptyEntries }