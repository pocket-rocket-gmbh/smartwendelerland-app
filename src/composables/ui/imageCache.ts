export function useImageCache() {
  const cacheableImageUrl = (url:string, cacheTime = 30) => {
    const currentTime = new Date()
    const d = new Date(currentTime)
  
    d.setMinutes(Math.floor(d.getMinutes() / cacheTime) * cacheTime)
    d.setSeconds(0)
    d.setMilliseconds(0)
  
    const dateString = new Date(d).getTime() / 1000
  
    return `${url}?${dateString}`
  }

  return {
    cacheableImageUrl
  }
}



