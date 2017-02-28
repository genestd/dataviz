import React from 'react'
import * as d3 from 'd3'
import * as _ from 'underscore'

export default class MapViz extends React.Component{

  constructor(props){
    super(props)
    let map = mapChart().size(this.props.size)
    this.state = {
      ready: false,
      map: map
    }
    //clean up any svg / tooltips
    d3.selectAll('svg').remove()
    d3.selectAll('#tip div').remove()

    // get data - meteor data sorted for mouseover functionality
    d3.json( 'meteorData.json', function(error, data){
      let that=this
      data.features.forEach( function(d){
        d.properties.mass = +d.properties.mass
      })
      data.features.sort( function(a,b){
        if (a.properties.mass > b.properties.mass) return - 1
        if (a.properties.mass < b.properties.mass) return 1
        return 0
      })
      this.state.map.meteorData(data.features)
      d3.json( 'ne_50m_admin_0_countries.json', function(error, data){
        this.setState({ ready: true})

        this.state.map.countryData(data.geometries)
        d3.select(this.props.location).call(this.state.map)
        this.state.map.update()

      }.bind(that))

    }.bind(this))
    // country data from natural earth
  }

  componentDidMount(){
    this.state.map.tooltip(this.refs.tooltip).update()
  }
  componentDidUpdate(){
    if (this.state.ready) this.state.map.size(this.props.size).update()
    //d3.select('svg').remove()
  }

  componentWillUnmount(){
    d3.select('svg').remove()
    d3.select("#tip div").remove()
  }

  render(){
    return (  <div ref="tooltip"></div>)
  }
}

