import React from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import * as _ from 'underscore'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as Actions from '../actions/'

class Carousel extends React.Component{

  constructor(props){
    super(props)

    this.updateDimensions = this.updateDimensions.bind(this)
  }

  componentDidMount(){
    this.updateDimensions()
    window.addEventListener("resize", _.debounce(this.updateDimensions,200));
  }

  updateDimensions() {
    let w=window,
    d = document,
    documentElement = d.documentElement,
    body = d.getElementsByTagName('body')[0],
    winWidth = w.innerWidth || documentElement.clientWidth || body.clientWidth,
    winHeight = w.innerHeight|| documentElement.clientHeight|| body.clientHeight;

    winWidth = winWidth < 500 ? 500 : winWidth
    this.props.actions.updateDimensions(
      {width: winWidth,
       height: winHeight-100
      }
    );
  }

  componentWillMount() {
      this.updateDimensions();
  }

  componentWillUnmount() {
      window.removeEventListener("resize", this.updateDimensions);
  }

  fetchChart(){
     const Chart = this.props.charts[this.props.currentChart].comp
     return <Chart className={'hero'} key={Chart} size={this.props.size} location={this.refs.chartDiv} tooltip={this.refs.tooltip} />
     //<img className='hero' key={this.props.charts[this.props.currentChart]} src={this.props.charts[this.props.currentChart]}/>
     //<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" className="flag flag-cz" alt="Czech Republic" />
  }
  render(){
    return (
      <div className='carousel'>
        <h1 className='header'>A Gallery of D3 Visualizations</h1>
        <ReactCSSTransitionGroup className='container' component='div' transitionName={"animation--" + this.props.direction} transitionEnterTimeout={1000} transitionLeaveTimeout={1000}>
          <div ref='chartDiv' id='chartDiv'>
            <div ref='tooltip' id='tip'></div>
            {this.fetchChart()}
          </div>
        </ReactCSSTransitionGroup>
        <div className='leftNav'>
          <i className="material-icons leftNav" onClick={()=>{this.props.actions.decrementCarousel()}}>chevron_left</i>
        </div>
        <div className='rightNav'>
          <i className="material-icons rightNav" onClick={()=>{this.props.actions.incrementCarousel()}}>chevron_right</i>
        </div>
        <h4 className='footer'>
          {this.props.charts.map( function(item, index){
            let active = index === this.props.currentChart ? ' active' : ''
            return( <div key={index} className={'navDot'+active} onClick={()=>{this.props.actions.gotoCarousel(index)}}></div>)
          }.bind(this))}
        </h4>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return ({
    charts: state.appState.charts,
    currentChart: state.appState.currentChart,
    size: state.appState.size,
    direction: state.appState.direction
  })
};

const mapDispatchToProps = (dispatch) => {
  return ({
    actions: bindActionCreators(Actions, dispatch)
  })
};

export default connect( mapStateToProps, mapDispatchToProps)(Carousel)
