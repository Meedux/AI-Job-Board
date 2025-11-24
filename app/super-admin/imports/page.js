 'use client'

 import React, { useEffect, useMemo, useState } from 'react';

 const PAGE_SIZE = 12;

 function StatusBadge({ status }) {
   const cls = {
     pending: 'bg-yellow-100 text-yellow-800',
     approved: 'bg-green-100 text-green-800',
     rejected: 'bg-red-100 text-red-800'
   }[status] || 'bg-gray-100 text-gray-800';
   return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{status}</span>;
 }

 export default function ImportsPage() {
   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [page, setPage] = useState(1);
   const [query, setQuery] = useState('');
   const [selected, setSelected] = useState(new Set());
   const [expanded, setExpanded] = useState(null);

   async function load() {
     setLoading(true);
     try {
       const res = await fetch('/api/jobs/imports?limit=200');
       const data = await res.json();
       if (data && data.items) setItems(data.items);
     } catch (e) {
       console.error('Failed to load imports', e);
     } finally { setLoading(false); }
   }

   useEffect(() => { load(); }, []);

   const filtered = useMemo(() => {
     if (!query) return items;
     const q = query.toLowerCase();
     return items.filter(i => (i.title||'').toLowerCase().includes(q) || (i.companyName||'').toLowerCase().includes(q) || (i.sourceHost||'').toLowerCase().includes(q));
   }, [items, query]);

   const total = filtered.length;
   const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

   function toggleSelect(id){
     const s = new Set(selected);
     if (s.has(id)) s.delete(id); else s.add(id);
     setSelected(s);
   }

   async function doBulkAction(action){
     if (selected.size === 0) return alert('No items selected');
     if (!confirm(`Are you sure? ${action} ${selected.size} items`)) return;
     for (const id of [...selected]){
       const url = `/api/jobs/imports/${id}/${action}`;
       await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reason: action==='reject' ? 'Bulk rejected' : undefined }) });
     }
     setSelected(new Set());
     load();
     alert('Done');
   }

   async function approveOne(id){
     if (!confirm('Approve and publish this imported job?')) return;
     const res = await fetch(`/api/jobs/imports/${id}/approve`, { method: 'POST' });
     const data = await res.json();
     if (data?.success) { await load(); alert('Approved'); } else { alert('Failed: ' + (data?.error || 'unknown')); }
   }

   async function rejectOne(id){
     const reason = prompt('Optional reason for rejection');
     const res = await fetch(`/api/jobs/imports/${id}/reject`, { method: 'POST', headers: { 'content-type': 'application/json'}, body: JSON.stringify({ reason }) });
     const data = await res.json();
     if (data?.success) { await load(); alert('Rejected'); } else { alert('Failed: ' + (data?.error || 'unknown')); }
   }

   if (loading) return <div className="p-6">Loading imports…</div>;

   return (
     <div className="p-6">
       <div className="flex items-center justify-between mb-6">
         <div>
           <h2 className="text-2xl font-bold">Aggregated Job Imports</h2>
           <div className="text-sm text-gray-500 mt-1">Review, approve or reject imported job candidates from crawler runs.</div>
         </div>
         <div className="flex items-center gap-2">
           <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search title, company or source" className="px-3 py-2 border rounded-lg w-72" />
           <button onClick={() => load()} className="px-3 py-2 border rounded-lg bg-white">Refresh</button>
           <div className="ml-2 flex items-center gap-2">
             <button onClick={() => doBulkAction('approve')} className="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-50">Approve selected</button>
             <button onClick={() => doBulkAction('reject')} className="px-3 py-2 bg-red-600 text-white rounded">Reject selected</button>
           </div>
         </div>
       </div>

       <div className="bg-white border rounded-lg overflow-hidden">
         <table className="min-w-full table-auto">
           <thead className="bg-gray-50">
             <tr>
               <th className="px-4 py-3 text-left text-sm font-medium text-gray-500"> </th>
               <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Title</th>
               <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Company</th>
               <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Location</th>
               <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Source</th>
               <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
               <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
             </tr>
           </thead>
           <tbody>
             {filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE).map(it => (
               <tr key={it.id} className="border-b hover:bg-gray-50">
                 <td className="px-4 py-3">
                   <input type="checkbox" checked={selected.has(it.id)} onChange={() => toggleSelect(it.id)} />
                 </td>
                 <td className="px-4 py-3 align-top">
                   <div className="font-semibold">{it.title}</div>
                   <div className="text-xs text-gray-500 mt-1">{new Date(it.createdAt).toLocaleString()}</div>
                   {expanded === it.id && (
                     <pre className="mt-2 text-xs bg-slate-50 p-3 rounded border text-xs overflow-auto max-h-48">{JSON.stringify(it.normalized || it, null, 2)}</pre>
                   )}
                 </td>
                 <td className="px-4 py-3 align-top">{it.companyName}</td>
                 <td className="px-4 py-3 align-top">{it.location}</td>
                 <td className="px-4 py-3 align-top"><a className="text-xs text-blue-600" href={it.sourceUrl||'#'} target="_blank" rel="noreferrer">{it.sourceHost || it.sourceUrl}</a></td>
                 <td className="px-4 py-3 align-top"><StatusBadge status={it.status} /></td>
                 <td className="px-4 py-3 align-top text-right">
                   <div className="flex items-center justify-end gap-2">
                     <button onClick={() => setExpanded(expanded === it.id ? null : it.id)} className="px-2 py-1 text-xs border rounded">{expanded===it.id ? 'Hide' : 'Details'}</button>
                     <button onClick={() => approveOne(it.id)} className="px-3 py-1 text-xs bg-green-600 text-white rounded">Approve</button>
                     <button onClick={() => rejectOne(it.id)} className="px-3 py-1 text-xs bg-red-600 text-white rounded">Reject</button>
                   </div>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>

       <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
         <div>Showing {Math.min(total, (page-1)*PAGE_SIZE+1)} - {Math.min(total, page*PAGE_SIZE)} of {total} imports</div>
         <div className="flex items-center gap-2">
           <button onClick={() => setPage(1)} disabled={page===1} className="px-3 py-1 border rounded">«</button>
           <button onClick={() => setPage(Math.max(1,page-1))} disabled={page===1} className="px-3 py-1 border rounded">‹</button>
           <div className="px-3 py-1 border rounded">{page} / {pages}</div>
           <button onClick={() => setPage(Math.min(pages,page+1))} disabled={page===pages} className="px-3 py-1 border rounded">›</button>
           <button onClick={() => setPage(pages)} disabled={page===pages} className="px-3 py-1 border rounded">»</button>
         </div>
       </div>
     </div>
   );
 }
