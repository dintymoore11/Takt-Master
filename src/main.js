import './style.css'

import {
  PROJECTS,
  DAILY_DELAY_COST,
  LIQUIDATED_DAMAGES_PER_DAY,
  PERIOD_LABEL,
  NAME_KEYS,
  NAME_ACTIONS,
  MODES,
} from './gameConfig.js'
import { visualForTrade } from './visualAssets.js'
import {
  buildingAssetForProject,
  roadblockAsset,
  uiAsset,
} from './assets/manifest.js'
import {
  addLog,
  activeTradeCount,
  continueFromGameOver,
  currentProject,
  formatMoney,
  getTrade,
  leaderboardQualifies,
  levelCount,
  loadLeaderboard,
  moraleFace,
  projectBudget,
  projectDuration,
  pushSelectedTrade,
  quitToLeaderboard,
  resolveSelectedRoadblock,
  restartAfterLeaderboard,
  resetProject,
  returnToTitle,
  saveLeaderboardScore,
  selectNameKey,
  setRenderCallback,
  startCampaign,
  startNextProject,
  state,
  stopTimer,
  tradeTemplates,
  tradeForSelectedZonePush,
  tradeLocation,
  usesPlanGrid,
  visibleLevels,
  visualColumn,
  visualRow,
  zoneBay,
  zoneColumns,
  zoneCount,
  zoneFromLevelAndColumn,
  zoneFromPlanPosition,
  zoneLevel,
  zonesForLevel,
  zonesPerLevel,
  roadblockTimer,
} from './gameLogic.js'

const IDLE_RETURN_MS = 90_000
const app = document.querySelector('#app')
let idleReturnTimer = null

function scheduleIdleReturn() {
  if (idleReturnTimer) {
    window.clearTimeout(idleReturnTimer)
    idleReturnTimer = null
  }

  if (state.phase === 'title') return

  idleReturnTimer = window.setTimeout(() => {
    idleReturnTimer = null
    if (state.phase !== 'title') returnToTitle()
  }, IDLE_RETURN_MS)
}

function noteUserActivity() {
  scheduleIdleReturn()
}

function render() {
  scheduleIdleReturn()

  if (state.phase === 'title') {
    app.innerHTML = titleView()
    bindTitle()
    return
  }

  if (state.phase === 'setup') {
    app.innerHTML = setupView()
    bindSetup()
    return
  }

  if (state.phase === 'nameEntry') {
    app.innerHTML = nameEntryView()
    bindNameEntry()
    return
  }

  if (state.phase === 'gameOver') {
    app.innerHTML = gameOverView()
    bindGameOver()
    return
  }

  if (state.phase === 'scoreResult') {
    app.innerHTML = scoreResultView()
    bindScoreResult()
    return
  }

  if (state.phase === 'win') {
    app.innerHTML = winView()
    bindWin()
    return
  }

  app.innerHTML = gameView()
  bindGame()
}

function titleView() {
  return `
    <main class="title-screen">
      <section class="title-copy">
        <p class="eyebrow">Arcade Construction Simulation</p>
        <h1>Takt Master</h1>
        <h2>Build with flow.</h2>
        <p class="summary">Sequence trades through an office building, clear roadblocks, protect morale, and finish projects before budget and schedule run out.</p>
        <button class="start-button" type="button" data-start>
          <img class="button-icon" src="${uiAsset('start')}" alt="" aria-hidden="true">
          Start
        </button>
        <p class="press-start">Press S</p>
      </section>
      <section class="title-sidebar">
        <section class="leaderboard title-board">
          <strong>Leaderboard</strong>
          ${leaderboardRows()}
        </section>
        <section class="project-picker">
          <strong>Test Project</strong>
          <div>
            ${PROJECTS.map((project, index) => `
              <button type="button" data-test-project="${index + 1}">
                <span>${index + 1}</span>
                ${project.name}
              </button>
            `).join('')}
          </div>
        </section>
      </section>
      <section class="demo-cabinet" aria-label="Gameplay preview">
        <div class="demo-tower">
          ${PROJECTS[0].levels ? Array.from({ length: PROJECTS[0].levels }, (_, index) => PROJECTS[0].levels - index).map((level) => `
            <div class="demo-level">
              <span>Level ${level}</span>
              ${Array.from({ length: PROJECTS[0].zonesPerLevel }, (_, index) => `<i style="--delay: ${index}; --color: ${PROJECTS[0].trades[index % PROJECTS[0].trades.length].color}"></i>`).join('')}
            </div>
          `).join('') : ''}
        </div>
      </section>
    </main>
  `
}

