module.exports = {
  uppercase: (text) => {
    if (!text) return ''
    return text.toUpperCase();
  },
  lenLocations: (locations) => {
    if (!Array.isArray(locations)) return 0;
    return locations.length
  },
  getFirstStartDate: (startDates) => {
    if (!Array.isArray(startDates) || !startDates[0]) return 'Ainda não possui data';
    firstDate = startDates[0];
    let dateResult = firstDate.toLocaleString('en-US', { month: 'long', year: 'numeric'})
    return dateResult
  }
}
