<template>
  <MapWidget
    ref="map"
    :style="mapStyle"
    :zoomControl=false
    :locations="locations"
    :drag=false
    :tap=false
    :autoFit=true
    :attributionFontSize=8
  />
</template>

<script lang="ts">
import { defineComponent, PropType, ref, onMounted } from 'vue'
import { MapLocation } from '@/types/MapLocation'
import MapWidget from '@/components/MapWidget.vue'

export default defineComponent({
  name: 'ProjectMapPanel',
  components: { MapWidget },
  props: {
    locations: {
      type: Array as PropType<MapLocation[]>,
      default(): MapLocation[] {
        return []
      }
    }
  },
  setup() {   
    const map = ref(null)
    const mapStyle = ref('')

    onMounted(() => {
      updateMapStyle(window.innerWidth)

      window.onresize = () => {
        updateMapStyle(window.innerWidth)
        refresh()
      }
    })

    const refresh = () => {
      map.value.refreshView()
    }

    const updateMapStyle = (width: number) => {
      // const finalWidth = width - 20
      const finalHeight = width / 2
      mapStyle.value = `width: 100%; height: ${finalHeight}px;`
    }

    return {
      map,
      mapStyle,
      refresh
    }
  }
})
</script>

<style>
</style>
