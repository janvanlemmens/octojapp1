import React , { useState, useEffect } from 'react'
import axios from 'axios';
import CustomButton from '../ui/CustomButton';
import "./Invoices.css"


const joptions = [
  { value: 11, label: "Aankopen"},
  { value: 12, label: "Aankopen Spanje"},
  { value: 21, label: "Verkopen"},
]

export default function Invoices() {
  const [ invoices, setInvoices] = useState([])
  const [ refresh, setRefresh] = useState(false)
  const [ journal, setJournal] = useState("")
  const [ file, setFile] = useState(null)

 useEffect(() => {
 
  const fetchData = () => {

  }

  fetchData();

 },[refresh])

 const handleSelect = (e) => {
  setJournal(e.target.value)
  console.log("journal",journal)
 }

 const handleRefresh = () => {
  setRefresh(prev => !prev)
 }
  

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

        <input type="date" />
        <input type="date" />
        <button onClick={handleRefresh}>Refresh</button>
        <input type="text" placeholder="Search..." />
      </div>

      <div className="content-area">
        {/* left content (list/table) */}
      </div>
    </div>

    <div className="column1">
      {/* right content (details/preview) */}
    </div>
  </div>


  )
}

