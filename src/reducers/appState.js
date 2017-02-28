import Loading from '../components/Loading'
import GDPViz from '../components/GDPViz'
import CycleViz from '../components/CycleViz'
import HeatViz from '../components/Heatviz'
import ForceViz from '../components/ForceViz'
import MapViz from '../components/MapViz'
import ChartContainer from '../components/ChartContainer'
import {
  UPDATE_DIMENSIONS,
  INCREMENT_CAROUSEL,
  DECREMENT_CAROUSEL,
  GOTO_CAROUSEL
} from '../actions/'

//charts: ['./icons/berrypie.jpg', './icons/pizza.jpg', './icons/fruitsalad.jpg', './icons/peasoup.jpg']
//[ {comp: Loading}, {comp: GDPViz}, {comp: CycleViz}, {comp: Loading}]
const INITIAL_STATE = {
  size: {},
  charts: [ {comp: MapViz}, {comp: ForceViz}, {comp: HeatViz}, {comp: GDPViz}, {comp: CycleViz}],
  currentChart: 0,
  direction: 'next'
}

const appState = function( state=INITIAL_STATE, action){
  let newState = Object.assign({}, state)
  switch( action.type ){

    case UPDATE_DIMENSIONS:
      newState.size = action.payload
      return newState
      break

    case INCREMENT_CAROUSEL:
      newState.currentChart++
      if (newState.currentChart >= newState.charts.length ){
        newState.currentChart = 0
      }
      newState.direction='previous'
      return newState

    case DECREMENT_CAROUSEL:
      newState.currentChart--
      if (newState.currentChart < 0 ){
        newState.currentChart = newState.charts.length-1
      }
      newState.direction='next'
      return newState

    case GOTO_CAROUSEL:
      newState.direction = action.payload > state.currentChart ? 'previous' : 'next'
      newState.currentChart = action.payload
      return newState

    default:
      return Object.assign({}, state)
  }
}

export default appState
