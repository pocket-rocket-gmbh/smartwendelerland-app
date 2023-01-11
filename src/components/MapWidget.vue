<template>
  <div class="mapwidget" :id="mapWidgetId"></div>
</template>

<script lang="ts">
import { defineComponent, PropType, onMounted } from 'vue'
import L from 'leaflet'
import { MapLocation } from '@/types/MapLocation'

class LocationMarker extends L.Marker {

  id: string

  constructor(id: string, latLng: L.LatLngExpression, options?: L.MarkerOptions) {
    super(latLng, options)
    this.id = id
  }

  getId() {
    return this.id
  }
}

export default defineComponent({
  name: 'MapWidget',
  props: {
    zoomControl: {
      type: Boolean,
      default: true
    },
    minZoom: {
      type: Number,
      default: 1
    },
    maxZoom: {
      type: Number,
      default: 17
    },
    defaultZoom: {
      type: Number
    },
    autoFit: {
      type: Boolean,
      default: false
    },
    locations: {
      type: Array as PropType<MapLocation[]>,
      default(): MapLocation[] {
        return []
      }
    },
    centerPoint: {
      type: Object as PropType<L.LatLngExpression>
    },
    zoom: {
      type: Boolean,
      default: true
    },
    centerZoom: {
      type: Boolean,
      default: false
    },
    drag: {
      type: Boolean,
      default: true
    },
    tap: {
      type: Boolean,
      default: true
    },
    attributionFontSize: {
      type: Number,
      default: 12
    }
  },
  emits: [
    'markerClick', 'scroll'
  ],
  setup(props: any, { emit }) {

    // Timeout for loading the map locations. This ensures that all plugins have been loaded (they are dynamically added to the DOM during mounting).
    const mapTimeoutBase = 80

    const mapMarkerIcon = L.icon({
        iconUrl: '/map-marker-blue.png',
        shadowUrl: null,

        iconSize:     [60, 60], // size of the icon
        shadowSize:   [0, 0], // size of the shadow
        iconAnchor:   [30, 51], // point of the icon which will correspond to marker's location
        shadowAnchor: [0, 0],  // the same for the shadow
        popupAnchor:  [-5, -55] // point from which the popup should open relative to the iconAnchor
    });

    const mapWidgetId = 'map' + Math.floor(Math.random() * 100000000000) // THIS IS A WORKAROUND  'const mapWidgetId = 'map' + self.crypto.randomUUID()'

    let locationMarkers: Array<LocationMarker> = []
    let map: L.Map = null
    let clusterlayer: any = null

    let programmaticScrollInProgress = false

    onMounted(() => {

      // Load mask plugin to grey out any area outside the Landkreis.
      const maskPlugin = document.createElement("script")
      maskPlugin.setAttribute(
        "src",
        "/js/leaflet.mask.js"
      )
      document.head.appendChild(maskPlugin)

      // Load clustering plugin to create marker clusters for zoomed out areas.
      const clusterPlugin = document.createElement("script")
      clusterPlugin.setAttribute(
        "src",
        "/js/leaflet.markercluster-src.js"
      )
      document.head.appendChild(clusterPlugin)

      map = L.map(mapWidgetId, {
        zoomControl: props.zoomControl
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { // TODO make configurable (e.g. environment varaible)
        minZoom: props.minZoom,
        maxZoom: props.maxZoom
      }).addTo(map)

      createAttribution()

      if (!props.zoom) {
        disableZoom()
      }
      else {
        // Enable mouse wheel zoom after map has been clicked once to avoid zooming when scrolling over the page.
        map.scrollWheelZoom.disable()
        map.once('focus', function() { map.scrollWheelZoom.enable() })
      }

      if (props.centerZoom) {
        enableCenterZoom()
      }

      if (!props.drag) {
        disableDragging()
      }

      if (!props.tap) {
        disableTapping()
      }

      map.on('moveend', function() {
        if (!programmaticScrollInProgress)
        {
          emit('scroll')
        }
      })

      if (props.centerPoint) {
        programmaticScrollInProgress = true
        map.setView(props.centerPoint, getZoom())
        programmaticScrollInProgress = false
      }

      refreshView()

      setTimeout(() => { // Need to wait for the DOM to be completely loaded for the mask plugin to be active.
        // @ts-ignore:
        L.mask('/LKWND.geojson', { fillOpacity: 0.7 }).addTo(map)
      }, mapTimeoutBase) // Note: This timeout must be smaller than the timout of the automatic viewport calculation (see below).
    })

    const refreshView = () => {

      if (clusterlayer) {
        clusterlayer.clearLayers()
        clusterlayer = null
      }

      locationMarkers = []

      setTimeout(() => { // Need to wait for the DOM to be completely loaded for the markercluster plugin to be active.

        // @ts-ignore:
        clusterlayer = L.markerClusterGroup({
          iconCreateFunction: function (cluster: any) {
            return L.divIcon({ html: cluster.getAllChildMarkers().length.toString(), className: 'clustericon', iconSize: L.point(40, 40) });
          },
          showCoverageOnHover: false
        })

        props.locations.forEach((location: MapLocation) => {
          const marker = new LocationMarker(location.id, [location.latitude, location.longitude], { icon: mapMarkerIcon, draggable: location.draggable })

          if (location.tooltipHtml) {
            marker.bindTooltip(location.tooltipHtml)
          }

          locationMarkers.push(marker)
          clusterlayer.addLayer(marker)
        })

        clusterlayer.on('click', function (marker: any) {
          emit('markerClick', marker.layer)
        })

        map.addLayer(clusterlayer)
      }, mapTimeoutBase + 10)

      // Calculate viewport after timeout to make sure the page is already properly initialized.
      setTimeout(function () {
        programmaticScrollInProgress = true
        if (props.autoFit && locationMarkers.length > 0) {
          const group: L.FeatureGroup<any> = L.featureGroup(locationMarkers)
          map.fitBounds(group.getBounds())
        }
        map.invalidateSize()
        programmaticScrollInProgress = false
      }, mapTimeoutBase + 20) // Note: The timeout must be larger than the timeout of the mask layer (see above).
    }

    const getZoom = () => {
      if (props.defaultZoom) {
        return props.defaultZoom
      }

      return props.minZoom
    }

    const getLocations = (): Array<MapLocation> => {

      const result: Array<MapLocation> = []

      locationMarkers.forEach((element) => {
        result.push({
          id: element.getId(),
          longitude: element.getLatLng().lng,
          latitude: element.getLatLng().lat,
          draggable: false,
          tooltipHtml: null // Not needed for location information.
        })
      })

      return result
    }

    const getVisibleRectangle = () => {
      return map.getBounds()
    }

    const createAttribution = () => {
      map.attributionControl.addAttribution(`<span style="font-size: ${props.attributionFontSize}px">© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors</span>`)
      map.attributionControl.setPrefix('')
      map.attributionControl.getContainer().style.height = `${props.attributionFontSize + 4}px`
      map.attributionControl.getContainer().style.paddingRight = '2px'
      map.attributionControl.getContainer().style.paddingLeft = '2px'
      map.attributionControl.getContainer().style.paddingTop = getTopPaddingFromFontSize(props.attributionFontSize)
      map.attributionControl.getContainer().style.lineHeight = `${props.attributionFontSize}px`
    }

    const getTopPaddingFromFontSize = (fontsize: number) => {
      if (fontsize < 8) {
        return '0px'
      }
      else if (fontsize < 10) {
        return '1px'
      }
      else {
        return '2px'
      }
    }

    const disableAll = () => {
      disableZoom()
      disableDragging()
      disableTapping()
    }

    const disableZoom = () => {
      map.touchZoom.disable()
      map.doubleClickZoom.disable()
      map.scrollWheelZoom.disable()
      map.boxZoom.disable()
      map.keyboard.disable()
    }

    const enableCenterZoom = () => {
      map.options.scrollWheelZoom = "center"
    }

    const disableDragging = () => {
      map.dragging.disable()
      map.keyboard.disable()
    }

    const disableTapping = () => {
      if (map.tap) {
        map.tap.disable()
      }
    }

    return {
      mapWidgetId,
      refreshView,
      getLocations,
      getVisibleRectangle,
      disableAll
    }
  }
})
</script>

<style>
div.mapwidget {
  width: 100%;
  height: 100%;
}
div.clustericon {
  width: 40px;
  height: 40px;
  background-color: #2b79c2;
  padding-top: 2px;
  text-align: center;
  font-size: 24px;
  border-radius: 25px;
  color: white;
}
</style>
