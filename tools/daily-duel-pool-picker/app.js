(() => {
  'use strict'

  const DATA = window.MATCHCUT_PICKER_DATA
  if (!DATA) {
    document.body.innerHTML = '<main class="not-approval"><strong>Picker data is missing.</strong> Run <code>node scripts/daily-duel-pool-model.ts</code> from the repository root.</main>'
    return
  }

  const cards = DATA.cards
  const byId = new Map(cards.map((card) => [card.id, card]))
  const storageKey = `matchcut:daily-duel-pool-picker:v1:${DATA.modelDigest}`
  const defaults = Object.fromEntries(cards.map((card) => [card.id, card.defaultDecision]))
  const state = {
    decisions: { ...defaults },
    history: [],
    activeId: cards.find((card) => card.layer === 'outside-challenger')?.id ?? cards[0].id,
    filters: { search: '', layer: 'all', decision: 'all', gate: 'all', sort: 'model' },
  }

  const elements = {
    digest: document.querySelector('#model-digest'),
    keepCount: document.querySelector('#keep-count'),
    countKeep: document.querySelector('#count-keep'),
    countMaybe: document.querySelector('#count-maybe'),
    countStrike: document.querySelector('#count-strike'),
    metricGrid: document.querySelector('#metric-grid'),
    warnings: document.querySelector('#warnings'),
    distributions: document.querySelector('#distributions'),
    search: document.querySelector('#search'),
    filterLayer: document.querySelector('#filter-layer'),
    filterDecision: document.querySelector('#filter-decision'),
    filterGate: document.querySelector('#filter-gate'),
    sort: document.querySelector('#sort'),
    undo: document.querySelector('#undo'),
    reset: document.querySelector('#reset'),
    previous: document.querySelector('#previous'),
    next: document.querySelector('#next'),
    reviewPosition: document.querySelector('#review-position'),
    activeCard: document.querySelector('#active-card'),
    visibleCount: document.querySelector('#visible-count'),
    queue: document.querySelector('#queue'),
    exportMarkdown: document.querySelector('#export-markdown'),
    exportJson: document.querySelector('#export-json'),
    toast: document.querySelector('#toast'),
  }

  const layerMeta = {
    'current-89': { label: 'Locked current 89', headClass: '' },
    'proposed-150': { label: 'Proposed 150 spine', headClass: 'spine' },
    'fallback-175': { label: '150→175 fallback', headClass: 'tail' },
    'fallback-200': { label: '175→200 fallback', headClass: 'tail' },
    'outside-challenger': { label: 'Outside challenger', headClass: 'outside' },
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
  }

  function round(value, digits = 2) {
    return Number(value.toFixed(digits))
  }

  function lowerMedian(values) {
    if (values.length === 0) return 0
    const sorted = values.slice().sort((a, b) => a - b)
    return sorted[Math.floor((sorted.length - 1) / 2)]
  }

  function uniqueCredits(card) {
    return [...new Set([
      ...card.credits.topCast,
      ...card.credits.deepCast,
      ...card.credits.director,
      ...card.credits.writers,
    ])]
  }

  function creditRoles(card) {
    const roles = new Map()
    const add = (name, role) => {
      const entry = roles.get(name) ?? new Set()
      entry.add(role)
      roles.set(name, entry)
    }
    card.credits.topCast.forEach((name) => add(name, 'Actor'))
    card.credits.deepCast.forEach((name) => add(name, 'Actor'))
    card.credits.director.forEach((name) => add(name, 'Director'))
    card.credits.writers.forEach((name) => add(name, 'Writer'))
    return roles
  }

  const roleIndex = new Map(cards.map((card) => [card.id, creditRoles(card)]))
  const deepIndex = new Map(cards.map((card) => [card.id, new Set(card.credits.deepCast)]))

  function sharedPeople(a, b) {
    const rolesA = roleIndex.get(a.id)
    const rolesB = roleIndex.get(b.id)
    const deepA = deepIndex.get(a.id)
    const deepB = deepIndex.get(b.id)
    const out = []
    const seen = new Set()
    const ordered = [...a.credits.topCast, ...a.credits.director, ...a.credits.writers, ...a.credits.deepCast]
    for (const name of ordered) {
      if (seen.has(name)) continue
      seen.add(name)
      if (!rolesB.has(name)) continue
      const union = new Set([...(rolesA.get(name) ?? []), ...(rolesB.get(name) ?? [])])
      out.push({
        name,
        role: union.has('Director') ? 'Director' : union.has('Actor') ? 'Actor' : 'Writer',
        deep: deepA.has(name) || deepB.has(name),
      })
    }
    return out
  }

  function relation(a, b) {
    const shared = sharedPeople(a, b)
    if (shared.length === 0) return null
    const tier = a.series && a.series === b.series
      ? 'super'
      : shared.length >= 3
        ? 'super'
        : shared.length >= 2 || shared.some((person) => person.role !== 'Actor')
          ? 'strong'
          : 'standard'
    return { shared, tier, visible: shared.some((person) => !person.deep) }
  }

  function keptCards() {
    return cards.filter((card) => state.decisions[card.id] === 'keep')
  }

  function graphMetrics(selected) {
    const adjacency = new Map(selected.map((card) => [card.id, []]))
    const degree = new Map(selected.map((card) => [card.id, 0]))
    const tiers = { standard: 0, strong: 0, super: 0 }
    let edges = 0
    let visibleEdges = 0
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const edge = relation(selected[i], selected[j])
        if (!edge) continue
        edges++
        if (edge.visible) visibleEdges++
        tiers[edge.tier]++
        degree.set(selected[i].id, degree.get(selected[i].id) + 1)
        degree.set(selected[j].id, degree.get(selected[j].id) + 1)
        adjacency.get(selected[i].id).push(selected[j].id)
        adjacency.get(selected[j].id).push(selected[i].id)
      }
    }
    const seen = new Set()
    const components = []
    for (const card of selected) {
      if (seen.has(card.id)) continue
      const component = []
      const stack = [card.id]
      seen.add(card.id)
      while (stack.length) {
        const id = stack.pop()
        component.push(id)
        for (const next of adjacency.get(id)) {
          if (seen.has(next)) continue
          seen.add(next)
          stack.push(next)
        }
      }
      components.push(component)
    }
    components.sort((a, b) => b.length - a.length)
    const degrees = [...degree.values()]
    const peopleCounts = new Map()
    for (const card of selected) {
      for (const person of uniqueCredits(card)) peopleCounts.set(person, (peopleCounts.get(person) ?? 0) + 1)
    }
    const people = [...peopleCounts]
      .map(([person, count]) => ({ person, count }))
      .sort((a, b) => b.count - a.count || a.person.localeCompare(b.person))
    const byDecade = {}
    const byGenre = {}
    const bySeries = {}
    for (const card of selected) {
      const decade = `${Math.floor(card.year / 10) * 10}s`
      byDecade[decade] = (byDecade[decade] ?? 0) + 1
      byGenre[card.genre] = (byGenre[card.genre] ?? 0) + 1
      const series = card.series ?? '(none)'
      bySeries[series] = (bySeries[series] ?? 0) + 1
    }
    const possible = selected.length > 1 ? selected.length * (selected.length - 1) / 2 : 0
    return {
      selected,
      edges,
      density: possible ? round(edges / possible * 100) : 0,
      visibleEdges,
      visibleEdgeShare: edges ? round(visibleEdges / edges * 100) : 0,
      tiers,
      degrees,
      degreeById: degree,
      minDegree: degrees.length ? Math.min(...degrees) : 0,
      medianDegree: lowerMedian(degrees),
      meanDegree: degrees.length ? round(degrees.reduce((sum, value) => sum + value, 0) / degrees.length) : 0,
      maxDegree: degrees.length ? Math.max(...degrees) : 0,
      components: components.length,
      componentSizes: components.map((component) => component.length),
      isolates: selected.filter((card) => degree.get(card.id) === 0),
      people,
      peopleAboveLimit: people.filter((entry) => entry.count > DATA.constraints.maxPersonCards),
      maxPersonCount: people[0]?.count ?? 0,
      deepCastCards: selected.filter((card) => card.credits.deepCast.length > 0).length,
      deepCastShare: selected.length ? round(selected.filter((card) => card.credits.deepCast.length > 0).length / selected.length * 100) : 0,
      byDecade,
      byGenre,
      bySeries,
    }
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
      if (!saved || saved.modelDigest !== DATA.modelDigest) return
      for (const card of cards) {
        const decision = saved.decisions?.[card.id]
        if (card.locked) state.decisions[card.id] = 'keep'
        else if (['keep', 'maybe', 'strike'].includes(decision)) state.decisions[card.id] = decision
      }
      if (byId.has(saved.activeId)) state.activeId = saved.activeId
    } catch {
      // Corrupt local authoring state safely falls back to the generated slate.
    }
  }

  function save() {
    localStorage.setItem(storageKey, JSON.stringify({
      schemaVersion: DATA.schemaVersion,
      modelDigest: DATA.modelDigest,
      savedAt: new Date().toISOString(),
      activeId: state.activeId,
      decisions: state.decisions,
    }))
  }

  function setDecision(id, decision) {
    const card = byId.get(id)
    if (!card || card.locked || state.decisions[id] === decision) return
    state.history.push({ id, previous: state.decisions[id], next: decision })
    state.decisions[id] = decision
    save()
    render()
  }

  function undo() {
    const action = state.history.pop()
    if (!action) return
    state.decisions[action.id] = action.previous
    state.activeId = action.id
    save()
    render()
    toast(`Undid ${byId.get(action.id).title} → ${action.previous}`)
  }

  function gateMatches(card, gate) {
    if (gate === 'all') return true
    if (gate === 'pass') return card.layer === 'outside-challenger' && card.allStaticGatesPass === true
    if (gate === 'blocked') return card.layer === 'outside-challenger' && card.allStaticGatesPass === false
    if (gate === 'verified') return card.metadataStatus === 'current-credited'
    return card.metadataStatus === 'provisional-unverified'
  }

  function visibleCards() {
    const query = state.filters.search.trim().toLocaleLowerCase()
    const filtered = cards.filter((card) => {
      if (state.filters.layer !== 'all' && card.layer !== state.filters.layer) return false
      if (state.filters.decision !== 'all' && state.decisions[card.id] !== state.filters.decision) return false
      if (!gateMatches(card, state.filters.gate)) return false
      if (!query) return true
      const haystack = [
        card.title,
        card.year,
        card.genre,
        card.series,
        card.priorStatus,
        ...uniqueCredits(card),
        ...card.breadthReasons,
      ].filter(Boolean).join(' ').toLocaleLowerCase()
      return haystack.includes(query)
    })
    const degree = (card) => card.staticLinks.final200.degree
    filtered.sort((a, b) => {
      if (state.filters.sort === 'title') return a.title.localeCompare(b.title)
      if (state.filters.sort === 'year-new') return b.year - a.year || a.title.localeCompare(b.title)
      if (state.filters.sort === 'year-old') return a.year - b.year || a.title.localeCompare(b.title)
      if (state.filters.sort === 'degree-high') return degree(b) - degree(a) || a.title.localeCompare(b.title)
      if (state.filters.sort === 'degree-low') return degree(a) - degree(b) || a.title.localeCompare(b.title)
      if (state.filters.sort === 'gate') return Number(b.allStaticGatesPass === true) - Number(a.allStaticGatesPass === true) || a.order - b.order
      return a.order - b.order
    })
    return filtered
  }

  function navigate(offset) {
    const visible = visibleCards()
    if (!visible.length) return
    const current = Math.max(0, visible.findIndex((card) => card.id === state.activeId))
    const next = (current + offset + visible.length) % visible.length
    state.activeId = visible[next].id
    save()
    render()
    document.querySelector('.active-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function metric(label, value, good) {
    return `<div class="metric ${good ? 'good' : 'bad'}"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`
  }

  function renderDashboard(metrics) {
    const counts = { keep: 0, maybe: 0, strike: 0 }
    for (const decision of Object.values(state.decisions)) counts[decision]++
    elements.keepCount.textContent = counts.keep
    elements.countKeep.textContent = counts.keep
    elements.countMaybe.textContent = counts.maybe
    elements.countStrike.textContent = counts.strike
    elements.metricGrid.innerHTML = [
      metric('real films · exactly 200', metrics.selected.length, metrics.selected.length === DATA.constraints.exactCount),
      metric('person components · 1', metrics.components, metrics.components === DATA.constraints.components),
      metric(`minimum degree · ≥${DATA.constraints.minDegree}`, metrics.minDegree, metrics.minDegree >= DATA.constraints.minDegree),
      metric(`median degree · ≥${DATA.constraints.medianDegree}`, metrics.medianDegree, metrics.medianDegree >= DATA.constraints.medianDegree),
      metric(`person density · ≥${DATA.constraints.density}%`, `${metrics.density.toFixed(2)}%`, metrics.density >= DATA.constraints.density),
      metric(`visible edge share · ≥${DATA.constraints.visibleEdgeShare}%`, `${metrics.visibleEdgeShare.toFixed(2)}%`, metrics.visibleEdgeShare >= DATA.constraints.visibleEdgeShare),
      metric(`max person cards · ≤${DATA.constraints.maxPersonCards}`, metrics.maxPersonCount, metrics.maxPersonCount <= DATA.constraints.maxPersonCards),
      metric('cards carrying deep credits', `${metrics.deepCastCards} · ${metrics.deepCastShare.toFixed(1)}%`, true),
    ].join('')

    const warnings = []
    if (metrics.selected.length !== DATA.constraints.exactCount) warnings.push(`Keep set is ${metrics.selected.length}; it must finish at exactly 200.`)
    if (metrics.components !== 1) warnings.push(`Person graph has ${metrics.components} components; required: one.`)
    if (metrics.isolates.length) warnings.push(`Isolates: ${metrics.isolates.map((card) => card.title).join(', ')}.`)
    if (metrics.minDegree < DATA.constraints.minDegree) warnings.push(`Minimum degree is ${metrics.minDegree}; required: at least ${DATA.constraints.minDegree}.`)
    if (metrics.medianDegree < DATA.constraints.medianDegree) warnings.push(`Median degree is ${metrics.medianDegree}; required: at least ${DATA.constraints.medianDegree}.`)
    if (metrics.density < DATA.constraints.density) warnings.push(`Person density is ${metrics.density.toFixed(2)}%; required: at least ${DATA.constraints.density}%.`)
    if (metrics.visibleEdgeShare < DATA.constraints.visibleEdgeShare) warnings.push(`Visible edge share is ${metrics.visibleEdgeShare.toFixed(2)}%; required: at least ${DATA.constraints.visibleEdgeShare}%.`)
    if (metrics.peopleAboveLimit.length) warnings.push(`Person concentration exceeds 15: ${metrics.peopleAboveLimit.map((entry) => `${entry.person} ${entry.count}`).join(', ')}.`)
    const blockedKeeps = metrics.selected.filter((card) => card.layer === 'outside-challenger' && !card.allStaticGatesPass)
    if (blockedKeeps.length) warnings.push(`Blocked outside keeps need a breadth-exception ruling: ${blockedKeeps.map((card) => card.title).join(', ')}.`)
    const provisionalKeeps = metrics.selected.filter((card) => card.metadataStatus === 'provisional-unverified')
    if (provisionalKeeps.length) warnings.push(`Selected outside metadata is provisional and must be audited: ${provisionalKeeps.map((card) => card.title).join(', ')}.`)
    if (counts.maybe) warnings.push(`${counts.maybe} Maybe decision${counts.maybe === 1 ? '' : 's'} remain; this is a partial review state.`)
    elements.warnings.innerHTML = warnings.length
      ? warnings.map((warning, index) => `<div class="warning ${index >= warnings.length - (counts.maybe ? 1 : 0) ? 'provisional' : ''}">${escapeHtml(warning)}</div>`).join('')
      : '<div class="all-clear">All live structural floors pass. Export the receipt and explicitly submit the selection; this still does not authorize implementation.</div>'

    const distributionList = (title, entries) => `<section class="distribution-card"><h3>${escapeHtml(title)}</h3><ol>${entries.map(([name, count]) => `<li>${escapeHtml(name)} · ${count}</li>`).join('')}</ol></section>`
    const topEntries = (object, limit = 12, dropNone = false) => Object.entries(object)
      .filter(([name]) => !dropNone || name !== '(none)')
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, limit)
    elements.distributions.innerHTML = [
      distributionList('Decades', Object.entries(metrics.byDecade).sort()),
      distributionList('Genres', topEntries(metrics.byGenre)),
      distributionList('Series tags', topEntries(metrics.bySeries, 12, true)),
      distributionList('Top people', metrics.people.slice(0, 12).map((entry) => [entry.person, entry.count])),
      distributionList('Link tiers', Object.entries(metrics.tiers)),
    ].join('')
  }

  function decisionButtons(card) {
    const current = state.decisions[card.id]
    const locked = card.locked ? 'disabled title="The current 89 are locked"' : ''
    return `<div class="decision-bar" aria-label="Decision for ${escapeHtml(card.title)}">
      ${['keep', 'maybe', 'strike'].map((decision) => `<button type="button" class="decision-button ${decision}" data-decision="${decision}" aria-pressed="${current === decision}" ${locked}>${decision[0].toUpperCase() + decision.slice(1)} <kbd>${decision === 'keep' ? 'K' : decision === 'maybe' ? 'M' : 'S'}</kbd></button>`).join('')}
    </div>`
  }

  function staticFact(label, links) {
    return `<div class="fact"><strong>${links.degree}</strong><span>${escapeHtml(label)} · ${links.visible} visible / ${links.deepOnly} deep</span></div>`
  }

  function liveRelations(card, selected) {
    return selected
      .filter((neighbor) => neighbor.id !== card.id)
      .map((neighbor) => ({ neighbor, edge: relation(card, neighbor) }))
      .filter((entry) => entry.edge)
      .sort((a, b) => {
        const rank = { super: 3, strong: 2, standard: 1 }
        return rank[b.edge.tier] - rank[a.edge.tier] || a.neighbor.title.localeCompare(b.neighbor.title)
      })
  }

  function renderActive(card, selected) {
    const layer = layerMeta[card.layer]
    const decision = state.decisions[card.id]
    const links = liveRelations(card, selected)
    const liveTiers = { standard: 0, strong: 0, super: 0 }
    const people = new Map()
    for (const link of links) {
      liveTiers[link.edge.tier]++
      for (const person of link.edge.shared) people.set(person.name, (people.get(person.name) ?? 0) + 1)
    }
    const topPeople = [...people]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 8)
    const gateHtml = card.layer === 'outside-challenger'
      ? `<div class="callout ${card.allStaticGatesPass ? 'pass' : 'blocked'}"><strong>${card.allStaticGatesPass ? 'Provisional entry gate: PASS' : 'Provisional entry gate: BLOCKED'}</strong><br>${[
          ['≥3 spine person links', card.challengerGates.spinePersonNeighbors],
          ['≥2 spine visible links', card.challengerGates.spineVisibleNeighbors],
          ['≥7 fallback-200 person links', card.challengerGates.fallback200PersonNeighbors],
        ].map(([label, pass]) => `${pass ? '✓' : '✗'} ${label}`).join(' · ')}</div>`
      : ''
    const provisionalHtml = card.provisionalOnly
      ? '<div class="callout"><strong>Unverified relation scaffold.</strong> These credits support review only. A Keep still requires the selected-candidate TMDB, name, date, billing, and series workflow.</div>'
      : ''
    const breadthHtml = card.breadthReasons.length
      ? `<section><h3 class="section-title">Reason beyond a dominant hub</h3><ul class="prose-list">${card.breadthReasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join('')}</ul></section>`
      : ''
    const swapHtml = card.layer === 'outside-challenger'
      ? `<details class="detail-block"><summary>Tail swaps that keep every live structural floor (${card.viableSwapTargets.length} shown)</summary>${card.viableSwapTargets.length
          ? `<ul class="swap-list">${card.viableSwapTargets.map((swap) => `<li><strong>${escapeHtml(swap.removeTitle)}</strong> · edges ${swap.edgeDelta >= 0 ? '+' : ''}${swap.edgeDelta} · candidate degree ${swap.candidateDegree}</li>`).join('')}</ul>`
          : '<p>No structurally admissible tail swap under this provisional credit scaffold.</p>'}</details>`
      : ''
    const neighborHtml = links.length
      ? `<ul class="neighbor-list">${links.map(({ neighbor, edge }) => `<li class="tier-${edge.tier}"><strong>${escapeHtml(neighbor.title)}</strong> · ${edge.tier} · ${edge.visible ? 'visible' : 'deep only'}<br><span>${edge.shared.map((person) => escapeHtml(person.name)).join(', ')}</span></li>`).join('')}</ul>`
      : '<p>No person-linked neighbors in the live Keep set.</p>'
    const credits = card.credits
    elements.activeCard.innerHTML = `
      <header class="card-head ${layer.headClass}">
        <div class="badge-row">
          <span class="badge">${escapeHtml(layer.label)}</span>
          <span class="badge neutral">${escapeHtml(card.sourceKind.replaceAll('-', ' '))}</span>
          ${card.metadataStatus === 'provisional-unverified' ? '<span class="badge provisional">metadata unverified</span>' : ''}
          ${card.allStaticGatesPass === true ? '<span class="gate-pill pass">entry gate pass</span>' : card.allStaticGatesPass === false ? '<span class="gate-pill blocked">entry gate blocked</span>' : ''}
          <span class="decision-pill ${decision}">${decision}</span>
        </div>
        <div class="card-title-row"><h2 id="active-title">${escapeHtml(card.title)}</h2><span class="year-ticket">${card.year}</span></div>
      </header>
      ${decisionButtons(card)}
      <div class="card-body">
        ${gateHtml}
        ${provisionalHtml}
        <div class="fact-grid">
          ${staticFact('links to original 89', card.staticLinks.original89)}
          ${staticFact('links to proposed 150', card.staticLinks.spine150)}
          ${staticFact('projected fallback degree', card.staticLinks.final200)}
          <div class="fact"><strong>${links.length}</strong><span>links to live Keep set · S ${liveTiers.standard} / St ${liveTiers.strong} / Su ${liveTiers.super}</span></div>
        </div>
        <section><h3 class="section-title">Prior evidence and exact identity</h3><p>${escapeHtml(card.priorStatus)}</p><p>${escapeHtml(card.identityNote)}</p></section>
        ${breadthHtml}
        ${card.concentrationCaveat ? `<div class="callout"><strong>Concentration caveat:</strong> ${escapeHtml(card.concentrationCaveat)}</div>` : ''}
        <section><h3 class="section-title">Series value — separate from person degree</h3><p>${escapeHtml(card.seriesReview ?? (card.series ? `Existing series tag: ${card.series}.` : 'No series tag.'))}</p></section>
        <section><h3 class="section-title">Top shared people in live Keep set</h3><p>${topPeople.length ? topPeople.map((entry) => `${escapeHtml(entry.name)} ×${entry.count}`).join(' · ') : 'None'}</p></section>
        <details class="detail-block" open><summary>Exact live person-linked neighbors (${links.length})</summary>${neighborHtml}</details>
        ${swapHtml}
        <details class="detail-block"><summary>Provisional / current credits</summary>
          <ul class="credit-list">
            <li><strong>Director:</strong> ${credits.director.map(escapeHtml).join(', ') || '—'}</li>
            <li><strong>Writers:</strong> ${credits.writers.map(escapeHtml).join(', ') || '—'}</li>
            <li><strong>Top cast:</strong> ${credits.topCast.map(escapeHtml).join(', ') || '—'}</li>
            <li><strong>Deep cast:</strong> ${credits.deepCast.map(escapeHtml).join(', ') || '—'}</li>
          </ul>
        </details>
      </div>`
    elements.activeCard.querySelectorAll('[data-decision]').forEach((button) => {
      button.addEventListener('click', () => setDecision(card.id, button.dataset.decision))
    })
  }

  function renderQueue(visible, metrics) {
    elements.visibleCount.textContent = visible.length
    elements.queue.innerHTML = visible.length
      ? visible.map((card) => {
          const decision = state.decisions[card.id]
          const degree = metrics.degreeById.get(card.id) ?? card.staticLinks.final200.degree
          return `<button type="button" role="listitem" class="queue-item ${card.id === state.activeId ? 'active' : ''}" data-id="${escapeHtml(card.id)}" data-layer="${escapeHtml(card.layer)}">
            <span class="queue-title">${escapeHtml(card.title)} · ${card.year}</span>
            <span class="queue-meta">${escapeHtml(layerMeta[card.layer].label)} · ${decision}${card.allStaticGatesPass === false ? ' · blocked' : card.allStaticGatesPass === true ? ' · pass' : ''}</span>
            <span class="queue-score"><strong>${degree}</strong><span>degree</span></span>
          </button>`
        }).join('')
      : '<p class="callout">No cards match these filters.</p>'
    elements.queue.querySelectorAll('[data-id]').forEach((button) => {
      button.addEventListener('click', () => {
        state.activeId = button.dataset.id
        save()
        render()
        document.querySelector('.active-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })
  }

  function buildReceipt() {
    const selected = keptCards()
    const metrics = graphMetrics(selected)
    const decisions = { keep: [], maybe: [], strike: [] }
    for (const card of cards) decisions[state.decisions[card.id]].push({
      id: card.id,
      title: card.title,
      year: card.year,
      layer: card.layer,
      sourceKind: card.sourceKind,
      metadataStatus: card.metadataStatus,
      staticGatePass: card.allStaticGatesPass,
      priorStatus: card.priorStatus,
    })
    return {
      schemaVersion: 'matchcut-daily-duel-selection-receipt-v1',
      exportedAt: new Date().toISOString(),
      modelDigest: DATA.modelDigest,
      submitted: false,
      explicitCheckpointApproval: false,
      partial: decisions.maybe.length > 0,
      metrics: {
        films: selected.length,
        edges: metrics.edges,
        density: metrics.density,
        visibleEdgeShare: metrics.visibleEdgeShare,
        components: metrics.components,
        isolates: metrics.isolates.map((card) => card.id),
        minDegree: metrics.minDegree,
        medianDegree: metrics.medianDegree,
        meanDegree: metrics.meanDegree,
        maxDegree: metrics.maxDegree,
        maxPersonCount: metrics.maxPersonCount,
        peopleAbove15: metrics.peopleAboveLimit,
        deepCastShare: metrics.deepCastShare,
        tiers: metrics.tiers,
        byDecade: metrics.byDecade,
        byGenre: metrics.byGenre,
        bySeries: metrics.bySeries,
      },
      decisions,
      selectedIds: selected.map((card) => card.id),
    }
  }

  function receiptMarkdown(receipt) {
    const group = (label, entries) => `## ${label} (${entries.length})\n\n${entries.length ? entries.map((entry) => `- ${entry.title} (${entry.year}) — ${layerMeta[entry.layer].label}${entry.metadataStatus === 'provisional-unverified' ? ' — METADATA UNVERIFIED' : ''}${entry.staticGatePass === false ? ' — ENTRY GATE BLOCKED' : ''}`).join('\n') : '- None'}\n`
    return `# Match Cut Daily / Duel pool selection receipt

**Exported:** ${receipt.exportedAt}

**Model digest:** \`${receipt.modelDigest}\`

**Status:** ${receipt.partial ? 'PARTIAL — Maybe decisions remain' : 'Complete picker state, awaiting explicit checkpoint submission'}

**Approval:** NOT APPROVED · NOT AN IMPLEMENTATION INSTRUCTION

## Live Keep-set metrics

- Real films: ${receipt.metrics.films} / 200
- Person edges / density: ${receipt.metrics.edges} / ${receipt.metrics.density.toFixed(2)}%
- Visible edge share: ${receipt.metrics.visibleEdgeShare.toFixed(2)}%
- Components / isolates: ${receipt.metrics.components} / ${receipt.metrics.isolates.length}
- Minimum / median / mean / maximum degree: ${receipt.metrics.minDegree} / ${receipt.metrics.medianDegree} / ${receipt.metrics.meanDegree} / ${receipt.metrics.maxDegree}
- Maximum exact-person card count: ${receipt.metrics.maxPersonCount}
- Deep-credit card share: ${receipt.metrics.deepCastShare.toFixed(2)}%

${group('KEEP', receipt.decisions.keep)}
${group('MAYBE', receipt.decisions.maybe)}
${group('STRIKE', receipt.decisions.strike)}
## Submission boundary

This export records local picker state only. Buri must explicitly say the selection is complete before the exact-200 audit, metadata build, Daily cutover analysis, or wild simulation begins.
`
  }

  function download(filename, contents, type) {
    const blob = new Blob([contents], { type })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  let toastTimer
  function toast(message) {
    elements.toast.textContent = message
    elements.toast.classList.add('show')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 1800)
  }

  function render() {
    const visible = visibleCards()
    if (!visible.some((card) => card.id === state.activeId)) state.activeId = visible[0]?.id ?? state.activeId
    const selected = keptCards()
    const metrics = graphMetrics(selected)
    renderDashboard(metrics)
    const active = byId.get(state.activeId)
    if (active) renderActive(active, selected)
    renderQueue(visible, metrics)
    const index = visible.findIndex((card) => card.id === state.activeId)
    elements.reviewPosition.textContent = visible.length ? `${index + 1} of ${visible.length}` : '0 of 0'
    elements.previous.disabled = visible.length < 2
    elements.next.disabled = visible.length < 2
    elements.undo.disabled = state.history.length === 0
  }

  function bindFilters() {
    const bindings = [
      [elements.search, 'search', 'input'],
      [elements.filterLayer, 'layer', 'change'],
      [elements.filterDecision, 'decision', 'change'],
      [elements.filterGate, 'gate', 'change'],
      [elements.sort, 'sort', 'change'],
    ]
    for (const [element, key, event] of bindings) {
      element.addEventListener(event, () => {
        state.filters[key] = element.value
        render()
      })
    }
  }

  load()
  elements.digest.textContent = `${DATA.modelDigest.slice(0, 12)}…`
  bindFilters()
  elements.previous.addEventListener('click', () => navigate(-1))
  elements.next.addEventListener('click', () => navigate(1))
  elements.undo.addEventListener('click', undo)
  elements.reset.addEventListener('click', () => {
    if (!window.confirm('Reset every editable card to the generated slate? This cannot be undone.')) return
    state.decisions = { ...defaults }
    state.history = []
    state.activeId = cards.find((card) => card.layer === 'outside-challenger')?.id ?? cards[0].id
    save()
    render()
    toast('Picker reset to the generated slate')
  })
  elements.exportJson.addEventListener('click', () => {
    const receipt = buildReceipt()
    download('matchcut-daily-duel-selection-receipt.json', `${JSON.stringify(receipt, null, 2)}\n`, 'application/json')
    toast('JSON receipt exported')
  })
  elements.exportMarkdown.addEventListener('click', () => {
    const receipt = buildReceipt()
    download('matchcut-daily-duel-selection-receipt.md', receiptMarkdown(receipt), 'text/markdown')
    toast('Markdown receipt exported')
  })
  window.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const tag = document.activeElement?.tagName
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) return
    const key = event.key.toLocaleLowerCase()
    if (key === 'arrowleft') navigate(-1)
    else if (key === 'arrowright') navigate(1)
    else if (key === 'u') undo()
    else if (key === 'k') setDecision(state.activeId, 'keep')
    else if (key === 'm') setDecision(state.activeId, 'maybe')
    else if (key === 's') setDecision(state.activeId, 'strike')
    else return
    event.preventDefault()
  })

  render()
})()
