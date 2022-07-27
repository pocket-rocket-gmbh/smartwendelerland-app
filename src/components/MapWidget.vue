<template>
  <div class="mapwidget" id="map"></div>
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
    }
  },
  setup(props: any) {

    let locationMarkers: Array<LocationMarker> = []
    let map: L.Map = null

    onMounted(() => {
      map = L.map('map', {
        zoomControl: props.zoomControl
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { // TODO make configurable (e.g. environment varaible)
        minZoom: props.minZoom,
        maxZoom: props.maxZoom,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

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

    return {
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
