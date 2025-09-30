const RelationsSchema = {
  name: "Relations",
  primaryKey: "id",
  properties: {
    id: "int",
    name: { type: "string", indexed: true },
    client: { type: "bool", default: false },
    supplier: { type: "bool", default: false },
    streetandnr: "string?",
    postalcode: "int?",
    city: "string?",
    country: "string?",
    phone: "string?" ,
    email: "string?" ,
    vatnumber: "string?",
  },
};

const InvoicesSchema = {
  name: "Invoices",
  primaryKey: "id",
  properties: {
    id: "string",
    period: "int",
    journaltype: "int",
    journalnr: "int",
    documentnr: "int",
    relation: "Relations",
    amount: "double",
    taxamount: "double",
    totalamount: "double",
    date: "string",
    duedate: "string",
    paid: { type: "bool", default: false },
    paymentreference: "string?",
    comment: "string?",
  },
};

export {
  RelationsSchema,
  InvoicesSchema,
};
   