function setupView() {
  const project = currentProject()
  return `
    <main class="setup-screen project-setup">
      <div class="setup-stage" aria-hidden="true">
        ${setupPreviewTower()}
      </div>
      <section class="setup-overlay">
        <p class="eyebrow">Project ${state.projectRound}</p>
        <h1>${project.name}</h1>
        <h2>Takt Master</h2>
        <p class="setup-subtitle">Build with flow.</p>
        <p class="summary">${project.summary}, ${levelCount()} levels, ${zoneCount()} zones, ${tradeTemplates().length} trades, ${formatMoney(projectBudget())} budget, ${projectDuration()} day schedule.</p>
        <section class="briefing-panel">
          ${stat('Project', state.projectRound)}
          ${stat('Budget', formatMoney(projectBudget()))}
          ${stat('Schedule', `${projectDuration()} days`)}
        </section>
        <section class="mode-grid" aria-label="Variability mode">
          ${MODES.map(
            (mode, index) => `
              <button class="mode-button" data-mode="${index}" type="button">
                <span class="mode-key">${index + 1}</span>
                <span class="mode-title">${mode.name}</span>
                <span class="dice-row">${mode.dice.map((value) => `<span class="die">${value}</span>`).join('')}</span>
                <span class="mode-note">${mode.note}</span>
              </button>
            `,
          ).join('')}
        </section>
      </section>
    </main>
  `
}

