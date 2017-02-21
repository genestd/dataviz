import React from 'react'
import * as d3 from 'd3'

class ForceViz extends React.Component {
  constructor(props){
    super(props);
    let c = d3.select(this.props.location)
      //c.selectAll('svg').remove()
    this.setContext = this.setContext.bind(this)

    this.state = {
      nodes: [],
      links: [],
      loaded: false
    }

    d3.json('countryData.json', function(error, fileData){
      this.setState({
        nodes: fileData.nodes,
        links: fileData.links
      })
      this.setContext()
      this.setState({
        loaded:true
      })
    }.bind(this))

  }

  render(){
      return (
        <div ref="tooltip"></div>
      )
  }

  componentDidUpdate(){
    let c = d3.select(this.props.location)
    c.selectAll('svg').remove()
    d3.select("#tip div").remove()
    if(this.state.loaded) this.setContext()
  }

  setContext(){
    let nodes = this.state.nodes,
        links = this.state.links,
        margin = {top: 75, bottom: 65, right: 10, left: 70},
        height = this.props.size.height - margin.top - margin.bottom,
        width = this.props.size.width - margin.right - margin.left,
        radius = 5;

    let div = d3.select(this.refs.tooltip)
       .attr("id", "tip")
       .attr("class", "tooltip")
       .style("opacity", 0);

    let simulation = d3.forceSimulation()
       .force("link", d3.forceLink())
       .force("charge", d3.forceManyBody().distanceMax(width/10))
       .force("center", d3.forceCenter(width / 2, height / 2))

    // Create the SVG
    let context = d3.select( this.props.location).append('svg')
      .attr('height', height + margin.top + margin.bottom)
      .attr('width', width + margin.right + margin.left)

    // Add the bars
    let link = context.append("g")
       .attr("class", "link")
       .selectAll('line')
       .data(links)
       .enter().append('line')
       .attr('stroke', 'steelblue')
       .attr('stroke-width', '1.5px')

    let node = context.append('g')
       .attr('class','node')
       .selectAll('circle')
       .data(nodes)
       .enter().append('circle')
       .attr('r', radius)
       .attr('fill', 'red')
       .call(d3.drag()
           .on("start", dragstarted)
           .on("drag", dragged)
           .on("end", dragended));

     simulation.nodes(nodes)
       .on('tick', ticked)
     simulation.force("link").links(links)


     function ticked() {
      link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      node
        .attr("cx", function(d) { return d.x })
        .attr("cy", function(d) { return d.y });
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    /*    .on("mouseover", function(d) {
           div.transition()
           .duration(200)
           .style("opacity", .9);
           let line1="<span class='line1'>"+months[d.month-1]+" "+d.year+"</span>"
           let line2="<span><br/>Temp: " + this.round2dp((baseTemp + d.variance),2) + "</span>"
           let line3="<span><br/>Variance: " + this.round2dp(d.variance,2) + "</span>"
           div.html( line1 + line2 + line3)
             //"<strong>Date:</strong>" + months[d.month-1] + ", " + d.year + "<br/>Temp: " + (baseTemp + d.variance) + "<br/>Variance: " + d.variance)
           .style("left", (d3.event.pageX-80) + "px")
           .style("top", (d3.event.pageY-125) + "px");
         }.bind(this))
       .on("mouseout", function(d) {
         div.transition()
         .duration(500)
         .style("opacity", 0);
       });*/

      // Add the X Axis
      context.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

      context.append("text")
        .attr("class", "axisLabel")
        .attr("x", width/2)
        .attr("y", height + margin.bottom/2+10)
        .text("Year")

      // Add the Y Axis
      context.append("g")
       .attr("class", "axis")
       .call(d3.axisLeft(y).tickFormat(function(d,i){return months[i-1]}));

      context.append("text")
        .attr("class", "axisLabel")
       .attr("transform", "rotate(-90)")
       .attr("x", 0-height/2)
       .attr("y", 0-margin.left)
       .attr("dy","1.1em")
       .text("Month ")


      //Add title, subtitle
      context.append("text")
       .attr('x', width/2)
       .attr('y', 0)
       .attr('dy', '-1.4em')
       .style('font-size', '28px')
       .style('text-anchor', 'middle')
       .text('Monthly Global Land Surface Temperature')
     context.append("text")
         .attr('x', width/2)
         .attr('y', 0)
         .attr('dy', '-1.4em')
         .style('font-size', '14px')
         .text('1735-2015')
      context.append("text")
        .attr('x', width/2)
        .attr('y',0)
        .attr('dy', '-.5em')
        .style('font-size', '12px')
        .style('text-anchor', 'middle')
        .text('Temperatures are in Celsius and reported as anomalies relative to the Jan 1951-Dec 1980 average. ' +
              'Estimated Jan 1951-Dec 1980 absolute temperature ℃: 8.66 +/- 0.07')

     return context
  }

}

export default ForceViz;
