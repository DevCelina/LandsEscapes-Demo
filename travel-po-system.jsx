import { useState, useMemo } from "react";

const VENDORS = ["Air France", "Emirates Airlines", "Marriott Hotels", "Hilton Group", "Hertz Car Rental", "Viator Tours", "Trafalgar Travel", "National Express", "Celebrity Cruises", "G Adventures"];
const CATEGORIES = ["Airfare", "Hotel", "Car Rental", "Tour Package", "Cruise", "Ground Transport", "Travel Insurance", "Visa Fees", "Misc Supplies"];
const STATUSES = ["Draft", "Pending", "Approved", "Rejected"];

const STATUS_CONFIG = {
  Draft:    { color: "#94a3b8", bg: "#1e293b",  label: "Draft" },
  Pending:  { color: "#f59e0b", bg: "#292013",  label: "Pending" },
  Approved: { color: "#10b981", bg: "#0d2920",  label: "Approved" },
  Rejected: { color: "#ef4444", bg: "#2d1111",  label: "Rejected" },
};

const STATUS_PRINT = {
  Draft:    { color: "#475569", border: "#94a3b8" },
  Pending:  { color: "#b45309", border: "#f59e0b" },
  Approved: { color: "#047857", border: "#10b981" },
  Rejected: { color: "#b91c1c", border: "#ef4444" },
};

const generateId = () => "PO-" + String(Math.floor(Math.random() * 90000) + 10000);
const today = () => new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const initialPOs = [
  { id: "PO-38241", vendor: "Emirates Airlines",  category: "Airfare",      description: "Round-trip flights DXB-JFK for 4 pax - Business Class",        amount: 18400, date: "2026-04-15", requestedBy: "Sarah Mitchell", status: "Approved", notes: "Confirmed with airline. Ticket numbers issued." },
  { id: "PO-38190", vendor: "Marriott Hotels",    category: "Hotel",        description: "7 nights at Marriott Marquis Dubai - Deluxe Sea View",           amount: 6300,  date: "2026-04-20", requestedBy: "James Okonkwo",  status: "Pending",  notes: "Awaiting GM sign-off." },
  { id: "PO-38155", vendor: "Hertz Car Rental",   category: "Car Rental",   description: "SUV rental x3 - Santorini, 5 days",                              amount: 1750,  date: "2026-04-10", requestedBy: "Liu Wei",        status: "Approved", notes: "" },
  { id: "PO-38100", vendor: "Viator Tours",       category: "Tour Package", description: "Guided Colosseum and Vatican tour for group of 12",               amount: 2160,  date: "2026-03-30", requestedBy: "Anita Sharma",   status: "Rejected", notes: "Budget exceeded for Q1. Reschedule to Q3." },
  { id: "PO-38055", vendor: "Celebrity Cruises",  category: "Cruise",       description: "Mediterranean 10-night cruise - Balcony cabins x6",              amount: 31200, date: "2026-05-01", requestedBy: "Sarah Mitchell", status: "Draft",    notes: "" },
];

const emptyForm = { vendor: "", category: "", description: "", amount: "", date: "", requestedBy: "", notes: "" };

// ─── PDF Export ───────────────────────────────────────────────────────────────

