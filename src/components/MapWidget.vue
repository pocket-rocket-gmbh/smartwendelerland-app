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
    locations: {
      type: Array as PropType<MapLocation[]>,
      default(): MapLocation[] {
        return []
      }
    },
    centerPoint: {
      type: Object as PropType<L.LatLngExpression>
    },
    interactive: {
      type: Boolean,
      default: true
    },
    attributionFontSize: {
      type: Number,
      default: 12
    }
  },
  setup(props: any) {

    const mapWidgetId = 'map' + self.crypto.randomUUID()

    let locationMarkers: Array<LocationMarker> = []
    let map: L.Map = null

    onMounted(() => {
      map = L.map(mapWidgetId, {
        zoomControl: props.zoomControl
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { // TODO make configurable (e.g. environment varaible)
        minZoom: props.minZoom,
        maxZoom: props.maxZoom,
        attribution: `<span style="font-size: ${props.attributionFontSize}px">© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors</span>`
      }).addTo(map)

      map.attributionControl.setPrefix('')
      map.attributionControl.getContainer().style.height = `${props.attributionFontSize + 4}px`
      map.attributionControl.getContainer().style.paddingRight = '2px'
      map.attributionControl.getContainer().style.paddingLeft = '2px'
      map.attributionControl.getContainer().style.paddingTop = getTopPaddingFromFontSize(props.attributionFontSize)
      map.attributionControl.getContainer().style.lineHeight = `${props.attributionFontSize}px`

      if (!props.interactive) {
        map.dragging.disable()
        map.touchZoom.disable()
        map.doubleClickZoom.disable()
        map.scrollWheelZoom.disable()
        map.boxZoom.disable()
        map.keyboard.disable()
        if (map.tap) {
          map.tap.disable()
        }
      }

      refreshView()
    })

    const refreshView = () => {
      locationMarkers.forEach((marker) => {
        marker.remove()
      })

      locationMarkers = []

      props.locations.forEach((location: MapLocation) => {
        const marker = new LocationMarker(location.id, [location.latitude, location.longitude], { draggable: location.draggable })
        locationMarkers.push(marker)
        marker.addTo(map)        
      })

      // Calculate viewport after timeout to make sure the page is already properly initialized.
      setTimeout(function () {
        if (props.locations.length === 0) {
          map.setView(getCenterPoint(), getZoom())
        }
        else {
          const group: L.FeatureGroup<any> = L.featureGroup(locationMarkers)
          map.fitBounds(group.getBounds())
        }
        map.invalidateSize()
      }, 100)
    }

    const getCenterPoint = (): L.LatLngExpression => {

      // Predefined center point.
      if (props.centerPoint) {
        return props.centerPoint
      }

      // Fallback center point if nothing is defined and there are no locations.
      if (props.locations.length == 0) {
        return [0.0, 0.0]
      }
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
          draggable: false
        })
      })

      return result
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

    return {
      mapWidgetId,
      refreshView,
      getLocations
    }
  }
})
</script>

<style>
div.mapwidget {
  width: 100%;
  height: 100%;
}
</style>
