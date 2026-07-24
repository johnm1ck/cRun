import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

const BANGKOK = [13.7563, 100.5018]
const THAILAND_BOUNDS = L.latLngBounds([5.55, 97.25], [20.48, 105.65])
const territoryColors = ['#31d696', '#8e62e8', '#238be6', '#f37a55', '#d6dc47', '#55bf71', '#32b9b5']

const territories = [
  [[13.80, 100.43], [13.84, 100.49], [13.81, 100.54], [13.76, 100.51], [13.76, 100.45]],
  [[13.84, 100.49], [13.87, 100.57], [13.82, 100.60], [13.81, 100.54]],
  [[13.76, 100.45], [13.76, 100.51], [13.72, 100.53], [13.70, 100.47], [13.72, 100.42]],
  [[13.81, 100.54], [13.82, 100.60], [13.76, 100.62], [13.75, 100.56], [13.76, 100.51]],
  [[13.76, 100.51], [13.75, 100.56], [13.70, 100.58], [13.68, 100.52], [13.72, 100.53]],
  [[13.70, 100.47], [13.72, 100.53], [13.68, 100.52], [13.65, 100.45]],
  [[13.87, 100.45], [13.84, 100.49], [13.80, 100.43], [13.81, 100.37], [13.86, 100.38]],
  [[13.76, 100.62], [13.82, 100.60], [13.81, 100.67], [13.74, 100.68]],
  [[13.68, 100.52], [13.70, 100.58], [13.66, 100.64], [13.62, 100.57]],
  [[13.72, 100.42], [13.70, 100.47], [13.65, 100.45], [13.66, 100.38]],
]

const partners = [
  ['MK', 13.744, 100.534, '#e83c49'], ['J', 13.751, 100.501, '#ff7043'],
  ['AM', 13.762, 100.566, '#f6c344'], ['CP', 13.735, 100.56, '#e53935'],
  ['BB', 13.785, 100.533, '#f58d42'], ['K', 13.71, 100.512, '#50b55b'],
  ['PL', 13.802, 100.557, '#5a8bd8'], ['S&P', 13.728, 100.586, '#4f6fb2'],
  ['C', 13.773, 100.611, '#e36f9b'], ['G', 13.69, 100.546, '#5dbb63'],
  ['Y', 13.823, 100.48, '#f6a623'], ['JJ', 13.793, 100.445, '#9858b8'],
  ['P', 13.683, 100.486, '#2eb9aa'], ['BR', 13.746, 100.64, '#ec6c3e'],
  ['N', 13.855, 100.52, '#4e9bdb'], ['TB', 13.718, 100.435, '#ba884f'],
]

function TerritoryMap({ showPartners, locateSignal }) {
  const mapNode = useRef(null)
  const map = useRef(null)
  const partnerLayer = useRef(null)
  const userMarker = useRef(null)
  const [locationState, setLocationState] = useState('')

  useEffect(() => {
    if (!mapNode.current || map.current) return
    map.current = L.map(mapNode.current, {
      center: BANGKOK,
      zoom: 11,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      maxBounds: THAILAND_BOUNDS,
      maxBoundsViscosity: 1,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map.current)

    territories.forEach((points, index) => {
      L.polygon(points, {
        color: territoryColors[index % territoryColors.length],
        weight: 1.2,
        opacity: 0.85,
        fillColor: territoryColors[index % territoryColors.length],
        fillOpacity: 0.35,
        interactive: false,
      }).addTo(map.current)
    })

    partnerLayer.current = L.layerGroup()
    partners.forEach(([name, lat, lng, color]) => {
      const icon = L.divIcon({
        className: 'partner-marker-wrap',
        html: `<span class="partner-marker" style="--marker:${color}">${name}</span>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })
      L.marker([lat, lng], { icon }).addTo(partnerLayer.current)
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    if (!map.current || !partnerLayer.current) return
    if (showPartners) partnerLayer.current.addTo(map.current)
    else partnerLayer.current.remove()
  }, [showPartners])

  useEffect(() => {
    if (!map.current) return
    if (!navigator.geolocation) {
      setLocationState('Location unavailable')
      return
    }
    setLocationState('Finding you…')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const current = L.latLng(coords.latitude, coords.longitude)
        const inThailand = THAILAND_BOUNDS.contains(current)
        const visiblePosition = inThailand ? current : L.latLng(BANGKOK)
        if (userMarker.current) userMarker.current.setLatLng(visiblePosition)
        else {
          userMarker.current = L.circleMarker(visiblePosition, {
            radius: 9,
            color: '#fff',
            weight: 4,
            fillColor: '#42a5ff',
            fillOpacity: 1,
          }).addTo(map.current)
        }
        map.current.flyTo(visiblePosition, 13, { duration: 0.8 })
        setLocationState(inThailand ? 'Current location' : 'Showing Bangkok')
      },
      () => {
        if (!userMarker.current) {
          userMarker.current = L.circleMarker(BANGKOK, {
            radius: 9, color: '#fff', weight: 4, fillColor: '#42a5ff', fillOpacity: 1,
          }).addTo(map.current)
        }
        map.current.flyTo(BANGKOK, 12, { duration: 0.8 })
        setLocationState('Bangkok demo location')
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 300000 },
    )
  }, [locateSignal])

  return (
    <>
      <div className="map" ref={mapNode} />
      {locationState && <div className="location-toast">{locationState}</div>}
    </>
  )
}

export default TerritoryMap
