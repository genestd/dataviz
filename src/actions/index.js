export const UPDATE_DIMENSIONS = 'UPDATE_DIMENSIONS'
export const INCREMENT_CAROUSEL = 'INCREMENT_CAROUSEL'
export const DECREMENT_CAROUSEL = 'DECREMENT_CAROUSEL'
export const GOTO_CAROUSEL = 'GOTO_CAROUSEL'

export const updateDimensions = (obj) => ({
  type: UPDATE_DIMENSIONS,
  payload: obj
})

export const incrementCarousel = () => ({
  type: INCREMENT_CAROUSEL
})

export const decrementCarousel = () => ({
  type: DECREMENT_CAROUSEL
})

export const gotoCarousel = (index) => ({
  type: GOTO_CAROUSEL,
  payload: index
})
