import React from 'react'
import * as d3 from 'd3'

class ForceViz extends React.Component {
  constructor(props){
    super(props);
    let c = d3.select(this.props.location)
        c.selectAll('svg').remove()
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
      })      //this.setContext()
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
    d3.selectAll("#tip img").remove()
    d3.selectAll("#tip div").remove()
    if(this.state.loaded) this.setContext()
  }

  componentWillUnmount(){
    let c = d3.selectAll('svg').remove()
    d3.selectAll("#tip img").remove()
    d3.selectAll("#tip div").remove()
  }

  setContext(){
    let nodes = this.state.nodes,
        links = this.state.links,
        margin = {top: 0, bottom: 11, right: 0, left: 16},
        height = this.props.size.height - margin.top - margin.bottom,
        width = this.props.size.width - margin.right - margin.left

    let simulation = d3.forceSimulation()
       .alphaDecay(.05)
       .force("link", d3.forceLink())
       .force("charge", d3.forceManyBody().strength(-100).distanceMin(100).distanceMax(170))
       .force("center", d3.forceCenter(width/2 , height/2 ))
       .force("collide", d3.forceCollide(25))

    let tooltip = d3.select(this.props.tooltip)
       .append('div')
       .attr("id", "tip")
       .attr("class", "forceTip")
       .style('z-index', 100)
       .style("opacity", 0)

    // Create the SVG
    let context = d3.select( this.props.location).append('svg')
      .attr('height', height + margin.top + margin.bottom)
      .attr('width', width + margin.right + margin.left)

    let node = context.append("g")
       .attr("class", "node")
       .selectAll('rect')
       .data(nodes)
       .enter().append('rect')
       .attr('height', '11px')
       .attr('width', '16px')
       .attr('stroke-width', '1.5px')
       .attr('fill', 'transparent')
       .on('mouseover', function(d){
         tooltip.transition().duration(200)
            .attr('width', function(){ return (d.country.length+5) + 'em'}.bind(d))
            .attr('height', '2em')
            .attr('transform', 'scale(2)')
            .style('opacity', '.9')
            .style('top', function(d){return d3.event.pageY - 120 + 'px'})
            .style('left', d3.event.pageX - 60 + 'px')
         tooltip.html(d.country)
       })
       .on('mouseout', function(d){
         tooltip.transition().duration(200)
            .style('opacity', 0)
       })
       .call(d3.drag()
         .on("start", dragstarted)
         .on("drag", dragged)
         .on("end", dragended))

    let flag = d3.select(this.props.tooltip)
         .selectAll('.node')
         .data(nodes)
         .enter().append('img')
         .style('position', 'absolute')
         .style('z-index', 1)
         .attr('class', function(d) {return 'flag flag-' + d.code;})

     // Add the lines
     let link = context.append("g")
        .selectAll('links')
        .data(links)
        .enter().append('line')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', '1.5px')

     simulation.nodes(nodes)
       .on('tick', ticked)
     simulation.force("link").links(links)


     function ticked() {
      flag
        .style("left", function(d) { d.x = Math.max(16, Math.min(width - 16, d.x)); return d.x + 'px' })
        .style("top", function(d) { d.y = Math.max(30, Math.min(height-11, d.y)); return d.y + 'px' })

      node
        .attr('x', function(d){ d.x = Math.max(16, Math.min(width - 16, d.x)); return d.x })
        .attr('y', function(d){ d.y = Math.max(30, Math.min(height-11, d.y)); return d.y })

      link
        .attr("x1", function(d) { return d.source.x+8; })
        .attr("y1", function(d) { return d.source.y+5.5; })
        .attr("x2", function(d) { return d.target.x+8; })
        .attr("y2", function(d) { return d.target.y+5.5; });
    }

    function dragstarted(d, i) {
         simulation.stop() // stops the force auto positioning before you start dragging
     }

     function dragged(d, i) {
         d.px += d3.event.dx;
         d.py += d3.event.dy;
         d.x += d3.event.dx;
         d.y += d3.event.dy;
         ticked(); // this is the key to make it work together with updating both px,py,x,y on d !
     }

     function dragended(d, i) {
         d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
         simulation.alpha(.5)
         ticked();
         simulation.restart();
     }

      //Add title,
      context.append("text")
       .attr('x', width/2)
       .attr('y', 0)
       .attr('dy', '1em')
       .style('font-size', '28px')
       .style('text-anchor', 'middle')
       .text('Force Directed Graph of National Borders')

     return context
  }

}

export default ForceViz;
