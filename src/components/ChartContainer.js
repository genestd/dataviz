import React from 'react'
import * as _ from 'underscore'
import axios from 'axios'
import * as d3 from 'd3'
import GDPViz from '../components/GDPViz'
import Loading from '../components/Loading'

export default class ChartContainer extends React.Component{

  constructor(props){
    super(props)
    console.log(props)
    let margin = {top: 50, bottom: 20, right: 20, left: 60}

    this.state = {
      data: [],
      loaded: false,
      height: this.props.size.height,
      width: this.props.size.width,
      margin: margin,
      svgId: "GDPSVG",
      tooltipId: "tooltip"
    }

  }

  componentDidMount(){
    let gdp = []
    let parseTime = d3.timeParse("%Y-%m-%d")
    let formatTime = d3.timeFormat("%d-%b-%Y")

    axios.get( 'https://enigmatic-shelf-36767.herokuapp.com/api?https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=ed1b37238eb016257dabc4a5cd535e15&file_type=json')
      //"https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=ed1b37238eb016257dabc4a5cd535e15&file_type=json")
         .then( res => {
           res.data["observations"].map( (result,index)=>{
             let date = parseTime( result.date)
             let value = +result.value
             if (isNaN(value)){
               value=0
             }
             gdp[index] = { date: date
                           ,gdp: value}
             })
          this.setState({data: gdp,
                            loaded: true})
         })

  }

  render(){
    if (this.state.loaded){
      return ( <div ref='container'>
                 <GDPViz data={this.state.data}
                         height={this.state.height}
                         width={this.state.width}
                         id={this.state.svgId}/>
                     </div>     )
    } else {
      return ( <Loading /> )
    }
  }

}
