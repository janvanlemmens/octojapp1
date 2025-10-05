const RelationsSchema = {
  name: "Relations",
  primaryKey: "id",
  properties: {
    id: "int",
    name: { type: "string", indexed: true },
    client: { type: "bool", default: false },
    supplier: { type: "bool", default: false },
    streetandnr: "string?",
    postalcode: "string?",
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
    journal: "string",  //journaltype_journalnr
    documentnr: "int",
    date: "string",
    duedate: "string",
    comment: "string?",
    paymentreference: "string?",
    relation: "Relations",
    amount: "double",
    taxamount: "double",
    totalamount: "double",
    cn: { type: "bool", default: false },
    paid: { type: "bool", default: false },
    pdf: "string?",
  },
};

const UsersSchema = {
  name: "Users",
  primaryKey: "email",
  properties: {
    email: { type: "string", indexed: true },
    passwordHash: "string",
    createdAt: "date",
  },
};

export {
  RelationsSchema,
  InvoicesSchema,
  UsersSchema
};
   