function mapChart(){
  let margin = {top: 0, right: 0, bottom: 0, left: 0},
      size = {width: 900, height: 400},
      maxlat = 83,
      countryData = [],
      meteorData = [],
      tooltip

  let update,redraw

  function chart(selection){
    //tooltip div
    selection.each( function(){
      let height = size.height - margin.top - margin.bottom
      let width  = size.width - margin.left - margin.right

      let div = d3.select(tooltip)
       .attr("id", "tip")
       .attr("class", "meteorTip")
       .style("opacity", 0);

      let projection = d3.geoMercator()
         .rotate([60,0,0])
         .scale(1)
         .translate([width/2, height/2])

      // find the top left and bottom right of current projection
      function mercatorBounds(projection, maxlat) {
        let yaw = projection.rotate()[0],
            xymin = projection([-yaw-180+1e-6,-maxlat]),
            xymax = projection([-yaw+180-1e-6,maxlat])
        return [xymin,xymax];
      }

      // set up the scale extent and initial scale for the projection
      let b = mercatorBounds(projection, maxlat),
          s = width/(b[1][0]-b[0][0]),
          scaleExtent = [s, 10*s];
      projection.scale(scaleExtent[0])

      // linear scale for size of impact
      let massScale = d3.scaleLinear().range([2,11]).domain(d3.extent(meteorData, function(d){return d.properties.mass}))

      let zoom = d3.zoom()
          .scaleExtent(scaleExtent)
          .on("zoom", redraw)

      let path = d3.geoPath().projection(projection)
      let dom = d3.select(this)
      let context = dom.append('svg')
        .attr('class', 'map')
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width + margin.right + margin.left)
        .call(zoom)

      //gradient to fade out the fill
      let gradient = context.append('defs')
        .append('radialGradient')
        .attr('id', 'rgrad')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '75%')
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('style', "stop-color:rgb(136,12,48);stop-opacity:1")
      gradient.append('stop')
        .attr('offset', '50%')
        .attr('style', "stop-color:rgb(136,12,48);stop-opacity:.75")
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('style', "stop-color:rgb(136,12,48);stop-opacity:3")

      //initialize zoom behavior
      context.call(zoom.transform, d3.zoomIdentity.translate(projection.translate()[0], projection.translate()[1]).scale(projection.scale()))

      let countries = context.selectAll('path.country')
        .data(countryData)
        .enter()
        .append('path')
        .attr('class', 'country')

      let meteors = context.selectAll('g.meteors')
        .data(meteorData)
        .enter()
        .append('g')

      meteors.append('path')
        .attr('class','meteor')
      meteors.append('circle')
        .attr('class', 'meteor-circle')
        .attr('fill', '#880c30')
        .attr('r', function(d){ return massScale(d.properties.mass) * (projection.scale() / scaleExtent[0]) })
        .attr('cx', function(d){ return projection(d.geometry.coordinates)[0]})
        .attr('cy', function(d){ return projection(d.geometry.coordinates)[1]})
        .on('mouseover', function(d){
          div.transition()
             .duration(200)
             .style('opacity', 1)
             .style('top', (d3.event.pageY-125) + "px")
             .style('left', (d3.event.pageY-80) + "px")
          div.html("Name: " + d.properties.name + "<br/>Mass: " + d.properties.mass)
        })
        .on('mouseout', function(){
          div.transition()
             .duration(300)
             .style('opacity', 0)
        })
        //.attr('transform', function(d){ return('translate(' + projection(d.geometry.coordinates) + ')') })
        let title = context.append('g')
          .attr('transform', 'translate(' + width/2 + ',' + height + ')')
        title.append('text')
          .attr('class', 'meteor-title')
          .attr('dy', '-.5em')
          .attr('text-anchor', 'middle')
          .text('Global Meteor Strikes - pan and zoom')

        let tlast = [projection.translate()[0], projection.translate()[1]],
            slast = projection.scale()

        //update svg based on zoom+drag events
        redraw=function(){
          height = size.height - margin.top - margin.bottom
          width  = size.width - margin.left - margin.right
          context.transition().duration(200)
            .attr('height', height + margin.top + margin.bottom)
            .attr('width', width + margin.right + margin.left)
          projection.translate([width/2, height/2])

          projection.scale(1)
          b = mercatorBounds(projection, maxlat),
              s = width/(b[1][0]-b[0][0]),
              scaleExtent = [s, 10*s];

          zoom.scaleExtent(scaleExtent).on("zoom", redraw)
          projection.scale(slast)
          if( d3.event ) {
            let scale = d3.event.transform.k,
                trans = [d3.event.transform.x, d3.event.transform.y]
            if (scale != slast){
              projection.scale(scale)
            } else {
              var dx = trans[0] - tlast[0],
                  dy = trans[1] - tlast[1],
                  yaw = projection.rotate()[0],
                  tp = projection.translate()
            // use x translation to rotate based on current scale
            /*console.log('current rotation (yaw): ', projection.rotate()[0],
                        'x offset: ', dx,
                        'width',  width,
                        'scaleExtent[0]', scaleExtent[0],
                        'transform scale: ',scale)*/
              projection.rotate([yaw+360.*dx/width*scaleExtent[0]/scale, 0, 0]);
              // use y translation to translate projection, clamped by min/max
              var b = mercatorBounds(projection, maxlat);
              if (b[1][1] + dy > 0) dy = -b[1][1];
              else if (b[0][1] + dy < height) dy = height-b[0][1]
              projection.translate([tp[0],tp[1]+dy]);

            }
            slast = scale
            tlast = trans
          }

          context.selectAll('path')
            .attr('d', path)
          context.selectAll('circle')
            .attr('cx', function(d){ return projection(d.geometry.coordinates)[0]})
            .attr('cy', function(d){ return projection(d.geometry.coordinates)[1]})
            .attr('r', function(d){ return massScale(d.properties.mass) * 2 * (projection.scale() / scaleExtent[0]) })

          title.transition().duration(200)
            .attr('transform', 'translate(' + width/2 + ',' + height + ')')
        }
      })
    }

    chart.size = function(value){
      if(!arguments.length) return size
      size = value
      return chart
    }

    chart.countryData = function(value){
      if(!arguments.length) return countryData
      countryData = value
      return chart
    }

    chart.meteorData = function(value){
      if(!arguments.length) return meteorData
      meteorData = value
      return chart
    }

    chart.tooltip = function(value){
      if(!arguments.length) return tooltip
      tooltip = value
      return chart
    }

    chart.update = function(){
      if(typeof redraw === 'function') redraw()
    }
    return chart
  }
