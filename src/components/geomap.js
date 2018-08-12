//import d3 and d3-svg-legend generator

import * as d3 from 'd3';
import {legendColor} from 'd3-svg-legend';

//import other components

import abvHistogram from './abv_histogram';
import ibuHistogram from './ibu_histogram';
import scatterplot from './scatterplot';

//import tooltip

import('../style/tooltip.scss'); 

//consulted this example
//https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2

//This is the map module. It is the controller which changes state in all the other charts.
//and is responsible for filtering the data when the u.s. states are clicked. At the bottom of this module,
//there is a click and reset events which controls how what happens to the other modules after states are clicked.
//Also, all the other modules are imported into this module - I figured this is logical since this is the driver
//of all the data manipulation.

//There are two states (not u.s. states, program states!) that I define. The first, initialized, is on page load, and
//shows all the data for the entire country. The second, update, is what happens when a state is clicked. These states are
//passed to the other charts in the form of 'update' or 'initialized'.

function geoMap(beersPerState, breweriesPerCity, breweriesPerState, breweriesPerCityValues, breweriesPerStateValues, json, beers, breweries) {

  // console.log(beersPerState);
  // console.log(breweriesPerCity);
  // console.log(breweriesPerCityValues);
  // console.log(json);
  // console.log(beers);
  // console.log(ibuBeers);

  const w = document.querySelector('.map').clientWidth;
  const h = document.querySelector('.map').clientHeight;
  console.log(h/2);
  let active = d3.select(null);

  const projection = d3.geoAlbersUsa()
    .translate([w/2, h/2])
    .scale(w * 1.25);

  const zoom = d3.zoom()
    .scaleExtent([1,8])
    .on('zoom', zoomed);

  const path = d3.geoPath()
    .projection(projection);

  const color = d3.scaleLinear() //sorts data values into buckets of color
      .domain([
        d3.min(breweriesPerStateValues),
        d3.max(breweriesPerStateValues)
      ])
    .range(["rgb(237,248,233)","rgb(0,109,44)"]);

  const svg = d3.select('.map')
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .on('click', stopped, true);
  
  //background rectangle for legend
  // svg.append('rect')
  //   .attr('width', w * .7 )
  //   .attr('height', h * .3)
  //   .attr('transform', `translate(${w * .59}, ${h * .053}) scale(${w * .00060})`)
  //   .attr('fill', '#ededed');

  svg.append('g')
    .attr('class', 'legendLinear')
    .attr('transform', `translate(${w * .60}, ${h * .08}) scale(${w * .00060})`)

  const legendLinear = legendColor()
    .title('Craft Breweries Per State')
    .shapeWidth(80)
    .orient('horizontal')
    .scale(color)
    .cells([1, 10, 20, 30, 40])
    .shapePadding(10)
    .labelOffset(30)
    .labelFormat(d3.format(".0f"))
    .labelAlign('middle');

  svg.select('.legendLinear')
    .call(legendLinear);
   
  d3.selectAll('.swatch')
      .attr('stroke', 'black')
      .attr('stroke-width', 1);
  
  d3.select('.legendTitle')
      .attr('textLength', 450);
  
  // const legendWidth = document.querySelector('.legendLinear').clientWidth;
  // const legendHeight = document.querySelector('.legendLinear').clientHeight;  
  // console.log(legendWidth);    

  const g = svg.append('g')
    .attr('id', 'gMap');

  const cholorpleth = g.selectAll('path') //this creates the chloropleth
    .data(json.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('class', 'feature')
    .attr('stroke-width', 0.25)
    .attr('stroke', 'var(--black)' )
    .attr('id', d => d.properties.name)
    .on('click', clicked);

    //this sets the fill of the states to the color scaled green value
    function colorStates() {
      cholorpleth.style('fill', d => {
        const value = d.properties.value;
        if (value) {
          return color(value); // if value exists
        } else {
          return '#ccc'; //if value is undefined
        }
      });
    } 

    //returns states to cholorpleth color
    colorStates();

    const radiusScale = d3.scaleLinear()
      .domain([d3.min(breweriesPerCityValues), d3.max(breweriesPerCityValues)])
      .range([1, 10]);

      //can't figure out how to get circles to behave with zoom

    g.selectAll('circle')
      .data(breweriesPerCity)
      .enter()
      .append('circle')
      .attr('cx', d => {
        return projection([d.long, d.lat])[0];
      })
      .attr('cy', d => {
        return projection([d.long, d.lat])[1];
      })
      .attr('r', d => {
        return radiusScale(d.value);
      })
      .attr('class', 'city')
      .style('fill', 'var(--city_yellow)')
      .style('stroke', 'black')
      .style('stroke-width', .25)
      .style('opacity', .75)
      .on('mouseenter', function(d) {
        console.log(d);      

        //isolating the translate and zoom values from the g

        if (active.size() == 1) {
          const transformValueString = g.attr('transform'); //this is the value that that transforms the g when a state is clicked
          const transformValueArray = [];
          transformValueArray[0] = transformValueString.substring(transformValueString.indexOf('(') +1, transformValueString.indexOf(',')); //x value
          transformValueArray[1] = transformValueString.substring(transformValueString.indexOf(',') +1, transformValueString.lastIndexOf(')', 57)); //y value
          transformValueArray[2] = transformValueString.substring(transformValueString.lastIndexOf('(') +1, transformValueString.lastIndexOf(')'));
          
          const translateX = parseFloat(transformValueArray[0]);
          const translateY = parseFloat(transformValueArray[1]);
          const translateScale = parseFloat(transformValueArray[2]);

          const circleCx = parseFloat(d3.select(this).attr('cx'));
          const circleCy = parseFloat(d3.select(this).attr('cy'));

          // newCx = prevCx * scale + translateX
          //const untransformedCx = (circleCx - translateX) / translateScale;
          //const untransformedCy = (circleCy - translateY) / translateScale;
          const transformedCx = translateScale * circleCx + translateX;
          const transformedCy = translateScale * circleCy + translateY;

          console.log(transformValueString);
          console.log('cx:',circleCx, transformedCx);
          console.log('cy:',circleCy, transformedCy);
          console.log('translateX:',translateX);
          console.log('translateY:',translateY);
          console.log('translateScale:',translateScale);

          console.log(circleCx - translateX);

          //changing color of circle to purple on hover

          d3.selectAll('.city')
            .style('fill', 'var(--city_yellow');

          d3.select(this)
            .transition()
            .style('fill', 'var(--bright_purple');
          
          console.log(d3.select(this));

          //tooltip

          const cityTooltip = d3.select('.map')
          .append('div')
          .attr('class', 'cityTooltip')
          .style('left', `${transformedCx}px`)
          .style('top', `${transformedCy}px`);
         
          cityTooltip.append('p')
            .html(d.city +','+ d.state)
            .style('font-size', '20px')
            .style('color', 'var(--city_yellow')
            .style('-webkit-text-stroke', '.5px black')
            .style('-moz-text-stroke', '.5px black');
          
          if (d.value === 1) {
            cityTooltip.append('p')
              .html(`${d.value} brewery`)
              .style('font-size', '16px');
          } else if (d.value > 1) {
            cityTooltip.append('p')
              .html(`${d.value} breweries`)
              .style('font-size', '16px');
          }
        
          d.breweryList.forEach(function(breweryName) {
            cityTooltip.append('p')
              .html(breweryName)
              .style('font-size', '12px')
          });
        
        }
      })
      .on('mouseleave', function() {    

        if (active.size() === 1) {
          //changing color of circle to yellow on hover
          console.log(d3.select(this));
          d3.selectAll('.city')
          .style('fill', 'var(--city_yellow)');

          d3.selectAll('.cityTooltip')
            .transition()
            .style('opacity', 0)
            .remove();
        }
      })
      
  //first, I save the beers and breweries to prefiltered variables. //This gets displayed to the initalized state.

  const prefilteredBeers = beers;
  const prefilteredBreweries = breweries;

  d3.select('#state')
    .html('U.S.');

  d3.select('#breweries')
    .html(breweries.length)

  d3.select('#beers')
    .html(beers.length);

  //zooming behavior https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2

    function clicked(d) {

      //color all circles yellow
      d3.selectAll('.city')
        .style('fill', 'var(--city_yellow');

      //returns state to cholorpleth color
      colorStates();

      //hide legend
      d3.select('.legendLinear').style('display', 'none');

      beers = prefilteredBeers; //when clicked, i reset the filtered variables to the prefiltered ones
      breweries = prefilteredBreweries;
      if (active.node() === this) return reset();
      active.classed("active", false);
      active = d3.select(this).classed("active", true);
      const activeState = d3.select(active.node())
          .attr('id');
      console.log(activeState);

      const filteredBeers = beers.filter(d => { //these functions filter the data by the state that is clicked
        if (activeState == d.brewery_state) {
          return d.brewery_state;
        }
      });

      const filteredBreweries = breweries.filter(d => {
        if (activeState == d.State) {
          return d.State;
        }
      })

      beers = filteredBeers; //now, I set the variables to the filtered ones
      breweries = filteredBreweries;
      console.log(beers);
      console.log(breweries);
      console.log(breweries.length);

      //fills in the state that is selected
      d3.selectAll('.state_selected')
        .html(activeState)
        .style('color', 'var(--bright_red)');

      d3.select('#breweries')
        .html(breweries.length);

      d3.select('#beers')
        .html(beers.length);
      
      //changes color of state to bright red
      d3.select('.active')
        .style('fill', 'var(--state_red');

      const bounds = path.bounds(d),
          dx = bounds[1][0] - bounds[0][0],
          dy = bounds[1][1] - bounds[0][1],
          x = (bounds[0][0] + bounds[1][0]) / 2,
          y = (bounds[0][1] + bounds[1][1]) / 2,
          scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / w, dy / h))),
          translate = [w / 2 - scale * x, h / 2 - scale * y];

      svg.transition()
          .duration(750)
          .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) );

      abvHistogram(beers, 'update'); //passing the filtered variables to the other charts
      ibuHistogram(beers, 'update');
      scatterplot(beers, 'update');
    }

    function reset() {
      //returns states to cholorpleth color
      colorStates();

      //returns all 

      //show legend
      d3.select('.legendLinear').style('display', 'block');

      active.classed("active", false);
      active = d3.select(null);
      beers = prefilteredBeers; //the reset function resets the variables back to unfiltered
      breweries = prefilteredBreweries;

      svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity);

      d3.selectAll('.state_selected')
        .html('the United States')
        .style('color', 'var(--black)');

      d3.select('#breweries')
        .html(breweries.length)

      d3.select('#beers')
        .html(beers.length);

      abvHistogram(beers, 'update');
      ibuHistogram(beers, 'update');
      scatterplot(beers, 'update');
    }

    function zoomed() {
      //this changes the transform on the g
      g.style("stroke-width", 1.5 / d3.event.transform.k + "px");

      g.attr("transform", d3.event.transform); // updated for d3 v4
     
    }

    // If the drag behavior prevents the default click,
    // also stop propagation so we don’t click-to-zoom.
    function stopped() {
      if (d3.event.defaultPrevented) d3.event.stopPropagation();
    }

    //this is the intial state for the charts on page load - unfiltered
    abvHistogram(beers, 'initialized');
    ibuHistogram(beers, 'initialized');
    scatterplot(beers, 'initialized');
}

export default geoMap;