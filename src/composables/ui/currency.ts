export function useCurrency() {

  const getCurrencyFromNumber = (item:any) => {
    if (item !== null) {

      // Create our number formatter.
      const formatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumSignificantDigits: 10
      })

      return formatter.format(item)
    }
  }

  return {
    getCurrencyFromNumber
  }
}
