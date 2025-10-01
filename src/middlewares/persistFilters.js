function persistFilters(req, res, next) {
  const q = req.query || {};
  res.locals.q = q;
  
  res.locals.sel = (name, value) =>
    String(req.query?.[name] ?? '') === String(value) ? 'selected' : '';

  res.locals.isChecked = (name, value='1') => {
    const v = req.query?.[name];
    if (Array.isArray(v)) return v.map(String).includes(String(value));
    return String(v ?? '') === String(value);
  };

  res.locals.val = (name, def='') => req.query?.[name] ?? def;

  res.locals.qs = (overrides = {}) => {
    const params = new URLSearchParams({ ...req.query, ...overrides });
    // limpiar vacíos
    for (const [k, v] of [...params.entries()]) {
      if (v === '' || v == null) params.delete(k);
    }
    return params.toString();
  };

  next();
}

export default persistFilters;