import React from 'react'
import * as d3 from 'd3'

  let parseTime = d3.timeParse("%Y-%m-%d")
  let formatTime = d3.timeFormat("%d-%b-%Y")

class GDPViz extends React.Component {

  constructor(props){
    super(props);

    this.setContext = this.setContext.bind(this)
  }


  render(){
      return (
        <div>
          <h1 className="title">US GDP - Seasonally Adjusted Annual Rate</h1>
          <h4 className="title">Data from <a href="https://research.stlouisfed.org/about.html" target="_blank">fred.stlouisfed.org</a></h4>
          <div ref="gdpChart"></div>
          <div ref="tooltip"></div>
        </div>
      )
  }

  componentDidMount(){
    this.setContext()
  }
  componentDidUpdate(){
    d3.select("#GDPSVG").remove()
    d3.select("#tip").remove()
    this.setContext()
  }

  setContext(){
    let gdp = this.props.data,
        margin = {top: 0, bottom: 100, right: 50, left: 100},
        height = this.props.height - margin.top - margin.bottom - 100,
        width = this.props.width - margin.right - margin.left

     let div = d3.select(this.refs.tooltip)
     .append("div")
     .attr("id", "tip")
     .attr("class", "tooltip")
     .style("opacity", 0);

    let x = d3.scaleTime().range([0,width])
    let y = d3.scaleLinear().range([height,0])
    y.domain([0, d3.max(gdp, function(d){return d.gdp})])
    x.domain(d3.extent( gdp, function(d){return d.date}))

    // Create the SVG
    let context = d3.select( this.refs.gdpChart).append('svg')
      .attr('height', height + margin.top + margin.bottom)
      .attr('width', width + margin.right + margin.left)
      .attr('id', this.props.id)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // Append a defs section to the SVG
    let gradient = d3.select( "#"+this.props.id)
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
           div.html(formatTime(d.date-1) + "<br/>" + d.gdp)
           .style("left", (d3.event.pageX-80) + "px")
           .style("top", (d3.event.pageY - 28) + "px");
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
        .attr("y", height + margin.top + 50)
        .text("Date (Quarter End)")

      // Add the Y Axis
      context.append("g")
       .attr("class", "axis")
       .call(d3.axisLeft(y));

      context.append("text")
        .attr("class", "axisLabel")
        .attr("transform", "rotate(-90)")
        .attr("x", 0-height/2)
        .attr("y", 0-margin.left)
        .attr("dy","1em")
        .text("US Dollars (Billions)")

     return context
  }

  resetContext(){
    let id = '#' + this.state.id
    const context = d3.select(id);
    context.remove();
    this.setContext();
  }

}

export default GDPViz;
