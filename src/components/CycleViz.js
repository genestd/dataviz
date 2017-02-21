import React from 'react'
import * as d3 from 'd3'
import Loading from '../components/Loading'
const parseTime = d3.timeParse("%0M:%0S")
const formatTime = d3.timeFormat("%M:%S ")
const getTimeDiff = function(maxTime, time){
  let diffMin = Math.floor((maxTime - time)/60)
  let diffSec = (maxTime - time) % 60
  let diff = parseTime(diffMin+":"+diffSec)
  return diff
}



class CycleViz extends React.Component {
  constructor(props){
    super(props);
    this.setContext = this.setContext.bind(this)
    this.state = {
      data: [],
      loaded: true
    }
    let c = d3.select(this.props.location)
    c.selectAll('svg').remove()
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
  componentDidMount(){
    let c = d3.select(this.props.location)
    c.selectAll('svg').remove()

    let data = 'data.csv'
    d3.json( data, function(error, data){
      data.forEach( function(d){
        d.Year = +d.Year
        d.Place = +d.Place
        d.Seconds = +d.Seconds
        d.Time = parseTime(d.Time)
      })
    this.setState({
      data: data
    })
    }.bind(this))
    this.setContext()
  }
  componentDidUpdate(){
    let c = d3.select(this.props.location)
    c.selectAll('svg').remove()
    d3.select("#tip").remove()
    if(this.state.loaded) this.setContext()
  }

  setContext(){
    let data = this.state.data,
        margin = {top: 10, bottom: 65, right: 105, left: 50},
        height = this.props.size.height - margin.top - margin.bottom,
        width = this.props.size.width - margin.right - margin.left
    let maxTime = d3.max(data, function(d){return d.Seconds})
    let minTime = d3.min(data, function(d){return d.Seconds})

    let x = d3.scaleTime().range([0,width])
    let y = d3.scaleLinear().range([height,0])
    y.domain([d3.max(data, function(d){return d.Place+1}),0])
    x.domain([getTimeDiff(maxTime+5, d3.min(data,function(d){return d.Seconds})),parseTime("00:00")])
    // Create the SVG
    let context = d3.select( this.props.location).append('svg')
      .attr('height', height + margin.top + margin.bottom)
      .attr('width', width + margin.right + margin.left)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

     // Add a group for the callout
     let callout = context.append('g')
       .attr('transform', 'translate(' + (width*.5) + ',' + (height*.5) + ')')
     let calloutBG = callout.append('rect')
       .style('fill', 'none')
       .attr('width', width*.7)
       .attr('height', height*.2)
     let calloutText = callout.append('text')
       .style('font-size', this.props.size.height/42 + "px")
       .style("fill", "#fff")
     // Add a group for the dots
      let dots = context.selectAll("dot")
        .data(data)
        .enter()
        .append('g')
        .attr('id', 'dot')
        .attr("transform", function(d){
          let tx=x(getTimeDiff(d.Seconds, minTime ))
          let ty=y(d.Place)
          return 'translate(' + tx + ',' + ty + ')' }.bind(this))
        .style('fill','#000')
        .style('font-size', Math.floor(height/35)+"px")
        .on("mouseover", function(d) {
           d3.select(this).transition()
           .duration(200)
           .style("font-size", Math.floor(height/35)*1.25+"px")
           let line1 = d.Name + " (" + d.Nationality + ")"
           let line2 = "Time: " + formatTime(d.Time) + " +(" + formatTime(getTimeDiff(d.Seconds, minTime)) + ")"
           let line3 = d.Doping
           let line4 = d.URL
            calloutBG.style("fill", d.Doping==="" ? "darkgreen" : "red")
            callout.transition()
            .duration(200)
            .style("opacity", .9)
            calloutText.append("tspan")
                   .attr('x', '5')
                   .attr('dy','1.2em')
                   .style("fill", "#fff")
                   .text(line1)
            calloutText.append("tspan")
                   .attr('x', '5')
                   .attr('dy','1.2em')
                   .style("fill", "#fff")
                   .text(line2)
            calloutText.append("tspan")
                   .attr('x', '5')
                   .attr('dy','1.2em')
                   .style("fill", "#fff")
                   .text(line3)
            calloutText.append("tspan")
                   .attr('x', '5')
                   .style("fill", "#fff")
                   .attr('dy','1.2em')
                   .text(line4)
       })
         .on("mouseout", function(d) {
           d3.select(this).transition()
           .duration(200)
           .style("font-size", Math.floor(height/35)+"px")
           callout.transition()
           .duration(500)
           .style("opacity", 0)
           callout.selectAll("tspan").remove()
         })

      dots.append('text')
        .attr('x', 0) //function(d){return x(this.getTimeDiff(d.Seconds, minTime ))}.bind(this))
        .attr('y', 0) //function(d) { return y(d.Place) })
        .attr('dx', '1em')
        .attr('dy', '.5em')
        .text(function(d){ return d.Name})
      dots.append("circle")
        .attr("class", "circle")
        .attr("cx", 0)//function(d) { return x(this.getTimeDiff(d.Seconds, minTime ))}.bind(this))
        .attr("cy", 0)// function(d) { return y(d.Place); })
        .attr("r", Math.floor(height/70))
        .style("fill", function(d){ return d.Doping === "" ? 'darkgreen' : 'red'})

      // Add the X Axis
      context.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(formatTime))

      context.append("text")
        .attr("class", "axisLabel")
        .attr("x", width/2)
        .attr("y", height + margin.bottom/2 + 10)
        .text("Minutes behind fastest climb")

      // Add the Y Axis
      context.append("g")
       .attr("class", "axis")
       .call(d3.axisLeft(y));

      context.append("text")
        .attr("class", "axisLabel")
        .attr("transform", "rotate(-90)")
        .attr("x", 0-height/2)
        .attr("y", 0-margin.left+5)
        .attr("dy","1em")
        .text("Place")

      //Append the title, subtitle
      context.append("text")
        .attr('text-anchor', 'middle')
        .attr('font-size', this.props.size.height/25 + "px")
        .attr('x', width/2)
        .attr('y', 0)
        .attr('dy', '1em')
        .text('Doping in Professional Bicycle Racing')
      context.append("text")
        .attr('text-anchor', 'middle')
        .attr('font-size', this.props.size.height/38 + "px")
        .attr('x', width/2)
        .attr('y', 0)
        .attr('dy', '3em')
        .text("35 Fastest times up Alpe d'Huez")

      //Append the legend
      let legend = context.append('g')
        .attr('transform', 'translate(' + (width-200) + ',' + (height*.9) + ')')
        .style('font-size', this.props.size.height/38 + "px")
        .style('fill', '#000')
      legend.append('circle')
        .attr('cx', 0)
        .attr('cy', -Math.floor(height/70))
        .attr('r', Math.floor(height/70))
        .style('fill', 'red')
      legend.append('text')
        .attr('x', 0)
        .attr('dx', '1em')
        .attr('y', 0)
        .style('fill', '#000')
        .text('Riders with doping allegations')
      legend.append('circle')
        .attr('cx', 0)
        .attr('cy', this.props.size.height/19-Math.floor(height/70))
        .attr('r', Math.floor(height/70))
        .style('fill', 'darkgreen')
      legend.append('text')
        .attr('x', 0)
        .attr('dx', '1em')
        .attr('y', 0)
        .attr('dy', '2em')
        .text('Riders with no doping allegations')

     return context
  }
}
export default CycleViz;