function setupPreviewTower() {
  const project = currentProject()
  return `
    <section class="tower ${project.type}-tower setup-preview-tower" style="--building-asset: url('${buildingAssetForProject(project)}')">
      ${visibleLevels().map((level) => `
        <div class="tower-level">
          <div class="level-label">Level ${level}</div>
          <div class="level-zones" style="--zone-columns: ${zoneColumns()}">
            ${zonesForLevel(level).map((zone) => `
              <div class="tower-zone preview-zone">
                <span class="zone-number">${zone}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
      <div class="ground"></div>
    </section>
  `
}

function nameEntryView() {
  if (state.scoreSaved) {
    return `
      <main class="name-screen">
        <section class="name-card">
          <p class="eyebrow">Score Saved</p>
          <h1>Leaderboard</h1>
          <p class="final-score">${state.scoreName} · Final score ${formatMoney(state.totalProfit)} · Last project ${state.projectRound}</p>
          <button class="start-button" type="button" data-home>Home</button>
          <p class="name-help">Press S, Space, or Enter</p>
        </section>
        <section class="leaderboard standalone">
          <strong>Leaderboard</strong>
          ${leaderboardRows()}
        </section>
      </main>
    `
  }

  return `
    <main class="name-screen">
      <section class="name-card">
        <p class="eyebrow">Game Over</p>
        <h1>Enter Name</h1>
        <p class="final-score">Final score ${formatMoney(state.totalProfit)} · Last project ${state.projectRound}</p>
        <div class="name-display">${(state.scoreName || '___').padEnd(3, '_')}</div>
        <div class="letter-grid">
          ${[...NAME_KEYS, ...NAME_ACTIONS].map((key, index) => `
            <button class="${index === state.nameCursor ? 'selected' : ''}" data-letter="${index}" type="button">${key}</button>
          `).join('')}
        </div>
        <p class="name-help">Arrow keys move · Space selects · Enter saves</p>
      </section>
      <section class="leaderboard standalone">
        <strong>Leaderboard</strong>
        ${leaderboardRows()}
      </section>
    </main>
  `
}

function gameOverView() {
  const qualified = leaderboardQualifies(state.totalProfit)
  return `
    <main class="name-screen">
      <section class="name-card">
        <p class="eyebrow">Game Over</p>
        <h1>You Lost</h1>
        <p class="final-score">Career earnings ${formatMoney(state.totalProfit)}</p>
        <div class="briefing-panel compact-results">
          ${stat('Last project', currentProject().name)}
          ${stat('Project profit', formatMoney(state.profit), state.profit < 0 ? 'bad' : '')}
          ${scheduleVarianceStat()}
          ${stat('Costs', formatMoney(totalProjectCosts()))}
          ${stat('Schedule efficiency', `${scheduleEfficiency().toFixed(0)}%`)}
        </div>
        <button class="start-button" type="button" data-continue>${qualified ? 'Enter Name' : 'Results'}</button>
        <p class="name-help">Press Space, Enter, or S</p>
      </section>
      <section class="leaderboard standalone">
        <strong>Leaderboard</strong>
        ${leaderboardRows()}
      </section>
    </main>
  `
}

function scoreResultView() {
  return `
    <main class="name-screen">
      <section class="name-card">
        <p class="eyebrow">Game Over</p>
        <h1>Final Score</h1>
        <p class="final-score">${formatMoney(state.totalProfit)} · Last project ${state.projectRound}</p>
        <p class="name-help">Not enough for the leaderboard</p>
        <button class="start-button" type="button" data-home>Home</button>
        <p class="name-help">Press S, Space, Enter, or End</p>
      </section>
      <section class="leaderboard standalone">
        <strong>Leaderboard</strong>
        ${leaderboardRows()}
      </section>
    </main>
  `
}

function winView() {
  return `
    <main class="win-screen">
      <div class="fireworks">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <section class="win-card">
        <p class="eyebrow">Grand Opening</p>
        <h1>You Won</h1>
        <p class="summary">The hotel is open, the ribbon is cut, and your construction career ends in a successful retirement.</p>
        <div class="ribbon-cutting">
          <span class="ribbon left"></span>
          <span class="scissors"></span>
          <span class="ribbon right"></span>
        </div>
        <p class="final-score">Career earnings ${formatMoney(state.totalProfit)}</p>
        <button class="start-button" type="button" data-continue>Enter Leaderboard</button>
        <p class="name-help">Press Space, Enter, or S</p>
      </section>
    </main>
  `
}

function gameView() {
  return `
    <main class="game-shell phase-${state.roundPhase}">
      <section class="unity-frame">
        <div class="stage">
          <header class="topbar">
            <div class="topbar-title">
              <strong>Takt Master</strong>
              <span>${state.mode.name} · Project ${state.projectRound}</span>
            </div>
            <div class="arcade-hud">
              <div class="hud-tile profit ${state.profit < 0 ? 'bad' : ''}">
                <span>Profit</span>
                <strong>${formatMoney(state.profit)}</strong>
              </div>
              <div class="hud-tile day ${state.day > projectDuration() ? 'bad' : ''}">
                <span>Day</span>
                <strong>${state.day}</strong>
                <em>/${projectDuration()}</em>
              </div>
            </div>
            <div class="topbar-secondary">
              ${scheduleBar()}
              ${budgetGauge()}
            </div>
          </header>
          ${liveDamagesBanner()}

          <div class="playfield">
            ${towerView()}
          </div>
        </div>
        <footer class="unity-footer">
          <span>Takt Master</span>
          <button class="fullscreen-fake" type="button" aria-label="Fullscreen preview"></button>
        </footer>
      </section>
      ${state.phase === 'ended' ? endScreen() : ''}
    </main>
  `
}

function liveDamagesBanner() {
  if (state.phase !== 'running' || state.liquidatedDamages <= 0) return ''
  return `
    <div class="live-damages ${state.liquidatedDamages === LIQUIDATED_DAMAGES_PER_DAY ? 'first-hit' : ''}">
      Liquidated damages -${formatMoney(state.liquidatedDamages)}
    </div>
  `
}

function operatingCosts() {
  return state.laborCost + state.pushCost
}

function totalProjectCosts() {
  return operatingCosts() + state.delayCost + state.liquidatedDamages
}

function scheduleBar() {
  const duration = projectDuration()
  const progress = Math.min(100, (state.day / duration) * 100)
  const overrun = state.day > duration
  return `
    <div class="schedule ${overrun ? 'overrun' : ''}" aria-label="Project schedule">
      <div class="schedule-meta">
        <span>Start</span>
        <strong>Day ${state.day} / ${duration}</strong>
        <span>Finish</span>
      </div>
      <div class="schedule-track">
        <span class="milestone start"></span>
        <span class="schedule-fill" style="width: ${progress}%"></span>
        <span class="today-marker" style="left: ${progress}%"></span>
        <span class="milestone finish"></span>
      </div>
    </div>
  `
}

function budgetGauge() {
  const budget = projectBudget()
  const costs = totalProjectCosts()
  const costPercent = Math.min(130, (costs / budget) * 100)
  return `
    <div class="budget-gauge ${costs > budget ? 'overrun' : ''}" aria-label="Project budget and costs">
      <div class="budget-column">
        <span class="cost-fill" style="height: ${costPercent}%"></span>
        <span class="budget-marker"></span>
      </div>
      <div class="budget-labels">
        <span>Budget <strong>${formatMoney(budget)}</strong></span>
        <span>Costs <strong>${formatMoney(costs)}</strong></span>
      </div>
    </div>
  `
}

function stat(label, value, tone = '') {
  return `
    <div class="stat ${tone}">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `
}

function roundPhaseHelp() {
  if (state.roundPhase === 'rolling') return 'Dice rolling'
  if (state.roundPhase === 'moving') return 'Trades moving'
  return 'Costs updating'
}

function towerView() {
  const project = currentProject()
  return `
    <section class="tower ${project.type}-tower" aria-label="${project.name} with ${zoneCount()} zones" style="--building-asset: url('${buildingAssetForProject(project)}')">
      ${visibleLevels().map((level) => towerLevel(level)).join('')}
      <div class="ground"></div>
    </section>
  `
}

function towerLevel(level) {
  return `
    <div class="tower-level">
      <div class="level-label">Level ${level}</div>
      <div class="level-zones" style="--zone-columns: ${zoneColumns()}">
        ${zonesForLevel(level).map((zone) => towerZone(zone)).join('')}
      </div>
    </div>
  `
}

function towerZone(zoneNumber) {
  const tradesInZone = state.trades.filter((trade) => trade.zone === zoneNumber && !trade.finished)
  const roadblocks = state.roadblocks.filter((item) => item.zone === zoneNumber)
  const selected = state.selectedZone === zoneNumber
  const delayCallout = delayCalloutForZone(zoneNumber)
  return `
    <button class="tower-zone ${selected ? 'selected-zone' : ''}" data-zone="${zoneNumber}" type="button">
      <span class="zone-number">${zoneNumber}</span>
      <div class="office-work">
        ${zoneWorkLayers(zoneNumber)}
      </div>
      <div class="work-stack">
        ${tradesInZone.map((trade) => workerToken(trade)).join('')}
      </div>
      ${delayCallout ? `<span class="delay-callout">${delayCallout}</span>` : ''}
      ${roadblocks.map((roadblock) => roadblockMarker(roadblock)).join('')}
    </button>
  `
}

function zoneWorkLayers(zoneNumber) {
  return state.trades
    .filter((trade) => trade.zoneWorkWeeks[zoneNumber]?.length)
    .map((trade) => {
      const active = trade.zone === zoneNumber && !trade.finished
      const visual = visualForTrade(trade)
      return `<span class="work-layer ${visual.workClass} ${active ? 'active-work' : ''}" style="--work-asset: url('${visual.workAsset}')"></span>`
    })
    .join('')
}

function delayCalloutForZone(zoneNumber) {
  const roadblock = state.roadblocks.find((item) => {
    const trade = getTrade(item.tradeId)
    return (
      !item.resolved &&
      item.delayDays > 0 &&
      item.zone === zoneNumber &&
      trade &&
      trade.zone === zoneNumber &&
      !trade.finished
    )
  })

  if (!roadblock) return ''
  return `delay -${formatMoney(roadblock.delayDays * DAILY_DELAY_COST)}`
}

function workerToken(trade) {
  const visual = visualForTrade(trade)
  const movementClass = workerMovementClass(trade)
  const activelyFrustrated = trade.frustratedUntil > Date.now()
  const delayedByProblem = trade.delayedToday && trade.waitReason !== 'spacing'
  const frustrated = trade.morale < 70 || delayedByProblem || trade.pushedUntil > Date.now() || activelyFrustrated
  const frustrationClass = activelyFrustrated ? `frustrated frustration-${trade.frustrationReason}` : ''
  return `
    <span class="worker ${visual.workerClass} ${movementClass} ${frustrationClass} ${state.roundPhase === 'moving' && trade.pendingSteps > 0 ? 'moving' : ''}" style="--trade-color: ${trade.color}; --worker-asset: url('${visual.workerAsset}')">
      <span class="hardhat"></span>
      <span class="head"></span>
      <span class="torso"></span>
      <span class="arm arm-left"></span>
      <span class="arm arm-right"></span>
      <span class="leg leg-left"></span>
      <span class="leg leg-right"></span>
      <span class="tool"></span>
      <span class="worker-label">${tradeLabel(trade)}</span>
      ${tradeDice(trade)}
      ${frustrated ? `<span class="worker-morale">${moraleFace(trade)}</span>` : ''}
      ${activelyFrustrated ? '<span class="frustration-burst">!</span>' : ''}
    </span>
  `
}

function tradeLabel(trade) {
  return visualForTrade(trade).label
}

function workerMovementClass(trade) {
  if (!trade.previousZone || trade.previousZone === trade.zone || trade.finished) return ''
  if (usesPlanGrid()) {
    const fromRow = visualRow(trade.previousZone)
    const toRow = visualRow(trade.zone)
    const fromColumn = visualColumn(trade.previousZone)
    const toColumn = visualColumn(trade.zone)
    if (fromRow < toRow) return 'entered-from-up'
    if (fromRow > toRow) return 'entered-from-down'
    if (fromColumn < toColumn) return 'entered-from-left'
    if (fromColumn > toColumn) return 'entered-from-right'
  }

  return visualColumn(trade.previousZone) <= visualColumn(trade.zone)
    ? 'entered-from-left'
    : 'entered-from-right'
}

function roadblockMarker(roadblock) {
  const selected = state.selectedZone === roadblock.zone
  const trade = getTrade(roadblock.tradeId)
  const timer = roadblockTimer(roadblock)
  const asset = roadblockAsset(roadblock.visualKey)
  return `
    <span class="tower-blocker ${selected ? 'selected' : ''}" style="--trade-color: ${trade.color}">
      <img class="roadblock-asset" src="${asset}" alt="" aria-hidden="true">
      <span class="barricade">
        <i></i>
      </span>
      <b class="${timer < 0 ? 'negative' : ''}">${timer}</b>
    </span>
  `
}

function tradeCard(trade, index) {
  const pushing = trade.pushedUntil > Date.now()
  return `
    <article class="trade-card trade-card-${index} ${pushing ? 'pushed' : ''}">
      <span class="trade-swatch" style="background: ${trade.color}"></span>
      <div>
        <strong>${trade.name}</strong>
        <span>${tradeLocation(trade)}</span>
      </div>
      <div class="trade-status">
        <span class="face">${moraleFace(trade)}</span>
        ${tradeDice(trade)}
      </div>
      <div class="morale">
        <span style="width: ${trade.morale}%"></span>
      </div>
      ${pushing ? `<span class="push-flash">${trade.pushFlash}</span>` : ''}
    </article>
  `
}

function tradeDice(trade) {
  const rolling = state.roundPhase === 'rolling' && !trade.finished && trade.pendingSteps > 0
  const pushed = trade.pushedUntil > Date.now()
  return `
    <span class="trade-die ${rolling ? 'rolling' : ''} ${trade.lastRoll ? 'rolled' : ''} ${pushed ? 'pushed' : ''}">
      <img class="die-asset" src="${uiAsset('die')}" alt="" aria-hidden="true">
      ${trade.lastRoll ?? '?'}
    </span>
  `
}

function roadblockItem(roadblock, index) {
  const trade = getTrade(roadblock.tradeId)
  const timer = roadblockTimer(roadblock)
  const asset = roadblockAsset(roadblock.visualKey)
  return `
    <button class="roadblock ${roadblock.zone === state.selectedZone ? 'selected' : ''}" data-roadblock="${index}" style="--trade-color: ${trade.color}" type="button">
      <span class="blocker">
        <img class="roadblock-list-asset" src="${asset}" alt="" aria-hidden="true">
        !
      </span>
      <span>
        <strong>${roadblock.label}</strong>
        <small>${trade.name} · level ${zoneLevel(roadblock.zone)} bay ${zoneBay(roadblock.zone)}</small>
      </span>
      <b class="${timer < 0 ? 'negative' : ''}">${timer}</b>
    </button>
  `
}

function endScreen() {
  const margin = (state.profit / projectBudget()) * 100
  const quitButton = state.quitConfirm
    ? `<button class="restart danger ${state.endActionIndex === 1 ? 'selected-action' : ''}" type="button" data-confirm-quit>Confirm Quit</button>`
    : `<button class="restart secondary ${state.endActionIndex === 1 ? 'selected-action' : ''}" type="button" data-quit>Quit Game</button>`
  return `
    <section class="end-modal" role="dialog" aria-modal="true" aria-label="Project complete">
      <div class="end-screen">
        <div>
          <p class="eyebrow">${state.gameOver ? 'Game Over' : `Project ${state.projectRound} Complete`}</p>
          <h2>Total profit ${formatMoney(state.profit)} (${margin.toFixed(1)}%)</h2>
          ${state.gameOver ? `<p class="final-score">Final score ${formatMoney(state.totalProfit)}</p>` : `<p class="final-score">Career profit ${formatMoney(state.totalProfit)}</p>`}
        </div>
        <div class="end-stats">
          ${scheduleVarianceStat()}
          ${stat('Costs', formatMoney(totalProjectCosts()))}
          ${stat('Schedule efficiency', `${scheduleEfficiency().toFixed(0)}%`)}
        </div>
        ${state.liquidatedDamages > 0 ? `<div class="damages-flash">Liquidated damages -${formatMoney(state.liquidatedDamages)}</div>` : ''}
        ${taktPlan()}
        <div class="end-actions">
          <button class="restart ${state.endActionIndex === 0 ? 'selected-action' : ''}" type="button" data-restart>${state.gameOver ? 'New Game' : state.projectRound >= PROJECTS.length ? 'Finish Game' : 'Next Project'}</button>
          ${state.gameOver ? '' : quitButton}
        </div>
      </div>
    </section>
  `
}

function scheduleVarianceStat() {
  const variance = projectDuration() - state.day
  if (variance >= 0) return stat('Days early', `${variance} days`)
  return stat('Days late', `${Math.abs(variance)} days`, 'bad')
}

function leaderboardRows() {
  const rows = loadLeaderboard()
  if (rows.length === 0) return '<p>No scores yet</p>'
  return rows
    .map(
      (row, index) => `
        <div>
          <span>${index + 1}. ${row.name}</span>
          <span>Project ${row.project}</span>
          <b>${formatMoney(row.earnings)}</b>
        </div>
      `,
    )
    .join('')
}

function taktPlan() {
  const weeks = Array.from({ length: state.day }, (_, index) => index + 1)
  return `
    <div class="takt-plan">
      <div class="takt-title">
        <strong>As-Built Takt Plan</strong>
        <span>Working days</span>
      </div>
      <div class="zone-plan" style="--week-count: ${state.day}">
        ${tradeLegend()}
        <div class="zone-plan-header">
          <span>Zone</span>
          <div>${weeks.map((week) => `<span>${week}</span>`).join('')}</div>
        </div>
        ${Array.from({ length: levelCount() }, (_, index) => index + 1).map((level) => taktLevelGroup(level, weeks)).join('')}
      </div>
    </div>
  `
}

function taktLevelGroup(level, weeks) {
  return `
    <div class="zone-plan-group">Level ${level}</div>
    ${zonesForPlanLevel(level).map((zone) => taktZoneRow(zone, weeks)).join('')}
  `
}

function taktZoneRow(zone, weeks) {
  const entries = zonePlanEntries(zone, weeks)
  return `
    <div class="zone-plan-row" style="--lane-count: ${entries.laneCount}">
      <strong>${zone}</strong>
      <div class="zone-plan-track">
        ${zonePlanBars(entries.bars)}
      </div>
    </div>
  `
}

function zonePlanBars(bars) {
  return bars
    .map(
      ({ trade, start, end, lane }) => `
        <span
          class="plan-bar"
          style="--start: ${start}; --duration: ${end - start + 1}; --lane: ${lane}; background: ${trade.color}"
          title="${trade.name}, ${PERIOD_LABEL.toLowerCase()} ${start}-${end}"
        ></span>
      `,
    )
    .join('')
}

function zonePlanEntries(zone, weeks) {
  const spans = state.trades
    .flatMap((trade) => zoneWorkSpans(trade, zone, weeks))
    .sort((a, b) => a.start - b.start || a.end - b.end)

  const laneEnds = []
  const bars = spans.map((span) => {
    let lane = laneEnds.findIndex((end) => end < span.start)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(0)
    }
    laneEnds[lane] = span.end
    return { ...span, lane: lane + 1 }
  })

  return {
    bars,
    laneCount: Math.max(1, laneEnds.length),
  }
}

function tradeLegend() {
  return `
    <div class="trade-legend">
      <strong>Trades</strong>
      ${state.trades
        .map(
          (trade) => `
            <span>
              <i style="background: ${trade.color}"></i>
              ${trade.name}
            </span>
          `,
        )
        .join('')}
    </div>
  `
}

function scheduleEfficiency() {
  let workedDays = 0
  let elapsedDays = 0

  Array.from({ length: zoneCount() }, (_, index) => index + 1).forEach((zone) => {
    const zoneWeeks = uniqueSortedWeeksForZone(zone)
    if (zoneWeeks.length === 0) return
    workedDays += zoneWeeks.length
    elapsedDays += Math.max(1, zoneWeeks[zoneWeeks.length - 1] - zoneWeeks[0] + 1)
  })

  if (elapsedDays === 0) return 0
  return (workedDays / elapsedDays) * 100
}

function uniqueSortedWeeksForZone(zone) {
  return [
    ...new Set(
      state.trades.flatMap((trade) => trade.zoneWorkWeeks[zone] ?? []),
    ),
  ].sort((a, b) => a - b)
}

function zoneWorkSpans(trade, zone, weeks) {
  const recordedWeeks = trade.zoneWorkWeeks[zone] ?? []
  const workedWeeks = weeks.filter((week) => recordedWeeks.includes(week))

  if (workedWeeks.length === 0) return []

  const spans = []
  let start = workedWeeks[0]
  let previous = workedWeeks[0]

  workedWeeks.slice(1).forEach((week) => {
    if (week === previous + 1) {
      previous = week
      return
    }
    spans.push({ trade, start, end: previous })
    start = week
    previous = week
  })

  spans.push({ trade, start, end: previous })
  return spans
}

function zonesForPlanLevel(level) {
  const firstZone = (level - 1) * zonesPerLevel() + 1
  return Array.from({ length: zonesPerLevel() }, (_, index) => firstZone + index)
}

function bindTitle() {
  document.querySelector('[data-start]')?.addEventListener('click', () => {
    state.projectRound = 1
    state.totalProfit = 0
    state.gameOver = false
    state.phase = 'setup'
    render()
  })

  document.querySelectorAll('[data-test-project]').forEach((button) => {
    button.addEventListener('click', () => {
      state.projectRound = Number(button.dataset.testProject)
      state.totalProfit = 0
      state.gameOver = false
      state.phase = 'setup'
      render()
    })
  })
}

function bindSetup() {
  document.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      const mode = MODES[Number(button.dataset.mode)]
      if (state.projectRound === 1 && state.totalProfit === 0) {
        startCampaign(mode)
      } else {
        resetProject(mode)
      }
    })
  })
}

