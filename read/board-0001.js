
    const KEY = 'framework-os-v6';
    const GST = 0.05;
    const SOP = [
      { id:'site', title:'01  Site and grade', why:'Water at the foundation is a pest factory. Walk the lot before you touch a wall.', items:[
        { id:'s1', q:'Does finished grade fall away from the foundation on all sides?' },
        { id:'s2', q:'Are downspouts extended so roof water does not dump against the wall?' },
        { id:'s3', q:'Is wood, mulch, or stored material held off soil-to-siding contact?' },
        { id:'s4', q:'Are window wells drained and screened, not holding leaf litter?' },
        { id:'s5', q:'Any tree limbs abrading roof, gutters, or soffit?' }
      ]},
      { id:'roof', title:'02  Roof, flashing, and drainage', why:'Weakest points are changes in plane or material — stacks, valleys, chimneys, wall intersections.', items:[
        { id:'r1', q:'Roof covering viewed (ground, binoculars, or hatch). Condition noted?' },
        { id:'r2', q:'Flashings at chimney, plumbing stacks, vents, and roof-to-wall sound?' },
        { id:'r3', q:'Gutters aligned, clean, and discharging away from the building?' },
        { id:'r4', q:'Soffit and fascia intact, vents open and screened — not blocked or chewed?' },
        { id:'r5', q:'Signs of ice-damming risk (thin attic insulation, stained eaves) recorded?' }
      ]},
      { id:'cladding', title:'03  Walls, weeps, openings', why:'Cladding joints and weeps are designed to drain. Guard them. Do not mortar them shut.', items:[
        { id:'c1', q:'Weep holes present and fitted with pest-rated guards where required?' },
        { id:'c2', q:'Utility penetrations (gas, AC, hose bib, cable) collared and sealed?' },
        { id:'c3', q:'Door sweeps and weatherseals close the gap at grade and garage?' },
        { id:'c4', q:'Window and door frames free of rot, gaps, and ant/frass staining?' },
        { id:'c5', q:'Dryer, bath, and kitchen exhausts terminate outdoors with intact screens?' }
      ]},
      { id:'structure', title:'04  Structure and wood integrity', why:'Probe suspect wood. Moisture plus soil contact is the carpenter-ant and rot brief in Alberta — not termites.', items:[
        { id:'t1', q:'Foundation cracks mapped. Width, location, and whether they take a mouse?' },
        { id:'t2', q:'Sill, rim joist, and any wood-soil contact probed for softness or galleries?' },
        { id:'t3', q:'Carpenter-ant frass, winged ants, or hollow-sounding damp wood noted?' },
        { id:'t4', q:'Termite language avoided unless a qualified ID is documented. AB default: not established.' },
        { id:'t5', q:'Active movement vs historic settlement distinguished?' }
      ]},
      { id:'below', title:'05  Basement and crawl', why:'Start below grade after the lot walk. Follow exterior clues inside.', items:[
        { id:'b1', q:'Access gained to every crawl or unheated void that can be entered safely?' },
        { id:'b2', q:'Moisture clues: efflorescence, rusty form ties, staining, stored goods on floor?' },
        { id:'b3', q:'Rim-joist insulation, gaps at joist bays, and pipe sleeves inspected?' },
        { id:'b4', q:'Sump, floor drain, and any wood posts or stair stringers at slab checked?' },
        { id:'b5', q:'If unheated crawl: ground cover and ventilation present? If heated: walls insulated, vents managed?' }
      ]},
      { id:'attic', title:'06  Attic, insulation, vents', why:'Attic moisture is leak, condensation, or ice dam. Pest use follows the same holes heat and water use.', items:[
        { id:'a1', q:'Every attic hatch found and opened. More than one attic checked?' },
        { id:'a2', q:'Ventilation path clear at soffit and ridge or gable? Daylight at vents?' },
        { id:'a3', q:'Kitchen and bath fans ducted through the roof or wall — not dumping in the attic?' },
        { id:'a4', q:'Droppings, nesting, chewed baffles, or unscreened vents recorded?' },
        { id:'a5', q:'Insulation damp, missing at eaves, or covering recessed fixtures?' }
      ]},
      { id:'interior', title:'07  Interior harbourage', why:'Finish last. Interiors confirm the envelope story; they do not replace it.', items:[
        { id:'i1', q:'Activity mapped to rooms: droppings, trails, bites, casings, live pests?' },
        { id:'i2', q:'Kitchens and food storage: sanitation vs structural entry separated?' },
        { id:'i3', q:'Plumbing leaks or condensation that create attractants noted?' },
        { id:'i4', q:'Multi-unit or commercial food site flagged for series work, not one visit?' },
        { id:'i5', q:'Client duties listed: prep, storage, pets, access?' }
      ]}
    ];
    const ZONES = [
      { id: 'roof', label: 'Roof / transitions' },
      { id: 'soffit', label: 'Soffit / fascia' },
      { id: 'weep', label: 'Weep holes / cladding' },
      { id: 'window', label: 'Windows / doors' },
      { id: 'utility', label: 'Utility penetrations' },
      { id: 'foundation', label: 'Foundation / grade' },
      { id: 'garage', label: 'Garage / overhead' },
      { id: 'crawl', label: 'Crawl / rim joist' },
      { id: 'attic', label: 'Attic / vents' },
      { id: 'interior', label: 'Interior harbourage' }
    ];
    const PIPE = ['New lead','Qualified','Inspect booked','Proposal sent','Won'];
    const TERRITORIES = [
      { id:'NW', name:'Calgary NW', focus:'Detacheds + condos, rodent winter' },
      { id:'NE', name:'Calgary NE', focus:'Industrial bays, warehouse IPM' },
      { id:'SW', name:'Calgary SW', focus:'Heritage envelopes, weep holes' },
      { id:'SE', name:'Calgary SE', focus:'New-build gaps, ants + mice' },
      { id:'CORE', name:'Beltline / Inner City', focus:'Multi-unit, bed bug protocol' },
      { id:'AIR', name:'Airdrie', focus:'Perimeter + wasp season' },
      { id:'COC', name:'Cochrane', focus:'Acreage outbuildings' },
      { id:'CHE', name:'Chestermere', focus:'Lakeside soffits + wasps' },
      { id:'OKO', name:'Okotoks', focus:'Foundation freeze-thaw' },
      { id:'RVC', name:'Rocky View', focus:'Rural exclusion, grain sheds' }
    ];
    const TECHS = [
      { id:'T1', name:'A. Mensah', role:'Lead tech', skills:'Exclusion · rodent · envelope', tags:['exclusion','rodent','inspect','residential'] },
      { id:'T2', name:'Deolu Akin', role:'Founder', skills:'Inspect · commercial · quotes', tags:['inspect','commercial','quotes','exclusion'] },
      { id:'T3', name:'K. Patel', role:'Series tech', skills:'Bed bug · food site · IPM', tags:['bedbug','food','ipm','series'] }
    ];
    const RATE_SECTIONS = [
      { id:'inspect', title:'Inspection', blurb:'Credit 100% to first treatment if they book within 7 days. Not a home inspection and not an engineering stamp.', items:[
        { id:'SVC-INSP', name:'Residential inspection', minutes:75, lo:129, price:159, hi:189, skill:'inspect', window:'Year-round', note:'SOP walk + moisture notes. Filters LSA tyre-kickers.' },
        { id:'SVC-INSP-AH', name:'Same-day / after-hours inspect adder', minutes:30, lo:75, price:100, hi:125, skill:'inspect', window:'Urgent', note:'Doorway wasps, kitchen mice, bed bugs.' },
        { id:'SVC-COM', name:'Commercial / multi-res survey', minutes:120, lo:189, price:269, hi:349, skill:'commercial', window:'Year-round', note:'Credit to year-1 if they sign within 14 days.' }
      ]},
      { id:'spray', title:'Spray menu — billed production', blurb:'Minimum spray ticket $189 before GST. IPM decides whether and where. The card decides what the lap costs. Do not give away a foundation spray on a mouse stop.', items:[
        { id:'SVC-PERIM', name:'Foundation / perimeter residual', minutes:60, lo:219, price:269, hi:329, skill:'spray', window:'May–Sep', note:'One full lap: grade beam, weeps, doors, garage return, patio edge.' },
        { id:'SVC-EAVE', name:'Perimeter + eave / soffit band', minutes:90, lo:279, price:339, hi:399, skill:'spray', window:'May–Sep', note:'Default first “general pest” visit when they want crawlers gone.' },
        { id:'SVC-STOREY', name:'Two-storey / walk-out / hedge adder', minutes:30, lo:60, price:100, hi:140, skill:'spray', window:'Any spray', note:'Add to that visit. Not a stand-alone job.' },
        { id:'SVC-WASP', name:'Wasp nest application (accessible)', minutes:45, lo:189, price:219, hi:249, skill:'spray', window:'Jun–Sep', note:'First nest. +$40–$75 each extra same visit.' },
        { id:'SVC-WASP-V', name:'Void / soffit / ground nest', minutes:90, lo:279, price:359, hi:449, skill:'spray', window:'Jun–Sep', note:'Hidden or elevated. May need a dusk return.' },
        { id:'SVC-MOSQ', name:'Mosquito / biting-fly barrier', minutes:50, lo:169, price:219, hi:279, skill:'spray', window:'Jun–Aug', note:'Priced by lot. Small $129–$199 · large/ravine $249–$399. Check Code near water.' },
        { id:'SVC-CLUSTER', name:'Cluster / boxelder / lady beetle wall', minutes:70, lo:219, price:279, hi:349, skill:'spray', window:'Aug–Oct', note:'Sunny elevation + attic soffit edge.' },
        { id:'SVC-CC', name:'Interior crack-and-crevice', minutes:60, lo:229, price:279, hi:329, skill:'spray', window:'Year-round', note:'Stand-alone interior. As add-on to exterior: $189–$279.' },
        { id:'SVC-VOID', name:'Garage / attic / void dust or residual', minutes:40, lo:149, price:199, hi:249, skill:'spray', window:'Year-round', note:'Where the label allows. Separate from living-space spray.' }
      ]},
      { id:'initial', title:'One-time / first lift', blurb:'Initial is 1.5–2.5× a maintenance stop. Do not discount mobilization to win the job.', items:[
        { id:'SVC-MOUSE', name:'Mouse / rodent mobilization', minutes:120, lo:349, price:449, hi:549, skill:'rodent', window:'Sep–Mar', note:'Inspect, devices, exclusion list, 14–21 day follow-up. Spray does not close 6 mm gaps.' },
        { id:'SVC-COMBO', name:'Mouse setup + spring perimeter', minutes:150, lo:499, price:624, hi:749, skill:'rodent', window:'Apr–Jun', note:'Two trades, one mobilization. Price both. Do not throw the spray in.' },
        { id:'SVC-ANT', name:'Carpenter ant investigate + first treatment', minutes:90, lo:299, price:399, hi:499, skill:'residential', window:'Apr–Sep', note:'Find moisture / wood. Forager spray alone is not the job. Repair not included.' },
        { id:'SVC-EXCL', name:'Physical exclusion package (res)', minutes:180, lo:980, price:1840, hi:2400, skill:'exclusion', window:'Year-round', note:'Seals, weeps, garage. Materials beyond kit extra. T&M if the list grows.' },
        { id:'SVC-BB0', name:'Bed bug inspect + written plan', minutes:75, lo:179, price:239, hi:299, skill:'bedbug', window:'Year-round', note:'Series quoted after inspect. Never one spray of the couch.' },
        { id:'SVC-BB1', name:'Bed bug series — visit 1', minutes:180, lo:700, price:700, hi:0, skill:'bedbug', window:'Year-round', note:'Placeholder until unit count and prep are known.' },
        { id:'SVC-FOOD', name:'Food-site night inspect', minutes:120, lo:640, price:640, hi:0, skill:'food', window:'Year-round', note:'Applicator cert if a pesticide is used. After-close labour.' },
        { id:'SVC-NS', name:'No-show / wasted stop', minutes:30, lo:95, price:95, hi:0, skill:'residential', window:'Year-round', note:'Access failed without notice.' }
      ]},
      { id:'program', title:'Programs — spray season + winter rodent', blurb:'Do not sell mice-only then spray the foundation free in May. Prepaid year beats monthly by 8–10%, not by giving away a lap.', items:[
        { id:'PRG-A', name:'A — Spray season (2 laps)', minutes:120, lo:429, price:529, hi:629, skill:'spray', window:'May–Sep', note:'Spring + peak summer residual. Wasp nests extra unless a credit is sold.' },
        { id:'PRG-A+', name:'A+ — Spray season + eave', minutes:180, lo:529, price:639, hi:749, skill:'spray', window:'May–Sep', note:'Two heavier spray visits.' },
        { id:'PRG-M', name:'M — Mosquito barrier season', minutes:150, lo:349, price:449, hi:549, skill:'spray', window:'Jun–Aug', note:'3 lot-size barrier applications. Large/wet lots quoted up.' },
        { id:'PRG-B', name:'B — Mouse winter watch', minutes:135, lo:429, price:539, hi:649, skill:'rodent', window:'Oct–Mar', note:'Fall proofing + devices + 2–3 winter services. No spray substitute.' },
        { id:'PRG-C', name:'C — Framework Year', minutes:0, lo:1049, price:1299, hi:1549, skill:'program', window:'12 months', note:'A or A+ plus B plus 1–2 wasp credits + optional M. Or $99–$149/mo.' },
        { id:'PRG-WASP', name:'Wasp credit after program', minutes:30, lo:99, price:124, hi:149, skill:'spray', window:'Jun–Sep', note:'Accessible nest beyond included credits.' }
      ]},
      { id:'commercial', title:'Commercial shape', blurb:'No pest-free promise on food sites. Promise a documented program and a re-service window if sanitation and access hold.', items:[
        { id:'SVC-QMON', name:'Warehouse / shop quarterly', minutes:75, lo:249, price:349, hi:449, skill:'commercial', window:'Quarterly', note:'Includes labelled zone work, not a fog.' },
        { id:'SVC-KIT', name:'Kitchen / restaurant monthly IPM', minutes:90, lo:189, price:269, hi:349, skill:'food', window:'Monthly', note:'After clean-out. Extra flush $149–$249. After-close +25–40%.' }
      ]}
    ];
    const SERVICES = RATE_SECTIONS.flatMap(s=>s.items);
    const JOB_STAT = ['Scheduled','En route','On site','Complete','No-show','Cancelled'];
    const CHEMS = [
      { id:'EX-MESH', name:'Copper mesh / hardware cloth', kind:'Exclusion', pcp:'n/a — hardware', note:'Physical. Not a pesticide.' },
      { id:'EX-SEAL', name:'Exterior-grade sealant', kind:'Exclusion', pcp:'n/a — hardware', note:'Physical. Not a pesticide.' },
      { id:'EX-WEEP', name:'Pest-rated weep guards', kind:'Exclusion', pcp:'n/a — hardware', note:'Do not mortar weeps shut.' },
      { id:'MON-SNAP', name:'Covered snap trap', kind:'Device', pcp:'n/a — device', note:'Place after seals close.' },
      { id:'MON-STAT', name:'Tamper-resistant station', kind:'Device', pcp:'n/a — device', note:'Bait only if label later requires.' },
      { id:'CHEM-HOLD', name:'Labelled rodenticide (if used)', kind:'Pesticide', pcp:'Confirm PCP # on the container', note:'Certified applicator. Follow the label. No rate invented here.' },
      { id:'CHEM-CR', name:'Labelled cockroach bait (if used)', kind:'Pesticide', pcp:'Confirm PCP # on the container', note:'Food site: applicator certificate. Label governs.' },
      { id:'CHEM-BB', name:'Labelled bed-bug product (if used)', kind:'Pesticide', pcp:'Confirm PCP # on the container', note:'Series work. Prep sheet required.' }
    ];
    const COMM_TEMPLATES = [
      { id:'remind', name:'Appointment reminder', channel:'SMS', body:'Framework Pest: {name}, we are booked {date} {window} at {site}. Reply C to confirm or call the shop if access changed.' },
      { id:'omw', name:'On my way', channel:'SMS', body:'Framework tech {tech} is en route to {site}. Window {window}. Gate/pets: use the note on file.' },
      { id:'prep', name:'Prep sheet', channel:'Email', body:'{name} — visit {date}. Clear the listed rooms, bin pet food, and keep the cat contained. We treat the envelope first, not the pantry.' },
      { id:'done', name:'Service complete', channel:'Email', body:'Work finished at {site}. Seals and monitors as scoped. Aftercare is attached. Questions: frameworkpest.ca' },
      { id:'quote2', name:'Quote follow-up · day 2', channel:'Email', body:'{name} — the exclusion scope for {org} is still open. Reply with a window or questions. Framework does not lead with a spray.' },
      { id:'quote5', name:'Quote follow-up · day 5', channel:'SMS', body:'Framework Pest: still holding the {org} inspect/exclusion quote. Want it on the board or should we close the file?' },
      { id:'aftercare', name:'48h aftercare', channel:'Email', body:'{name} — 48 hours after {site}. Activity in stations is normal. Call the shop if you see a new gap or a live wasp nest we missed.' },
      { id:'review', name:'Review request', channel:'Email', body:'If the visit was solid, a Google review helps Calgary neighbours find exclusion-first work. Thank you — Framework Pest.' },
      { id:'invoice', name:'Invoice ready', channel:'Email', body:'Invoice {id} for {org} is {total} CAD including GST. Pay link is a placeholder until the shop processor is live.' },
      { id:'noshow', name:'No-show follow-up', channel:'SMS', body:'We arrived at {site} and could not access. Reply with a new window or we will rebook the exclusion visit.' }
    ];

    const seed = () => ({
      user: { name: 'Deolu Akin', role: 'Founder / Operator', shop: 'Framework Pest Ltd.' },
      leads: [
        { id:'L-1042', name:'Maya Chen', org:'Chen Residence', phone:'403-555-0142', email:'maya.chen@email.com', community:'Altadore', zone:'SW', type:'Residential detached', pest:'House mice', evidence:'Droppings in pantry, scratching in walls after 02:00', urgency:'High', stage:'Inspect booked', value:1840, next:'Inspection 12 Sep 08:30', notes:'Pets: 1 cat. Access: see dispatch.', created:'2026-09-10T07:12:00', firstTouch:'2026-09-10T07:18:00', source:'GBP', pay:'E-transfer', referredBy:'' },
        { id:'L-1048', name:'Jordan Hale', org:'Hale + West LLP', phone:'403-555-0190', email:'j.hale@halewest.ca', community:'Downtown', zone:'CORE', type:'Commercial office', pest:'Cluster flies / envelope gaps', evidence:'Flies at south glazing, gaps at curtain-wall sills', urgency:'Medium', stage:'Proposal sent', value:6240, next:'Follow-up call 11 Sep', notes:'Building manager wants exclusion-first scope, not monthly spray.', created:'2026-09-08T09:40:00', firstTouch:'2026-09-08T10:05:00', source:'Referral', pay:'PO', referredBy:'Property manager network' },
        { id:'L-1051', name:'Priya Nair', org:'Sunridge Food Hall', phone:'403-555-0118', email:'ops@sunridgefood.ca', community:'Sunridge', zone:'NE', type:'Commercial kitchen', pest:'German cockroach (suspect)', evidence:'Nymphs near dish pit, grease harbourage', urgency:'High', stage:'Qualified', value:4800, next:'Night inspect window', notes:'Occupied food site. Applicator certificate required if chemical used.', created:'2026-09-11T08:02:00', firstTouch:'2026-09-11T08:11:00', source:'Web', pay:'Card on file pending', referredBy:'' },
        { id:'L-1055', name:'Owen Brooks', org:'Brooks Family', phone:'587-555-0166', email:'owen.b@email.com', community:'Evanston', zone:'NW', type:'Residential detached', pest:'Pavement ants', evidence:'Trail from garage control joint into mudroom', urgency:'Low', stage:'New lead', value:420, next:'Book spring-style perimeter + crack seal list', notes:'Wants DIY first — retail only if labelled domestic is enough; else inspect.', created:'2026-09-11T10:40:00', firstTouch:'', source:'Missed call', pay:'', referredBy:'' },
        { id:'L-1058', name:'Leah Okonkwo', org:'Bow River Lofts', phone:'403-555-0177', email:'leah@bowlofts.ca', community:'East Village', zone:'CORE', type:'Multi-unit', pest:'Bed bugs (unit 612)', evidence:'Bites + casings at headboard', urgency:'High', stage:'Won', value:2100, next:'Prep sheet + series visit 1', notes:'Condo board access. Not a one-spray job.', created:'2026-09-09T14:20:00', firstTouch:'2026-09-09T14:27:00', source:'PM email', pay:'PO', referredBy:'' },
        { id:'L-1060', name:'Tom Vickers', org:'Vickers Shop', phone:'403-555-0129', email:'tom@vickers.shop', community:'Okotoks', zone:'OKO', type:'Light industrial', pest:'Mice + sparrow entry', evidence:'Droppings on insulation, 20mm gap at overhead seal', urgency:'Medium', stage:'Won', contract:'Monitoring', value:3600, next:'Q4 exclusion audit', notes:'Recurring monitoring contract. Access: see dispatch.', created:'2026-06-12T09:00:00', firstTouch:'2026-06-12T09:08:00', source:'Nine-around', pay:'E-transfer', referredBy:'Neighbour on 32 Ave' }
      ],
      inspections: [
        { id:'INS-887', leadId:'L-1042', site:'14 Westmount Rd SW, Altadore', date:'2026-09-10', tech:'A. Mensah', moisture:'Rim joist 19% — elevated at NW corner after Chinook melt.', thermal:'Cold bridge at unsealed hose bib sleeve. Heat loss plume at dryer vent.', defects:[
          { zone:'foundation', severity:'High', note:'12 mm settlement crack at NW corner — mouse-capable. Needs mortar + hardware cloth + exterior grade seal.' },
          { zone:'utility', severity:'High', note:'Unsealed AC line-set and gas pipe penetration at east wall.' },
          { zone:'garage', severity:'Medium', note:'Weather seal on overhead door crushed at both bottom corners.' },
          { zone:'weep', severity:'Low', note:'Open weeps at brick — install pest-rated weep guards, do not mortar shut.' }
        ], attractants:'Bird seed stored in paper bags on garage floor. Dog food in open bin.', recommendation:'Physical exclusion package before any rodenticide. Monitoring stations only after seal list is complete.', status:'Draft report',
          sop:{
            s1:'Fail', s2:'Fail', s3:'Fail', s4:'Pass', s5:'Pass',
            r1:'Pass', r2:'Watch', r3:'Fail', r4:'Watch', r5:'Watch',
            c1:'Fail', c2:'Fail', c3:'Fail', c4:'Pass', c5:'Watch',
            t1:'Fail', t2:'Watch', t3:'Pass', t4:'Pass', t5:'Pass',
            b1:'Pass', b2:'Watch', b3:'Fail', b4:'Pass', b5:'n/a',
            a1:'Pass', a2:'Watch', a3:'Pass', a4:'Pass', a5:'Watch',
            i1:'Fail', i2:'Fail', i3:'Pass', i4:'Pass', i5:'Watch'
          }
        }
      ],
      proposals: [
        { id:'PR-221', leadId:'L-1048', title:'Curtain-wall exclusion + quarterly monitor', package:'Commercial envelope retrofit', subtotal:6240, gst:312, total:6552, valid:'2026-09-25', status:'Sent', signed:false, approval:'Pending' }
      ],
      jobs: [
        { id:'JOB-401', leadId:'L-1042', date:'2026-09-12', window:'08:30–10:00', tech:'T1', type:'Envelope inspect', status:'Scheduled', community:'Altadore', address:'14 Westmount Rd SW', zone:'SW', driveMin:14, order:1, notes:'Cat on site. Access: see dispatch.' },
        { id:'JOB-402', leadId:'L-1058', date:'2026-09-11', window:'10:30–13:00', tech:'T3', type:'Bed bug visit 1', status:'On site', community:'East Village', address:'Bow River Lofts 612', zone:'CORE', driveMin:11, order:1, notes:'Condo board access. Series.' },
        { id:'JOB-403', leadId:'L-1048', date:'2026-09-11', window:'13:30–15:30', tech:'T2', type:'Curtain-wall survey', status:'Scheduled', community:'Downtown', address:'Hale + West LLP', zone:'CORE', driveMin:8, order:2, notes:'Manager wants exclusion-first.' },
        { id:'JOB-404', leadId:'L-1060', date:'2026-09-11', window:'09:00–10:30', tech:'T1', type:'Q monitor + sparrow gap', status:'En route', community:'Okotoks', address:'Vickers Shop', zone:'OKO', driveMin:32, order:1, notes:'Overhead seal 20 mm.' },
        { id:'JOB-405', leadId:'L-1051', date:'2026-09-12', window:'21:00–23:00', tech:'T3', type:'Night kitchen inspect', status:'Scheduled', community:'Sunridge', address:'Sunridge Food Hall', zone:'NE', driveMin:18, order:2, notes:'Occupied food site.' },
        { id:'JOB-406', leadId:'L-1055', date:'2026-09-13', window:'Anytime AM', tech:'T1', type:'Ant + joint seal consult', status:'Scheduled', community:'Evanston', address:'Brooks Family', zone:'NW', driveMin:22, order:1, notes:'Retail first if labelled domestic is enough.' }
      ],
      invoices: [
        { id:'INV-118', leadId:'L-1060', jobId:'JOB-404', date:'2026-08-12', due:'2026-08-26', subtotal:890, gst:44.50, total:934.50, status:'Paid', method:'E-transfer', issued:true, paidOn:'2026-08-14' },
        { id:'INV-121', leadId:'L-1058', jobId:'JOB-402', date:'2026-09-11', due:'2026-09-25', subtotal:700, gst:35, total:735, status:'Due', method:'Card on file (pending processor)', issued:true },
        { id:'INV-109', leadId:'L-1048', jobId:'', date:'2026-07-02', due:'2026-07-17', subtotal:420, gst:21, total:441, status:'Overdue', method:'Net 15', issued:true }
      ],
      agreements: [
        { id:'AGR-12', leadId:'L-1060', title:'Quarterly envelope monitor', freq:'Quarterly', next:'2026-08-12', value:900, status:'Active', includes:'Station check, gap audit, sparrow net inspect' },
        { id:'AGR-14', leadId:'L-1058', title:'Bed bug series — 3 visits', freq:'14-day series', next:'2026-09-25', value:2100, status:'Active', includes:'Visit 1 heat/chem per label + follow-ups' },
        { id:'AGR-08', leadId:'L-1048', title:'Commercial exclusion + Q monitor', freq:'Quarterly after retrofit', next:'Pending signed proposal', value:1560, status:'Draft', includes:'Sill seals, quarterly trend report' }
      ],
      devices: [
        { id:'ST-01', leadId:'L-1060', kind:'Tamper station', loc:'Warehouse north wall, bay 2', last:'2026-08-12', result:'Clean', next:'2026-12-04' },
        { id:'ST-02', leadId:'L-1060', kind:'Tamper station', loc:'Overhead door interior jamb', last:'2026-08-12', result:'Touched — reset', next:'2026-12-04' },
        { id:'ST-03', leadId:'L-1042', kind:'Covered snap', loc:'Garage SE corner after seals', last:'—', result:'Not placed — seals first', next:'After JOB-401' },
        { id:'ST-04', leadId:'L-1058', kind:'Interceptor', loc:'Unit 612 bed legs', last:'2026-09-11', result:'Set this visit', next:'2026-09-25' }
      ],
      usages: [
        { id:'U-11', jobId:'JOB-404', date:'2026-08-12', product:'EX-SEAL', qty:'2 tubes', area:'Overhead corners + utility sleeve', pest:'Mice / sparrow gap', weather:'18 C, dry', tech:'T1', pcp:'n/a — hardware', note:'Physical exclusion only.' }
      ],
      comms: [
        { id:'C-20', leadId:'L-1042', channel:'SMS', template:'remind', date:'2026-09-10', status:'Queued', preview:'Maya — booked 12 Sep 08:30 Altadore. Reply C to confirm.' },
        { id:'C-21', leadId:'L-1058', channel:'Email', template:'prep', date:'2026-09-10', status:'Sent', preview:'Prep sheet for unit 612 series visit 1.' }
      ],
      suppliers: [
        { id:'SUP-VES', name:'Veseris', kind:'Distributor', city:'Western Canada desk', pay:'Account', note:'Stations, labelled product, PPE. Confirm PCP on the carton — never from memory.' },
        { id:'SUP-TGT', name:'Target Specialty Products', kind:'Distributor', city:'Western desk', pay:'Account', note:'Hardware, weeps, residuals. Same label rule.' },
        { id:'SUP-NOS', name:'Nosis', kind:'Supplier', city:'To confirm', pay:'Account', note:'Owner: lock legal name, GST #, and what we actually buy here.' },
        { id:'SUP-KIN', name:'Kin', kind:'Supplier', city:'To confirm', pay:'Account', note:'Owner: lock legal name and category (device vs chemical vs exclusion).' }
      ],
      purchases: [
        { id:'PO-2408', supplierId:'SUP-VES', date:'2026-08-14', sku:'STAT-TR', item:'Tamper stations', qty:8, subtotal:312, gst:15.60, total:327.60, status:'Paid', jobId:'' },
        { id:'PO-2409', supplierId:'SUP-TGT', date:'2026-08-28', sku:'WEEP-B', item:'Weep guards brick', qty:40, subtotal:186, gst:9.30, total:195.30, status:'Paid', jobId:'' },
        { id:'PO-2410', supplierId:'SUP-VES', date:'2026-09-04', sku:'SEAL-EXT', item:'Exterior sealant', qty:6, subtotal:84, gst:4.20, total:88.20, status:'Received', jobId:'' },
        { id:'PO-2411', supplierId:'SUP-NOS', date:'2026-09-09', sku:'MESH-6', item:'Hardware cloth 6 mm', qty:4, subtotal:96, gst:4.80, total:100.80, status:'Ordered', jobId:'' }
      ],
      vehicles: [
        { id:'VAN-1', name:'SW route van', plate:'PLACEHOLDER', km:84210, nextOil:'2026-10-15', nextTires:'2026-11-01', nextSafety:'2026-12-01', note:'Block heater before −20. Winter tires on by 1 Nov.' }
      ],
      equipment: [
        { id:'EQ-SPR', name:'Backpack / tank sprayer', interval:'Each season + after rinse', next:'2026-05-01', note:'Hose, wand tip, lock-out. Rinse per label — not a guess.' },
        { id:'EQ-LAD', name:'Extension ladder + standoff', interval:'Before wasp season', next:'2026-05-15', note:'Feet, rungs, rope. No eave work if tagged out.' },
        { id:'EQ-THM', name:'Thermal camera', interval:'Annual', next:'2026-09-30', note:'Battery + calibration check. Used on envelope surveys.' },
        { id:'EQ-MST', name:'Moisture meter', interval:'Annual', next:'2026-09-30', note:'Rim-joist work. Recalibrate if readings drift.' },
        { id:'EQ-PPE', name:'Respirator fit / cartridges', interval:'Per manufacturer + use', next:'2026-10-01', note:'Applicator kit. Do not invent change-out hours.' }
      ],
      maint: [
        { id:'M-88', asset:'VAN-1', date:'2026-08-20', kind:'Oil + filter', km:83100, cost:184.80, shop:'Dealer / indie — log the invoice', status:'Done' },
        { id:'M-89', asset:'EQ-SPR', date:'2026-08-22', kind:'Tip + hose inspect, rinse log', km:'', cost:0, shop:'In-house', status:'Done' },
        { id:'M-90', asset:'VAN-1', date:'2026-11-01', kind:'Winter tires on', km:'', cost:0, shop:'Booked', status:'Scheduled' }
      ],
      inventory: [
        { sku:'MESH-6', name:'Hardware cloth 6 mm', par:8, onhand:5, season:'Mouse window' },
        { sku:'WEEP-B', name:'Weep guards brick', par:40, onhand:12, season:'Heritage SW' },
        { sku:'SEAL-EXT', name:'Exterior sealant', par:12, onhand:4, season:'Year-round' },
        { sku:'SNAP-CV', name:'Covered snaps', par:24, onhand:18, season:'Rodent' },
        { sku:'STAT-TR', name:'Tamper stations', par:16, onhand:9, season:'Monitor contracts' }
      ],
      punches: [
        { id:'P-1', tech:'T1', jobId:'JOB-404', start:'08:42', end:'', date:'2026-09-11' },
        { id:'P-2', tech:'T3', jobId:'JOB-402', start:'10:28', end:'', date:'2026-09-11' }
      ],
      bookings: [
        { id:'BK-01', name:'Samira Cole', community:'Marda Loop', pest:'Mice in garage', window:'Weekday morning', status:'New request', note:'Found frameworkpest.ca', pay:'Will e-transfer', phone:'403-555-0188', email:'samira@email.com', zone:'SW' }
      ],
      reviews: [
        { id:'RV-01', leadId:'L-1060', asked:'2026-08-13', status:'Asked', note:'After Q visit' }
      ],
      lark: [
        { id:'LK-01', kind:'scheduled', jobId:'JOB-401', sent:false, wired:false, reason:'queued', at:'2026-09-10T18:00:00', title:'Job booked · Altadore inspect' }
      ],
      larkCfg: { endpoint:'https://open.larksuite.com', chat:'#dispatch', wired:false },
      workspace: [],
      drips: [
        { id:'DR-01', leadId:'L-1048', seq:'quote', step:'Day 2 follow', due:'2026-09-10', status:'Due', template:'quote2' },
        { id:'DR-02', leadId:'L-1060', seq:'aftercare', step:'48h check', due:'2026-08-15', status:'Sent', template:'aftercare' }
      ],
      calls: [
        { id:'CALL-11', at:'2026-09-11T10:38:00', who:'Owen Brooks', phone:'587-555-0166', result:'Missed', minutes:0, leadId:'L-1055', note:'Voicemail. SLA clock running.' },
        { id:'CALL-10', at:'2026-09-11T08:02:00', who:'Priya Nair', phone:'403-555-0118', result:'Answered', minutes:9, leadId:'L-1051', note:'Night inspect window booked.' },
        { id:'CALL-09', at:'2026-09-10T16:12:00', who:'Unknown', phone:'403-555-0100', result:'Abandoned', minutes:0, leadId:'', note:'Hung before pickup. No message.' }
      ],
      referrals: [
        { id:'REF-01', fromLead:'L-1060', toName:'Neighbour 32 Ave', status:'Credited', note:'Nine-around after Q monitor. $0 until they book inspect.' }
      ],
      photos: [
        { id:'PH-01', inspId:'INS-887', key:'d0', slot:'Before', caption:'NW foundation crack — 12 mm, mouse-capable', dataUrl:'' },
        { id:'PH-02', inspId:'INS-887', key:'d1', slot:'Before', caption:'Unsealed AC line-set and gas sleeve, east wall', dataUrl:'' },
        { id:'PH-03', inspId:'INS-887', key:'d2', slot:'Before', caption:'Crushed overhead-door seal, both bottom corners', dataUrl:'' },
        { id:'PH-04', inspId:'INS-887', key:'d3', slot:'Before', caption:'Open brick weeps — guard, do not mortar shut', dataUrl:'' },
        { id:'PH-05', inspId:'INS-887', key:'site', slot:'Site', caption:'14 Westmount Rd SW — grade and downspouts', dataUrl:'' },
        { id:'PH-06', inspId:'INS-887', key:'moisture', slot:'Moisture', caption:'Rim joist moisture reading, NW corner', dataUrl:'' },
        { id:'PH-07', inspId:'INS-887', key:'thermal', slot:'Thermal', caption:'Cold bridge at hose-bib sleeve', dataUrl:'' }
      ]
    });

    function load() {
      try {
        const raw = localStorage.getItem(KEY) || localStorage.getItem('framework-os-v5') || localStorage.getItem('framework-os-v4');
        if (raw) {
          const s = JSON.parse(raw);
          const base = seed();
          Object.keys(base).forEach(k => { if (s[k] == null) s[k] = base[k]; });
          return normalizeState(s);
        }
      } catch(e) {}
      const s = seed(); save(s); return normalizeState(s);
    }
    function save(state) {
      localStorage.setItem(KEY, JSON.stringify(state));
      if (shopSession) schedulePush();
    }
    let state = load();
    let shopSession = null;
    let pushTimer = null;
    function schedulePush(){
      clearTimeout(pushTimer);
      pushTimer = setTimeout(pushBoard, 500);
    }
    async function pushBoard(){
      if(!shopSession) return;
      await fetch('/api/board', { method:'PUT', credentials:'same-origin', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ state }) });
    }
    function showLogin(msg){
      document.getElementById('app').innerHTML = `
        <div style="min-height:100vh;background:#F4F2EC;color:#15361E;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Outfit,sans-serif">
          <form id="shop-login" style="width:100%;max-width:22rem;background:#fff;border:1px solid rgba(21,54,30,.12);border-radius:24px;padding:24px">
            <div style="letter-spacing:.16em;text-transform:uppercase;font-size:11px;opacity:.55">Framework Pest Ltd.</div>
            <h1 style="font-size:32px;margin:8px 0 8px">Shop sign-in</h1>
            <p style="font-size:14px;opacity:.7;margin:0 0 16px">One board for the office and the truck. The book link stays open without this pin.</p>
            <label style="display:block;font-size:14px">Your name<input name="name" required value="Shop" style="display:block;width:100%;margin-top:6px;padding:10px 12px;border-radius:12px;border:1px solid rgba(21,54,30,.2);background:#F4F2EC"/></label>
            <label style="display:block;font-size:14px;margin-top:12px">Shop pin<input name="pin" type="password" inputmode="numeric" required style="display:block;width:100%;margin-top:6px;padding:10px 12px;border-radius:12px;border:1px solid rgba(21,54,30,.2);background:#F4F2EC"/></label>
            <button style="margin-top:16px;background:#15361E;color:#F4F2EC;border:0;border-radius:999px;padding:10px 16px">Open the board</button>
            <p id="login-err" style="color:#F2733A;font-size:13px;min-height:1.2em">${msg||''}</p>
          </form>
        </div>`;
      document.getElementById('shop-login').onsubmit = async (e)=>{
        e.preventDefault();
        const fd = new FormData(e.target);
        const res = await fetch('/api/login', { method:'POST', credentials:'same-origin', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: fd.get('name'), pin: fd.get('pin') }) });
        if(!res.ok){ showLogin('That pin did not match.'); return; }
        await startShop();
      };
    }
    async function startShop(){
      const ses = await fetch('/api/session', { credentials:'same-origin' }).then(r=>r.json());
      if(!ses.ok){ showLogin(''); return; }
      shopSession = ses;
      const board = await fetch('/api/board', { credentials:'same-origin' }).then(r=>r.json());
      if(board.state && board.state.leads){
        state = normalizeState(board.state);
        localStorage.setItem(KEY, JSON.stringify(state));
      } else {
        await pushBoard();
      }
      render();
    }
    let view = 'dashboard';
    let selectedLead = null;
    let selectedInsp = state.inspections[0]?.id || null;
    let selectedJob = null;
    let selectedDay = new Date().toISOString().slice(0,10);
    let toast = '';
    let portalLead = 'L-1042';

    function esc(s){ return String(s??'').replace(/[&<>"']/g, c=>({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[c])); }
    function money(n){ return new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format(n||0); }
    function todayISO(){ return new Date().toISOString().slice(0,10); }
    function priceFor(job){
      const svc = SERVICES.find(s=>s.id===job.svc);
      if(!svc) return null;
      return svc;
    }
    function digits(p){ return String(p||'').replace(/\D/g,''); }
    function isCommercial(type){ return /commercial|warehouse|industrial/i.test(type||''); }
    function addDaysISO(iso, n){
      const d = new Date((iso||'2026-09-11').slice(0,10)+'T12:00:00');
      d.setDate(d.getDate()+n);
      return d.toISOString().slice(0,10);
    }
    function gstOf(sub){ return Math.round(Number(sub||0)*GST*100)/100; }
    function shapeLead(f){
      const type = f.type || 'Residential detached';
      const commercial = isCommercial(type);
      const access = (f.notes||'').replace(/code\s*\d+/ig,'see dispatch');
      return {
        id: f.id || uid('L'),
        name: f.name, org: f.org || (f.name+' household'),
        phone: f.phone||'', email: f.email||'',
        community: f.community||'', zone: f.zone||'SW', type,
        street: f.street||'',
        payer: { name:f.name||'', phone:f.phone||'', email:f.email||'', org: f.payerOrg || f.org || '' },
        site: { street:f.street||'', community:f.community||'', unit:f.unit||'', access:'see dispatch' },
        pest: f.pest||'', evidence: f.evidence||'', urgency: f.urgency||'Medium',
        stage: 'New lead', value: f.value||0, next: f.next||'Qualify + book envelope inspect',
        notes: access, created: new Date().toISOString(), firstTouch:'',
        source: f.source||'Web', pay: f.pay||'', referredBy: f.referredBy||'',
        contract: '', approval: commercial ? 'Pending' : 'Not required'
      };
    }
    function findDup(q){
      const phone = digits(q.phone);
      const email = String(q.email||'').trim().toLowerCase();
      const street = String(q.street||'').trim().toLowerCase();
      const community = String(q.community||'').trim().toLowerCase();
      return (state.leads||[]).find(l=>{
        const lp = digits(l.phone || (l.payer&&l.payer.phone));
        const le = String(l.email || (l.payer&&l.payer.email) || '').trim().toLowerCase();
        const ls = String((l.site&&l.site.street) || l.street || '').trim().toLowerCase();
        const lc = String(l.community || (l.site&&l.site.community) || '').trim().toLowerCase();
        if(phone && lp && phone.slice(-10)===lp.slice(-10)) return true;
        if(email && le && email===le) return true;
        if(street && ls && street===ls && community && lc && community===lc) return true;
