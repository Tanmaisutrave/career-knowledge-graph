/**
 * Utility helpers for neo4j-driver result parsing.
 * Neo4j integers must be converted to JS numbers before sending JSON.
 */

import neo4j from "neo4j-driver";

/**
 * Recursively converts neo4j Integer objects to JS numbers,
 * and strips internal neo4j metadata from node/relationship objects.
 */
export function sanitize(value) {
  if (value === null || value === undefined) return value;

  // neo4j Integer
  if (neo4j.isInt(value)) return value.toNumber();

  // neo4j Node or Relationship
  if (value && typeof value === "object" && value.properties) {
    return sanitize(value.properties);
  }

  // Plain array
  if (Array.isArray(value)) return value.map(sanitize);

  // Plain object
  if (typeof value === "object") {
    const result = {};
    for (const key of Object.keys(value)) {
      result[key] = sanitize(value[key]);
    }
    return result;
  }

  return value;
}

/**
 * Convert a single neo4j record to a plain JS object.
 * @param {neo4j.Record} record
 * @returns {Object}
 */
export function recordToObject(record) {
  return sanitize(record.toObject());
}

/**
 * Convert an array of neo4j records to plain JS objects.
 * @param {neo4j.Record[]} records
 * @returns {Object[]}
 */
export function recordsToObjects(records) {
  return records.map(recordToObject);
}

/**
 * Generate a unique ID with a given prefix (e.g. "u", "s", "p").
 * Uses timestamp + random suffix for uniqueness.
 * @param {string} prefix
 * @returns {string}
 */
export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
