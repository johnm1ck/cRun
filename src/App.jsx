import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  ArrowLeft,
  Bell,
  ChevronRight,
  CircleDollarSign,
  Eye,
  EyeOff,
  Footprints,
  Heart,
  LocateFixed,
  Layers,
  Map as MapIcon,
  Palette,
  Pause,
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
const captureColors = [
  { name: 'เขียว', value: 'var(--capture-region-green)' },
  { name: 'เทอร์ควอยซ์', value: 'var(--capture-region-turquoise)' },
  { name: 'ฟ้า', value: 'var(--capture-region-blue)' },
  { name: 'คอรัล', value: 'var(--capture-region-coral)' },
  { name: 'ม่วง', value: 'var(--capture-region-violet)' },
]

function routeFromHash() {
  const hash = window.location.hash.replace('#', '')
  return routes.includes(hash) ? hash : 'play'
}

function App() {
  const [page, setPage] = useState(routeFromHash)
  const [runStage, setRunStage] = useState('idle')

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
      {page === 'play' && <PlayPage navigate={navigate} runStage={runStage} setRunStage={setRunStage} />}
      {page === 'health' && <HealthPage navigate={navigate} />}
      {page === 'donation' && <DonationPage navigate={navigate} />}
      {runStage === 'idle' && <BottomNav />}
    </main>
  )
}

function TopBar({ active = 'map', navigate }) {
  return (
    <header className="top-bar">
      <button className="brand-mark" aria-label="หน้าหลัก cRun" onClick={() => navigate('play')}>
        <span>c</span>R
      </button>
      <nav className="mode-switch" aria-label="ส่วนต่าง ๆ ของแอป">
        <button className={active === 'map' ? 'active' : ''} onClick={() => navigate('play')}>แผนที่</button>
        <button className={active === 'health' ? 'active' : ''} onClick={() => navigate('health')}>สุขภาพ</button>
        <button className={active === 'donation' ? 'active' : ''} onClick={() => navigate('donation')}>บริจาค</button>
      </nav>
      <button className="icon-button notification" aria-label="การแจ้งเตือน"><Bell size={21} /></button>
    </header>
  )
}

function PlayPage({ navigate, runStage, setRunStage }) {
  const [showPartners, setShowPartners] = useState(false)
  const [locateSignal, setLocateSignal] = useState(0)

  if (runStage !== 'idle') {
    return <RunSession stage={runStage} setStage={setRunStage} />
  }

  return (
    <section className="map-screen">
      <TopBar navigate={navigate} />
      <div className="map-wrap">
        <TerritoryMap showPartners={showPartners} locateSignal={locateSignal} />
        <div className="map-stat"><MapIcon size={17} /> <strong>2.84</strong> ตร.กม.</div>
        <button className="map-control locate" onClick={() => setLocateSignal((value) => value + 1)} aria-label="ค้นหาตำแหน่งของฉัน">
          <LocateFixed size={22} />
        </button>
        <div className="map-actions">
          <button
            className={`partner-toggle ${showPartners ? 'selected' : ''}`}
            onClick={() => setShowPartners((visible) => !visible)}
            aria-label={showPartners ? 'ซ่อนร้านค้าพาร์ทเนอร์' : 'แสดงร้านค้าพาร์ทเนอร์'}
          >
            {showPartners ? <EyeOff size={22} /> : <Eye size={22} />}
            <span>{showPartners ? 'แสดงพาร์ทเนอร์' : 'พาร์ทเนอร์'}</span>
          </button>
          <div className="runner-card">
            <span className="runner-avatar">TW</span>
            <div><strong>Te Waramet</strong><small>นักยึดพื้นที่ · #247</small></div>
          </div>
          <button className="start-button" onClick={() => setRunStage('running')}><Footprints size={21} /> เริ่ม</button>
        </div>
        {showPartners && <div className="partner-hint"><ShoppingBag size={15} /> ร้านค้าพาร์ทเนอร์ 16 แห่งใกล้คุณ</div>}
      </div>
    </section>
  )
}

