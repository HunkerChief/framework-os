            <div class="flex justify-between"><span class="font-display">${cat?cat.name:u.product}</span><span>${u.date} · ${u.qty}</span></div>
            <div class="text-forest/70">${u.area} · ${u.pest} · ${u.weather}</div>
            <div class="text-xs mt-1">${u.jobId} · PCP ${u.pcp} · ${u.note}</div>
          </div>`;
        }).join('')||'<p class="text-sm text-forest/50">Nothing logged.</p>'}
      `);
    }

    function viewDevices(){
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Bait / monitor map</div>
        <h1 class="font-display text-4xl font-semibold mb-4">Devices</h1>
        <p class="text-sm text-forest/70 mb-4">Station IDs stay with the property so the next tech does not guess. Barcode hardware is future — names and last check are now.</p>
        ${(state.devices||[]).map(d=>{
          const l = leadBy(d.leadId);
          return `<div class="bg-white rounded-2xl p-4 border border-forest/10 mb-2 flex flex-wrap justify-between gap-3">
            <div>
              <div class="text-xs">${d.id} · ${d.kind}</div>
              <div class="font-display text-lg">${l?l.org:d.leadId}</div>
              <div class="text-sm">${d.loc}</div>
              <div class="text-xs text-forest/55">Last ${d.last} · ${d.result} · next ${d.next}</div>
            </div>
            <button onclick="checkDevice('${d.id}')" class="text-xs bg-forest text-white px-3 py-1 h-8 rounded-full">Log check</button>
          </div>`;
        }).join('')}
      `);
    }

    function viewInventory(){
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Truck par</div>
        <h1 class="font-display text-4xl font-semibold mb-4">Inventory</h1>
        <p class="text-sm text-forest/70 mb-4">Par is on-truck. Spend lives on <button class="underline" onclick="go('suppliers')">Suppliers</button> — Veseris, Target, Nosis, Kin.</p>
        ${(state.inventory||[]).map(it=>{
          const low = it.onhand < it.par;
          return `<div class="bg-white rounded-xl p-4 border border-forest/10 mb-2 flex justify-between items-center">
            <div>
              <div class="font-display">${it.name}</div>
              <div class="text-xs text-forest/55">${it.sku} · ${it.season} · par ${it.par}</div>
            </div>
            <div class="flex items-center gap-3">
              ${low?statusChip('Reorder'):''}
              <button onclick="adjustStock('${it.sku}',-1)" class="border w-8 h-8 rounded-full">−</button>
              <span class="font-display text-xl w-8 text-center">${it.onhand}</span>
              <button onclick="adjustStock('${it.sku}',1)" class="border w-8 h-8 rounded-full">+</button>
            </div>
          </div>`;
        }).join('')}
      `);
    }

    function supplierBy(id){ return (state.suppliers||[]).find(s=>s.id===id); }
    window.addPurchase = ()=>{
      const supplierId = prompt('Supplier id (SUP-VES / SUP-TGT / SUP-NOS / SUP-KIN)','SUP-VES'); if(!supplierId||!supplierBy(supplierId)) return showToast('Unknown supplier');
      const item = prompt('Item','Hardware cloth')||'Stock';
      const sku = prompt('SKU if it hits par (MESH-6 / WEEP-B / SEAL-EXT / SNAP-CV / STAT-TR)','')||'';
      const qty = Number(prompt('Qty','1')||1);
      const subtotal = Number(prompt('Subtotal CAD before GST','0')||0);
      const gst = Math.round(subtotal*GST*100)/100;
      state.purchases.unshift({ id:uid('PO'), supplierId, date:selectedDay, sku, item, qty, subtotal, gst, total:Math.round((subtotal+gst)*100)/100, status:'Ordered', jobId:'' });
      save(state); view='suppliers'; showToast('PO drafted — GST 5%');
    };
    window.receivePO = (id)=>{
      const p = (state.purchases||[]).find(x=>x.id===id); if(!p) return;
      p.status = 'Received';
      const it = (state.inventory||[]).find(x=>x.sku===p.sku);
      if(it) it.onhand += Number(p.qty||0);
      save(state); showToast(it? p.sku+' +'+p.qty+' on truck':id+' received (no par SKU)');
    };
    window.payPO = (id)=>{
      const p = (state.purchases||[]).find(x=>x.id===id); if(!p) return;
      p.status = 'Paid'; save(state); showToast(id+' marked paid to supplier');
    };

    function viewSuppliers(){
      const pos = state.purchases||[];
      const spend = (sid)=> pos.filter(p=>p.supplierId===sid).reduce((a,p)=>a+Number(p.total||0),0);
      const ytd = pos.reduce((a,p)=>a+Number(p.total||0),0);
      return shell(`
        <div class="flex flex-wrap justify-between gap-3 mb-4">
          <div>
            <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Purchasing</div>
            <h1 class="font-display text-4xl font-semibold">Suppliers</h1>
            <p class="text-sm text-forest/70 max-w-2xl">Veseris, Target Specialty, Nosis, and Kin. Track what left the account. Labelled product still needs the PCP from the carton when it hits the use log — this ledger is money, not a rate card.</p>
          </div>
          <button onclick="addPurchase()" class="bg-forest text-offwhite px-4 py-2 rounded-full font-display">New PO</button>
        </div>
        <div class="bg-white border border-forest/10 rounded-2xl p-4 mb-5 font-display text-2xl">YTD on this device ${money(ytd)} <span class="text-sm font-body text-forest/45">incl. GST</span></div>
        <div class="grid md:grid-cols-2 gap-3 mb-8">
          ${(state.suppliers||[]).map(s=>`
            <article class="bg-white rounded-2xl p-4 border border-forest/10">
              <div class="text-xs text-forest/40">${s.id} · ${s.kind}</div>
              <div class="font-display text-2xl">${s.name}</div>
              <div class="text-sm text-forest/60">${s.city} · ${s.pay}</div>
              <div class="font-display text-xl mt-2">${money(spend(s.id))}</div>
              <p class="text-xs text-forest/55 mt-2">${s.note}</p>
            </article>`).join('')}
        </div>
        <h2 class="font-display text-xl mb-2">Purchase log</h2>
        ${pos.map(p=>{
          const s = supplierBy(p.supplierId);
          return `<div class="bg-white rounded-xl p-3 border mb-2 flex flex-wrap justify-between gap-2 text-sm">
            <div>
              <div class="font-display">${p.id} · ${s?s.name:p.supplierId}</div>
              <div class="text-xs text-forest/55">${p.date} · ${p.item} × ${p.qty} ${p.sku?'· '+p.sku:''}</div>
            </div>
            <div class="text-right">
              <div class="font-display">${money(p.total)}</div>
              ${statusChip(p.status)}
              ${p.status==='Ordered'?`<button onclick="receivePO('${p.id}')" class="block text-[11px] underline mt-1">Receive to truck</button>`:''}
              ${p.status==='Received'?`<button onclick="payPO('${p.id}')" class="block text-[11px] underline mt-1">Mark paid</button>`:''}
            </div>
          </div>`;
        }).join('')||'<p class="text-sm">No POs.</p>'}
      `);
    }

    function dueChip(date){
      if(!date) return '';
      if(date < selectedDay) return statusChip('Overdue');
      if(date <= '2026-10-15') return statusChip('Due soon');
      return statusChip('Scheduled');
    }
    window.logMaint = ()=>{
      const asset = prompt('Asset id (VAN-1 / EQ-SPR / EQ-LAD / EQ-THM / EQ-MST / EQ-PPE)','VAN-1'); if(!asset) return;
      const kind = prompt('Work done','Oil')||'Service';
      const cost = Number(prompt('Cost CAD incl tax','0')||0);
      state.maint.unshift({ id:uid('M'), asset, date:selectedDay, kind, km:prompt('Km if van','')||'', cost, shop:prompt('Shop / in-house','In-house')||'In-house', status:'Done' });
      const v = (state.vehicles||[]).find(x=>x.id===asset);
      if(v && /oil/i.test(kind)) v.nextOil = prompt('Next oil date YYYY-MM-DD', v.nextOil)||v.nextOil;
      save(state); view='fleet'; showToast('Maintenance logged');
    };
    window.bumpKm = ()=>{
      const v = (state.vehicles||[])[0]; if(!v) return;
      v.km = Number(prompt('Odometer km', String(v.km))||v.km);
      save(state); render();
    };

    function viewFleet(){
      const ytd = (state.maint||[]).reduce((a,m)=>a+Number(m.cost||0),0);
      return shell(`
        <div class="flex flex-wrap justify-between gap-3 mb-4">
          <div>
            <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Scheduled maintenance</div>
            <h1 class="font-display text-4xl font-semibold">Fleet and kit</h1>
            <p class="text-sm text-forest/70 max-w-2xl">Van + sprayer + ladder + meters. This is a due list, not GPS. Tag out a ladder before an eave nest. Winter tires before 1 Nov.</p>
          </div>
          <div class="flex gap-2">
            <button onclick="bumpKm()" class="border px-4 py-2 rounded-full text-sm">Set km</button>
            <button onclick="logMaint()" class="bg-forest text-offwhite px-4 py-2 rounded-full font-display">Log service</button>
          </div>
        </div>
        <div class="font-display text-xl mb-4">Maint spend on file ${money(ytd)}</div>
        ${(state.vehicles||[]).map(v=>`
          <article class="bg-white rounded-2xl p-4 border border-forest/10 mb-3">
            <div class="flex justify-between"><div class="font-display text-2xl">${v.name}</div><div class="text-sm">${v.km.toLocaleString('en-CA')} km</div></div>
            <div class="text-xs text-forest/55">${v.id} · plate ${v.plate}</div>
            <p class="text-sm mt-2">${v.note}</p>
            <div class="grid sm:grid-cols-3 gap-2 mt-3 text-sm">
              <div>Oil ${v.nextOil} ${dueChip(v.nextOil)}</div>
              <div>Tires ${v.nextTires} ${dueChip(v.nextTires)}</div>
              <div>Safety ${v.nextSafety} ${dueChip(v.nextSafety)}</div>
            </div>
          </article>`).join('')}
        <h2 class="font-display text-xl mt-6 mb-2">Equipment</h2>
        ${(state.equipment||[]).map(e=>`
          <div class="bg-white rounded-xl p-3 border mb-2 flex flex-wrap justify-between gap-2 text-sm">
            <div>
              <div class="font-display text-lg">${e.name}</div>
              <div class="text-xs text-forest/55">${e.id} · ${e.interval}</div>
              <p class="text-xs mt-1">${e.note}</p>
            </div>
            <div class="text-right">Next ${e.next}<div class="mt-1">${dueChip(e.next)}</div></div>
          </div>`).join('')}
        <h2 class="font-display text-xl mt-6 mb-2">Service log</h2>
        ${(state.maint||[]).map(m=>`
          <div class="text-sm bg-white border rounded-xl p-3 mb-2 flex justify-between">
            <div>${m.date} · ${m.asset} · ${m.kind}<div class="text-xs text-forest/55">${m.shop}${m.km?' · '+m.km+' km':''}</div></div>
            <div>${money(m.cost)} ${statusChip(m.status)}</div>
          </div>`).join('')}
      `);
    }

    function viewComms(){
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Reminders · OMW · reviews</div>
        <h1 class="font-display text-4xl font-semibold mb-2">Comms</h1>
        <p class="text-sm text-forest/70 mb-4">A reminder opens Messages or Mail with the note filled in. You still tap send. The outbox is on the shared board, so the office can see it left this phone.</p>
        <div class="grid md:grid-cols-2 gap-3 mb-6">
          ${COMM_TEMPLATES.map(t=>`
            <div class="bg-white rounded-2xl p-4 border border-forest/10">
              <div class="text-xs text-forest/40">${t.channel}</div>
              <div class="font-display text-lg">${t.name}</div>
              <p class="text-xs text-forest/60 mt-1">${t.body}</p>
              <div class="mt-2 flex flex-wrap gap-1">${state.leads.slice(0,4).map(l=>`<button onclick="sendTemplate('${l.id}','${t.id}')" class="text-[10px] border px-2 py-0.5 rounded-full">${l.org.split(' ')[0]}</button>`).join('')}</div>
            </div>`).join('')}
        </div>
        <h2 class="font-display text-xl mb-2">Outbox</h2>
        ${(state.comms||[]).map(c=>`
          <div class="text-sm bg-white border border-forest/10 rounded-xl p-3 mb-2">
            <div class="flex justify-between"><span>${c.channel} · ${c.template} · ${leadBy(c.leadId)?.org||''}</span>${statusChip(c.status)}</div>
            <div class="text-forest/60 text-xs mt-1">${c.preview}</div>
          </div>`).join('')}
      `);
    }

    function viewTech(){
      const tech = 'T1';
      const stops = (state.jobs||[]).filter(j=>j.date===selectedDay && j.tech===tech).sort((a,b)=>a.order-b.order);
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Mobile day · ${techBy(tech).name}</div>
        <h1 class="font-display text-4xl font-semibold mb-1">Tech board</h1>
        <div class="flex gap-2 mb-4">${['2026-09-11','2026-09-12'].map(d=>`<button onclick="setDay('${d}')" class="px-3 py-1.5 rounded-full text-sm ${selectedDay===d?'bg-forest text-white':'bg-white border'}">${d.slice(5)}</button>`).join('')}</div>
        ${stops.map(j=>{
          const l = leadBy(j.leadId);
          return `<article class="bg-white border border-forest/10 rounded-3xl p-5 mb-3">
            <div class="flex justify-between"><span>${j.window}</span>${statusChip(j.status)}</div>
            <h2 class="font-display text-2xl mt-1">${l?l.org:j.address}</h2>
            <p class="text-sage text-sm">${j.address} · ${j.community}<br/>${j.type}<br/>${j.notes||l?.notes||''}</p>
            <div class="flex flex-wrap gap-2 mt-4">
              <button onclick="setJobStat('${j.id}','En route')" class="bg-forest text-offwhite px-3 py-2 rounded-full text-sm">En route</button>
              <button onclick="setJobStat('${j.id}','On site')" class="bg-white/10 px-3 py-2 rounded-full text-sm">On site</button>
              <button onclick="setJobStat('${j.id}','Complete')" class="bg-white text-forest px-3 py-2 rounded-full text-sm">Complete + invoice</button>
              <button onclick="sendTemplate('${j.leadId}','omw')" class="bg-white/10 px-3 py-2 rounded-full text-sm">OMW text</button>
            </div>
          </article>`;
        }).join('')||'<p>No stops assigned to A. Mensah this day.</p>'}
      `);
    }

    function viewPortal(){
      const l = leadBy(portalLead) || state.leads[0];
      const jobs = (state.jobs||[]).filter(j=>j.leadId===l.id);
      const inv = (state.invoices||[]).filter(i=>i.leadId===l.id);
      const agr = (state.agreements||[]).filter(a=>a.leadId===l.id);
      return shell(`
        <div class="flex justify-between mb-4">
          <div>
            <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">CustomerConnect lite</div>
            <h1 class="font-display text-4xl font-semibold">Client hub</h1>
          </div>
          <select onchange="portalLead=this.value;render()" class="border rounded-full px-3 py-2 bg-white">
            ${state.leads.map(x=>`<option value="${x.id}" ${x.id===l.id?'selected':''}>${x.org}</option>`).join('')}
          </select>
        </div>
        <div class="bg-white border border-forest/10 rounded-3xl p-6 mb-4">
          <div class="font-display text-3xl">${l.org}</div>
          <p class="text-forest/55 mt-1">${l.name} · ${l.phone} · ${l.community}</p>
          <p class="text-sm mt-3">${l.notes}</p>
        </div>
        <h2 class="font-display text-xl mb-2">Upcoming / recent visits</h2>
        ${jobs.map(j=>`<div class="bg-white rounded-xl p-3 border mb-2 text-sm flex justify-between"><span>${j.date} ${j.window} · ${j.type}</span>${statusChip(j.status)}</div>`).join('')||'<p class="text-sm">None scheduled.</p>'}
        <h2 class="font-display text-xl mt-6 mb-2">Agreements</h2>
        ${agr.map(a=>`<div class="bg-white rounded-xl p-3 border mb-2 text-sm">${a.title} · ${a.freq} · next ${a.next}</div>`).join('')||'<p class="text-sm">No contract on file.</p>'}
        <h2 class="font-display text-xl mt-6 mb-2">Invoices</h2>
        ${inv.map(i=>`<div class="bg-white rounded-xl p-3 border mb-2 text-sm flex justify-between"><span>${i.id} · ${money(i.total)}</span>${statusChip(i.status)}</div>`).join('')||'<p class="text-sm">No invoices.</p>'}
        <p class="text-xs text-forest/50 mt-6">Online booking and card-on-file are mocked. Occupant can request a window; office still confirms.</p>
        <div class="flex flex-wrap gap-2 mt-3">
          <button onclick="bookJob()" class="bg-forest text-offwhite px-4 py-2 rounded-full">Request a visit</button>
          <button onclick="copyBookLink()" class="border px-4 py-2 rounded-full text-sm">Copy public book link</button>
        </div>
        <h2 class="font-display text-xl mt-8 mb-2">Web booking queue</h2>
        ${(state.bookings||[]).map(b=>`<div class="bg-white rounded-xl p-3 border mb-2 text-sm flex justify-between gap-2"><div>${b.name} · ${b.community} · ${b.pest}<br/><span class="text-xs text-forest/55">${b.window} · ${b.note}</span></div>${b.status==='New request'?`<button onclick="acceptBooking('${b.id}')" class="text-xs bg-forest text-white px-3 h-8 rounded-full">Accept to CRM</button>`:statusChip(b.status)}</div>`).join('')}
      `);
    }

    function viewBook(){
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">YYC placeholder card · Olson process, local numbers</div>
        <h1 class="font-display text-4xl font-semibold mb-2">Rate card</h1>
        <p class="text-sm text-forest/70 max-w-3xl mb-2">CAD before GST. Mid-band is what the OS bills when you complete a job. Low–high is the quote range. Owner overwrite lives in Framework-Ops-Intake.xlsx sheet 04 and artifacts/Framework-YYC-Pricing-Model.md. Do not publish this sheet on the website.</p>
        <p class="text-sm text-forest/70 max-w-3xl mb-6">Spray is a paid lap — minimum ticket $189. Termites are not a Calgary service. Label is law; no PCP or rate on the quote.</p>
        ${RATE_SECTIONS.map(sec=>`
          <section class="mb-8">
            <div class="flex items-end justify-between gap-3 mb-3">
              <div>
                <h2 class="font-display text-2xl">${sec.title}</h2>
                <p class="text-xs text-forest/60 max-w-2xl">${sec.blurb}</p>
              </div>
            </div>
            <div class="grid md:grid-cols-2 gap-3">
              ${sec.items.map(s=>`
                <div class="bg-white rounded-2xl p-4 border border-forest/10">
                  <div class="text-xs text-forest/40">${s.id} · ${s.window} · ${s.skill}</div>
                  <div class="font-display text-xl">${s.name}</div>
                  <div class="font-display text-2xl mt-1">${money(s.price)} <span class="text-sm font-body text-forest/50">mid</span></div>
                  <div class="text-xs text-forest/55">${s.hi? money(s.lo)+' – '+money(s.hi)+' band + GST':'Fixed placeholder + GST'}</div>
                  <p class="text-xs text-forest/60 mt-2">${s.note}</p>
                  <button onclick="bookFromSku('${s.id}')" class="mt-3 text-xs bg-forest text-white px-3 py-1 rounded-full">Book mid-band</button>
                </div>`).join('')}
            </div>
          </section>`).join('')}
        <p class="text-xs text-forest/45">Source talk: Jonas Olson / Pest Badger process, rebuilt for a 115-day outdoor season, Chinooks, GST, and billed spray. Not a live rate card until Deolu overwrites the intake sheet.</p>
      `);
    }

    function viewFit(){
      const f = window._fit || { zone:'SW', skill:'inspect', date:selectedDay, rows:bestFit('SW','inspect',selectedDay) };
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">PestPac Best Fit lite</div>
        <h1 class="font-display text-4xl font-semibold mb-2">Find a time</h1>
        <p class="text-sm text-forest/70 mb-4">Scores skill, same-zone density, and open load. Not live traffic.</p>
        <div class="flex flex-wrap gap-2 mb-4">
          <select id="fit-zone" class="border rounded-full px-3 py-2 bg-white">${TERRITORIES.map(t=>`<option ${t.id===f.zone?'selected':''} value="${t.id}">${t.id}</option>`).join('')}</select>
          <select id="fit-skill" class="border rounded-full px-3 py-2 bg-white">${['inspect','spray','exclusion','rodent','commercial','bedbug','food'].map(s=>`<option ${s===f.skill?'selected':''}>${s}</option>`).join('')}</select>
          <input id="fit-date" type="date" value="${f.date}" class="border rounded-full px-3 py-2 bg-white"/>
          <button onclick="runFit()" class="bg-forest text-offwhite px-4 py-2 rounded-full">Score techs</button>
        </div>
        ${f.rows.map(r=>`
          <div class="bg-white rounded-2xl p-4 border border-forest/10 mb-2 flex justify-between items-center">
            <div>
              <div class="font-display text-lg">${r.name} · score ${r.score}</div>
              <div class="text-xs text-forest/55">${r.skills} · ${r.stops} stops already · ${r.same} in-zone · ${r.reason}</div>
            </div>
            <button onclick="placeFit('${r.id}')" class="text-xs bg-forest text-white px-3 py-1 rounded-full">Slot here</button>
          </div>`).join('')}
      `);
    }

    function viewCost(){
      const rows = (state.jobs||[]).map(j=>{
        const inv = (state.invoices||[]).find(i=>i.jobId===j.id);
        const labour = (state.punches||[]).filter(p=>p.jobId===j.id).reduce((a,p)=>a+minutesOpen(p),0);
        const labourCost = Math.round((labour/60)*55);
        const mat = (state.usages||[]).filter(u=>u.jobId===j.id).length * 18;
        const rev = inv?inv.subtotal:0;
        return { j, inv, labour, labourCost, mat, rev, margin: rev-(labourCost+mat) };
      });
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Jobber costing lite</div>
        <h1 class="font-display text-4xl font-semibold mb-2">Job cost</h1>
        <p class="text-sm text-forest/70 mb-4">Labour assumed $55/hr shop burden until payroll is wired. Materials counted as kit draws, not pesticide rates.</p>
        ${rows.map(r=>`
          <div class="bg-white rounded-2xl p-4 border border-forest/10 mb-2 grid md:grid-cols-5 gap-2 text-sm">
            <div><div class="text-xs text-forest/50">${r.j.id}</div><div class="font-display">${r.j.type}</div></div>
            <div>Labour ${r.labour} min<br/>${money(r.labourCost)}</div>
            <div>Kit draws ${money(r.mat)}</div>
            <div>Revenue ${money(r.rev)}</div>
            <div class="font-display ${r.margin<0?'text-safety':''}">${money(r.margin)}</div>
          </div>`).join('')}
      `);
    }

    function viewReviews(){
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Review engine</div>
        <h1 class="font-display text-4xl font-semibold mb-2">Reviews</h1>
        <p class="text-sm text-forest/70 mb-4">Jobber / GorillaDesk ask after close. We queue the ask. Google post is still on the shop listing.</p>
        ${(state.reviews||[]).map(r=>{
          const l = leadBy(r.leadId);
          return `<div class="bg-white rounded-2xl p-4 border mb-2 flex justify-between gap-3">
            <div><div class="font-display">${l?l.org:r.leadId}</div><div class="text-xs">${r.asked} · ${r.note||''}</div></div>
            <div>${statusChip(r.status)} ${r.status!=='Asked'?`<button onclick="askReview('${r.id}')" class="ml-2 text-xs bg-forest text-offwhite px-3 py-1 rounded-full">Ask</button>`:''}</div>
          </div>`;
        }).join('')||'<p class="text-sm">Complete a job to prime an ask.</p>'}
      `);
    }

    function viewCompliance(){
      return shell(`
        <div class="flex justify-between mb-4">
          <div>
            <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Use report</div>
            <h1 class="font-display text-4xl font-semibold">Compliance log</h1>
            <p class="text-sm text-forest/70 max-w-2xl">PestPac / GorillaDesk export FIFRA sheets. Framework lists date, site, product, PCP from the container, qty, area, pest, weather, tech. Print this page. Rates are not invented.</p>
          </div>
          <button onclick="window.print()" class="no-print border px-4 py-2 rounded-full">Print</button>
        </div>
        <table class="w-full text-sm bg-white rounded-2xl overflow-hidden">
          <thead class="bg-forest text-offwhite text-left"><tr><th class="p-2">Date</th><th>Job</th><th>Product</th><th>PCP</th><th>Qty</th><th>Area</th><th>Pest</th><th>Weather</th><th>Tech</th></tr></thead>
          <tbody>
            ${(state.usages||[]).map(u=>{
              const cat = CHEMS.find(c=>c.id===u.product);
              return `<tr class="border-t border-forest/10"><td class="p-2">${u.date}</td><td>${u.jobId}</td><td>${cat?cat.name:u.product}</td><td>${u.pcp}</td><td>${u.qty}</td><td>${u.area}</td><td>${u.pest}</td><td>${u.weather}</td><td>${(techBy(u.tech)||{}).name||u.tech}</td></tr>`;
            }).join('')||'<tr><td class="p-3" colspan="9">No applications logged.</td></tr>'}
          </tbody>
        </table>
      `);
    }

    function viewLark(){
      const cfg = state.larkCfg || {};
      return shell(`
        <div class="flex flex-wrap justify-between gap-3 mb-4">
          <div>
            <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Office layer</div>
            <h1 class="font-display text-4xl font-semibold">Lark pipe</h1>
            <p class="text-sm text-forest/70 max-w-2xl mt-1">Framework stays source of truth. Lark gets a card, a calendar hold, or an approval request. Nothing is marked sent unless the ops API reports Lark accepted it.</p>
          </div>
          <button onclick="probeLark()" class="bg-forest text-white px-4 py-2 rounded-full font-display">Probe API</button>
        </div>
        <div class="grid md:grid-cols-3 gap-3 mb-6">
          <div class="bg-white rounded-2xl p-4 border border-forest/10"><div class="text-xs uppercase tracking-widest text-forest/40">Endpoint</div><div class="font-display mt-1">${cfg.endpoint||'https://open.larksuite.com'}</div></div>
          <div class="bg-white rounded-2xl p-4 border border-forest/10"><div class="text-xs uppercase tracking-widest text-forest/40">Credentials</div><div class="font-display mt-1">${cfg.wired?'Wired':'Not in env'}</div></div>
          <div class="bg-white rounded-2xl p-4 border border-forest/10"><div class="text-xs uppercase tracking-widest text-forest/40">Dispatch chat</div><div class="font-display mt-1">${cfg.chat||'#dispatch — set LARK_DISPATCH_CHAT'}</div></div>
        </div>
        <h2 class="font-display text-xl mb-2">Push a live job</h2>
        ${(state.jobs||[]).slice(0,6).map(j=>`
          <div class="bg-white rounded-xl p-3 border border-forest/10 mb-2 flex flex-wrap justify-between gap-2 text-sm">
            <div><span class="font-display">${j.id}</span> · ${j.type} · ${j.community} · ${j.status}</div>
