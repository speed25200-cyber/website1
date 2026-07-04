/* =========================================================================
   Validateur JSON Schema minimal (sous-ensemble draft-07)
   Sans dépendance. Couvre les fonctionnalités utilisées par nos schémas :
   type, required, properties, additionalProperties (bool), items, enum,
   const, minLength, maxLength, pattern, minimum, maximum, format:"email".
   ========================================================================= */
"use strict";

function typeOf(v) {
  if (Array.isArray(v)) return "array";
  if (v === null) return "null";
  if (Number.isInteger(v)) return "integer";
  return typeof v; // string, number, boolean, object
}

function matchesType(v, t) {
  if (t === "integer") return Number.isInteger(v);
  if (t === "number") return typeof v === "number";
  if (t === "array") return Array.isArray(v);
  if (t === "object") return v !== null && typeof v === "object" && !Array.isArray(v);
  if (t === "null") return v === null;
  return typeof v === t; // string, boolean
}

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(schema, data, path, errors) {
  path = path || "";
  errors = errors || [];

  if (schema.const !== undefined && JSON.stringify(data) !== JSON.stringify(schema.const)) {
    errors.push(path + " doit valoir " + JSON.stringify(schema.const));
  }
  if (schema.enum && schema.enum.indexOf(data) === -1) {
    errors.push(path + " doit être l'une de : " + schema.enum.join(", "));
  }
  if (schema.type) {
    var types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some(function (t) { return matchesType(data, t); })) {
      errors.push(path + " doit être de type " + types.join("|") + " (reçu: " + typeOf(data) + ")");
      return errors; // inutile de descendre plus loin
    }
  }

  if (typeof data === "string") {
    if (schema.minLength != null && data.length < schema.minLength) errors.push(path + " trop court (min " + schema.minLength + ")");
    if (schema.maxLength != null && data.length > schema.maxLength) errors.push(path + " trop long (max " + schema.maxLength + ")");
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) errors.push(path + " ne respecte pas le motif " + schema.pattern);
    if (schema.format === "email" && !EMAIL_RE.test(data)) errors.push(path + " n'est pas un e-mail valide");
  }

  if (typeof data === "number") {
    if (schema.minimum != null && data < schema.minimum) errors.push(path + " < minimum " + schema.minimum);
    if (schema.maximum != null && data > schema.maximum) errors.push(path + " > maximum " + schema.maximum);
  }

  if (matchesType(data, "object") && (schema.properties || schema.required || schema.additionalProperties === false)) {
    (schema.required || []).forEach(function (k) {
      if (!(k in data)) errors.push(path + "/" + k + " est requis");
    });
    var props = schema.properties || {};
    if (schema.additionalProperties === false) {
      Object.keys(data).forEach(function (k) {
        if (!(k in props)) errors.push(path + "/" + k + " n'est pas autorisé");
      });
    }
    Object.keys(props).forEach(function (k) {
      if (k in data) validate(props[k], data[k], path + "/" + k, errors);
    });
    if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
      Object.keys(data).forEach(function (k) {
        if (!(k in props)) validate(schema.additionalProperties, data[k], path + "/" + k, errors);
      });
    }
  }

  if (Array.isArray(data)) {
    if (schema.minItems != null && data.length < schema.minItems) errors.push(path + " a trop peu d'éléments (min " + schema.minItems + ")");
    if (schema.maxItems != null && data.length > schema.maxItems) errors.push(path + " a trop d'éléments (max " + schema.maxItems + ")");
    if (schema.items) data.forEach(function (item, i) { validate(schema.items, item, path + "[" + i + "]", errors); });
  }

  return errors;
}

module.exports = function (schema, data) {
  var errors = validate(schema, data, "", []);
  return { valid: errors.length === 0, errors: errors };
};