function RunSession({ stage, setStage }) {
  const [seconds, setSeconds] = useState(0)
  const [runPath, setRunPath] = useState([])
  const [loopClosed, setLoopClosed] = useState(false)
  const [captureColor, setCaptureColor] = useState(captureColors[0].value)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const holdTimer = useRef(null)

  useEffect(() => {
    if (stage !== 'running') return undefined
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [stage])

  useEffect(() => {
    if (stage !== 'running' || loopClosed || !navigator.geolocation) return undefined

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const point = [coords.latitude, coords.longitude]
        setRunPath((currentPath) => {
          if (currentPath.length === 0) return [point]

          const lastPoint = currentPath[currentPath.length - 1]
          if (distanceBetween(lastPoint, point) < 2) return currentPath

          const nextPath = [...currentPath, point]
          const travelled = pathDistance(nextPath)
          const nearStart = distanceBetween(nextPath[0], point) <= 15

          if (nextPath.length >= 6 && travelled >= 40 && nearStart) {
            setLoopClosed(true)
            return [...nextPath, nextPath[0]]
          }

          return nextPath
        })
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [stage, loopClosed])

  useEffect(() => () => window.clearTimeout(holdTimer.current), [])

  const finishRun = () => setStage('summary')
  const beginFinishHold = () => {
    window.clearTimeout(holdTimer.current)
    holdTimer.current = window.setTimeout(finishRun, 900)
  }
  const cancelFinishHold = () => window.clearTimeout(holdTimer.current)
  const duration = formatDuration(seconds)
  const trackedDistance = pathDistance(runPath) / 1000
  const distance = (trackedDistance || Math.min(seconds * 0.002, 0.99)).toFixed(2)
  const capturedArea = loopClosed ? Math.max(polygonArea(runPath), 1).toFixed(2) : '0.00'

  if (stage === 'summary') {
    return (
      <section className="run-session summary-session">
        <div className="run-map summary-map">
          <TerritoryMap
            showPartners={false}
            locateSignal={0}
            runMode
            runPath={runPath}
            loopClosed={loopClosed}
            captureColor={captureColor}
          />
          <button className="run-pill resume-pill" onClick={() => setStage('running')}>
            <ArrowLeft size={20} /> วิ่งต่อ
          </button>
        </div>
        <div className="summary-sheet">
          <strong className="captured-area">{capturedArea}<small>ม²</small></strong>
          <span className={`capture-status ${loopClosed ? 'complete' : ''}`}>
            <Route size={14} /> {loopClosed ? 'ยึดพื้นที่สำเร็จ' : 'ยังไม่ปิดเส้นทาง'}
          </span>
          <div className="run-title">วิ่งในกรุงเทพฯ <span>✎</span></div>
          <div className="run-metrics summary-metrics">
            <RunMetric label="ระยะทาง" value={distance === '0.00' ? '0.01' : distance} unit="กม." />
            <RunMetric label="ระยะเวลา" value={duration === '0:00' ? '0:49' : duration} />
            <RunMetric label="เพซเฉลี่ย" value="6:18" unit="/กม." />
          </div>
          <textarea aria-label="บันทึกเกี่ยวกับการวิ่ง" placeholder="เล่าเกี่ยวกับการวิ่งของคุณ…" />
          <button className="log-run-button" onClick={() => setStage('idle')}>บันทึกการวิ่ง</button>
        </div>
      </section>
    )
  }

  return (
    <section className={`run-session ${stage === 'paused' ? 'is-paused' : ''}`}>
      <div className="run-map">
        <TerritoryMap
          showPartners={false}
          locateSignal={0}
          runMode
          runPath={runPath}
          loopClosed={loopClosed}
          captureColor={captureColor}
        />
        <button className="run-circle back" aria-label="ออกจากการวิ่ง" onClick={() => setStage('idle')}><ArrowLeft /></button>
        <div className="run-map-tools">
          <button className="run-circle" aria-label="ค้นหาตำแหน่งของฉัน"><LocateFixed /></button>
          <button className="run-circle" aria-label="ชั้นข้อมูลแผนที่"><Layers /></button>
        </div>
        <div className="color-picker">
          <button
            className="color-button"
            onClick={() => setPaletteOpen((open) => !open)}
            aria-expanded={paletteOpen}
          >
            <Palette size={17} /> สี
            <i style={{ background: captureColor }} />
          </button>
          {paletteOpen && (
            <div className="color-palette" aria-label="เลือกสีพื้นที่">
              {captureColors.map((color) => (
                <button
                  key={color.name}
                  className={captureColor === color.value ? 'selected' : ''}
                  style={{ '--swatch': color.value }}
                  onClick={() => {
                    setCaptureColor(color.value)
                    setPaletteOpen(false)
                  }}
                  aria-label={`สี${color.name}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="run-sheet">
        <strong className="captured-area">{capturedArea}<small>ม²</small></strong>
        <span className={`capture-status ${loopClosed ? 'complete' : ''}`}>
          {loopClosed ? <Route size={14} /> : <span className="spinner" />}
          {loopClosed ? 'ปิดเส้นทางและยึดพื้นที่แล้ว' : 'กำลังยึดพื้นที่'}
        </span>
        {stage === 'paused' && <div className="finishing-run"><span>⚑ กำลังจบการวิ่ง</span></div>}
        <div className="run-metrics">
          <RunMetric label="ระยะทาง" value={distance} unit="กม." />
          <RunMetric label="ระยะเวลา" value={duration} />
          <RunMetric label="เพซ" value={seconds > 0 ? '6:18' : '0:00'} unit="/กม." />
        </div>
        {stage === 'running' ? (
          <button className="pause-run-button" onClick={() => setStage('paused')}><Pause size={21} /> หยุดชั่วคราว</button>
        ) : (
          <div className="paused-actions">
            <button className="resume-run-button" onClick={() => setStage('running')}><Play size={22} /> วิ่งต่อ</button>
            <button
              className="finish-run-button"
              onPointerDown={beginFinishHold}
              onPointerUp={cancelFinishHold}
              onPointerLeave={cancelFinishHold}
              onPointerCancel={cancelFinishHold}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') finishRun()
              }}
            >
              ⚑ กดค้างเพื่อจบ
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

function RunMetric({ label, value, unit }) {
  return <div><span>{label}</span><strong>{value}<small>{unit}</small></strong></div>
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainder = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${remainder}`
}

function distanceBetween([lat1, lng1], [lat2, lng2]) {
  const radius = 6371000
  const toRadians = (value) => value * Math.PI / 180
  const deltaLat = toRadians(lat2 - lat1)
  const deltaLng = toRadians(lng2 - lng1)
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLng / 2) ** 2
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function pathDistance(points) {
  return points.slice(1).reduce(
    (total, point, index) => total + distanceBetween(points[index], point),
    0,
  )
}

function polygonArea(points) {
  if (points.length < 4) return 0
  const latitude = points.reduce((sum, point) => sum + point[0], 0) / points.length
  const metersPerLng = 111320 * Math.cos(latitude * Math.PI / 180)
  const metersPerLat = 110540

  return Math.abs(points.reduce((area, point, index) => {
    const next = points[(index + 1) % points.length]
    const x1 = point[1] * metersPerLng
    const y1 = point[0] * metersPerLat
    const x2 = next[1] * metersPerLng
    const y2 = next[0] * metersPerLat
    return area + (x1 * y2 - x2 * y1)
  }, 0)) / 2
}

function HealthPage({ navigate }) {
  return (
    <section className="content-screen">
      <TopBar active="health" navigate={navigate} />
      <div className="scroll-content">
        <div className="page-intro">
          <p className="eyebrow">วันศุกร์ที่ 24 กรกฎาคม</p>
          <h1>สุขภาพของคุณวันนี้</h1>
          <p>ซิงค์กับ Apple Watch เวลา 16:41 น.</p>
        </div>
        <section className="step-hero">
          <div className="ring" style={{ '--progress': '78%' }}>
            <div><Footprints size={24} /><strong>8,426</strong><span>จากเป้าหมาย 10,000 ก้าว</span></div>
          </div>
          <div className="step-copy">
            <span className="status-pill"><Sparkles size={14} /> ทำได้ดีมาก</span>
            <h2>เหลืออีก 1,574 ก้าว</h2>
            <p>วันนี้คุณเดินมากกว่าค่าเฉลี่ย 7 วัน</p>
          </div>
        </section>
        <div className="metric-grid">
          <Metric icon={<Route />} label="ระยะทาง" value="6.3" unit="กม." tone="lime" />
          <Metric icon={<Zap />} label="พลังงานที่ใช้" value="412" unit="กิโลแคลอรี" tone="orange" />
          <Metric icon={<Heart />} label="อัตราการเต้นหัวใจ" value="78" unit="ครั้ง/นาที" tone="pink" />
          <Metric icon={<Activity />} label="เวลาเคลื่อนไหว" value="68" unit="นาที" tone="blue" />
        </div>
        <section className="insight-card">
          <div className="card-heading"><div><p className="eyebrow">การเคลื่อนไหววันนี้</p><h2>กิจกรรมรายชั่วโมง</h2></div><span>68 นาที</span></div>
          <div className="activity-chart" aria-label="กราฟกิจกรรมรายชั่วโมง">
            {[18, 25, 20, 36, 55, 43, 76, 62, 88, 48, 70, 92].map((height, index) => (
              <i key={index} style={{ height: `${height}%` }} className={index === 11 ? 'current' : ''} />
            ))}
          </div>
          <div className="chart-labels"><span>06:00</span><span>10:00</span><span>14:00</span><span>ตอนนี้</span></div>
        </section>
        <section className="compact-card"><Trophy /><div><strong>ต่อเนื่อง 3 วัน</strong><span>เคลื่อนไหวอีกหนึ่งวันก็จะแซงสัปดาห์ที่แล้ว</span></div><ChevronRight /></section>
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
          <p className="eyebrow">ผลลัพธ์ของคุณ</p>
          <h1>ทุกก้าวเปลี่ยนเป็นการให้</h1>
          <p>พาร์ทเนอร์ร่วมบริจาคตามจำนวนก้าวที่คุณเดิน</p>
        </div>
        <section className="donation-hero">
          <div className="donation-icon"><CircleDollarSign /></div>
          <p>ยอดบริจาคที่ปลดล็อกวันนี้</p>
          <strong>฿84.26</strong>
          <div className="donation-progress"><span /></div>
          <div className="progress-copy"><span>8,426 ก้าว</span><span>เป้าหมาย ฿100 ต่อวัน</span></div>
        </section>
        <section className="partner-message">
          <div><Heart size={20} /></div>
          <p><strong>คุณขยับ พาร์ทเนอร์ของเราร่วมให้</strong> คุณไม่ต้องจ่ายเงิน พาร์ทเนอร์ร้านอาหารและสุขภาพของ cRun จะเปลี่ยนก้าวที่ตรวจสอบแล้วเป็นเงินบริจาคให้องค์กรการกุศลไทย</p>
        </section>
        <div className="impact-summary">
          <div><span>ยอดบริจาคทั้งหมด</span><strong>฿1,284</strong></div>
          <div><span>จำนวนก้าวที่บริจาค</span><strong>128,420</strong></div>
        </div>
        <section className="charities">
          <div className="card-heading"><div><p className="eyebrow">เดือนนี้</p><h2>องค์กรที่คุณสนับสนุน</h2></div><button>ดูทั้งหมด</button></div>
          <CharityRow color="var(--charity-sos)" initials="SC" name="Scholars of Sustenance" cause="ช่วยเหลืออาหารส่วนเกินในกรุงเทพฯ" amount="฿642" />
          <CharityRow color="var(--charity-food-school)" initials="TF" name="โครงการ Food School" cause="ส่งมอบอาหารให้ชุมชน" amount="฿385" />
          <CharityRow color="var(--charity-kindness)" initials="BK" name="Bangkok Kindness" cause="สนับสนุนสุขภาพชุมชน" amount="฿257" />
        </section>
        <section className="compact-card"><Users /><div><strong>นักวิ่ง 12,408 คนกำลังร่วมกันสร้างการเปลี่ยนแปลง</strong><span>บริจาคแล้ว ฿248,930 ทั่วกรุงเทพฯ ในเดือนนี้</span></div></section>
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
    <nav className="bottom-nav" aria-label="เมนูหลัก">
      <button><span><Users size={23} /></span><small>ฉัน</small></button>
      <button className="active"><span><Play size={22} fill="currentColor" /></span><small>เล่น</small></button>
      <button><span><Users size={24} /></span><small>สังคม</small></button>
    </nav>
  )
}

export default App
