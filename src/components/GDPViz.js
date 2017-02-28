import React from 'react'
import * as d3 from 'd3'
import axios from 'axios'
import Loading from '../components/Loading'
let parseTime = d3.timeParse("%Y-%m-%d")
let formatTime = d3.timeFormat("%d-%b-%Y")



class GDPViz extends React.Component {
  constructor(props){
    super(props);
    let c = d3.select(this.props.location)
    c.selectAll('svg').remove()
    this.setContext = this.setContext.bind(this)
    d3.select('body').attr('class', 'body')
    this.state = {
      data: [],
      loaded: false,
      id: 'gdpChart'
    }

    let gdp = []

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
          this.setState({data: gdp })
          this.setContext()
          this.setState({loaded: true})
         })
  }

  render(){
    if (this.state.loaded){
      return (
        <div ref="tooltip"></div>
      )
    } else {
      return <Loading />
    }
  }

  componentDidUpdate(){
    let c = d3.select(this.props.location)
    c.selectAll('svg').remove()
    d3.select("#tip div").remove()
    if(this.state.loaded) this.setContext()
  }

  setContext(){
    let gdp = this.state.data,
        margin = {top: 5, bottom: 65, right: 10, left: 90},
        height = this.props.size.height - margin.top - margin.bottom,
        width = this.props.size.width - margin.right - margin.left

  let div = d3.select(this.refs.tooltip)
     .attr("id", "tip")
     .attr("class", "tooltip")
     .style("opacity", 0);

    let x = d3.scaleTime().range([0,width])
    let y = d3.scaleLinear().range([height,0])
    y.domain([0, d3.max(gdp, function(d){return d.gdp})])
    x.domain(d3.extent( gdp, function(d){return d.date}))

    // Create the SVG
    let context = d3.select( this.props.location).append('svg')
      .attr('height', height + margin.top + margin.bottom)
      .attr('width', width + margin.right + margin.left)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // Append a defs section to the SVG
    let gradient = d3.select( this.props.location).select('svg')
          .append("defs")
          .append("linearGradient")
          .attr("id", "gdpGradient")
          .attr("x1", "0%").attr("y1", "100%")
          .attr("x2", "100%").attr("y2", "0%")
    gradient.append("stop")
          .attr("offset", "20%")
          .attr("stop-color", "steelblue")
          .attr("stop-opacity", "1.0")
    gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", "green")
          .attr("stop-opacity", "1.0")

     // Add the bars
      context.selectAll(".bar")
        .data(gdp)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.date) })
        .attr("width", width/gdp.length)
        .attr("y", function(d) { return y(d.gdp); })
        .attr("height", function(d) { return height - y(d.gdp)})
        .on("mouseover", function(d) {
           div.transition()
           .duration(200)
           .style("opacity", .9);
           div.html("Date: " + formatTime(d.date-1) + "<br/>GDP: " + d.gdp)
           .style("left", (d3.event.pageX-80) + "px")
           .style("top", (d3.event.pageY-125) + "px");
         })
       .on("mouseout", function(d) {
         div.transition()
         .duration(500)
         .style("opacity", 0);
       });

      // Add the X Axis
      context.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      context.append("text")
        .attr("class", "axisLabel")
        .attr("x", width/2)
        .attr("y", height + margin.bottom/2 + 5)
        .text("Date (Quarter End)")

      // Add the Y Axis
      context.append("g")
       .attr("class", "axis")
       .call(d3.axisLeft(y));

      //Add title, subtitle
      context.append("text")
       .attr('x', width/2)
       .attr('y', margin.top)
       .attr('dy', '1em')
       .style('font-size', '28px')
       .style('text-anchor', 'middle')
       .text('US GDP - Seasonally Adjusted Annual Rate')
     context.append('a')
       .attr("xlink:href", "https://research.stlouisfed.org/about.html")
       .attr('target', '_blank')
       .append("text")
         .attr('x', width/2)
         .attr('y', margin.top)
         .attr('dy', '3.5em')
         .style('font-size', '14px')
         .style('text-anchor', 'middle')
         .attr('class', 'svgLink')
         .text('Data from https://research.stlouisfed.org/about.html')

      context.append("text")
        .attr("class", "axisLabel")
        .attr("transform", "rotate(-90)")
        .attr("x", 0-height/2)
        .attr("y", 0-margin.left)
        .attr("dy","1em")
        .text("US Dollars (Billions)")

     return context
  }

}

export default GDPViz;
