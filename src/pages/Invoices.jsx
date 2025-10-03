import React , { useState, useEffect } from 'react'
import axios from 'axios';
import CustomButton from '../ui/CustomButton';
import "./Invoices.css"
import { Toaster, toast } from "sonner";
import InvoicesTable from '../ui/InvoicesTable';
import InvoiceModal from '../ui/InvoiceModal';


const joptions = [
  { value: 11, label: "Aankopen"},
  { value: 12, label: "Aankopen Spanje"},
  { value: 21, label: "Verkopen"},
]

export default function Invoices() {
  const [ invoices, setInvoices] = useState([])
  const [ refresh, setRefresh] = useState(false)
  const [ journal, setJournal] = useState("")
  const [ formData, setFormData] = useState({
    from: "",
    till: "",
    search: ""
    
  })
  const [ file, setFile] = useState(null)
  const [ selectedInvoice, setSelectedInvoice] = useState(null);
  const [ openModal, setOpenModal] = useState(false);

  

  const fetchData = async () => {
    
    try {
      const yearprev = new Date().getFullYear() -1 +  "01"
      const yearcur = new Date().getFullYear() +  "12"
      const response = await axios.post("http://localhost:5001/realm-invoices", { 
        journal: journal,
        from: formData.from || yearprev,
        till: formData.till || yearcur     
      });
      const data = response.data;   // axios puts parsed JSON here
      
      setInvoices(data);
      console.log("invoices",data);
      
      console.log("Invoices fetched:", sortedArray);

    } catch (err) {
      console.error("Request failed:", err.message);
    }
  }


 useEffect(() => {
    if (!journal) return;  // wait till journal selected
 
  fetchData();

 },[refresh])

  const sortedArray = invoices
    // filter if search has a value
    .filter(inv => {

      const search = formData.search.toLowerCase();
      if (formData.search.trim() === "") return true;

     const inRelation = inv.relation?.name?.toLowerCase().includes(search);
     const inPaymentRef = inv.paymentreference?.toLowerCase().includes(search);

     return inRelation || inPaymentRef;
    })
    // sort by period desc, then documentnr desc
    .sort((a, b) => {
      if (b.period !== a.period) {
        return b.period - a.period; // period descending
      }
      return b.documentnr - a.documentnr; // doc nr descending
    });

 const handleSelect = (e) => {
  setJournal(e.target.value)
  console.log("journal",journal)
 }

 const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

 const handleRefresh = () => {
  if (!journal) {
    toast("Select journal first")
    return
  }
   /* i emplement date check later
  if (!formData.from || !formData.till) {
    toast("Enter from and till dates")
    return
  }
    */
  setRefresh(prev => !prev)
  //toast("journal",journal)
  console.log("refresh",refresh)
  
 }

 const handleDoubleClick = (inv) => {
    setOpenModal(true);
    setSelectedInvoice(inv); // open modal with this invoice
  };

  const handleClose = () => {
    setSelectedInvoice(null); // close modal
    setOpenModal(false)
  };

  const handleSave = async (updated) => {
    console.log("Save invoice:", updated);
    const year = updated.period.toString().substring(0, 4);
    const payload = {
      ...updated,
      relation: updated.relation?.id || null, // send relation id only
      pdf : updated?.pdf ? "bk" + year + "/" + updated.pdf : null
     }
    // TODO: call backend (axios POST/PUT) to update Realm/DB
    const response = await axios.post("http://localhost:5001/realm-addinvoice", payload);
    console.log("response", response.data);
    setSelectedInvoice(null);
    setRefresh(prev => !prev)
    if (updated.pdf) {
      const res = await axios.post("http://localhost:5001/move-file", { pdfname: "bk" + year + "/" + updated.pdf });
      console.log("move response", res.data);
    }
  };
  

  return (
   
  <div className="container">
    <div className="column2">
      <div className="header-row">
  <select id="selectJournal" value={journal} onChange={handleSelect}>
    <option value="">Select journal...</option>
    <option value="11">Aankopen</option>
    <option value="12">Aankopen Spanje</option>
    <option value="21">Verkopen</option>
  </select>

  <div className="input-row">
    <div className="iwrapper">
      <input
        placeholder="From"
        name="from"
        value={formData.from}
        onChange={handleChangeForm}
      />
    </div>
    <div className="iwrapper">
      <input
        placeholder="Till"
        name="till"
        value={formData.till}
        onChange={handleChangeForm}
      />
    </div>
  </div>

  <div className="bwrapper">
    <CustomButton onClick={handleRefresh}>Refresh</CustomButton>
  </div>
<Toaster richColors position="top-center" offset={100}/>
  <input placeholder="Search..."
        name="search"
        value={formData.search} 
         onChange={handleChangeForm}
         />
</div>

      <div className="content-area">
       <InvoicesTable invoices={sortedArray} onRowDoubleClick={handleDoubleClick} onRowClick={setSelectedInvoice}/>
       {openModal && selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
      </div>
    </div>

    <div className="column1">
      {selectedInvoice?.pdf && (
          <iframe
            src={`http://localhost:5001/pdfs/${selectedInvoice.pdf}`}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title="Invoice PDF"
          />
        ) }
    </div>
  </div>

  )
}