function bindNameEntry() {
  document.querySelector('[data-home]')?.addEventListener('click', restartAfterLeaderboard)
  document.querySelectorAll('[data-letter]').forEach((button) => {
    button.addEventListener('click', () => {
      state.nameCursor = Number(button.dataset.letter)
      selectNameKey()
    })
  })
}

function bindGameOver() {
  document.querySelector('[data-continue]')?.addEventListener('click', continueFromGameOver)
}

function bindScoreResult() {
  document.querySelector('[data-home]')?.addEventListener('click', returnToTitle)
}

function bindWin() {
  document.querySelector('[data-continue]')?.addEventListener('click', quitToLeaderboard)
}

function bindGame() {
  document.querySelectorAll('[data-zone]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedZone = Number(button.dataset.zone)
      state.focusArea = 'zones'
      render()
    })
  })

  document.querySelectorAll('[data-roadblock]').forEach((button) => {
    button.addEventListener('click', () => {
      const roadblock = state.roadblocks[Number(button.dataset.roadblock)]
      if (roadblock) state.selectedZone = roadblock.zone
      state.focusArea = 'zones'
      render()
    })
  })

  document.querySelector('[data-restart]')?.addEventListener('click', () => {
    stopTimer()
    if (state.gameOver) {
      state.projectRound = 1
      state.totalProfit = 0
      state.gameOver = false
      state.phase = 'setup'
      render()
    } else {
      startNextProject()
    }
  })

  document.querySelector('[data-quit]')?.addEventListener('click', () => {
    state.quitConfirm = true
    state.endActionIndex = 1
    render()
  })

  document.querySelector('[data-confirm-quit]')?.addEventListener('click', quitToLeaderboard)

}

