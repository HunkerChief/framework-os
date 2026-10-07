      return `<div class="min-h-screen bg-offwhite text-forest p-5 max-w-lg mx-auto">
        <div class="flex items-center gap-2 mb-4">${logo(32)}<div><div class="font-display font-semibold">Framework Pest</div><div class="text-xs text-forest/40">Show us what you saw</div></div></div>
        <h1 class="font-display text-3xl font-semibold">Book an inspect</h1>
        <p class="text-sm text-forest/70 mt-1 mb-4">Calgary · Airdrie · Cochrane · Chestermere · Okotoks. We confirm the window. Not a live calendar.</p>
        <form onsubmit="return submitPublicBook(event)" class="bg-white rounded-3xl p-5 border border-forest/10 grid gap-3">
          ${field('name','Your name')}
          ${field('phone','Phone')}
          <label class="text-sm">Email<input name="email" type="email" class="mt-1 w-full border border-forest/15 rounded-xl px-3 py-2 bg-offwhite"/></label>
          ${field('community','Community')}
          <label class="text-sm">Street <span class="text-forest/40">(optional)</span>
            <input name="street" class="mt-1 w-full border rounded-xl px-3 py-2 bg-offwhite"/>
          </label>
          <label class="text-sm">Zone
            <select name="zone" class="mt-1 w-full border rounded-xl px-3 py-2 bg-offwhite">${TERRITORIES.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}</select>
          </label>
          <label class="text-sm">What is it
            <select name="pest" class="mt-1 w-full border rounded-xl px-3 py-2 bg-offwhite">
              <option>Mice</option><option>Wasps</option><option>Ants</option><option>Bed bugs</option><option>Not sure — send a photo later</option>
            </select>
          </label>
          <label class="text-sm">What you saw
            <textarea name="evidence" rows="3" required class="mt-1 w-full border rounded-xl px-3 py-2 bg-offwhite" placeholder="Droppings, nest, bites, where…"></textarea>
          </label>
          <label class="text-sm">Window
            <select name="window" class="mt-1 w-full border rounded-xl px-3 py-2 bg-offwhite">
              <option>Weekday morning</option><option>Weekday afternoon</option><option>Same-day / after hours</option>
            </select>
          </label>
          <label class="text-sm">How you will pay
            <select name="pay" required class="mt-1 w-full border rounded-xl px-3 py-2 bg-offwhite">
              <option value="">Choose…</option>
              <option>E-transfer</option>
              <option>Card pending</option>
              <option>Call first</option>
            </select>
          </label>
          <button class="bg-forest text-offwhite rounded-full py-3 font-display font-semibold mt-1">Send to the shop</button>
        </form>
        <p id="book-ok" class="hidden mt-4 text-sm">Received. Framework will reach you from frameworkpest.ca. 825 747 5787 if it is at the door.</p>
        <p class="text-xs text-forest/45 mt-6">Residential inspect mid-band ${money(159)} + GST until the shop overwrites the card. Credit to treatment if you book within 7 days.</p>
      </div>`;
    }

    function viewFollow(){
      const rows = (state.drips||[]).slice().sort((a,b)=> (a.due||'').localeCompare(b.due||''));
      return shell(`
        <div class="flex flex-wrap justify-between gap-3 mb-4">
          <div>
            <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Instead of HubSpot</div>
            <h1 class="font-display text-4xl font-semibold">Follow-up</h1>
            <p class="text-sm text-forest/70 max-w-2xl">Day 2 and day 5 on open quotes. 48h aftercare then a review ask — warranty desk still blocks the ask if a callback is open.</p>
          </div>
        </div>
        ${state.leads.slice(0,6).map(l=>`<button onclick="enrollDrip('${l.id}','newlead');save(state);render();showToast('Drip on ${l.org}')" class="text-[11px] border px-2 py-1 rounded-full mr-1 mb-2">Enroll ${l.org.split(' ')[0]}</button>`).join('')}
        ${rows.map(d=>{
          const l = leadBy(d.leadId);
          return `<div class="bg-white rounded-xl p-3 border mb-2 flex flex-wrap justify-between gap-2 text-sm">
            <div><div class="font-display">${l?l.org:d.leadId} · ${d.step}</div><div class="text-xs text-forest/55">due ${d.due} · ${d.seq}</div></div>
            <div>${statusChip(d.status)} ${d.status==='Due'?`<button onclick="runDrip('${d.id}')" class="ml-2 text-xs bg-forest text-white px-3 py-1 rounded-full">Queue send</button>`:''}</div>
          </div>`;
        }).join('')||'<p class="text-sm">No drips. Enroll a lead above.</p>'}
      `);
    }
    window.runDrip = (id)=>{
      const d = (state.drips||[]).find(x=>x.id===id); if(!d) return;
      const l = leadBy(d.leadId);
      if(d.template==='review'){
        const openCb = (state.reviews||[]).some(r=>r.leadId===d.leadId && r.status==='Hold');
        // warranty hold: if warranty desk has open, skip — simple check notes
        const held = (state.reviews||[]).find(r=>r.leadId===d.leadId && /hold|callback/i.test(r.note||''));
        if(held){ showToast('Warranty hold — review ask blocked'); return; }
      }
      sendTemplate(d.leadId, d.template);
      d.status = 'Sent';
      save(state); showToast((l?l.org:'')+' · '+d.step+' queued');
    };

    function render(){
      const map = {
        dashboard: viewDashboard,
        intake: viewIntake,
        crm: viewCRM,
        lead: viewLead,
        guard: viewGuard,
        sop: viewSOP,
        inspection: viewInspection,
        dispatch: viewDispatch,
        route: viewRoute,
        jobs: viewJobs,
        agreements: viewAgreements,
        billing: viewBilling,
        chem: viewChem,
        devices: viewDevices,
        inventory: viewInventory,
        suppliers: viewSuppliers,
        fleet: viewFleet,
        comms: viewComms,
        tech: viewTech,
        portal: viewPortal,
        book: viewBook,
        fit: viewFit,
        cost: viewCost,
        reviews: viewReviews,
        compliance: viewCompliance,
        lark: viewLark,
        workspace: viewWorkspace,
        id: viewID,
        brief: viewBrief,
        warranty: viewWarranty,
        density: viewDensity,
        retail: viewRetail,
        bid: viewBid,
        speed: viewSpeed,
        phone: viewPhone,
        refer: viewRefer,
        booklink: viewBookLink,
        follow: viewFollow,
        publicbook: viewPublicBook,
        churn: viewChurn,
        territory: viewTerritory,
        proposals: viewProposals,
        report: viewReport
      };
      document.getElementById('app').innerHTML = (map[view]||viewDashboard)();
    }
    window.shopOut = ()=>{ fetch('/api/logout',{method:'POST',credentials:'same-origin'}).then(()=>{ shopSession=null; showLogin(''); }); };
    const hashView = (location.hash||'').replace('#','');
    if(hashView==='book' || /[?&]book=1/.test(location.search)) view = 'publicbook';
    else if(hashView && BAYS.some(b=>b.items.some(i=>i.id===hashView))) view = hashView;
    openBay = bayOf(view);
    window.addEventListener('hashchange', ()=>{
      const next = (location.hash||'').replace('#','');
      if(next==='book'){ view='publicbook'; render(); return; }
      if(next && BAYS.some(b=>b.items.some(i=>i.id===next))) go(next);
    });
    try { render(); } catch(err) {
      document.getElementById('app').innerHTML = '<div style="padding:24px;font-family:sans-serif;background:#F4F2EC;color:#15361E"><h1>Framework OS hit an error</h1><pre style="white-space:pre-wrap">'+String(err)+'</pre></div>';
    }
    async function boot(){
      if(view==='publicbook') return;
      try {
        const ses = await fetch('/api/session', { credentials:'same-origin' });
        const type = ses.headers.get('content-type') || '';
        if(ses.ok && type.includes('json')){
          const data = await ses.json();
          if(data.ok){ await startShop(); return; }
          showLogin('');
          return;
        }
        render();
      } catch(err) {
        try { render(); } catch(e) {
          document.getElementById('app').innerHTML = '<div style="padding:24px;font-family:sans-serif;background:#F4F2EC;color:#15361E"><h1>Framework OS hit an error</h1><pre style="white-space:pre-wrap">'+String(e)+'</pre></div>';
        }
      }
    }
    boot();
  
