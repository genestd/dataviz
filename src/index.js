import React from 'react';
import {render} from 'react-dom';
import store from './utils/store'
import {Provider} from 'react-redux'
import './styles/main.scss';
import Carousel from './components/Carousel'

const rootElement = document.getElementById('app');

render(
  <Provider store={store}>
    <Carousel />
  </Provider>,
  rootElement
);
