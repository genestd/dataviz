import React from 'react';
import {render} from 'react-dom';
import './styles/main.scss';
import ChartContainer from './components/ChartContainer'

const rootElement = document.getElementById('app');

render(
      <div>
        <ChartContainer />
      </div>,
  rootElement
);
