            <section class="bg-white rounded-2xl p-5 border border-forest/10">
              <h2 class="font-display text-xl mb-2">Pathology brief</h2>
              <p><strong>Hypothesis:</strong> ${l.pest}</p>
              <p class="mt-2"><strong>Evidence:</strong> ${l.evidence}</p>
              <p class="mt-2"><strong>Notes:</strong> ${l.notes||'—'}</p>
            </section>
            <section class="bg-white rounded-2xl p-5 border border-forest/10">
              <h2 class="font-display text-xl mb-3">Inspections</h2>
              ${insp.length?insp.map(i=>`<button onclick="selectInsp('${i.id}')" class="block w-full text-left mb-2 p-3 rounded-xl bg-offwhite">${i.id} · ${i.site} · ${i.defects.length} defects</button>`).join(''):'<p class="text-sm text-forest/60">No envelope survey yet.</p>'}
              <button onclick="newInspect('${l.id}')" class="mt-2 bg-forest text-offwhite px-4 py-2 rounded-full text-sm font-display">Start Pest Guard survey</button>
            </section>
          </div>
          <aside class="space-y-3">
            <div class="bg-sage/40 rounded-2xl p-4 text-sm">
              ${l.phone}<br/>${l.email}<br/>Next: ${l.next}<br/>
              Source: ${l.source||'—'} · Pay: ${l.pay||'none'}<br/>
              SLA: ${l.firstTouch?'touched':'OPEN — tap First touch'}
            </div>
            <button onclick="touchLead('${l.id}')" class="w-full border border-forest/20 rounded-full py-2 text-sm">Log first touch</button>
            <button onclick="setPay('${l.id}')" class="w-full border border-forest/20 rounded-full py-2 text-sm">Pay method on file</button>
            <label class="text-sm block">Move stage
              <select onchange="moveStage('${l.id}', this.value)" class="mt-1 w-full rounded-xl px-3 py-2 bg-white border border-forest/15">
                ${PIPE.map(s=>`<option ${s===l.stage?'selected':''}>${s}</option>`).join('')}
              </select>
            </label>
            <button onclick="draftProposal('${l.id}')" class="w-full bg-forest text-offwhite rounded-full py-3 font-display font-semibold">Draft proposal</button>
          </aside>
        </div>
      `);
    }
    window.moveStage = (id, stage)=>{
      const l = state.leads.find(x=>x.id===id); l.stage=stage;
      if(!l.firstTouch) l.firstTouch = new Date().toISOString();
      save(state); showToast('Stage → '+stage);
    };
    window.touchLead = (id)=>{
      const l = leadBy(id); if(!l) return;
      if(!l.firstTouch) l.firstTouch = new Date().toISOString();
      l.lastTouch = new Date().toISOString();
      save(state); showToast('First touch stamped on '+l.id);
    };
    window.setPay = (id)=>{
      const l = leadBy(id); if(!l) return;
      l.pay = prompt('Pay method on file (E-transfer / PO / Card pending / empty = none)', l.pay||'') ?? l.pay;
      save(state); render();
    };
    window.newInspect = (leadId)=>{
      const l = state.leads.find(x=>x.id===leadId);
      const insp = { id:uid('INS'), leadId, site:l.community+', Calgary AB', date:'2026-09-11', tech:state.user.name, moisture:'', thermal:'', attractants:'', recommendation:'', status:'In field', defects:[], sop:{} };
      state.inspections.unshift(insp); save(state); selectedInsp=insp.id; view='inspection'; render();
    };

    function viewGuard(){
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Field tool</div>
        <h1 class="font-display text-4xl font-semibold mb-6">Pest Guard</h1>
        <div class="grid md:grid-cols-2 gap-4">
          ${state.inspections.map(i=>{
            const l = state.leads.find(x=>x.id===i.leadId);
            return `<button onclick="selectInsp('${i.id}')" class="text-left bg-white rounded-3xl p-5 border border-forest/10 hover:border-safety">
              <div class="text-xs text-forest/40">${i.id} · ${i.status}</div>
              <div class="font-display text-2xl">${esc(l?l.org:i.site)}</div>
              <div class="text-sm text-forest/60 mt-1">${i.site}</div>
              <div class="mt-3 flex gap-2 flex-wrap">${i.defects.map(d=>`<span class="text-[11px] bg-offwhite border px-2 py-1 rounded-full">${d.zone} · ${d.severity}</span>`).join('')||'<span class="text-sm">No defects logged yet</span>'}</div>
            </button>`;
          }).join('')}
        </div>
      `);
    }

    function viewInspection(){
      const i = state.inspections.find(x=>x.id===selectedInsp) || state.inspections[0];
      if(!i) return shell('<p>No inspections.</p>');
      selectedInsp = i.id;
      const l = state.leads.find(x=>x.id===i.leadId);
      return shell(`
        <button onclick="go('guard')" class="text-sm text-forest/60 no-print">← Surveys</button>
        <div class="flex flex-wrap justify-between gap-3 mt-2 mb-4">
          <div>
            <div class="text-forest/40 text-xs">${i.id} · ${i.date} · ${i.tech}</div>
            <h1 class="font-display text-3xl font-semibold">${l?l.org:'Site'} envelope</h1>
            <p class="text-forest/70">${i.site}</p>
          </div>
          <button onclick="go('report')" class="bg-forest text-offwhite px-5 py-3 rounded-full font-display no-print">Open report engine</button>
        </div>
        <div class="grid lg:grid-cols-2 gap-6">
          <section class="bg-white rounded-3xl p-5 border border-forest/10">
            <h2 class="font-display text-xl mb-3">Structural defect map</h2>
            <p class="text-sage text-sm mb-4">Tap a building zone to log an entry point. Weep holes stay open — guard them, do not mortar them closed.</p>
            <div class="grid grid-cols-2 gap-2">${ZONES.map(z=>{
              const hits = i.defects.filter(d=>d.zone===z.id);
              return `<button onclick="addDefect('${i.id}','${z.id}')" class="text-left rounded-xl p-3 ${hits.length?'bg-forest text-offwhite zone-hot':'bg-white/10'}">
                <div class="font-display text-sm">${z.label}</div>
                <div class="text-[11px] opacity-80">${hits.length?hits.length+' logged':'+ add'}</div>
              </button>`;
            }).join('')}</div>
          </section>
          <section class="space-y-4">
            <div class="bg-white rounded-2xl p-4 border border-forest/10">
              <h3 class="font-display font-semibold mb-2">Logged deficiencies</h3>
              ${i.defects.map((d,idx)=>`
                <div class="border-b border-forest/10 py-2 text-sm">
                  <div class="flex justify-between"><span class="font-semibold">${d.zone}</span><span class="${d.severity==='High'?'text-safety':'text-forest/50'}">${d.severity}</span></div>
                  <div>${d.note}</div>
                  <div class="grid grid-cols-2 gap-2 mt-2 no-print">${photoFrame(i.id,'d'+idx,'Before')}${photoFrame(i.id,'d'+idx,'After')}</div>
                  <button class="text-xs text-forest/50 no-print" onclick="delDefect('${i.id}',${idx})">Remove</button>
                </div>`).join('')||'<p class="text-sm text-forest/50">Map is empty.</p>'}
            </div>
            <label class="block text-sm">Moisture observations
              <textarea onchange="patchInsp('${i.id}','moisture',this.value)" class="mt-1 w-full rounded-xl p-3 border border-forest/15 bg-white" rows="2">${i.moisture||''}</textarea>
            </label>
            <label class="block text-sm">Thermal imaging notes
              <textarea onchange="patchInsp('${i.id}','thermal',this.value)" class="mt-1 w-full rounded-xl p-3 border border-forest/15 bg-white" rows="2">${i.thermal||''}</textarea>
            </label>
            <label class="block text-sm">Biological attractants
              <textarea onchange="patchInsp('${i.id}','attractants',this.value)" class="mt-1 w-full rounded-xl p-3 border border-forest/15 bg-white" rows="2">${i.attractants||''}</textarea>
            </label>
            <label class="block text-sm">Exclusion recommendation
              <textarea onchange="patchInsp('${i.id}','recommendation',this.value)" class="mt-1 w-full rounded-xl p-3 border border-forest/15 bg-white" rows="2">${i.recommendation||''}</textarea>
            </label>
          </section>
        </div>
        <section class="mt-8 bg-white rounded-3xl p-5 border border-forest/10">
          <div class="flex flex-wrap justify-between gap-2 mb-3">
            <h2 class="font-display text-xl">SOP walk — seven house systems</h2>
            <span class="text-xs text-forest/50">Pass / Watch / Fail / n/a · original Framework protocol</span>
          </div>
          ${SOP.map(mod=>`
            <div class="mb-5">
              <div class="font-display font-semibold">${mod.title}</div>
              <p class="text-xs text-forest/55 mb-2">${mod.why}</p>
              ${mod.items.map(it=>{
                const v = (i.sop&&i.sop[it.id])||'';
                return `<div class="flex flex-col sm:flex-row sm:items-center gap-2 py-2 border-b border-forest/5">
                  <div class="flex-1 text-sm">${it.q}</div>
                  <div class="flex gap-1">${['Pass','Watch','Fail','n/a'].map(st=>`
                    <button onclick="setSop('${i.id}','${it.id}','${st}')" class="text-[11px] px-2 py-1 rounded-full border ${v===st?(st==='Fail'?'bg-forest text-offwhite border-safety':st==='Pass'?'bg-forest text-white border-forest':'bg-sage border-sage'):'border-forest/20'}">${st}</button>`).join('')}
                  </div>
                </div>`;
              }).join('')}
            </div>`).join('')}
        </section>
      `);
    }
    window.addDefect = (id, zone)=>{
      const note = prompt('Deficiency at '+zone+' (what failed, size, recommended seal):');
      if(!note) return;
      const severity = prompt('Severity: High / Medium / Low','High')||'Medium';
      const i = state.inspections.find(x=>x.id===id);
      i.defects.push({ zone, severity, note }); save(state); render();
    };
    window.delDefect = (id, idx)=>{
      const i = state.inspections.find(x=>x.id===id); i.defects.splice(idx,1); save(state); render();
    };
    window.patchInsp = (id, key, val)=>{
      const i = state.inspections.find(x=>x.id===id); i[key]=val; save(state);
    };
    window.setSop = (id, item, st)=>{
      const i = state.inspections.find(x=>x.id===id);
      if(!i.sop) i.sop = {};
      i.sop[item] = st; save(state); render();
    };

    function viewSOP(){
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Pest Guard protocol</div>
        <h1 class="font-display text-4xl font-semibold mt-1">Field SOP</h1>
        <p class="max-w-3xl text-forest/70 mt-2 mb-6">Walk order follows a house-system inspection: lot first, then roof and walls, then structure, then below-grade, then attic, interiors last. Framework wrote these prompts for Calgary pest pathology. They are not a reproduction of any published home-inspection manual. Termites are not treated as an established Alberta pest.</p>
        <ol class="space-y-3 mb-8 text-sm bg-white rounded-3xl p-6 border border-forest/10">
          <li><strong>Kit.</strong> Flashlight, moisture meter, probe, binoculars, camera, ladder if safe, gloves, tape. Do not walk fragile roofing.</li>
          <li><strong>Outside-in.</strong> Grade and downspouts tell you if the basement will be wet before you go downstairs.</li>
          <li><strong>Follow the clue.</strong> A crack outdoors is checked on the matching interior bay. A stained eave is checked in the attic above it.</li>
          <li><strong>Moisture first.</strong> Separate roof leak, plumbing leak, condensation, and ice dam before you name a pest.</li>
          <li><strong>Close the walk.</strong> One last circuit. Every Fail becomes a deficiency line on the client report.</li>
        </ol>
        ${SOP.map(mod=>`
          <article class="bg-white rounded-2xl p-5 border border-forest/10 mb-3">
            <h2 class="font-display text-xl">${mod.title}</h2>
            <p class="text-sm text-forest/60 mt-1">${mod.why}</p>
            <ul class="mt-3 space-y-1 text-sm">${mod.items.map(it=>`<li class="pl-3 border-l-2 border-sage">${it.q}</li>`).join('')}</ul>
          </article>`).join('')}
        <p class="text-xs text-forest/50">Word templates live beside this app: Framework-SOP-Playbook.docx and Framework-Report-Sample-Altadore.docx.</p>
      `);
    }

    function viewTerritory(){
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Sales Hub</div>
        <h1 class="font-display text-4xl font-semibold mb-2">Territories</h1>
        <p class="text-forest/70 mb-6 max-w-2xl">Calgary plus Airdrie, Cochrane, Chestermere, Okotoks, and Rocky View. Confirm drive time before same-day promises.</p>
        <div class="grid md:grid-cols-2 gap-3">
          ${TERRITORIES.map(t=>{
            const n = state.leads.filter(l=>l.zone===t.id).length;
            return `<div class="bg-white rounded-2xl p-5 border border-forest/10">
              <div class="flex justify-between"><div class="font-display text-xl">${t.name}</div><span class="text-sm bg-sage/40 px-2 py-0.5 rounded-full">${n} files</span></div>
              <p class="text-sm text-forest/70 mt-2">${t.focus}</p>
            </div>`;
          }).join('')}
        </div>
      `);
    }

    function viewProposals(){
      return shell(`
        <div class="flex justify-between items-end mb-6">
          <div>
            <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Agreements</div>
            <h1 class="font-display text-4xl font-semibold">Proposals</h1>
          </div>
        </div>
        <p class="text-sm text-forest/60 mb-4">Figures are placeholders until Framework overwrites the price book. GST 5% applied.</p>
        <div class="space-y-3">
          ${state.proposals.map(p=>{
            const l = state.leads.find(x=>x.id===p.leadId);
            return `<div class="bg-white rounded-2xl p-5 border border-forest/10 flex flex-wrap justify-between gap-3">
              <div>
                <div class="text-xs text-forest/40">${p.id} · ${p.status} · valid ${p.valid}</div>
                <div class="font-display text-xl">${p.title}</div>
                <div class="text-sm">${l?l.org:''} · ${p.package}</div>
                <div class="text-xs mt-1">${p.approval==='Pending'?'Approval pending':p.approval==='Approved'?'Approved':'Residential — no bid approval'}</div>
              </div>
              <div class="text-right font-display">
                <div>${money(p.subtotal)} + GST</div>
                <div class="text-2xl">${money(p.total)}</div>
                ${p.approval==='Pending'?`<button onclick="approveProposal('${p.id}')" class="mt-2 text-xs border px-3 py-1 rounded-full">Approve bid</button>`:''}
                ${p.signed?'<div class="text-xs text-forest mt-1">Signed</div>':`<button onclick="signProposal('${p.id}')" class="mt-2 text-xs bg-forest text-white px-3 py-1 rounded-full">Capture e-sign</button>`}
              </div>
            </div>`;
          }).join('')}
        </div>
      `);
    }
    window.draftProposal = (leadId)=>{
      const l = state.leads.find(x=>x.id===leadId);
      const subtotal = l.value || 1850;
      const gst = Math.round(subtotal*GST*100)/100;
      const commercial = isCommercial(l.type);
      const p = { id:uid('PR'), leadId, title:'Envelope exclusion + follow-up', package:'Structural IPM (placeholder pricing)', subtotal, gst, total:subtotal+gst, valid:'2026-10-09', status:'Draft', approval: commercial?'Pending':'Not required' };
      state.proposals.unshift(p); l.stage='Proposal sent'; save(state); view='proposals'; showToast('Proposal '+p.id+' drafted');
    };

    function photoFrame(inspId, key, slot){
      const p = (state.photos||[]).find(x=>x.inspId===inspId && x.key===key && x.slot===slot);
      if(p && p.dataUrl){
        return `<figure class="photo-slot filled">
          <img src="${p.dataUrl}" alt="${(p.caption||slot).replace(/"/g,'')}" />
          <figcaption>${slot}${p.caption? ' · '+p.caption:''}</figcaption>
        </figure>`;
      }
      return `<label class="photo-slot empty no-print">
        <span class="font-display text-xs">${slot}</span>
        <span class="text-[10px] opacity-70">Tap to place a photo</span>
        <input type="file" accept="image/*" class="sr-only" onchange="attachReportPhoto('${inspId}','${key}','${slot}',this)" />
      </label>
      <div class="photo-slot empty print-only"><span class="font-display text-xs">${slot}</span><span class="text-[10px]">${p&&p.caption?p.caption:'Frame for field photo'}</span></div>`;
    }
    window.attachReportPhoto = (inspId, key, slot, input)=>{
      const file = input.files && input.files[0]; if(!file) return;
      const reader = new FileReader();
      reader.onload = ()=>{
        state.photos = state.photos || [];
        const cap = prompt('Caption for this still', (state.photos.find(x=>x.inspId===inspId&&x.key===key&&x.slot===slot)||{}).caption || slot) || slot;
        const existing = state.photos.find(x=>x.inspId===inspId && x.key===key && x.slot===slot);
        if(existing){ existing.dataUrl = reader.result; existing.caption = cap; }
        else state.photos.unshift({ id:uid('PH'), inspId, key, slot, caption:cap, dataUrl:reader.result });
        save(state); render();
      };
      reader.readAsDataURL(file);
    };

    function viewReport(){
      const i = state.inspections.find(x=>x.id===selectedInsp) || state.inspections[0];
      const l = i && state.leads.find(x=>x.id===i.leadId);
      if(!i) return shell('<p>Complete a Pest Guard survey first.</p>');
      return `
      <div class="min-h-screen bg-offwhite">
        <div class="no-print p-4 flex justify-between items-center bg-forest text-offwhite">
          <button onclick="go('inspection')" class="text-sm">← Editor</button>
          <div class="font-display">Client deficiency report</div>
          <button onclick="window.print()" class="bg-forest text-offwhite px-4 py-2 rounded-full text-sm">Print / PDF</button>
        </div>
        <article class="max-w-3xl mx-auto bg-white my-6 p-8 lg:p-12 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 right-0 w-40 h-40 border-l border-b border-safety rounded-bl-full"></div>
          <header class="flex items-start justify-between mb-8">
            <div class="flex gap-3 items-center">${logo(40)}
              <div>
                <div class="font-display text-xl font-semibold">Framework Pest Ltd.</div>
                <div class="text-sm text-forest/50">Engineering Pest-Free Environments.</div>
              </div>
            </div>
            <div class="text-right text-sm">${i.id}<br/>${i.date}<br/>Calgary, Alberta</div>
          </header>
          <h1 class="font-display text-4xl font-semibold leading-tight">Building envelope deficiency report</h1>
          <p class="mt-3 text-forest/70">Prepared for ${l?l.org:i.site}. This is an architectural finding list. Chemical application is not the primary recommendation.</p>
          <div class="grid grid-cols-2 gap-4 mt-8 text-sm">
            <div><div class="text-xs uppercase tracking-widest text-forest/40">Site</div>${esc(i.site)}</div>
            <div><div class="text-xs uppercase tracking-widest text-forest/40">Surveyor</div>${i.tech}</div>
          </div>
          <h2 class="font-display text-2xl mt-10 mb-3">Site stills</h2>
          <div class="grid grid-cols-3 gap-3">
            ${photoFrame(i.id,'site','Site')}
            ${photoFrame(i.id,'moisture','Moisture')}
            ${photoFrame(i.id,'thermal','Thermal')}
          </div>
          <h2 class="font-display text-2xl mt-10 mb-3">SOP findings</h2>
          ${SOP.map(mod=>`
            <div class="mt-4">
              <div class="font-display font-semibold">${mod.title}</div>
              <ul class="text-sm mt-1">${mod.items.map(it=>{
                const v = (i.sop&&i.sop[it.id])||'Not marked';
                return `<li class="flex justify-between gap-3 py-0.5"><span>${it.q}</span><span class="font-display ${v==='Fail'?'text-safety':''}">${v}</span></li>`;
              }).join('')}</ul>
            </div>`).join('')}
          <h2 class="font-display text-2xl mt-10 mb-3">Observed breaches</h2>
          <ol class="space-y-6">${i.defects.map((d,idx)=>`
            <li class="border-l-2 border-safety pl-4">
              <strong class="font-display">${d.zone} · ${d.severity}</strong>
              <p class="text-sm mt-1">${esc(d.note)}</p>
              <div class="grid grid-cols-2 gap-3 mt-3">
                ${photoFrame(i.id,'d'+idx,'Before')}
                ${photoFrame(i.id,'d'+idx,'After')}
              </div>
            </li>`).join('')}</ol>
          <h2 class="font-display text-2xl mt-10 mb-3">Pathology notes</h2>
          <p><strong>Moisture.</strong> ${esc(i.moisture||'Not recorded.')}</p>
          <p class="mt-2"><strong>Thermal.</strong> ${esc(i.thermal||'Not recorded.')}</p>
          <p class="mt-2"><strong>Attractants.</strong> ${esc(i.attractants||'Not recorded.')}</p>
          <h2 class="font-display text-2xl mt-10 mb-3">Recommended work</h2>
          <p>${esc(i.recommendation||'Seal listed openings with pest-rated materials. Install weep guards. Correct garage and utility closures. Monitor after exclusion — do not lead with rodenticide.')}</p>
          <p class="mt-8 text-xs text-forest/50">Framework Pest Ltd. · frameworkpest.ca · Structural integrity, precision, stewardship. Alberta pesticide service work, where required, is performed by certified applicators following the product label and the provincial Code of Practice. This report does not invent label rates.</p>
        </article>
      </div>`;
    }

    function statusChip(st){
      const hot = ['No-show','Overdue','Fail','Cancelled'].includes(st);
      const go = ['Complete','Paid','Active','On site'].includes(st);
      return `<span class="text-[11px] px-2 py-0.5 rounded-full ${hot?'bg-safety text-white':go?'bg-forest text-offwhite':'bg-sage/40 text-forest'}">${st}</span>`;
    }

    window.setDay = (d)=>{ selectedDay=d; render(); };
    window.setJobStat = (id, st)=>{
      const j = jobBy(id); if(!j) return;
      j.status = st;
      if(st==='En route'){
        const open = (state.punches||[]).find(p=>p.jobId===id && !p.end);
        if(!open) state.punches.unshift({ id:uid('P'), tech:j.tech, jobId:id, start:new Date().toTimeString().slice(0,5), end:'', date:j.date });
      }
      if(st==='On site'){
        const open = (state.punches||[]).find(p=>p.jobId===id && !p.end);
        if(!open) state.punches.unshift({ id:uid('P'), tech:j.tech, jobId:id, start:new Date().toTimeString().slice(0,5), end:'', date:j.date, kind:'On site' });
      }
      if(st==='No-show'){
        const svc = SERVICES.find(s=>s.id==='SVC-NS');
        const sub = svc.price;
        const gst = Math.round(sub*GST*100)/100;
        state.invoices.unshift({ id:uid('INV'), leadId:j.leadId, jobId:id, date:j.date, due:addDaysISO(j.date,14), subtotal:sub, gst, total:sub+gst, status:'Draft', issued:false, method:'No-show fee', plan:null });
        sendTemplate(j.leadId, 'noshow');
        save(state); showToast('No-show fee drafted');
        return;
      }
      if(st==='Complete'){
        const open = (state.punches||[]).find(p=>p.jobId===id && !p.end);
        if(open) open.end = new Date().toTimeString().slice(0,5);
        const svc = priceFor(j);
        if(!svc){ showToast('No price-book SKU on this work order. Invoice not guessed.'); save(state); render(); return; }
        const sub = svc.price;
        const gst = Math.round(sub*GST*100)/100;
        state.invoices.unshift({ id:uid('INV'), leadId:j.leadId, jobId:id, date:j.date, due:addDaysISO(j.date,14), subtotal:sub, gst, total:sub+gst, status:'Draft', issued:false, method:'', sku:svc.id, plan:null });
        state.reviews.unshift({ id:uid('RV'), leadId:j.leadId, asked:j.date, status:'Ready', note:'Ask after '+id });
        sendTemplate(j.leadId, 'done');
        save(state); showToast('Invoice from price book · review primed');
        return;
      }
      save(state); render();
    };
    window.moveJob = (id, dir)=>{
      const j = jobBy(id); if(!j) return;
      const list = state.jobs.filter(x=>x.date===j.date && x.tech===j.tech).sort((a,b)=>a.order-b.order);
      const i = list.findIndex(x=>x.id===id);
      const k = i+dir; if(k<0||k>=list.length) return;
      const tmp = list[i].order; list[i].order = list[k].order; list[k].order = tmp;
      save(state); render();
    };
    window.optimizeRoute = (tech, date)=>{
      const list = state.jobs.filter(j=>j.date===date && j.tech===tech && !['Cancelled'].includes(j.status));
      list.sort((a,b)=> (a.zone||'').localeCompare(b.zone||'') || (a.driveMin||99)-(b.driveMin||99));
      list.forEach((j,i)=> j.order = i+1);
      save(state); showToast('Stops clustered by zone for '+ (techBy(tech)||{}).name);
    };
    window.bookJob = ()=>{
      const leadId = prompt('Lead id', state.leads[0].id); if(!leadId) return;
      const l = leadBy(leadId); if(!l) return showToast('Unknown lead');
      if(!l.pay){
        const ok = confirm(l.org+' has no e-transfer / PO / card note. Olson rule: do not roll the truck. Book anyway?');
        if(!ok) return showToast('Held — collect pay method first');
      }
      const date = prompt('Date YYYY-MM-DD', selectedDay)||selectedDay;
      const windowT = prompt('Window','09:00–11:00')||'Anytime';
      const tech = prompt('Tech T1 / T2 / T3','T1')||'T1';
