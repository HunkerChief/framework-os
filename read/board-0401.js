        return false;
      });
    }
    function normalizeState(s){
      (s.leads||[]).forEach(l=>{
        if(l.stage==='Monitoring'){ l.stage='Won'; l.contract='Monitoring'; }
        if(!l.created) l.created = new Date().toISOString();
        if(l.firstTouch === undefined) l.firstTouch = l.stage==='New lead' ? '' : l.created;
        if(!l.source) l.source = 'Unknown';
        if(l.pay === undefined) l.pay = '';
        if(l.referredBy === undefined) l.referredBy = '';
        if(l.contract === undefined) l.contract = '';
        if(!l.payer) l.payer = { name:l.name||'', phone:l.phone||'', email:l.email||'', org:l.org||'' };
        if(!l.site) l.site = { street:l.street||'', community:l.community||'', unit:'', access:'see dispatch' };
        if(l.approval===undefined) l.approval = isCommercial(l.type) ? 'Pending' : 'Not required';
        if(/code\s*\d+|gate\s*\d+/i.test(l.notes||'')) l.notes = l.notes.replace(/code\s*\d+|gate\s*\d+/ig,'see dispatch');
      });
      (s.jobs||[]).forEach(j=>{
        if(/code\s*\d+|gate\s*\d+/i.test(j.notes||'')) j.notes = j.notes.replace(/code\s*\d+|gate\s*\d+/ig,'see dispatch');
      });
      (s.proposals||[]).forEach(p=>{
        const l = (s.leads||[]).find(x=>x.id===p.leadId);
        if(p.approval===undefined) p.approval = (l && isCommercial(l.type)) ? 'Pending' : 'Not required';
        if(p.gst==null) p.gst = gstOf(p.subtotal);
      });
      (s.invoices||[]).forEach(inv=>{
        if(!inv.due) inv.due = addDaysISO(inv.date, 14);
        if(inv.issued===undefined) inv.issued = inv.status!=='Draft';
        if(!inv.method) inv.method = '';
      });
      return s;
    }
    function leadBy(id){ return (state.leads||[]).find(x=>x.id===id); }
    function techBy(id){ return TECHS.find(x=>x.id===id); }
    function jobBy(id){ return (state.jobs||[]).find(x=>x.id===id); }
    function uid(prefix){ return prefix + '-' + Math.floor(1000 + Math.random()*9000); }
    function showToast(msg){ toast = msg; render(); setTimeout(()=>{ toast=''; render(); }, 2200); }

    function logo(size=28){
      return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="4" y="6" width="28" height="10" rx="3" fill="#A9C0A0"/>
        <rect x="4" y="20" width="16" height="9" rx="2" fill="#A9C0A0"/>
        <path d="M24 20h12v9c0 5-4 9-9 9h-3V20z" fill="#F2733A"/>
        <rect x="4" y="33" width="10" height="10" rx="2" fill="#A9C0A0"/>
      </svg>`;
    }

    const BAYS = [
      { id:'site', n:'01', title:'On the envelope', blurb:'Read the building', items:[
        { id:'guard', label:'Envelope map' },
        { id:'sop', label:'House walk' },
        { id:'inspection', label:'Live inspect' },
        { id:'id', label:'Pest ID' },
        { id:'report', label:'Client report' }
      ]},
      { id:'run', n:'02', title:'On the route', blurb:'Who is where', items:[
        { id:'dispatch', label:'Day board' },
        { id:'route', label:'Stop order' },
        { id:'jobs', label:'Work orders' },
        { id:'tech', label:'Tech phone' },
        { id:'fit', label:'Best Fit' },
        { id:'brief', label:'Morning brief' }
      ]},
      { id:'desk', n:'03', title:'In the shop', blurb:'Leads to ink', items:[
        { id:'dashboard', label:'Command' },
        { id:'intake', label:'New ticket' },
        { id:'crm', label:'Pipeline' },
        { id:'proposals', label:'Proposals' },
        { id:'book', label:'Rate card' },
        { id:'territory', label:'YYC zones' },
        { id:'density', label:'Density cells' },
        { id:'bid', label:'Commercial bid' },
        { id:'speed', label:'Speed-to-lead' },
        { id:'phone', label:'Phone desk' },
        { id:'refer', label:'Referrals' },
        { id:'booklink', label:'Book link' },
        { id:'follow', label:'Follow-up' }
      ]},
      { id:'cash', n:'04', title:'On the books', blurb:'GST and return', items:[
        { id:'billing', label:'Invoices' },
        { id:'agreements', label:'Contracts' },
        { id:'cost', label:'Job cost' },
        { id:'reviews', label:'Reviews' },
        { id:'warranty', label:'Warranty desk' },
        { id:'churn', label:'Churn' },
        { id:'portal', label:'Client hub' },
        { id:'comms', label:'Outbox' }
      ]},
      { id:'kit', n:'05', title:'On the truck', blurb:'Kit and record', items:[
        { id:'chem', label:'Use log' },
        { id:'devices', label:'Stations' },
        { id:'inventory', label:'Par' },
        { id:'compliance', label:'Alberta log' },
        { id:'lark', label:'Lark' },
        { id:'workspace', label:'Workspace' },
        { id:'retail', label:'Retail counter' },
        { id:'suppliers', label:'Suppliers' },
        { id:'fleet', label:'Fleet & kit' }
      ]}
    ];
    function bayOf(v){
      if(v==='lead') return 'desk';
      const hit = BAYS.find(b=>b.items.some(i=>i.id===v));
      return hit?hit.id:'desk';
    }
    let openBay = bayOf(view);

    function navBays(){
      return BAYS.map(b=>{
        const on = openBay===b.id;
        const here = b.items.some(i=>i.id===view) || (view==='lead' && b.id==='desk');
        return `<section class="bay ${here?'on':''}">
          <button onclick="toggleBay('${b.id}')" class="w-full flex items-baseline justify-between gap-2 text-left">
            <span>
              <span class="text-forest/35 text-[10px] tracking-[0.18em] uppercase">${b.n}</span>
              <span class="font-display block text-[15px] leading-tight text-forest">${b.title}</span>
              <span class="text-[11px] text-forest/45">${b.blurb}</span>
            </span>
            <span class="text-[10px] text-sage/50">${b.items.length}</span>
          </button>
          <div class="flex flex-wrap gap-1.5 mt-2.5">
            ${b.items.map(i=>`<a href="#${i.id}" onclick="go('${i.id}');return false" class="navchip ${view===i.id?'on':''}">${i.label}</a>`).join('')}
          </div>
        </section>`;
      }).join('');
    }

    window.toggleBay = (id)=>{ openBay = openBay===id ? '' : id; render(); };
    window.go = (v)=>{ view=v; openBay = bayOf(v); if(location.hash!=='#'+v) history.replaceState(null,'','#'+v); render(); };
    window.selectLead = (id)=>{ selectedLead=id; view='lead'; render(); };
    window.selectInsp = (id)=>{ selectedInsp=id; view='inspection'; render(); };

    function shell(content){
      return `
      <div class="min-h-screen flex flex-col lg:flex-row">
        <aside class="no-print bg-white text-forest w-full lg:w-72 lg:min-h-screen p-4 border-r border-forest/10">
          <div class="flex items-center gap-3 mb-6">
            ${logo(36)}
            <div>
              <div class="font-display font-semibold leading-tight">Framework OS</div>
              <div class="text-[11px] text-forest/45">Guard · Dispatch · Cash · sales ends at Won</div>
            </div>
          </div>
          <div class="flex gap-2 mb-4">
            <button onclick="go('intake')" class="flex-1 bg-forest text-offwhite text-xs font-display rounded-full py-2">New ticket</button>
            <button onclick="go('tech')" class="flex-1 border border-forest/15 text-forest text-xs font-display rounded-full py-2">Tech phone</button>
          </div>
          ${navBays()}
          <div class="mt-4 pt-3 border-t border-forest/10 text-[11px] text-forest/55">
            <div class="font-display text-forest">${state.user.name}</div>
            ${state.user.role}<br/>${state.user.shop}
            <div class="mt-2">11 Sep 2026 · Calgary</div>
          </div>
        </aside>
        <main class="flex-1 p-4 lg:p-8 max-w-6xl">
          ${toast?`<div class="mb-4 bg-forest text-offwhite px-4 py-2 rounded-full inline-block text-sm">${toast}</div>`:''}
          <div class="no-print mb-4 text-[11px] tracking-[0.18em] uppercase text-forest/45">${(BAYS.find(b=>b.id===bayOf(view))||{}).n||''}  ${(BAYS.find(b=>b.id===bayOf(view))||{}).title||''}</div>
          ${content}
        </main>
      </div>`;
    }

    function kpis(){
      const open = state.leads.filter(l=>l.stage!=='Won').length;
      const won = state.leads.filter(l=>l.stage==='Won').reduce((a,l)=>a+l.value,0);
      const pipe = state.leads.filter(l=>l.stage!=='Won').reduce((a,l)=>a+l.value,0);
      const defects = state.inspections.reduce((a,i)=>a+i.defects.length,0);
      const todayJobs = (state.jobs||[]).filter(j=>j.date===selectedDay && !['Cancelled','Complete'].includes(j.status)).length;
      const ar = (state.invoices||[]).filter(x=>x.status!=='Paid').reduce((a,x)=>a+x.total,0);
      const calls = state.calls||[];
      const missed = calls.filter(c=>c.result==='Missed'||c.result==='Abandoned').length;
      const missPct = calls.length? Math.round(missed/calls.length*100)+'%' : '—';
      const touched = state.leads.filter(l=>l.created && l.firstTouch);
      const avgMin = touched.length? Math.round(touched.reduce((a,l)=>a+((new Date(l.firstTouch)-new Date(l.created))/60000),0)/touched.length) : 0;
      const slaBreach = state.leads.filter(l=>!l.firstTouch && l.stage==='New lead').length;
      const asked = (state.reviews||[]).length;
      const atRisk = (state.agreements||[]).filter(a=>a.status==='Active' && (!leadBy(a.leadId)||!leadBy(a.leadId).pay)).length
        + (state.agreements||[]).filter(a=>a.status==='Held').length;
      return [
        { l:'Open pipeline', v:money(pipe), s:'Envelope + monitoring work' },
        { l:'Won / monitoring', v:money(won), s:'Recurring protection' },
        { l:'Stops today', v:String(todayJobs), s:selectedDay+' still open' },
        { l:'AR outstanding', v:money(ar), s:'Due + overdue' },
        { l:'Missed / abandoned', v:missPct, s:missed+' of '+(calls.length||0)+' logged calls' },
        { l:'Min to first touch', v:touched.length? String(avgMin):'—', s:slaBreach+' sitting on the 15-min SLA' },
        { l:'Review asks on file', v:String(asked), s:'Do not ask mid-callback' },
        { l:'Churn watch', v:String(atRisk), s:'Held or no pay method' }
      ];
    }

    function viewDashboard(){
      const cards = kpis().map(k=>`
        <div class="bg-white rounded-2xl p-5 border border-forest/10">
          <div class="text-xs uppercase tracking-widest text-forest/50">${k.l}</div>
          <div class="font-display text-3xl font-semibold mt-1">${k.v}</div>
          <div class="text-sm text-forest/60 mt-1">${k.s}</div>
        </div>`).join('');
      const today = state.leads.filter(l=>['Inspect booked','Qualified','Won'].includes(l.stage));
      return shell(`
        <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Structural pest control · Calgary</div>
            <h1 class="font-display text-4xl font-semibold mt-1">Building pathology, not spray routes.</h1>
            <p class="mt-2 max-w-2xl text-forest/70">First fall frost is typically ~15 Sep. This is the mouse-proofing window — seal the envelope before the next cold snap, then monitor.</p>
          </div>
          <div class="flex gap-2">
            <button onclick="go('speed')" class="border border-forest/20 px-4 py-3 rounded-full font-display">SLA board</button>
            <button onclick="go('intake')" class="bg-forest text-offwhite px-5 py-3 rounded-full font-display font-semibold">New intake</button>
          </div>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">${cards}</div>
        <section class="bg-white rounded-2xl p-5 border border-forest/10 mb-8 text-sm">
          <div class="font-display text-lg">Live in this file vs not wired yet</div>
          <p class="text-forest/70 mt-1">The boards below run on this device. Card charges, SMS, GPS, and accounting export need shop accounts — those buttons queue work, they do not talk to a bank or a tower.</p>
          <div class="grid md:grid-cols-2 gap-3 mt-3">
            <div><div class="text-xs uppercase tracking-widest text-forest/40">Works here</div>Dispatch, Best Fit slot, price book, invoices + GST, material log, devices, truck par, comms drafts, e-sign on a proposal, job cost math, review queue, client hub.</div>
            <div><div class="text-xs uppercase tracking-widest text-forest/40">Needs a vendor</div>Live truck GPS, Stripe/Moneris AutoPay, Twilio/Workspace send, QuickBooks, Maps traffic, Sentricon. Lark cards send only when App ID + Secret + chat id are in env.</div>
          </div>
        </section>
        <div class="grid lg:grid-cols-3 gap-6">
          <section class="lg:col-span-2 bg-white rounded-3xl p-6 border border-forest/10">
            <h2 class="font-display text-2xl">Today’s structural work</h2>
            <div class="mt-4 space-y-3">${today.map(l=>`
              <button onclick="selectLead('${l.id}')" class="w-full text-left bg-offwhite hover:bg-sage/20 rounded-2xl p-4 flex justify-between gap-3">
                <div>
                  <div class="font-display font-semibold">${l.org}</div>
                  <div class="text-sm text-forest/60">${l.community} · ${l.pest}</div>
                  <div class="text-xs mt-1 text-forest/45">${l.next}</div>
                </div>
                <div class="text-right">
                  <div class="text-forest/50 text-xs uppercase">${l.urgency}</div>
                  <div class="font-display">${money(l.value)}</div>
                </div>
              </button>`).join('')}</div>
          </section>
          <section class="bg-white rounded-3xl p-6 border border-forest/10">
            <h2 class="font-display text-xl">Season brief</h2>
            <ul class="mt-3 space-y-2 text-sm">
              <li><strong>Now:</strong> mouse-capable gaps at grade, garage seals, utility sleeves.</li>
              <li><strong>Still active:</strong> late wasp nests at eaves if days stay warm.</li>
              <li><strong>Do not sell:</strong> termite treatments. Not established in Alberta.</li>
              <li><strong>Method:</strong> inspect → exclude → sanitation → labelled product only if needed.</li>
            </ul>
            <p class="text-xs mt-4 text-forest/60">Placeholder commercial figures until the shop price book is loaded. GST extra on proposals.</p>
          </section>
        </div>
      `);
    }

    function viewIntake(){
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Calgary ticket</div>
        <h1 class="font-display text-4xl font-semibold mt-1 mb-6">Intake</h1>
        <form onsubmit="return submitIntake(event)" class="grid md:grid-cols-2 gap-4 bg-white rounded-3xl p-6 border border-forest/10">
          ${field('name','Payer name')}
          ${field('org','Site name')}
          <label class="text-sm">Street <span class="text-forest/40">(optional — used to catch a duplicate site)</span>
            <input name="street" class="mt-1 w-full border border-forest/15 rounded-xl px-3 py-2 bg-offwhite" placeholder="14 Westmount Rd SW"/>
          </label>
          ${field('phone','Payer phone')}
          ${field('email','Payer email')}
          ${field('community','Community')}
          <label class="text-sm">Territory
            <select name="zone" class="mt-1 w-full border border-forest/15 rounded-xl px-3 py-2 bg-offwhite">${TERRITORIES.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}</select>
          </label>
          <label class="text-sm">Building type
            <select name="type" class="mt-1 w-full border border-forest/15 rounded-xl px-3 py-2 bg-offwhite">
              <option>Residential detached</option><option>Townhouse</option><option>Multi-unit</option>
              <option>Commercial office</option><option>Commercial kitchen</option><option>Warehouse / bay</option>
            </select>
          </label>
          <label class="text-sm">Urgency
            <select name="urgency" class="mt-1 w-full border border-forest/15 rounded-xl px-3 py-2 bg-offwhite">
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
          </label>
          <label class="text-sm">Source
            <select name="source" class="mt-1 w-full border border-forest/15 rounded-xl px-3 py-2 bg-offwhite">
              <option>GBP</option><option>Web</option><option>Missed call</option><option>Phone</option><option>Referral</option><option>Nine-around</option><option>PM email</option><option>Walk-in</option>
            </select>
          </label>
          <label class="text-sm">Referred by
            <input name="referredBy" class="mt-1 w-full border border-forest/15 rounded-xl px-3 py-2 bg-offwhite" placeholder="Neighbour, PM, last job…"/>
          </label>
          ${field('pest','Pest hypothesis')}
          <label class="text-sm md:col-span-2">What they actually saw
            <textarea name="evidence" rows="3" class="mt-1 w-full border border-forest/15 rounded-xl px-3 py-2 bg-offwhite" placeholder="Droppings, trails, nest, sounds, bites…"></textarea>
          </label>
          <label class="text-sm">Photo of what they saw
            <input type="file" name="saw" accept="image/*" class="mt-1 w-full text-xs"/>
          </label>
          <label class="text-sm">Pay method
            <select name="pay" class="mt-1 w-full border border-forest/15 rounded-xl px-3 py-2 bg-offwhite">
              <option value="">None yet</option>
              <option>E-transfer</option>
              <option>Card pending</option>
              <option>PO</option>
              <option>Call first</option>
            </select>
          </label>
          <label class="text-sm md:col-span-2">Site notes
            <textarea name="notes" rows="2" class="mt-1 w-full border border-forest/15 rounded-xl px-3 py-2 bg-offwhite" placeholder="Pets, kids. Gate codes stay off this record — write see dispatch."></textarea>
          </label>
          <div class="md:col-span-2 flex justify-end">
            <button class="bg-forest text-offwhite px-6 py-3 rounded-full font-display font-semibold">File ticket into CRM</button>
          </div>
        </form>
        <p class="text-xs text-forest/50 mt-3">Same ticket shape as the book link. A matching phone, email, or street+community opens the file that is already there. GST is a tax, not a line on this form.</p>
      `);
    }
    function field(name,label){
      return `<label class="text-sm">${label}<input name="${name}" required class="mt-1 w-full border border-forest/15 rounded-xl px-3 py-2 bg-offwhite"/></label>`;
    }
    window.submitIntake = (e)=>{
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target).entries());
      const dup = findDup(f);
      if(dup){
        selectedLead = dup.id; view='lead';
        showToast('Already on file — '+dup.id+' · '+dup.org);
        return false;
      }
      const lead = shapeLead(f);
      const file = e.target.saw && e.target.saw.files && e.target.saw.files[0];
      const finish = ()=>{
        enrollDrip(lead.id, 'newlead');
        state.leads.unshift(lead); save(state); selectedLead=lead.id; view='lead'; showToast('Ticket '+lead.id+' in CRM');
      };
      if(file){
        const r = new FileReader();
        r.onload = ()=>{
          state.photos = state.photos||[];
          state.photos.unshift({ id:uid('PH'), leadId:lead.id, key:'saw', slot:'What they saw', caption:f.evidence||'Intake still', dataUrl:r.result });
          finish();
        };
        r.readAsDataURL(file);
      } else finish();
      return false;
    };

    function viewCRM(){
      const cols = PIPE.map(stage=>{
        const items = state.leads.filter(l=>l.stage===stage);
        return `<div class="bg-white/70 rounded-2xl p-3 min-w-[210px] flex-1">
          <div class="flex justify-between items-center mb-3">
            <div class="font-display font-semibold">${stage}</div>
            <span class="text-xs bg-sage/50 px-2 py-0.5 rounded-full">${items.length}</span>
          </div>
          <div class="space-y-2 kanban">${items.map(l=>`
            <button onclick="selectLead('${l.id}')" class="w-full text-left bg-offwhite border border-forest/10 rounded-xl p-3 hover:border-safety">
              <div class="font-display text-sm font-semibold">${l.org}</div>
              <div class="text-[11px] text-forest/60">${l.community} · ${l.pest}</div>
              <div class="flex justify-between mt-2 text-xs"><span class="text-forest/50">${l.urgency}</span><span>${l.value?money(l.value):'TBD'}</span></div>
            </button>`).join('')}</div>
        </div>`;
      }).join('');
      return shell(`
        <div class="flex items-end justify-between mb-6">
          <div>
            <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Sales Hub</div>
            <h1 class="font-display text-4xl font-semibold">CRM pipeline</h1>
            <p class="text-forest/70 mt-1">Sales stops at Won. Monitoring is the agreement, not a pipeline column.</p>
          </div>
        </div>
        <div class="flex gap-3 overflow-x-auto pb-4">${cols}</div>
        <h2 class="font-display text-xl mt-6 mb-2">Won — on a contract</h2>
        ${state.leads.filter(l=>l.stage==='Won' && l.contract).map(l=>`
          <div class="bg-white rounded-xl border border-forest/10 p-3 mb-2 text-sm flex justify-between">
            <span>${l.org} · ${l.contract}</span><button onclick="selectLead('${l.id}')" class="underline text-xs">Open</button>
          </div>`).join('')||'<p class="text-sm text-forest/50">None. A signed monitor lives under Agreements.</p>'}
      `);
    }

    function viewLead(){
      const l = state.leads.find(x=>x.id===selectedLead) || state.leads[0];
      selectedLead = l.id;
      const insp = state.inspections.filter(i=>i.leadId===l.id);
      return shell(`
        <button onclick="go('crm')" class="text-sm text-forest/60 no-print">← Pipeline</button>
        <div class="flex flex-wrap justify-between gap-4 mt-2 mb-6">
          <div>
            <div class="text-forest/40 text-xs">${l.id} · ${l.zone}</div>
            <h1 class="font-display text-4xl font-semibold">${l.org}</h1>
            <p class="text-forest/70">${l.name} · ${l.community} · ${l.type}</p>
          </div>
          <div class="text-right">
            <div class="font-display text-2xl">${l.value?money(l.value):'Unscoped'}</div>
            <div class="text-sm">${l.stage}</div>
          </div>
        </div>
        <div class="grid lg:grid-cols-3 gap-4">
          <div class="lg:col-span-2 space-y-4">
            <section class="bg-white rounded-2xl p-5 border border-forest/10">
              <h2 class="font-display text-xl mb-2">Payer and site</h2>
              <p><strong>Payer:</strong> ${(l.payer&&l.payer.name)||l.name} · ${(l.payer&&l.payer.phone)||l.phone} · ${(l.payer&&l.payer.email)||l.email}</p>
              <p class="mt-2"><strong>Site:</strong> ${l.org} · ${(l.site&&l.site.street)||l.street||'street not filed'} · ${l.community}${(l.site&&l.site.unit)?', '+l.site.unit:''}</p>
              <p class="mt-2 text-sm text-forest/60">Access: ${(l.site&&l.site.access)||'see dispatch'}. Do not store gate codes on this record.</p>
              ${l.contract?`<p class="mt-2 text-sm">Contract: ${l.contract} — not a sales stage.</p>`:''}
              ${l.approval==='Pending'?'<p class="mt-2 text-sm">Commercial — approval required before e-sign.</p>':''}
            </section>
