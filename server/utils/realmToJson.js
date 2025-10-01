// utils/realmToJson.js
export function realmToJson(obj) {
  if (!obj) return null;

  // If it's a collection (Realm.Results or list)
  if (typeof obj.map === "function") {
    return obj.map(item => realmToJson(item));
  }

  // If it's a Realm object
  const plain = {};
  for (const key of Object.keys(obj.toJSON())) {
    plain[key] = obj[key];
  }
  return plain;
}