window.addEventListener('keydown', (event) => {
  noteUserActivity()

  if (state.phase === 'title') {
    if (event.key.toLowerCase() === 's') {
      event.preventDefault()
      state.phase = 'setup'
      render()
    }
    return
  }

  if (state.phase === 'setup') {
    if (['1', '2', '3'].includes(event.key)) {
      event.preventDefault()
      const mode = MODES[Number(event.key) - 1]
      if (state.projectRound === 1 && state.totalProfit === 0) {
        startCampaign(mode)
      } else {
        resetProject(mode)
      }
    }
    return
  }

  if (state.phase === 'gameOver') {
    if (['s', 'enter'].includes(event.key.toLowerCase()) || event.code === 'Space') {
      event.preventDefault()
      continueFromGameOver()
    }
    return
  }

  if (state.phase === 'nameEntry') {
    if (state.scoreSaved) {
      if (['s', 'enter', 'end'].includes(event.key.toLowerCase()) || event.code === 'Space') {
        event.preventDefault()
        restartAfterLeaderboard()
      }
      return
    }

    const totalKeys = NAME_KEYS.length + NAME_ACTIONS.length
    if (event.key === 'ArrowLeft') {
      state.nameCursor = Math.max(0, state.nameCursor - 1)
    } else if (event.key === 'ArrowRight') {
      state.nameCursor = Math.min(totalKeys - 1, state.nameCursor + 1)
    } else if (event.key === 'ArrowUp') {
      state.nameCursor = Math.max(0, state.nameCursor - 7)
    } else if (event.key === 'ArrowDown') {
      state.nameCursor = Math.min(totalKeys - 1, state.nameCursor + 7)
    } else if (event.code === 'Space') {
      event.preventDefault()
      selectNameKey()
      return
    } else if (event.key === 'Enter' || event.key === 'End') {
      event.preventDefault()
      saveLeaderboardScore()
      return
    } else if (event.key === 'Backspace') {
      event.preventDefault()
      state.scoreName = state.scoreName.slice(0, -1)
    } else {
      return
    }
    event.preventDefault()
    render()
    return
  }

  if (state.phase === 'scoreResult') {
    if (['s', 'enter', 'end'].includes(event.key.toLowerCase()) || event.code === 'Space') {
      event.preventDefault()
      returnToTitle()
    }
    return
  }

  if (state.phase === 'win') {
    if (['s', 'enter'].includes(event.key.toLowerCase()) || event.code === 'Space') {
      event.preventDefault()
      quitToLeaderboard()
    }
    return
  }

  if (state.phase === 'ended') {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      state.endActionIndex = state.endActionIndex === 0 ? 1 : 0
      if (state.endActionIndex === 0) state.quitConfirm = false
      render()
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      state.endActionIndex = 0
      state.quitConfirm = false
      render()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      state.endActionIndex = 1
      render()
      return
    }

    if (event.key.toLowerCase() === 's') {
      event.preventDefault()
      startNextProject()
      return
    }

    if (event.code === 'Space' || event.key === 'Enter') {
      event.preventDefault()
      if (state.endActionIndex === 0) {
        startNextProject()
      } else if (state.quitConfirm) {
        quitToLeaderboard()
      } else {
        state.quitConfirm = true
        render()
      }
    }
    return
  }

  if (state.phase !== 'running') return

  const currentLevel = zoneLevel(state.selectedZone)
  const currentColumn = visualColumn(state.selectedZone)

  if (usesPlanGrid()) {
    const currentRow = visualRow(state.selectedZone)
    if (event.key === 'ArrowUp') {
      state.selectedZone = zoneFromPlanPosition(currentRow - 1, currentColumn)
    } else if (event.key === 'ArrowDown') {
      state.selectedZone = zoneFromPlanPosition(currentRow + 1, currentColumn)
    } else if (event.key === 'ArrowLeft') {
      state.selectedZone = zoneFromPlanPosition(currentRow, currentColumn - 1)
    } else if (event.key === 'ArrowRight') {
      state.selectedZone = zoneFromPlanPosition(currentRow, currentColumn + 1)
    } else if (event.code === 'Space') {
      event.preventDefault()
      resolveSelectedRoadblock()
      return
    } else if (event.key.toLowerCase() === 'p') {
      const trade = tradeForSelectedZonePush()
      if (trade) {
        state.selectedTradeIndex = trade.id
        pushSelectedTrade(trade)
      } else {
        addLog(`No trade to push for zone ${state.selectedZone}.`)
        render()
      }
      return
    } else {
      return
    }

    event.preventDefault()
    render()
    return
  }

  if (event.key === 'ArrowUp') {
    const nextLevel = Math.min(levelCount(), currentLevel + 1)
    state.selectedZone = zoneFromLevelAndColumn(nextLevel, currentColumn)
  } else if (event.key === 'ArrowDown') {
    const nextLevel = Math.max(1, currentLevel - 1)
    state.selectedZone = zoneFromLevelAndColumn(nextLevel, currentColumn)
  } else if (event.key === 'ArrowLeft') {
    const nextColumn = Math.max(1, currentColumn - 1)
    state.selectedZone = zoneFromLevelAndColumn(currentLevel, nextColumn)
  } else if (event.key === 'ArrowRight') {
    const nextColumn = Math.min(zonesPerLevel(), currentColumn + 1)
    state.selectedZone = zoneFromLevelAndColumn(currentLevel, nextColumn)
  } else if (event.code === 'Space') {
    event.preventDefault()
    resolveSelectedRoadblock()
    return
  } else if (event.key.toLowerCase() === 'p') {
    const trade = tradeForSelectedZonePush()
    if (trade) {
      state.selectedTradeIndex = trade.id
      pushSelectedTrade(trade)
    } else {
      addLog(`No trade to push for zone ${state.selectedZone}.`)
      render()
    }
    return
  } else {
    return
  }

  event.preventDefault()
  render()
})

window.addEventListener('pointerdown', noteUserActivity)
window.addEventListener('touchstart', noteUserActivity, { passive: true })

setRenderCallback(render)
render()
