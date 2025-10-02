import Realm from "realm";
import { InvoicesSchema, RelationsSchema } from "./schemas.js";

const realmInstances = {}; // cache: { path: realmInstance }

/**
 * Opens (or reuses) a Realm instance by schema + path
 */
export async function getRealm(schemas, path) {
  if (realmInstances[path] && !realmInstances[path].isClosed) {
    return realmInstances[path];
  }
/*
Realm.deleteFile({
  path: "invoices.realm",
  schema: [InvoicesSchema],
});
*/
  
  const realm = await Realm.open({
    schema: Array.isArray(schemas) ? schemas : [schemas],
    path,
    schemaVersion: 1,
   deleteRealmIfMigrationNeeded: true,  // ⚠️ DEV ONLY
  });

  realmInstances[path] = realm;
  return realm;
}

/**
 * Convenience helpers for specific realms
 */
export async function getRelationsRealm() {
  return getRealm(RelationsSchema, "relations.realm");
}

export async function getInvoicesRealm() {
  return getRealm([InvoicesSchema, RelationsSchema], "invoices.realm"); //When a schema links to another schema, you must include both schemas when opening the Realm.
}

/**
 * Close all cached Realms (e.g. on app exit)
 */
export function closeAllRealms() {
  for (const key in realmInstances) {
    if (!realmInstances[key].isClosed) {
      realmInstances[key].close();
    }
    delete realmInstances[key];
  }
}

export async function addRelation(relationData) {
  const realmr = await getRelationsRealm();
  try {
  realmr.write(() => {
    realmr.create("Relations", relationData, Realm.UpdateMode.Modified);
   }) 
  return relationData.id;
  } catch (error) {
    console.error("Failed to add/update relation:", error);
    
  }
}

export async function addInvoice(invoiceData) {
   console.log("relation",invoiceData.relation)

  try {
  const realmi = await getInvoicesRealm();
  const realmr = await getRelationsRealm();
 const relObj = realmr.objectForPrimaryKey("Relations",invoiceData.relation)
 console.log("relObj",relObj)
 if (!relObj) {
      throw new Error(`Relation with id ${invoiceData.relation} not found in Realm`);
    }
  realmi.write(() => {
    realmi.create("Invoices", {
      ...invoiceData,
      relation: relObj
    }, 
    Realm.UpdateMode.Modified);
   }) 
  return invoiceData.id;
  } catch (error) {
    console.error("Failed to add/update invoice:", error);
    throw error; // so server.js can return 500 properly
  }
}

export async function deleteRelation(id) {
  const realmr = await getRelationsRealm();
  try {
  realmr.write(() => {
    const toDelete = realmr.objectForPrimaryKey("Relations", id);
    if (toDelete) {
      realmr.delete(toDelete);
    }
  });
  return id;
   } catch (error) {
    console.error("Failed to delete relation:", error);
    throw error;
  }

}

/*

function buildInvoiceId({ period, journaltype, journalnr, documentnr }) {
  return `${period}_${journaltype}_${journalnr}_${documentnr}`;
}


function upsertInvoice(realm, invoiceData) {
  const id = buildInvoiceId(invoiceData);

  const realmr = await getRelationsRealm();

  realmr.write(() => {
    realmr.create(
      "Invoices",
      { ...invoiceData, id },
      Realm.UpdateMode.Modified   // 👈 update if exists, otherwise create
    );
  });

  return id;
}

/* usage

const id = upsertInvoice(realm, {
  period: 202509,
  journaltype: 1,
  journalnr: 2,
  documentnr: 3,
  amount: 150.0,
});

console.log("Invoice upserted with id:", id);

optie 1 
async function saveRelation() {
  const relationsRealm = await getRelationsRealm();
  relationsRealm.write(() => {
    relationsRealm.create("Relations", { id: "1", name: "Acme Co." });
  });
}

saveRelation();

optie 2
getRelationsRealm().then((relationsRealm) => {
  relationsRealm.write(() => {
    relationsRealm.create("Relations", { id: "1", name: "Acme Co." }, Realm.UpdateMode.Modified);
  });
});

*/