function exportSinglePO(po) {
  const sc = STATUS_PRINT[po.status];
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>${po.id} Purchase Order</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;color:#1e293b;background:#fff;padding:48px;font-size:14px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #e2e8f0}
    .logo{width:44px;height:44px;background:linear-gradient(135deg,#0ea5e9,#6366f1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;margin-right:14px;float:left}
    .brand-name{font-size:22px;font-weight:700;color:#0f172a}
    .brand-sub{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin-top:3px}
    .po-label{font-size:11px;color:#94a3b8;font-family:monospace;letter-spacing:0.06em;margin-bottom:5px}
    .vendor-name{font-size:28px;font-weight:700;color:#0f172a;letter-spacing:-0.02em;margin-bottom:8px}
    .status-pill{display:inline-block;padding:5px 16px;border-radius:999px;border:1.5px solid ${sc.border};color:${sc.color};font-size:12px;font-weight:700;letter-spacing:0.06em}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:24px 0}
    .field{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px}
    .flabel{font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;font-weight:600;margin-bottom:5px}
    .fvalue{font-size:15px;font-weight:600;color:#0f172a}
    .amount-field{background:#eff6ff;border:1px solid #bfdbfe}
    .amount-val{font-size:26px;font-weight:700;color:#1d4ed8}
    .box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:14px}
    .boxlabel{font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;font-weight:600;margin-bottom:8px}
    .boxtext{color:#334155;line-height:1.7;font-size:14px}
    .notes{background:#fffbeb;border:1px solid #fde68a}
    .noteslabel{color:#92400e}
    .notestext{color:#78350f}
    .sig-section{margin-top:48px;padding-top:24px;border-top:1px solid #e2e8f0}
    .sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-top:20px}
    .sig-line{padding-top:8px;border-top:1px solid #cbd5e1;font-size:11px;color:#94a3b8}
    .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:11px;color:#94a3b8}
    @media print{body{padding:30px}@page{margin:1cm}}
  </style></head><body>
  <div class="header">
    <div style="display:flex;align-items:center">
      <div class="logo">+</div>
      <div style="margin-left:14px">
        <div class="brand-name">VoyageOps</div>
        <div class="brand-sub">Travel Agency - Internal Purchase Order</div>
      </div>
    </div>
    <div style="text-align:right">
      <div class="po-label">${po.id}</div>
      <div style="font-size:12px;color:#94a3b8;margin-top:2px">Printed: ${today()}</div>
    </div>
  </div>

  <div>
    <div class="po-label">PURCHASE ORDER</div>
    <div class="vendor-name">${po.vendor}</div>
    <div class="status-pill">${po.status.toUpperCase()}</div>
  </div>

  <div class="grid">
    <div class="field"><div class="flabel">PO Number</div><div class="fvalue" style="font-family:monospace">${po.id}</div></div>
    <div class="field"><div class="flabel">Order Date</div><div class="fvalue">${po.date}</div></div>
    <div class="field"><div class="flabel">Category</div><div class="fvalue">${po.category}</div></div>
    <div class="field"><div class="flabel">Requested By</div><div class="fvalue">${po.requestedBy}</div></div>
  </div>

  <div class="field amount-field" style="margin-bottom:14px">
    <div class="flabel" style="color:#3b82f6">Total Amount (USD)</div>
    <div class="amount-val">$${Number(po.amount).toLocaleString()}</div>
  </div>

  <div class="box">
    <div class="boxlabel">Description</div>
    <div class="boxtext">${po.description}</div>
  </div>

  ${po.notes ? `<div class="box notes"><div class="boxlabel noteslabel">Notes</div><div class="boxtext notestext">${po.notes}</div></div>` : ""}

  <div class="sig-section">
    <div style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Authorizations</div>
    <div class="sig-grid">
      <div><div class="sig-line">Requested By &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date</div></div>
      <div><div class="sig-line">Approved By &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date</div></div>
    </div>
  </div>

  <div class="footer">
    <span>VoyageOps - Confidential Internal Document</span>
    <span>Generated ${today()}</span>
  </div>
  <script>window.onload = function(){ window.print(); }</script>
  </body></html>`;

  const win = window.open("", "_blank", "width=860,height=700");
  if (win) { win.document.write(html); win.document.close(); }
}

function exportAllPOs(poList, filterLabel) {
  const total = poList.reduce((a, p) => a + p.amount, 0);
  const rows = poList.map((po, i) => {
    const sc = STATUS_PRINT[po.status];
    return `<tr style="background:${i % 2 === 0 ? "#fff" : "#f8fafc"}">
      <td style="font-family:monospace;color:#0369a1;font-weight:600;padding:11px 12px">${po.id}</td>
      <td style="padding:11px 12px"><strong style="color:#0f172a">${po.vendor}</strong><br/><span style="color:#94a3b8;font-size:12px">${po.description.substring(0,60)}${po.description.length>60?"...":""}</span></td>
      <td style="padding:11px 12px;color:#475569">${po.category}</td>
      <td style="padding:11px 12px;font-family:monospace;font-weight:700;color:#0f172a">$${Number(po.amount).toLocaleString()}</td>
      <td style="padding:11px 12px;color:#475569">${po.requestedBy}</td>
      <td style="padding:11px 12px;color:#475569">${po.date}</td>
      <td style="padding:11px 12px"><span style="padding:3px 12px;border-radius:999px;border:1.5px solid ${sc.border};color:${sc.color};font-size:11px;font-weight:700;white-space:nowrap">${po.status}</span></td>
    </tr>`;
  }).join("");

  const summaryCards = STATUSES.map(s => {
    const list = poList.filter(p => p.status === s);
    return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;font-weight:600;margin-bottom:6px">${s}</div>
      <div style="font-size:18px;font-weight:700;color:#0f172a">$${list.reduce((a,p)=>a+p.amount,0).toLocaleString()}</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:4px">${list.length} order${list.length!==1?"s":""}</div>
    </div>`;
  }).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>VoyageOps - Purchase Orders Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;color:#1e293b;background:#fff;padding:40px;font-size:13px}
    table{width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden}
    th{background:#f1f5f9;text-align:left;padding:10px 12px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;font-weight:700;border-bottom:2px solid #e2e8f0}
    td{border-bottom:1px solid #f1f5f9;vertical-align:middle}
    @media print{body{padding:20px}@page{margin:1cm;size:landscape}}
  </style></head><body>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;padding-bottom:18px;border-bottom:2px solid #e2e8f0">
    <div style="display:flex;align-items:center;gap:12px">
      <div style="width:40px;height:40px;background:linear-gradient(135deg,#0ea5e9,#6366f1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px">+</div>
      <div>
        <div style="font-size:20px;font-weight:700;color:#0f172a">VoyageOps</div>
        <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em">Internal Purchase Orders</div>
      </div>
    </div>
    <div style="text-align:right;font-size:12px;color:#94a3b8">Generated: ${today()}</div>
  </div>

  <div style="margin-bottom:6px">
    <span style="font-size:22px;font-weight:700;color:#0f172a">Purchase Orders Report</span>
  </div>
  <div style="color:#64748b;font-size:13px;margin-bottom:24px">Filter: ${filterLabel} &nbsp;·&nbsp; ${poList.length} order${poList.length!==1?"s":""} &nbsp;·&nbsp; Total: $${total.toLocaleString()}</div>

  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px">
    ${summaryCards}
  </div>

  <table>
    <thead><tr><th>PO #</th><th>Vendor / Description</th><th>Category</th><th>Amount</th><th>Requested By</th><th>Date</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr style="background:#f1f5f9">
        <td colspan="3" style="padding:12px;text-align:right;color:#64748b;font-size:12px;font-weight:600">TOTAL</td>
        <td style="padding:12px;font-family:monospace;font-weight:700;font-size:16px;color:#0369a1">$${total.toLocaleString()}</td>
        <td colspan="3"></td>
      </tr>
    </tfoot>
  </table>

  <div style="margin-top:28px;padding-top:14px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:11px;color:#94a3b8">
    <span>VoyageOps - Confidential Internal Document</span>
    <span>Page 1 of 1</span>
  </div>
  <script>window.onload = function(){ window.print(); }</script>
  </body></html>`;

  const win = window.open("", "_blank", "width=1100,height=750");
  if (win) { win.document.write(html); win.document.close(); }
}

// ─── Components ───────────────────────────────────────────────────────────────

function Badge({ status }) {
  const c = STATUS_CONFIG[status];
  return <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}40`, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>{c.label}</span>;
}

function Modal({ po, onClose, onStatusChange }) {
  if (!po) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, width: "100%", maxWidth: 580, padding: 32, position: "relative" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 4, fontFamily: "monospace", letterSpacing: "0.05em" }}>{po.id}</div>
            <div style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 700 }}>{po.vendor}</div>
          </div>
          <Badge status={po.status} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[["Category", po.category], ["Date", po.date], ["Requested By", po.requestedBy], ["Amount", `$${Number(po.amount).toLocaleString()}`]].map(([k, v]) => (
            <div key={k} style={{ background: "#1e293b", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{k}</div>
              <div style={{ color: k === "Amount" ? "#38bdf8" : "#f1f5f9", fontSize: k === "Amount" ? 20 : 15, fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#1e293b", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Description</div>
          <div style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 1.6 }}>{po.description}</div>
        </div>

        {po.notes && (
          <div style={{ background: "#1c1a0d", border: "1px solid #f59e0b30", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ color: "#b45309", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Notes</div>
            <div style={{ color: "#d97706", fontSize: 14, lineHeight: 1.6 }}>{po.notes}</div>
          </div>
        )}

        <button onClick={() => exportSinglePO(po)}
          style={{ width: "100%", background: "#1e293b", color: "#7dd3fc", border: "1px solid #38bdf830", borderRadius: 10, padding: "11px", fontWeight: 600, cursor: "pointer", fontSize: 14, marginBottom: 10 }}>
          ↓ Export this PO as PDF
        </button>

        {po.status === "Pending" && (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => onStatusChange(po.id, "Approved")} style={{ flex: 1, background: "#10b981", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Approve</button>
            <button onClick={() => onStatusChange(po.id, "Rejected")} style={{ flex: 1, background: "#ef444420", color: "#ef4444", border: "1px solid #ef444440", borderRadius: 10, padding: "12px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Reject</button>
          </div>
        )}
        {po.status === "Draft" && (
          <button onClick={() => onStatusChange(po.id, "Pending")} style={{ width: "100%", background: "#f59e0b", color: "#000", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Submit for Approval</button>
        )}

        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>x</button>
      </div>
    </div>
  );
}

function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.vendor) e.vendor = true;
    if (!form.category) e.category = true;
    if (!form.description) e.description = true;
    if (!form.amount || isNaN(Number(form.amount))) e.amount = true;
    if (!form.date) e.date = true;
    if (!form.requestedBy) e.requestedBy = true;
    return e;
  };

  const handleSubmit = (asDraft) => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onCreate({ ...form, amount: Number(form.amount), id: generateId(), status: asDraft ? "Draft" : "Pending" });
    onClose();
  };

  const inp = (key, placeholder, type = "text") => (
    <div style={{ marginBottom: 14 }}>
      <input type={type} placeholder={placeholder} value={form[key]}
        onChange={e => { set(key, e.target.value); setErrors(er => ({ ...er, [key]: false })); }}
        style={{ width: "100%", background: errors[key] ? "#2d1111" : "#1e293b", border: `1px solid ${errors[key] ? "#ef4444" : "#334155"}`, borderRadius: 8, padding: "11px 14px", color: "#f1f5f9", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, width: "100%", maxWidth: 520, padding: 32, position: "relative", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 700, marginBottom: 24 }}>New Purchase Order</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
          <select value={form.vendor} onChange={e => { set("vendor", e.target.value); setErrors(er => ({ ...er, vendor: false })); }}
            style={{ width: "100%", background: errors.vendor ? "#2d1111" : "#1e293b", border: `1px solid ${errors.vendor ? "#ef4444" : "#334155"}`, borderRadius: 8, padding: "11px 14px", color: form.vendor ? "#f1f5f9" : "#64748b", fontSize: 14, marginBottom: 14, boxSizing: "border-box", appearance: "none" }}>
            <option value="">Vendor</option>
            {VENDORS.map(v => <option key={v}>{v}</option>)}
          </select>
          <select value={form.category} onChange={e => { set("category", e.target.value); setErrors(er => ({ ...er, category: false })); }}
            style={{ width: "100%", background: errors.category ? "#2d1111" : "#1e293b", border: `1px solid ${errors.category ? "#ef4444" : "#334155"}`, borderRadius: 8, padding: "11px 14px", color: form.category ? "#f1f5f9" : "#64748b", fontSize: 14, marginBottom: 14, boxSizing: "border-box", appearance: "none" }}>
            <option value="">Category</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <textarea placeholder="Description" value={form.description} onChange={e => { set("description", e.target.value); setErrors(er => ({ ...er, description: false })); }}
            style={{ width: "100%", background: errors.description ? "#2d1111" : "#1e293b", border: `1px solid ${errors.description ? "#ef4444" : "#334155"}`, borderRadius: 8, padding: "11px 14px", color: "#f1f5f9", fontSize: 14, boxSizing: "border-box", outline: "none", minHeight: 80, resize: "vertical", fontFamily: "inherit" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
          {inp("amount", "Amount (USD)", "number")}
          {inp("date", "Date", "date")}
        </div>
        {inp("requestedBy", "Requested By")}
        <div style={{ marginBottom: 20 }}>
          <textarea placeholder="Notes (optional)" value={form.notes} onChange={e => set("notes", e.target.value)}
            style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "11px 14px", color: "#94a3b8", fontSize: 14, boxSizing: "border-box", outline: "none", minHeight: 60, resize: "vertical", fontFamily: "inherit" }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => handleSubmit(true)} style={{ flex: 1, background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: 10, padding: "12px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Save as Draft</button>
          <button onClick={() => handleSubmit(false)} style={{ flex: 1, background: "linear-gradient(135deg,#0ea5e9,#6366f1)", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Submit for Approval</button>
        </div>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>x</button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [pos, setPOs] = useState(initialPOs);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");

  const handleStatusChange = (id, status) => {
    setPOs(p => p.map(o => o.id === id ? { ...o, status } : o));
    setSelected(s => s?.id === id ? { ...s, status } : s);
  };

  const handleCreate = (po) => setPOs(p => [po, ...p]);

  const filtered = useMemo(() => pos.filter(p =>
    (filterStatus === "All" || p.status === filterStatus) &&
    (search === "" || [p.vendor, p.id, p.category, p.requestedBy].some(v => v.toLowerCase().includes(search.toLowerCase())))
  ), [pos, filterStatus, search]);

  const totals = useMemo(() => STATUSES.reduce((acc, s) => ({ ...acc, [s]: pos.filter(p => p.status === s).reduce((a, p) => a + p.amount, 0) }), {}), [pos]);
  const totalAll = pos.reduce((a, p) => a + p.amount, 0);
  const filterLabel = filterStatus === "All" ? "All Orders" : `${filterStatus} Orders`;

  return (
    <div style={{ minHeight: "100vh", background: "#080f1a", color: "#f1f5f9", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e293b", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#0ea5e9,#6366f1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✈</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>VoyageOps</div>
            <div style={{ color: "#64748b", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Purchase Orders</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => exportAllPOs(filtered, filterLabel)}
            style={{ background: "#1e293b", color: "#7dd3fc", border: "1px solid #38bdf830", borderRadius: 10, padding: "10px 18px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            ↓ Export List as PDF
          </button>
          <button onClick={() => setCreating(true)}
            style={{ background: "linear-gradient(135deg,#0ea5e9,#6366f1)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
            + New PO
          </button>
        </div>
      </div>

      <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 28 }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Total Value</div>
            <div style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 700 }}>${totalAll.toLocaleString()}</div>
            <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{pos.length} orders</div>
          </div>
          {STATUSES.map(s => (
            <div key={s} onClick={() => setFilterStatus(filterStatus === s ? "All" : s)}
              style={{ background: filterStatus === s ? STATUS_CONFIG[s].bg : "#0f172a", border: `1px solid ${filterStatus === s ? STATUS_CONFIG[s].color + "60" : "#1e293b"}`, borderRadius: 12, padding: "16px 18px", cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ color: STATUS_CONFIG[s].color, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{s}</div>
              <div style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 700 }}>${(totals[s] || 0).toLocaleString()}</div>
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{pos.filter(p => p.status === s).length} orders</div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
          <input placeholder="Search by vendor, PO number, category..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "11px 16px", color: "#f1f5f9", fontSize: 14, outline: "none" }} />
          <div style={{ display: "flex", gap: 6 }}>
            {["All", ...STATUSES].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                style={{ background: filterStatus === s ? (s === "All" ? "#1e293b" : STATUS_CONFIG[s].bg) : "transparent", color: filterStatus === s ? (s === "All" ? "#f1f5f9" : STATUS_CONFIG[s].color) : "#64748b", border: `1px solid ${filterStatus === s ? (s === "All" ? "#334155" : STATUS_CONFIG[s].color + "40") : "#1e293b"}`, borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 120px 110px 120px 100px 70px", padding: "12px 20px", borderBottom: "1px solid #1e293b" }}>
            {["PO Number", "Vendor / Description", "Category", "Amount", "Requested By", "Status", "PDF"].map(h => (
              <div key={h} style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{h}</div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>No purchase orders found.</div>
          )}

          {filtered.map((po, i) => (
            <div key={po.id}
              style={{ display: "grid", gridTemplateColumns: "110px 1fr 120px 110px 120px 100px 70px", padding: "14px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #1e293b" : "none", alignItems: "center", transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#1e293b40"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ color: "#38bdf8", fontSize: 13, fontFamily: "DM Mono,monospace", fontWeight: 500, cursor: "pointer" }} onClick={() => setSelected(po)}>{po.id}</div>
              <div style={{ cursor: "pointer" }} onClick={() => setSelected(po)}>
                <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 14 }}>{po.vendor}</div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 260 }}>{po.description}</div>
              </div>
              <div style={{ color: "#94a3b8", fontSize: 13, cursor: "pointer" }} onClick={() => setSelected(po)}>{po.category}</div>
              <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14, fontFamily: "DM Mono,monospace", cursor: "pointer" }} onClick={() => setSelected(po)}>${Number(po.amount).toLocaleString()}</div>
              <div style={{ color: "#94a3b8", fontSize: 13, cursor: "pointer" }} onClick={() => setSelected(po)}>{po.requestedBy}</div>
              <div style={{ cursor: "pointer" }} onClick={() => setSelected(po)}><Badge status={po.status} /></div>
              <div>
                <button onClick={() => exportSinglePO(po)} title="Export PDF"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "#7dd3fc", borderRadius: 7, padding: "6px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
          <div style={{ color: "#334155", fontSize: 12 }}>Showing {filtered.length} of {pos.length} purchase orders</div>
          <button onClick={() => exportAllPOs(filtered, filterLabel)}
            style={{ background: "transparent", border: "1px solid #334155", color: "#64748b", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            ↓ Export {filterLabel} as PDF
          </button>
        </div>
      </div>

      {selected && <Modal po={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />}
      {creating && <CreateModal onClose={() => setCreating(false)} onCreate={handleCreate} />}
    </div>
  );
}
