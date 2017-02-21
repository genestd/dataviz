import React from 'react'
import {render} from 'react-dom'
import store from './utils/store'
import {Provider} from 'react-redux'
import Carousel from './components/Carousel'
import './styles/main.scss'
import './styles/styles.css'

const rootElement = document.getElementById('app');

render(
  <Provider store={store}>
    <Carousel />
  </Provider>,
  rootElement
);
