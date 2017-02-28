import React from 'react'
import * as d3 from 'd3'

class HeatViz extends React.Component {
  constructor(props){
    super(props);
    let c = d3.select(this.props.location)
      //c.selectAll('svg').remove()
    this.setContext = this.setContext.bind(this)

    this.state = {
      data: [],
      baseTemperature: 0,
      loaded: false
    }

    d3.json('tempData.json', function(error, fileData){
      this.setState({
        baseTemperature: fileData.baseTemperature,
        data: fileData.monthlyVariance
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

  round2dp(num, dp) {
    var numToFixedDp = Number(num).toFixed(dp);
    return Number(numToFixedDp);
  }

  setContext(){
    let data = this.state.data,
        baseTemp = this.state.baseTemperature,
        margin = {top: 75, bottom: 65, right: 100, left: 70},
        height = this.props.size.height - margin.top - margin.bottom,
        width = this.props.size.width - margin.right - margin.left,
        months=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    let div = d3.select(this.refs.tooltip)
       .attr("id", "tip")
       .attr("class", "heatTip")
       .style("opacity", 0);

    //Set up Scales - X is linear (years), Y is linear (Months),
    //ColorScale maps the colors, and TempScale maps the temps into the colorScale
    let x = d3.scaleLinear().range([0, width])
    let y = d3.scaleLinear().range([height,0])
    let minYear = d3.min(this.state.data, function(d){return d.year})
    let maxYear = d3.max(this.state.data, function(d){return d.year})
    y.domain([0,12])
    x.domain([minYear,maxYear])

    //let colors = ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026']
    let colors = ['#0500ff', '#0032ff', '#00d4ff', '#3eff00', '#FFd200', '#FF6e00', '#FF0a00', '#FF0090' ]
    let colorScale = d3.scaleQuantize()
                       .domain(d3.extent(data, function(d){return d.variance}))
                       .range(colors)

    // Create the SVG
    let context = d3.select( this.props.location).append('svg')
      .attr('height', height + margin.top + margin.bottom)
      .attr('width', width + margin.right + margin.left)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

     // Add the bars
      context.selectAll(".cell")
        .data(data)
        .enter().append("rect")
        .attr("class", "cell")
        .attr("x", function(d) { return x(d.year) })
        .attr("width", width/(maxYear-minYear))
        .attr("y", function(d) { return y(d.month); })
        .attr("height", function(d) { return height/12})
        .attr('fill', function(d){ return colorScale(d.variance)})
        .on("mouseover", function(d) {
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
       });

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

     let legend = context.append('g')
        .attr('transform', 'translate(' + (width+margin.right/2) + ',0)')

     legend.selectAll('.legend')
        .data(colors)
        .enter()
        .append('rect')
        .attr('class', 'legend')
        .attr('x', 0)
        .attr('y', function(d,i){ return ((height/colors.length)*i)})
        .attr('width', margin.right/2)
        .attr('height', height / colors.length)
        .attr('fill', function(d,i){ return colors[i]})
        .append('text')
        .text('test')
        
      legend.selectAll('.legendLabels')
        .data(colors)
        .enter()
        .append('text')
        .attr('fill', '#fff')
        .attr('class', 'legendLabels')
        .attr('x', '.5em')
        .attr('y', function(d,i){ return ((height/colors.length)*i)})
        .attr('dy', '2em')
        .text( function(d,i){
          let low = colorScale.domain()[0]
          let high = colorScale.domain()[1]
          let tick = (high-low)/colors.length
          let num
          if( i===0){
            num = low + tick/2
          } else {
            num = low + tick/2 + tick*i
          }
          return Math.round(num*100)/100
        })

     return context
  }

}

export default HeatViz;
