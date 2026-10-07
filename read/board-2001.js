            <div class="flex gap-1">
              <button onclick="pushLark('${j.id}','status')" class="text-[11px] bg-forest text-white px-3 py-1 rounded-full">Card</button>
              <button onclick="pushLark('${j.id}','scheduled')" class="text-[11px] border px-3 py-1 rounded-full">Calendar hold</button>
              <button onclick="pushLark('${j.id}','approval')" class="text-[11px] border px-3 py-1 rounded-full">Ask approval</button>
            </div>
          </div>`).join('')}
        <h2 class="font-display text-xl mt-6 mb-2">Outbox</h2>
        ${(state.lark||[]).map(e=>`
          <div class="text-sm bg-white border border-forest/10 rounded-xl p-3 mb-2 flex justify-between gap-3">
            <div>${e.at?.slice(0,16)||''} · ${e.kind} · ${e.jobId}<div class="text-xs text-forest/55">${e.title||''}</div></div>
            <div>${e.sent?statusChip('Paid').replace('Paid','Sent'):statusChip(e.reason||'Queued')}</div>
          </div>`).join('')||'<p class="text-sm text-forest/50">Empty.</p>'}
        <p class="text-xs text-forest/50 mt-6">Put LARK_APP_ID, LARK_APP_SECRET, LARK_DISPATCH_CHAT in framework-ops/.env. China tenant: LARK_ENDPOINT=https://open.feishu.cn</p>
      `);
    }

    window.queueWorkspace = async (jobId, kind)=>{
      const j = jobBy(jobId); if(!j) return showToast('No job');
      const row = { id:uid('GW'), kind, jobId, sent:false, wired:false, reason:'queued', at:new Date().toISOString(), title:kind+' · '+(j.type||j.id) };
      state.workspace = state.workspace || [];
      state.workspace.unshift(row);
      save(state);
      try {
        const res = await fetch(LARK_API + '/workspace/queue', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ jobId, kind, job:j }) });
        const body = await res.json();
        row.wired = Boolean(body.wired); row.reason = body.reason || row.reason; save(state);
        showToast(body.wired ? 'Workspace OAuth present — consent still required' : 'Queued. Customer mail stays off Lark.');
      } catch(e) { showToast('Queued in OS. Ops API offline.'); }
    };

    function viewWorkspace(){
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Customer layer · @frameworkpest.ca</div>
        <h1 class="font-display text-4xl font-semibold mb-2">Google Workspace</h1>
        <p class="text-sm text-forest/70 max-w-2xl mb-4">Identity, Gmail to the client, Drive for stills and signed scopes, Calendar on the tech phone. Lark does not send the quote. Framework still owns the job.</p>
        <div class="grid md:grid-cols-2 gap-3 mb-6 text-sm">
          <div class="bg-white rounded-2xl p-4 border"><div class="text-xs text-forest/40">Gmail</div>Quote, invoice, reminder, prep sheet from hello@frameworkpest.ca</div>
          <div class="bg-white rounded-2xl p-4 border"><div class="text-xs text-forest/40">Calendar</div>Confirmed stop → tech calendar. Lark is the ping, not the schedule of record.</div>
          <div class="bg-white rounded-2xl p-4 border"><div class="text-xs text-forest/40">Drive</div>Thermal, site stills, signed commercial PDF. OS stores the link.</div>
          <div class="bg-white rounded-2xl p-4 border"><div class="text-xs text-forest/40">SSO</div>@frameworkpest.ca is the login. Suspend Workspace, they lose OS + Lark.</div>
        </div>
        ${(state.jobs||[]).slice(0,5).map(j=>`
          <div class="bg-white rounded-xl p-3 border mb-2 flex flex-wrap justify-between gap-2 text-sm">
            <div class="font-display">${j.id} · ${j.type}</div>
            <div class="flex gap-1">
              <button onclick="queueWorkspace('${j.id}','gmail')" class="text-[11px] bg-forest text-white px-3 py-1 rounded-full">Queue Gmail</button>
              <button onclick="queueWorkspace('${j.id}','calendar')" class="text-[11px] border px-3 py-1 rounded-full">Calendar</button>
              <button onclick="queueWorkspace('${j.id}','drive')" class="text-[11px] border px-3 py-1 rounded-full">Drive folder</button>
            </div>
          </div>`).join('')}
        <h2 class="font-display text-xl mt-6 mb-2">Outbox</h2>
        ${(state.workspace||[]).map(e=>`
          <div class="text-sm bg-white border rounded-xl p-3 mb-2 flex justify-between"><div>${e.kind} · ${e.jobId}</div>${statusChip(e.reason||'Queued')}</div>`).join('')||'<p class="text-sm text-forest/50">Empty. Set GOOGLE_CLIENT_ID in framework-ops/.env after consent.</p>'}
      `);
    }

    const PEST_ID = [
      { pest:'House mouse', season:'Year-round; spike after Chinooks and first frost', vs:'Rats are uncommon in most YYC residential. Droppings ~6 mm, pointed snout.', next:'Envelope inspect + exclusion list. Do not lead with a foundation spray.' },
      { pest:'Pavement / odorous ant', season:'May–Sep trails; indoor in winter if heat + food', vs:'Carpenter ants are larger, dump frass, want wet wood.', next:'Find the joint or moisture. Bait or residual only where the label allows.' },
      { pest:'Carpenter ant', season:'Spring swarmers; forage all summer', vs:'Not termites. Alberta default: termites not established.', next:'Probe wet wood. Treatment without the moisture story fails.' },
      { pest:'Baldfaced / aerial wasp', season:'Jun–Sep. Doorway = high urgency', vs:'Honey bees are fuzzy and pollen-loaded. Do not treat a hive as a pest nest.', next:'Accessible nest = labelled application. Void / allergy / eave = book service.' },
      { pest:'Cluster / boxelder / lady beetle', season:'Aug–Oct sunny walls', vs:'Not a hygiene pest. They overwinter in soffits.', next:'Seal + wall treatment. Do not fog the living room.' },
      { pest:'German cockroach', season:'Year-round indoor. Food sites.', vs:'Not a wood roach from firewood.', next:'Night inspect. Series + sanitation. Applicator cert if chemical used.' },
      { pest:'Bed bug', season:'Year-round travel / multi-res', vs:'Flea dirt is pepper in pet beds. Bed bug casings at seams.', next:'Inspect + prep sheet + series. Never one retail spray as a cure.' },
      { pest:'Mosquito / biting fly', season:'Jun–Aug only. Not a YYC year-round engine', vs:'Black flies after melt in some belt creeks.', next:'Lot barrier as a billed program. Check Code near ponds.' }
    ];
    const RETAIL_MAP = [
      { pest:'Mice', sell:'Covered snaps first. Door sweep / mesh. Domestic bait only if labelled for the buyer.', book:'If they have droppings in food rooms, or cannot set traps safely — book SVC-MOUSE.' },
      { pest:'Ants', sell:'Bait station matching sugar vs protein. Do not stack sprays on bait.', book:'Carpenter ants or wet wood — inspect, do not send a spray can.' },
      { pest:'Wasps', sell:'Foaming nest aerosol for a reachable nest they can see.', book:'Eave / void / ground nest, ladder, or allergy — SVC-WASP or SVC-WASP-V.' },
      { pest:'Spiders', sell:'Exclusion + labelled indoor/outdoor residual if they insist. Set expectations.', book:'Heavy eave webbing every May — sell A+ spray season, not a can a week.' },
      { pest:'Bed bugs', sell:'Nothing as a cure. Interceptors maybe. No single aerosol miracle.', book:'Always book SVC-BB0 inspect.' },
      { pest:'Pantry moths / beetles', sell:'Find and bin the source food. Then a labelled pantry product if needed.', book:'If they refuse to throw the rice out, product will fail — say so.' }
    ];
    const CELLS = [
      { id:'ALT', name:'Altadore / Marda / South Calgary', season:'Heritage weeps + mice', target:30, note:'SW envelope work. Nine-arounds after JOB-401.' },
      { id:'EV', name:'East Village / Beltline', season:'Multi-res + bed bug protocol', target:30, note:'Core. Property-manager touches count as law-of-100.' },
      { id:'OKO', name:'Okotoks light industrial strip', season:'Mice + sparrow + Q monitor', target:20, note:'Do not open a second rural cell until this holds.' }
    ];

    window.setWarranty = (leadId, action)=>{
      state.warranty = state.warranty || [];
      const l = leadBy(leadId);
      const lines = {
        covered: 'We will return at no charge inside the written window. Same pest, same zone, prep was done.',
        paid: 'This sits outside the sold scope (new pest, skipped exclusion, or the window closed). We can book a paid revisit.',
        convert: 'Activity pattern fits a program, not another one-off. Quote PRG-B or PRG-A on the same call.',
        refer: 'This is wildlife, another suite, or a structural repair we do not perform. We will write the handoff.',
        good: 'The biology is fine. We were late or messy. Office make-good — then the review ask.'
      };
      state.warranty.unshift({ id:uid('W'), leadId, action, said: lines[action], at: new Date().toISOString(), org:l?l.org:leadId });
      if(action==='good' || action==='covered'){
        state.reviews.unshift({ id:uid('RV'), leadId, asked:selectedDay, status:'Hold 24–48h', note:'Do not ask same-hour as a surprise invoice.' });
      }
      save(state); view='warranty'; showToast('Desk call logged');
    };

    function viewID(){
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">yyc-pest-id</div>
        <h1 class="font-display text-4xl font-semibold mb-2">What is it, this week</h1>
        <p class="text-sm text-forest/70 mb-4">11 Sep 2026 — first fall frost typically ~15 Sep. Mouse-proofing window. Wasps still active on warm afternoons. Termites are not a Calgary job.</p>
        ${PEST_ID.map(p=>`
          <article class="bg-white rounded-2xl p-4 border border-forest/10 mb-2">
            <div class="font-display text-xl">${p.pest}</div>
            <div class="text-xs text-forest/40 mt-1">${p.season}</div>
            <p class="text-sm mt-2">${p.vs}</p>
            <p class="text-sm text-forest/70">Next: ${p.next}</p>
          </article>`).join('')}
      `);
    }

    function viewBrief(){
      const urgent = state.leads.filter(l=>l.urgency==='High');
      const stops = (state.jobs||[]).filter(j=>j.date===selectedDay);
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">yyc-dispatch-intel</div>
        <h1 class="font-display text-4xl font-semibold mb-2">Morning brief</h1>
        <p class="text-sm text-forest/70 mb-4">11 Sep 2026 · America/Edmonton. First frost ~15 Sep. Pull live weather before the truck leaves — this card does not replace Environment Canada.</p>
        <div class="bg-white border border-forest/10 rounded-3xl p-6 mb-4">
          <div class="text-sage text-xs tracking-widest uppercase">Weather and access</div>
          <p class="mt-2">Shoulder season. Ladder work only if wind is honest. Chinook melt still feeds rim-joist moisture in SW heritage stock.</p>
          <div class="text-sage text-xs tracking-widest uppercase mt-4">Pest pressure today</div>
          <p class="mt-2">Mice moving toward heat. Wasps on warm walls. Cluster flies starting on south elevations. No termite language on the board.</p>
        </div>
        <h2 class="font-display text-xl mb-2">Urgency queue</h2>
        ${urgent.map(l=>`<div class="bg-white rounded-xl p-3 border mb-2 text-sm"><span class="text-forest/50">${l.urgency}</span> · ${l.org} · ${l.pest}</div>`).join('')}
        <h2 class="font-display text-xl mt-4 mb-2">Stops on ${selectedDay}</h2>
        ${stops.map(j=>`<div class="bg-white rounded-xl p-3 border mb-2 text-sm">${j.window} · ${j.type} · ${j.community} · ${(techBy(j.tech)||{}).name}</div>`).join('')||'<p class="text-sm">None.</p>'}
        <h2 class="font-display text-xl mt-4 mb-2">3 moves before 09:00</h2>
        <ol class="list-decimal ml-5 text-sm space-y-1">
          <li>Confirm Altadore access with dispatch (do not write the gate code here) and the cat before the 08:30 inspect.</li>
          <li>Do not add a free perimeter spray onto a mouse mobilization.</li>
          <li>Stage weep guards + mesh — par is short on the SW heritage run.</li>
        </ol>
        <p class="text-xs text-forest/50 mt-4">Compliance nudge: food-site night inspect needs an applicator if a pesticide is used. Label is law.</p>
      `);
    }

    function viewWarranty(){
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">yyc-warranty-desk</div>
        <h1 class="font-display text-4xl font-semibold mb-2">Warranty desk</h1>
        <p class="text-sm text-forest/70 mb-4">Covered activity is not a failed job. Do not ask for a Google review while a callback is open. Never argue science in public.</p>
        ${(state.leads||[]).slice(0,6).map(l=>`
          <div class="bg-white rounded-2xl p-4 border border-forest/10 mb-2">
            <div class="font-display text-lg">${l.org}</div>
            <div class="text-xs text-forest/55">${l.pest} · ${l.community} · ${l.stage}</div>
            <div class="flex flex-wrap gap-1 mt-2">
              ${[['covered','Covered revisit'],['paid','Paid revisit'],['convert','Convert to program'],['refer','Refer / escalate'],['good','Office make-good']].map(([k,lab])=>`<button onclick="setWarranty('${l.id}','${k}')" class="text-[11px] border px-2 py-1 rounded-full">${lab}</button>`).join('')}
            </div>
          </div>`).join('')}
        <h2 class="font-display text-xl mt-6 mb-2">Desk log</h2>
        ${(state.warranty||[]).map(w=>`
          <div class="text-sm bg-white border rounded-xl p-3 mb-2">
            <div class="font-display">${w.org} · ${w.action}</div>
            <p class="text-forest/70">${w.said}</p>
          </div>`).join('')||'<p class="text-sm text-forest/50">No calls yet.</p>'}
      `);
    }

    function viewDensity(){
      const byComm = {};
      (state.leads||[]).forEach(l=>{ byComm[l.community] = (byComm[l.community]||0)+1; });
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">yyc-density-growth</div>
        <h1 class="font-display text-4xl font-semibold mb-2">Own the cell</h1>
        <p class="text-sm text-forest/70 max-w-2xl mb-4">Value is a recurring program in a tight cell, not a truck on Deerfoot. Open a second cell only when the first holds ~30 active stops. No card / e-transfer / PO → not on the dispatch board.</p>
        ${CELLS.map(c=>{
          const have = Object.entries(byComm).filter(([n])=>c.name.includes(n.split(' ')[0]) || c.name.includes(n)).reduce((a,[,n])=>a+n,0) || (state.leads.filter(l=>c.name.includes(l.community)).length);
          const n = state.leads.filter(l=>c.name.toLowerCase().includes(l.community.toLowerCase()) || l.community && c.name.includes(l.community)).length;
          return `<div class="bg-white rounded-2xl p-4 border border-forest/10 mb-3">
            <div class="flex justify-between"><div class="font-display text-xl">${c.name}</div><div class="font-display">${n} / ${c.target}</div></div>
            <div class="text-xs text-forest/40">${c.season}</div>
            <p class="text-sm mt-2">${c.note}</p>
            <div class="h-2 bg-sage/30 rounded-full mt-3"><div class="h-2 bg-forest rounded-full" style="width:${Math.min(100, Math.round(n/c.target*100))}%"></div></div>
          </div>`;
        }).join('')}
        <h2 class="font-display text-xl mt-6 mb-2">Law of 100 — today mix</h2>
        <ul class="text-sm space-y-1">
          <li>20 nine-arounds from yesterday’s jobs</li>
          <li>20 GBP / web / voicemail follow-ups</li>
          <li>20 property-manager or HOA touches</li>
          <li>20 review or referral asks (desk owns the 24–48h window)</li>
          <li>20 retail or content touches aimed at the open cells</li>
        </ul>
        <p class="text-xs text-forest/50 mt-3">Winter shifts knocks to phone and last-fall rodent follow-up. Cut a channel that books no inspect in 14 days.</p>
      `);
    }

    function viewRetail(){
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">yyc-retail-counter</div>
        <h1 class="font-display text-4xl font-semibold mb-2">Walk-in counter</h1>
        <p class="text-sm text-forest/70 mb-4">Solve it or book it. Do not sell a commercial/restricted product to an uncertified buyer. Do not mix jugs. Label is law.</p>
        ${RETAIL_MAP.map(r=>`
          <div class="bg-white rounded-2xl p-4 border border-forest/10 mb-2">
            <div class="font-display text-xl">${r.pest}</div>
            <p class="text-sm mt-1"><span class="font-semibold">Sell</span> — ${r.sell}</p>
            <p class="text-sm"><span class="font-semibold">Book</span> — ${r.book}</p>
          </div>`).join('')}
      `);
    }

    function viewBid(){
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">yyc-commercial-bid</div>
        <h1 class="font-display text-4xl font-semibold mb-2">Commercial shape</h1>
        <p class="text-sm text-forest/70 mb-4">No pest-free promise on food sites. Survey credits to year-1 if they sign in 14 days. After-close applications +25–40%.</p>
        <div class="grid md:grid-cols-2 gap-3">
          ${SERVICES.filter(s=>s.skill==='commercial'||s.skill==='food'||s.id==='SVC-COM').map(s=>`
            <div class="bg-white rounded-2xl p-4 border border-forest/10">
              <div class="text-xs text-forest/40">${s.id}</div>
              <div class="font-display text-xl">${s.name}</div>
              <div class="font-display text-2xl">${money(s.price)} <span class="text-sm">mid + GST</span></div>
              <p class="text-xs text-forest/60 mt-2">${s.note}</p>
              <button onclick="bookFromSku('${s.id}')" class="mt-3 text-xs bg-forest text-white px-3 py-1 rounded-full">Put on the board</button>
            </div>`).join('')}
        </div>
        <p class="text-xs text-forest/50 mt-4">Full RFP narrative still lives in the commercial-bid playbook. This screen only prices the first year shape.</p>
      `);
    }

    function slaAge(l){
      if(l.firstTouch) return Math.round((new Date(l.firstTouch)-new Date(l.created))/60000);
      return Math.round((Date.now()-new Date(l.created||Date.now()))/60000);
    }
    window.logCall = ()=>{
      const phone = prompt('Number','403-')||'';
      const result = prompt('Answered / Missed / Abandoned','Missed')||'Missed';
      const who = prompt('Who','Unknown')||'Unknown';
      state.calls.unshift({ id:uid('CALL'), at:new Date().toISOString(), who, phone, result, minutes: result==='Answered'?Number(prompt('Talk minutes','5')||0):0, leadId:'', note:prompt('Note','')||'' });
      save(state); view='phone'; showToast('Call logged — not a live PBX');
    };
    window.savePlay = (agrId)=>{
      const a = state.agreements.find(x=>x.id===agrId); if(!a) return;
      sendTemplate(a.leadId, 'remind');
      a.status = a.status==='Held'?'Held':'Active';
      a.next = selectedDay;
      save(state); showToast('Retention play queued on '+a.id);
    };
    window.addReferral = ()=>{
      const fromLead = prompt('From lead id', state.leads[0].id); if(!fromLead) return;
      const toName = prompt('Who they sent','')||'Neighbour';
      state.referrals.unshift({ id:uid('REF'), fromLead, toName, status:'Open', note:'Nine-around / Clicki-style. Credit when they book inspect.' });
      const l = leadBy(fromLead); if(l && !l.referredBy) {/* source account */}
      save(state); view='refer'; showToast('Referral logged');
    };

    function viewSpeed(){
      const rows = (state.leads||[]).slice().sort((a,b)=>slaAge(b)-slaAge(a));
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Olson · speed-to-lead</div>
        <h1 class="font-display text-4xl font-semibold mb-2">Fifteen minutes</h1>
        <p class="text-sm text-forest/70 mb-4">In-season target: first human touch under 15 minutes. After-hours AI is a vendor. This board is the clock.</p>
        ${rows.map(l=>{
          const age = slaAge(l);
          const hot = !l.firstTouch && age>15;
          return `<div class="bg-white rounded-2xl p-4 border mb-2 flex flex-wrap justify-between gap-3 ${hot?'border-safety':''}">
            <div>
              <div class="font-display text-lg">${l.org}</div>
              <div class="text-xs">${l.source||'—'} · ${l.stage} · ${l.phone}</div>
            </div>
            <div class="text-right">
              <div class="font-display text-2xl ${hot?'text-safety':''}">${l.firstTouch?age+' min':'OPEN '+age+'m'}</div>
              ${l.firstTouch?'':`<button onclick="touchLead('${l.id}')" class="text-xs bg-forest text-offwhite px-3 py-1 rounded-full">Touch now</button>`}
            </div>
          </div>`;
        }).join('')}
      `);
    }
    function viewPhone(){
      const calls = state.calls||[];
      const miss = calls.filter(c=>c.result!=='Answered').length;
      return shell(`
        <div class="flex justify-between mb-4">
          <div>
            <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Olson · phone desk</div>
            <h1 class="font-display text-4xl font-semibold">Calls</h1>
            <p class="text-sm text-forest/70">Not Lawn Phone. Log what happened until a Canadian DID with recording exists. Missed inbound is a revenue leak.</p>
          </div>
          <button onclick="logCall()" class="bg-forest text-offwhite px-4 py-2 rounded-full font-display">Log a call</button>
        </div>
        <div class="font-display text-xl mb-3">${miss} missed or abandoned of ${calls.length}</div>
        ${calls.map(c=>`
          <div class="bg-white rounded-xl p-3 border mb-2 text-sm flex justify-between">
            <div>${(c.at||'').replace('T',' ').slice(0,16)} · ${c.who} · ${c.phone}<div class="text-xs text-forest/55">${c.note||''}</div></div>
            <div>${statusChip(c.result)} ${c.minutes?c.minutes+' min':''}</div>
          </div>`).join('')||'<p class="text-sm">No calls logged.</p>'}
      `);
    }
    function viewRefer(){
      return shell(`
        <div class="flex justify-between mb-4">
          <div>
            <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Olson · referrals</div>
            <h1 class="font-display text-4xl font-semibold">Who sent whom</h1>
            <p class="text-sm text-forest/70">Clicki is a contest engine. We log the nine-around and credit when they book. Cheaper than ads if the job was clean.</p>
          </div>
          <button onclick="addReferral()" class="bg-forest text-white px-4 py-2 rounded-full font-display">Add referral</button>
        </div>
        ${(state.referrals||[]).map(r=>{
          const from = leadBy(r.fromLead);
          return `<div class="bg-white rounded-2xl p-4 border mb-2 text-sm flex justify-between">
            <div><div class="font-display text-lg">${from?from.org:r.fromLead} → ${r.toName}</div><div class="text-xs">${r.note}</div></div>
            ${statusChip(r.status)}
          </div>`;
        }).join('')||'<p class="text-sm">None yet.</p>'}
        <h2 class="font-display text-xl mt-6 mb-2">Accounts that already named a source</h2>
        ${state.leads.filter(l=>l.referredBy||l.source==='Referral'||l.source==='Nine-around').map(l=>`
          <div class="text-sm bg-white border rounded-xl p-3 mb-1">${l.org} · ${l.source} · ${l.referredBy||'—'}</div>`).join('')}
      `);
    }
    function viewChurn(){
      const rows = (state.agreements||[]).map(a=>{
        const l = leadBy(a.leadId);
        const reasons = [];
        if(a.status==='Held') reasons.push('Seasonal hold');
        if(l && !l.pay) reasons.push('No pay method');
        if(a.next && a.next < selectedDay) reasons.push('Next date lapsed');
        const lastJob = (state.jobs||[]).filter(j=>j.leadId===a.leadId).sort((x,y)=>y.date.localeCompare(x.date))[0];
        if(!lastJob) reasons.push('No job on file');
        return { a, l, reasons, risk: reasons.length };
      }).filter(r=>r.risk);
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Olson · churn</div>
        <h1 class="font-display text-4xl font-semibold mb-2">Keep the book</h1>
        <p class="text-sm text-forest/70 mb-4">Small churn compounds on recurring routes. Fire a text/task here. A US churn SaaS is optional later — the list has to live in Framework first.</p>
        ${rows.map(r=>`
          <div class="bg-white rounded-2xl p-4 border border-forest/10 mb-2 flex flex-wrap justify-between gap-3">
            <div>
              <div class="font-display text-lg">${r.a.title}</div>
              <div class="text-sm">${r.l?r.l.org:r.a.leadId} · next ${r.a.next}</div>
              <div class="text-xs text-forest/40 mt-1">${r.reasons.join(' · ')}</div>
            </div>
            <button onclick="savePlay('${r.a.id}')" class="text-xs bg-forest text-white px-3 py-1 h-8 rounded-full">Queue save play</button>
          </div>`).join('')||'<p class="text-sm">No at-risk agreements on this seed.</p>'}
      `);
    }

    function enrollDrip(leadId, seq){
      state.drips = state.drips || [];
      const today = selectedDay || new Date().toISOString().slice(0,10);
      const addDays = (n)=>{ const d=new Date(today+'T12:00:00'); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
      const pack = {
        newlead: [
          { step:'Same-day touch', due:today, template:'remind', seq:'newlead' },
          { step:'Day 2 quote follow', due:addDays(2), template:'quote2', seq:'quote' },
          { step:'Day 5 close-or-book', due:addDays(5), template:'quote5', seq:'quote' }
        ],
        aftercare: [
          { step:'48h aftercare', due:addDays(2), template:'aftercare', seq:'aftercare' },
          { step:'Review ask (if no callback)', due:addDays(3), template:'review', seq:'review' }
        ]
      };
      (pack[seq]||[]).forEach(s=>{
        state.drips.unshift({ id:uid('DR'), leadId, seq:s.seq, step:s.step, due:s.due, status:'Due', template:s.template });
      });
    }
    window.copyBookLink = ()=>{
      const url = (location.href.split('#')[0].split('?')[0]) + '#book';
      if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url);
      showToast('Book link copied: '+url);
    };
    window.submitPublicBook = (e)=>{
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target).entries());
      if(!f.pay || f.pay==='Call first'){ /* allowed */ }
      if(!f.pay){ showToast('Pick how you will pay — e-transfer, card, or call first'); return false; }
      const row = { id:uid('BK'), name:f.name, community:f.community, street:f.street||'', pest:f.pest, window:f.window, status:'New request', note:f.evidence||'', pay:f.pay, phone:f.phone, email:f.email||'', zone:f.zone };
      state.bookings.unshift(row);
      save(state);
      document.getElementById('book-ok')?.classList.remove('hidden');
      e.target.classList.add('hidden');
      return false;
    };

    function viewBookLink(){
      const url = (typeof location!=='undefined' ? location.href.split('#')[0].split('?')[0] : 'Framework-OS.html') + '#book';
      return shell(`
        <div class="text-forest/40 text-xs tracking-[0.2em] uppercase font-semibold">Instead of Cal.com / Tally</div>
        <h1 class="font-display text-4xl font-semibold mb-2">Book link</h1>
        <p class="text-sm text-forest/70 max-w-2xl mb-4">Share this with a customer or paste it on frameworkpest.ca later. Same ticket as intake. Pay method required. Office still confirms the window — this is not live calendar.</p>
        <div class="bg-white border border-forest/10 rounded-2xl p-5 mb-5">
          <div class="text-xs uppercase tracking-widest text-sage">Public URL</div>
          <div class="font-display text-lg break-all mt-1">${url}</div>
          <button onclick="copyBookLink()" class="mt-3 bg-forest text-offwhite px-4 py-2 rounded-full text-sm">Copy link</button>
          <button onclick="view='publicbook';render()" class="mt-3 ml-2 border border-sage px-4 py-2 rounded-full text-sm">Preview</button>
        </div>
        <h2 class="font-display text-xl mb-2">Queue</h2>
        ${(state.bookings||[]).map(b=>`
          <div class="bg-white rounded-xl p-3 border mb-2 text-sm flex flex-wrap justify-between gap-2">
            <div>${b.name} · ${b.community} · ${b.pest}<div class="text-xs text-forest/55">${b.window} · ${b.pay||'no pay'} · ${b.phone||''}</div></div>
            ${b.status==='New request'?`<button onclick="acceptBooking('${b.id}')" class="text-xs bg-forest text-white px-3 h-8 rounded-full">Accept to CRM</button>`:statusChip(b.status)}
          </div>`).join('')||'<p class="text-sm">Empty.</p>'}
        <p class="text-xs text-forest/50 mt-4">When ops.frameworkpest.com is live, the .ca contact form posts here. Until then this hash link is the shareable slot.</p>
      `);
    }

    function viewPublicBook(){
