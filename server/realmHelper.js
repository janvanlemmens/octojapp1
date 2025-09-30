import Realm from "realm";
import { InvoicesSchema, RelationsSchema } from "./schemas.js";

const realmInstances = {}; // cache: { path: realmInstance }

/**
 * Opens (or reuses) a Realm instance by schema + path
 */
export async function getRealm(schema, path) {
  if (realmInstances[path] && !realmInstances[path].isClosed) {
    return realmInstances[path];
  }

  const realm = await Realm.open({
    schema: [schema],
    path,
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
  return getRealm(InvoicesSchema, "invoices.realm");
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
  realmr.write(() => {
    realmr.create("Relations", relationData, Realm.UpdateMode.Modified);
   }) 
}

export async function deleteRelation(id) {
  const realmr = await getRelationsRealm();

  realmr.write(() => {
    const toDelete = realmr.objectForPrimaryKey("Relations", id);
    if (toDelete) {
      realmr.delete(toDelete);
    }
  });

  return id;
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