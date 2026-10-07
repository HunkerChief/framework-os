      const sku = prompt('Price-book SKU (SVC-EX, SVC-INSP, SVC-MON)','SVC-EX');
      const svc = SERVICES.find(s=>s.id===sku);
      if(!svc) return showToast('Unknown SKU. Nothing booked.');
      const order = state.jobs.filter(j=>j.date===date && j.tech===tech).length+1;
      state.jobs.push({ id:uid('JOB'), leadId, date, window:windowT, tech, type:svc.name, svc:svc.id, status:'Scheduled', community:l.community, address:l.org, zone:l.zone, driveMin:15, order, notes:l.notes||'' });
      save(state); view='dispatch'; showToast('Work order booked');
    };
    window.signProposal = (id)=>{
      const p = state.proposals.find(x=>x.id===id); if(!p) return;
      if(p.approval==='Pending'){ showToast('Commercial bid stays unsigned until someone approves it'); return; }
      p.signed = true; p.status = 'Signed';
      const l = leadBy(p.leadId); if(l){ l.stage='Won'; if(/monitor/i.test(p.title+p.package)) l.contract='Monitoring'; }
      state.agreements.unshift({ id:uid('AGR'), leadId:p.leadId, title:p.title, freq:'As scoped', next:selectedDay, value:p.subtotal, status:'Active', includes:p.package });
      save(state); showToast(id+' signed — agreement opened');
    };
    window.approveProposal = (id)=>{
      const p = state.proposals.find(x=>x.id===id); if(!p) return;
      p.approval = 'Approved';
      const l = leadBy(p.leadId); if(l) l.approval = 'Approved';
      save(state); showToast(id+' approved — e-sign is now allowed');
    };
    window.payInvoice = (id)=>{
      const inv = state.invoices.find(x=>x.id===id); if(!inv) return;
      if(inv.status==='Draft' || !inv.issued){ showToast('Issue the draft first. GST stays a tax line, not revenue until paid.'); return; }
      const method = prompt('How it landed (E-transfer / PO). Do not book a processor net as revenue.', inv.method&&inv.method!=='Send link'?inv.method:'E-transfer');
      if(!method) return;
      inv.method = method;
      inv.status = 'Paid';
      inv.paidOn = new Date().toISOString().slice(0,10);
      save(state); render();
    };
    window.issueInvoice = (id)=>{
      const inv = state.invoices.find(x=>x.id===id); if(!inv) return;
      inv.issued = true;
      inv.status = (inv.due && inv.due < todayISO()) ? 'Overdue' : 'Due';
      if(!inv.due) inv.due = addDaysISO(inv.date, 14);
      save(state); showToast(inv.id+' issued · due '+inv.due);
    };
    window.sendTemplate = async (leadId, tid)=>{
      const l = leadBy(leadId); const t = COMM_TEMPLATES.find(x=>x.id===tid);
      const job = (state.jobs||[]).find(j=>j.leadId===leadId) || {};
      let body = t.body
        .replace('{name}', l?.name||'')
        .replace('{org}', l?.org||'')
        .replace('{date}', job.date||selectedDay)
        .replace('{window}', job.window||'')
        .replace('{site}', job.address||l?.community||'')
        .replace('{tech}', (techBy(job.tech)||{}).name||'Framework')
        .replace('{id}','INV')
        .replace('{total}', money(l?.value||0));
      const to = t.channel==='Email' ? (l?.email||'') : (l?.phone||'');
      const row = { id:uid('C'), leadId, channel:t.channel, template:tid, date:selectedDay, status:'Handed to phone', preview:body.slice(0,140), to };
      state.comms.unshift(row);
      save(state);
      let href = t.channel==='Email'
        ? 'mailto:'+encodeURIComponent(to)+'?subject='+encodeURIComponent(t.name)+'&body='+encodeURIComponent(body)
        : 'sms:'+digits(to)+'?&body='+encodeURIComponent(body);
      try {
        const res = await fetch('/api/send', { method:'POST', credentials:'same-origin', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ channel:t.channel, to, body, subject:t.name, leadId }) });
        if(res.ok){ const data = await res.json(); if(data.href) href = data.href; }
      } catch(e) {}
      showToast(t.channel+' opened on this phone. Tap send.');
      location.href = href;
    };
    window.requestPay = (id)=>{
      const inv = state.invoices.find(x=>x.id===id); if(!inv) return;
      const l = leadBy(inv.leadId)||{};
      const total = money((inv.subtotal||0) + (inv.gst||0));
      const body = 'Framework Pest: '+inv.id+' for '+(l.org||'the site')+' is '+total+'. E-transfer info@frameworkpest.ca and use '+inv.id+' as the message.';
      if(!COMM_TEMPLATES.some(t=>t.id==='etransfer')) COMM_TEMPLATES.push({ id:'etransfer', channel:'SMS', name:'E-transfer request', body:'' });
      const t = COMM_TEMPLATES.find(x=>x.id==='etransfer');
      t.channel = l.phone ? 'SMS' : 'Email';
      t.body = body;
      sendTemplate(inv.leadId, 'etransfer');
    };
    window.logUsage = ()=>{
      const jobId = prompt('Job id', (state.jobs[0]||{}).id); if(!jobId) return;
      const product = prompt('Product id from catalog (EX-MESH, EX-SEAL, CHEM-HOLD…)', 'EX-MESH');
      const qty = prompt('Quantity used','1')||'1';
      const area = prompt('Area treated / sealed','')||'';
      const pest = prompt('Target pest','')||'';
      const weather = prompt('Weather','')||'';
      const cat = CHEMS.find(c=>c.id===product) || { name:product, pcp:'Confirm on container', note:'' };
      state.usages.unshift({ id:uid('U'), jobId, date:selectedDay, product, qty, area, pest, weather, tech:jobBy(jobId)?.tech||'T1', pcp:cat.pcp, note:cat.note });
      save(state); view='chem'; showToast('Use logged. Label still governs.');
    };
    window.checkDevice = (id)=>{
      const d = state.devices.find(x=>x.id===id); if(!d) return;
      d.last = selectedDay; d.result = prompt('Result', d.result)||d.result;
      save(state); render();
    };
    window.adjustStock = (sku, delta)=>{
      const it = state.inventory.find(x=>x.sku===sku); if(!it) return;
      it.onhand = Math.max(0, (it.onhand||0)+delta); save(state); render();
    };
    window.clockOut = (id)=>{
      const p = state.punches.find(x=>x.id===id); if(!p) return;
      p.end = new Date().toTimeString().slice(0,5); save(state); render();
    };
    window.holdAgreement = (id)=>{
      const a = state.agreements.find(x=>x.id===id); if(!a) return;
      a.status = a.status==='Held' ? 'Active' : 'Held';
      save(state); render();
    };
    window.planInvoice = (id)=>{
      const inv = state.invoices.find(x=>x.id===id); if(!inv) return;
      inv.plan = prompt('Plan (e.g. 3 × monthly)', inv.plan||'3 × monthly')||inv.plan;
      inv.method = 'Payment plan';
      save(state); showToast('Plan noted — processor not live');
    };
    window.askReview = (id)=>{
      const r = state.reviews.find(x=>x.id===id);
      if(r) r.status = 'Asked';
      const leadId = r?r.leadId:id;
      sendTemplate(leadId, 'review');
      view='reviews';
    };
    window.addPhotoNote = (jobId)=>{
      const cap = prompt('Photo caption (file stays on the phone until upload exists)','');
      if(!cap) return;
      state.photos.unshift({ id:uid('PH'), jobId, caption:cap, slot:prompt('Slot','After')||'After' });
      save(state); render();
    };
    window.signJob = (jobId)=>{
      const j = jobBy(jobId); if(!j) return;
      j.signature = prompt('Occupant name for sign-off', leadBy(j.leadId)?.name||'')||'Signed';
      save(state); showToast('Sign-off stored on '+jobId);
    };
    window.bookFromSku = (sku)=>{
      const svc = SERVICES.find(s=>s.id===sku); if(!svc) return;
      const leadId = prompt('Lead id', state.leads[0].id); if(!leadId) return;
      const l = leadBy(leadId); if(!l) return showToast('Unknown lead');
      const date = prompt('Date YYYY-MM-DD', selectedDay)||selectedDay;
      const tech = (bestFit(l.zone, svc.skill, date)[0]||{}).id || 'T1';
      const order = state.jobs.filter(j=>j.date===date && j.tech===tech).length+1;
      state.jobs.push({ id:uid('JOB'), leadId, date, window:svc.minutes+' min', tech, type:svc.name, svc:svc.id, status:'Scheduled', community:l.community, address:l.org, zone:l.zone, driveMin:14, order, notes:svc.note });
      save(state); view='dispatch'; showToast(svc.name+' booked onto '+(techBy(tech)||{}).name);
    };
    window.acceptBooking = (id)=>{
      const b = state.bookings.find(x=>x.id===id); if(!b) return;
      b.status = 'Accepted';
      const dup = findDup(b);
      if(dup){ b.status='Already on file'; b.leadId=dup.id; save(state); view='lead'; selectedLead=dup.id; showToast('Book link matched '+dup.id); return; }
      const lead = shapeLead({ name:b.name, org:b.name+' household', phone:b.phone, email:b.email, community:b.community, zone:b.zone||'SW', type:'Residential detached', pest:b.pest, evidence:b.note, notes:b.window, source:'Book link', pay:b.pay, next:'Confirm '+b.window, value:285, street:b.street||'' });
      state.leads.unshift(lead);
      enrollDrip(lead.id, 'newlead');
      save(state); view='crm'; showToast('Booking became a lead — SLA running');
    };
    function minutesOpen(p){
      if(!p.start) return 0;
      const [sh,sm] = p.start.split(':').map(Number);
      const end = p.end || new Date().toTimeString().slice(0,5);
      const [eh,em] = end.split(':').map(Number);
      return Math.max(0, (eh*60+em)-(sh*60+sm));
    }
    function bestFit(zone, skill, date){
      return TECHS.map(t=>{
        const stops = (state.jobs||[]).filter(j=>j.date===date && j.tech===t.id && !['Cancelled','Complete'].includes(j.status));
        const same = stops.filter(j=>j.zone===zone).length;
        const skillHit = (t.tags||[]).includes(skill)?30:0;
        const load = Math.max(0, 40 - stops.length*12);
        const score = skillHit + load + same*18;
        return { ...t, score, stops:stops.length, same, reason:(skillHit?'skill ':'')+(same?'same-zone ':'')+(load>20?'open ':'busy') };
      }).sort((a,b)=>b.score-a.score);
    }
    window.runFit = ()=>{
      const zone = document.getElementById('fit-zone')?.value || 'SW';
      const skill = document.getElementById('fit-skill')?.value || 'inspect';
      const date = document.getElementById('fit-date')?.value || selectedDay;
      window._fit = { zone, skill, date, rows: bestFit(zone, skill, date) };
      render();
    };
    const LARK_API = 'http://127.0.0.1:8787';
    window.pushLark = async (jobId, kind)=>{
      const j = jobBy(jobId); if(!j) return showToast('No job');
      const title = (kind==='approval'?'Approval · ':'Lark · ') + j.type;
      const local = { id:uid('LK'), kind, jobId, sent:false, wired:false, reason:'queued', at:new Date().toISOString(), title };
      state.lark = state.lark || [];
      state.lark.unshift(local);
      save(state);
      try {
        const path = kind==='approval' ? '/lark/approval' : '/lark/notify';
        const res = await fetch(LARK_API + path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ jobId, kind, job:j, title }) });
        const body = await res.json();
        local.wired = Boolean(body.wired);
        local.sent = Boolean(body.sent);
        local.reason = body.reason || (body.sent?'ok':'api-'+res.status);
        save(state);
        showToast(body.sent ? 'Lark accepted the card' : (body.wired ? 'Lark wired but chat/approval still incomplete' : 'Queued — API up, no Lark keys'));
      } catch(e) {
        local.reason = 'api-offline';
        save(state);
        showToast('Queued in OS. Start framework-ops on :8787 to talk to Lark.');
      }
    };
    window.probeLark = async ()=>{
      try {
        const res = await fetch(LARK_API + '/lark/status');
        const body = await res.json();
        state.larkCfg = state.larkCfg || {};
        state.larkCfg.wired = !!(body.pipe && body.pipe.wired);
        state.larkCfg.endpoint = (body.pipe && body.pipe.endpoint) || state.larkCfg.endpoint;
        state.larkCfg.chat = body.pipe && body.pipe.chatConfigured ? 'configured' : 'missing LARK_DISPATCH_CHAT';
        save(state); render();
        showToast(state.larkCfg.wired ? 'Lark credentials present on API' : 'API up. Lark still unwired.');
      } catch(e) { showToast('Ops API not running on 127.0.0.1:8787'); }
    };

    window.placeFit = (techId)=>{
      const f = window._fit || { zone:'SW', skill:'inspect', date:selectedDay };
      const leadId = prompt('Lead id', state.leads[0].id); if(!leadId) return;
      const l = leadBy(leadId); if(!l) return;
      const svc = SERVICES.find(s=>s.skill===f.skill) || SERVICES[0];
      const order = state.jobs.filter(j=>j.date===f.date && j.tech===techId).length+1;
      state.jobs.push({ id:uid('JOB'), leadId, date:f.date, window:svc.minutes+' min window', tech:techId, type:svc.name, svc:svc.id, status:'Scheduled', community:l.community, address:l.org, zone:l.zone||f.zone, driveMin:12, order, notes:'Best Fit slot' });
      save(state); view='dispatch'; showToast('Slotted on '+(techBy(techId)||{}).name);
    };

    function viewDispatch(){
      const days = ['2026-09-11','2026-09-12','2026-09-13'];
      return shell(`
        <div class="flex flex-wrap justify-between gap-3 mb-4">
          <div>
            <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">FieldRoutes-class board</div>
            <h1 class="font-display text-4xl font-semibold">Dispatch</h1>
            <p class="text-forest/70 text-sm mt-1">Assign by tech and window. Not live GPS — reorder stops, mark en route / on site.</p>
          </div>
          <button onclick="bookJob()" class="bg-forest text-offwhite px-4 py-2 rounded-full font-display">Book stop</button>
        </div>
        <div class="flex gap-2 mb-4">${days.map(d=>`<button onclick="setDay('${d}')" class="px-3 py-1.5 rounded-full text-sm ${selectedDay===d?'bg-forest text-white':'bg-white border border-forest/15'}">${d.slice(5)}</button>`).join('')}</div>
        <div class="grid md:grid-cols-3 gap-3">
          ${TECHS.map(t=>{
            const stops = (state.jobs||[]).filter(j=>j.date===selectedDay && j.tech===t.id).sort((a,b)=>a.order-b.order);
            const mins = stops.reduce((a,j)=>a+(j.driveMin||0),0);
            return `<section class="bg-white rounded-2xl p-4 border border-forest/10">
              <div class="font-display text-lg">${t.name}</div>
              <div class="text-xs text-forest/50 mb-3">${t.skills} · ~${mins} min windshield</div>
              ${stops.map(j=>{
                const l = leadBy(j.leadId);
                return `<div class="border border-forest/10 rounded-xl p-3 mb-2">
                  <div class="flex justify-between gap-2"><span class="font-semibold text-sm">${j.window}</span>${statusChip(j.status)}</div>
                  <div class="text-sm mt-1">${l?l.org:j.address}</div>
                  <div class="text-[11px] text-forest/55">${j.type} · ${j.community} · stop ${j.order}</div>
                  <div class="flex flex-wrap gap-1 mt-2">
                    ${JOB_STAT.filter(s=>s!==j.status).slice(0,4).map(s=>`<button onclick="setJobStat('${j.id}','${s}')" class="text-[10px] px-2 py-0.5 rounded-full border border-forest/20">${s}</button>`).join('')}
                  </div>
                </div>`;
              }).join('')||'<p class="text-sm text-forest/40">No stops.</p>'}
            </section>`;
          }).join('')}
        </div>
      `);
    }

    function viewRoute(){
      return shell(`
        <div class="flex flex-wrap justify-between gap-3 mb-4">
          <div>
            <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">RouteOp lite</div>
            <h1 class="font-display text-4xl font-semibold">Routes</h1>
            <p class="text-sm text-forest/70 mt-1">Cluster by Calgary zone. Real turn-by-turn lives in the maps app until a routing API is wired.</p>
          </div>
        </div>
        <div class="flex gap-2 mb-4">${['2026-09-11','2026-09-12','2026-09-13'].map(d=>`<button onclick="setDay('${d}')" class="px-3 py-1.5 rounded-full text-sm ${selectedDay===d?'bg-forest text-white':'bg-white border'}">${d.slice(5)}</button>`).join('')}</div>
        ${TECHS.map(t=>{
          const stops = (state.jobs||[]).filter(j=>j.date===selectedDay && j.tech===t.id && j.status!=='Cancelled').sort((a,b)=>a.order-b.order);
          return `<section class="bg-white rounded-2xl p-4 border border-forest/10 mb-3">
            <div class="flex justify-between items-center mb-2">
              <div class="font-display text-xl">${t.name}</div>
              <button onclick="optimizeRoute('${t.id}','${selectedDay}')" class="text-xs bg-sage px-3 py-1 rounded-full">Cluster by zone</button>
            </div>
            ${stops.map((j,i)=>`
              <div class="flex items-center gap-3 py-2 border-b border-forest/5">
                <div class="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-display">${j.order}</div>
                <div class="flex-1">
                  <div class="text-sm font-semibold">${j.community} · ${j.type}</div>
                  <div class="text-[11px] text-forest/55">${j.window} · ${j.driveMin||'?'} min from previous · ${j.address}</div>
                </div>
                <button onclick="moveJob('${j.id}',-1)" class="text-xs border px-2 rounded">Up</button>
                <button onclick="moveJob('${j.id}',1)" class="text-xs border px-2 rounded">Down</button>
              </div>`).join('')||'<p class="text-sm text-forest/40">Empty route.</p>'}
          </section>`;
        }).join('')}
      `);
    }

    function viewJobs(){
      return shell(`
        <div class="flex justify-between mb-4">
          <div>
            <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Work orders</div>
            <h1 class="font-display text-4xl font-semibold">Jobs</h1>
          </div>
          <button onclick="bookJob()" class="bg-forest text-offwhite px-4 py-2 rounded-full font-display">New order</button>
        </div>
        <div class="space-y-2">
          ${(state.jobs||[]).slice().sort((a,b)=>a.date.localeCompare(b.date)+a.order-b.order).map(j=>{
            const l = leadBy(j.leadId);
            return `<div class="bg-white rounded-2xl p-4 border border-forest/10 flex flex-wrap justify-between gap-3">
              <div>
                <div class="text-xs text-forest/40">${j.id} · ${j.date} · ${(techBy(j.tech)||{}).name}</div>
                <div class="font-display text-xl">${l?l.org:j.address}</div>
                <div class="text-sm">${j.type} · ${j.window} · ${j.notes||''}</div>
              </div>
              <div class="text-right">
                ${statusChip(j.status)}
                <div class="mt-2 flex flex-wrap justify-end gap-1">
                  ${['En route','On site','Complete','No-show'].filter(s=>s!==j.status).map(s=>`<button onclick="setJobStat('${j.id}','${s}')" class="text-[11px] border px-2 py-0.5 rounded-full">${s}</button>`).join('')}
                  <button onclick="addPhotoNote('${j.id}')" class="text-[11px] border px-2 py-0.5 rounded-full">Photo note</button>
                  <button onclick="signJob('${j.id}')" class="text-[11px] border px-2 py-0.5 rounded-full">${j.signature?'Signed':'Sign off'}</button>
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
        <h2 class="font-display text-2xl mt-8 mb-3">Time punches</h2>
        <p class="text-xs text-forest/50 mb-2">On site is a punch on the work order. It is not a map and not live GPS.</p>
        ${(state.punches||[]).map(p=>`
          <div class="text-sm flex justify-between bg-white border border-forest/10 rounded-xl px-4 py-2 mb-1">
            <span>${(techBy(p.tech)||{}).name} · ${p.jobId} · ${p.start}${p.end?'–'+p.end:' · open'}</span>
            ${p.end?'':`<button onclick="clockOut('${p.id}')" class="underline">Clock out</button>`}
          </div>`).join('')}
      `);
    }

    function viewAgreements(){
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Service agreements</div>
        <h1 class="font-display text-4xl font-semibold mb-4">Recurring work</h1>
        <p class="text-sm text-forest/70 mb-4">PestPac / GorillaDesk live on cadence. Framework stores the contract and next date — bulk generate a Q visit from here.</p>
        ${(state.agreements||[]).map(a=>{
          const l = leadBy(a.leadId);
          return `<div class="bg-white rounded-2xl p-5 border border-forest/10 mb-3 flex flex-wrap justify-between gap-3">
            <div>
              <div class="text-xs">${a.id} · ${statusChip(a.status)}</div>
              <div class="font-display text-xl">${a.title}</div>
              <div class="text-sm">${l?l.org:a.leadId} · ${a.freq} · next ${a.next}</div>
              <div class="text-xs text-forest/55 mt-1">${a.includes}</div>
            </div>
            <div class="text-right">
              <div class="font-display text-2xl">${money(a.value)}</div>
              <button onclick="(function(){ const l=leadBy('${a.leadId}'); state.jobs.push({id:uid('JOB'),leadId:'${a.leadId}',date:selectedDay,window:'Anytime',tech:'T1',type:'Contract visit',status:'Scheduled',community:l.community,address:l.org,zone:l.zone,driveMin:16,order:9,notes:'From ${a.id}'}); save(state); view='dispatch'; showToast('Visit spawned'); })()" class="mt-2 text-xs bg-forest text-white px-3 py-1 rounded-full">Spawn visit</button>
              <button onclick="holdAgreement('${a.id}')" class="mt-2 text-xs border px-3 py-1 rounded-full">${a.status==='Held'?'Release hold':'Seasonal hold'}</button>
            </div>
          </div>`;
        }).join('')}
      `);
    }

    function viewBilling(){
      const due = (state.invoices||[]).filter(i=>i.status!=='Paid').reduce((a,i)=>a+i.total,0);
      return shell(`
        <div class="flex justify-between mb-4">
          <div>
            <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Jobber-class cash</div>
            <h1 class="font-display text-4xl font-semibold">Invoices</h1>
            <p class="text-sm text-forest/70">GST 5% is a tax, not a product line. New invoices stay Draft until you issue them. Mark paid only after the e-transfer or PO lands.</p>
          </div>
          <div class="font-display text-2xl">${money(due)} open</div>
        </div>
        ${(state.invoices||[]).map(inv=>{
          const l = leadBy(inv.leadId);
          return `<div class="bg-white rounded-2xl p-4 border border-forest/10 mb-2 flex flex-wrap justify-between gap-3">
            <div>
              <div class="text-xs">${inv.id} · issued ${inv.date} · due ${inv.due||'—'} · ${inv.method||'method open'} · ${inv.jobId||'manual'}</div>
              <div class="font-display text-lg">${l?l.org:inv.leadId}</div>
              <div class="text-sm">${money(inv.subtotal)} + GST ${money(inv.gst)} = ${money(inv.total)}</div>
            </div>
            <div class="text-right">
              <div class="font-display text-2xl">${money(inv.total)}</div>
              ${statusChip(inv.status)}
              <div class="mt-2 flex gap-2 justify-end">
                ${inv.status==='Draft'?`<button onclick="issueInvoice('${inv.id}')" class="text-xs border px-3 py-1 rounded-full">Issue</button>`:`<button onclick="requestPay('${inv.id}')" class="text-xs border px-3 py-1 rounded-full">Request e-transfer</button>`}
                ${inv.status!=='Paid'&&inv.status!=='Draft'?`<button onclick="payInvoice('${inv.id}')" class="text-xs bg-forest text-white px-3 py-1 rounded-full">Mark paid</button>`:''}
                <button onclick="planInvoice('${inv.id}')" class="text-xs border px-3 py-1 rounded-full">${inv.plan||'Payment plan'}</button>
                <button onclick="sendTemplate('${inv.leadId}','invoice')" class="text-xs border px-3 py-1 rounded-full">Queue invoice note</button>
              </div>
            </div>
          </div>`;
        }).join('')}
      `);
    }

    function viewChem(){
      return shell(`
        <div class="flex justify-between mb-4">
          <div>
            <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Alberta use record</div>
            <h1 class="font-display text-4xl font-semibold">Materials</h1>
            <p class="text-sm text-forest/70 max-w-2xl">GorillaDesk / PestPac log FIFRA fields. Framework logs what was used, where, weather, and PCP # from the container. Rates are not stored as shop defaults — the label is the rate.</p>
          </div>
          <button onclick="logUsage()" class="bg-forest text-offwhite px-4 py-2 rounded-full font-display">Log use</button>
        </div>
        <div class="grid md:grid-cols-2 gap-2 mb-6">
          ${CHEMS.map(c=>`<div class="bg-white rounded-xl p-3 border border-forest/10 text-sm"><div class="font-display">${c.name}</div><div class="text-xs text-forest/55">${c.kind} · ${c.pcp}<br/>${c.note}</div></div>`).join('')}
        </div>
        <h2 class="font-display text-xl mb-2">Field log</h2>
        ${(state.usages||[]).map(u=>{
          const cat = CHEMS.find(c=>c.id===u.product);
          return `<div class="bg-white rounded-xl p-4 border border-forest/10 mb-2 text-sm">
