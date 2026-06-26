'use strict';
const Data = {
  exportBackup() {
    const s = Store.toJSON();
    const b = new Blob([s],{type:'application/json'});
    const u = URL.createObjectURL(b), a = document.createElement('a');
    a.href=u; a.download=`v4-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(u);
    Toast.show('Backup exported','success');
  },
  importBackup(e) {
    const f=e.target.files[0]; if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{ try{Store.fromJSON(ev.target.result);Toast.show('Data imported','success');App.refresh();}catch{Toast.show('Invalid file','error');} };
    r.readAsText(f); e.target.value='';
  },
  exportCSV(name, rows) {
    const csv=rows.map(r=>r.map(c=>`"${String(c??'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const b=new Blob([csv],{type:'text/csv'}),u=URL.createObjectURL(b),a=document.createElement('a');
    a.href=u;a.download=name;a.click();URL.revokeObjectURL(u);
  },
  readExcel(file, cb) {
    const r=new FileReader();
    r.onload=e=>{const wb=XLSX.read(new Uint8Array(e.target.result),{type:'array'});cb(wb);};
    r.readAsArrayBuffer(file);
  },
  // Invoice Excel: Invoice No | Date | SKU ID | Qty
  parseInvoiceXL(wb) {
    const ws=wb.Sheets[wb.SheetNames[0]];
    const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
    const map={};
    rows.forEach(cols=>{
      if(!cols[0]||!cols[2])return;
      const num=String(cols[0]).trim();
      let date=cols[1];
      const skuId=String(cols[2]).trim().toUpperCase();
      const qty=parseInt(cols[3])||0;
      if(typeof date==='number'){const d=XLSX.SSF.parse_date_code(date);date=`${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;}
      date=String(date).trim();
      const key=`${num}|${date}`;
      if(!map[key])map[key]={num,date,lines:[]};
      if(qty>0)map[key].lines.push({skuId,qty});
    });
    return Object.values(map);
  },
  // SKU Excel: ID | Loreal Code | EAN | Name | Category
  parseSKUXL(wb) {
    const ws=wb.Sheets[wb.SheetNames[0]];
    const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
    return rows.map(c=>({
      id:String(c[0]||'').trim().toUpperCase(),
      lorCode:String(c[1]||'').trim(),
      ean:String(c[2]||'').trim(),
      name:String(c[3]||'').trim(),
      cat:String(c[4]||'Other').trim(),
    })).filter(r=>r.id&&r.name);
  },
};
