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
  },
  getGuideRoleLabel: (role) => {
    if(role === 'lead-guide') return 'Lead guide'
    if(role === 'guide') return 'Tour guide'

    return ''
  },
  getIndexNumber: (index) => index + 1,
  getRatingStars: (rating) => {
    result = ''
    for (let index = 1; index <= 5; index++) {
      result += `
      <svg class="reviews__star reviews__star--${(rating >= index)? 'active': 'inactive'}">
        <use xlink:href="/img/icons.svg#icon-star"></use>
      </svg>
      `
    }
    return result
  },
  GetSecondPhotoTour: (images) => {
    if (!Array.isArray(images) || !images[1]) return '';
    return images[1]
  }
}
