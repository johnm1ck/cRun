import { useEffect, useState } from 'react'
import {
  Activity,
  Bell,
  ChevronRight,
  CircleDollarSign,
  Eye,
  EyeOff,
  Footprints,
  Heart,
  LocateFixed,
  Map as MapIcon,
  Play,
  Route,
  ShoppingBag,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import TerritoryMap from './components/TerritoryMap.jsx'

const routes = ['play', 'health', 'donation']

function routeFromHash() {
  const hash = window.location.hash.replace('#', '')
  return routes.includes(hash) ? hash : 'play'
}

function App() {
  const [page, setPage] = useState(routeFromHash)

  useEffect(() => {
    const onHashChange = () => setPage(routeFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (nextPage) => {
    window.location.hash = nextPage === 'play' ? '' : nextPage
    setPage(nextPage)
  }

  return (
    <main className="app-shell">
      {page === 'play' && <PlayPage navigate={navigate} />}
      {page === 'health' && <HealthPage navigate={navigate} />}
      {page === 'donation' && <DonationPage navigate={navigate} />}
      <BottomNav />
    </main>
  )
}

function TopBar({ active = 'map', navigate }) {
  return (
    <header className="top-bar">
      <button className="brand-mark" aria-label="cRun home" onClick={() => navigate('play')}>
        <span>c</span>R
      </button>
      <nav className="mode-switch" aria-label="App sections">
        <button className={active === 'map' ? 'active' : ''} onClick={() => navigate('play')}>Map</button>
        <button className={active === 'health' ? 'active' : ''} onClick={() => navigate('health')}>Health</button>
        <button className={active === 'donation' ? 'active' : ''} onClick={() => navigate('donation')}>Donation</button>
      </nav>
      <button className="icon-button notification" aria-label="Notifications"><Bell size={21} /></button>
    </header>
  )
}

function PlayPage({ navigate }) {
  const [showPartners, setShowPartners] = useState(false)
  const [locateSignal, setLocateSignal] = useState(0)

  return (
    <section className="map-screen">
      <TopBar navigate={navigate} />
      <div className="map-wrap">
        <TerritoryMap showPartners={showPartners} locateSignal={locateSignal} />
        <div className="map-stat"><MapIcon size={17} /> <strong>2.84</strong> km²</div>
        <button className="map-control locate" onClick={() => setLocateSignal((value) => value + 1)} aria-label="Find my location">
          <LocateFixed size={22} />
        </button>
        <div className="map-actions">
          <button
            className={`partner-toggle ${showPartners ? 'selected' : ''}`}
            onClick={() => setShowPartners((visible) => !visible)}
            aria-label={showPartners ? 'Hide food partners' : 'Show food partners'}
          >
            {showPartners ? <EyeOff size={22} /> : <Eye size={22} />}
            <span>{showPartners ? 'Partners on' : 'Partners'}</span>
          </button>
          <div className="runner-card">
            <span className="runner-avatar">TW</span>
            <div><strong>Te Waramet</strong><small>Territory Ruler · #247</small></div>
          </div>
          <button className="start-button"><Footprints size={21} /> Start</button>
        </div>
        {showPartners && <div className="partner-hint"><ShoppingBag size={15} /> 16 food partners nearby</div>}
      </div>
    </section>
  )
}

function HealthPage({ navigate }) {
  return (
    <section className="content-screen">
      <TopBar active="health" navigate={navigate} />
      <div className="scroll-content">
        <div className="page-intro">
          <p className="eyebrow">Friday, 24 July</p>
          <h1>Your body in motion.</h1>
          <p>Synced with Apple Watch at 16:41</p>
        </div>
        <section className="step-hero">
          <div className="ring" style={{ '--progress': '78%' }}>
            <div><Footprints size={24} /><strong>8,426</strong><span>of 10,000 steps</span></div>
          </div>
          <div className="step-copy">
            <span className="status-pill"><Sparkles size={14} /> Great pace</span>
            <h2>1,574 to your goal</h2>
            <p>You’re ahead of your 7-day average.</p>
          </div>
        </section>
        <div className="metric-grid">
          <Metric icon={<Route />} label="Distance" value="6.3" unit="km" tone="lime" />
          <Metric icon={<Zap />} label="Active energy" value="412" unit="kcal" tone="orange" />
          <Metric icon={<Heart />} label="Heart rate" value="78" unit="bpm" tone="pink" />
          <Metric icon={<Activity />} label="Active time" value="68" unit="min" tone="blue" />
        </div>
        <section className="insight-card">
          <div className="card-heading"><div><p className="eyebrow">Today’s movement</p><h2>Activity by hour</h2></div><span>68 min</span></div>
          <div className="activity-chart" aria-label="Hourly activity chart">
            {[18, 25, 20, 36, 55, 43, 76, 62, 88, 48, 70, 92].map((height, index) => (
              <i key={index} style={{ height: `${height}%` }} className={index === 11 ? 'current' : ''} />
            ))}
          </div>
          <div className="chart-labels"><span>6a</span><span>10a</span><span>2p</span><span>Now</span></div>
        </section>
        <section className="compact-card"><Trophy /><div><strong>3 day streak</strong><span>One more active day beats last week.</span></div><ChevronRight /></section>
      </div>
    </section>
  )
}

function Metric({ icon, label, value, unit, tone }) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}<small>{unit}</small></strong>
    </article>
  )
}

function DonationPage({ navigate }) {
  return (
    <section className="content-screen donation-screen">
      <TopBar active="donation" navigate={navigate} />
      <div className="scroll-content">
        <div className="page-intro">
          <p className="eyebrow">Your impact</p>
          <h1>Steps that give back.</h1>
          <p>Partner-funded donations, powered by your movement.</p>
        </div>
        <section className="donation-hero">
          <div className="donation-icon"><CircleDollarSign /></div>
          <p>Unlocked today</p>
          <strong>฿84.26</strong>
          <div className="donation-progress"><span /></div>
          <div className="progress-copy"><span>8,426 steps</span><span>฿100 daily goal</span></div>
        </section>
        <section className="partner-message">
          <div><Heart size={20} /></div>
          <p><strong>You move. Our partners give.</strong> You never pay anything. cRun’s food and wellness partners convert verified steps into donations for Thai charities.</p>
        </section>
        <div className="impact-summary">
          <div><span>All-time impact</span><strong>฿1,284</strong></div>
          <div><span>Steps donated</span><strong>128,420</strong></div>
        </div>
        <section className="charities">
          <div className="card-heading"><div><p className="eyebrow">This month</p><h2>Your charities</h2></div><button>View all</button></div>
          <CharityRow color="var(--charity-sos)" initials="SC" name="Scholars of Sustenance" cause="Food rescue in Bangkok" amount="฿642" />
          <CharityRow color="var(--charity-food-school)" initials="TF" name="The Food School Project" cause="Meals for local communities" amount="฿385" />
          <CharityRow color="var(--charity-kindness)" initials="BK" name="Bangkok Kindness" cause="Community health support" amount="฿257" />
        </section>
        <section className="compact-card"><Users /><div><strong>12,408 runners moving together</strong><span>฿248,930 donated across Bangkok this month.</span></div></section>
      </div>
    </section>
  )
}

function CharityRow({ color, initials, name, cause, amount }) {
  return (
    <article className="charity-row">
      <span className="charity-logo" style={{ background: color }}>{initials}</span>
      <div><strong>{name}</strong><span>{cause}</span></div>
      <b>{amount}</b>
    </article>
  )
}

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <button><span><Users size={23} /></span><small>Me</small></button>
      <button className="active"><span><Play size={22} fill="currentColor" /></span><small>Play</small></button>
      <button><span><Users size={24} /></span><small>Social</small></button>
    </nav>
  )
}

export default App
