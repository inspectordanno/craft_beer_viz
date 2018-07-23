import * as d3 from 'd3';
import {legendColor} from 'd3-svg-legend';

//import other components

import abvHistogram from './abv_histogram';
import ibuHistogram from './ibu_histogram';
import scatterplot from './scatterplot';

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
    .scale(w);

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

  svg.append('g')
    .attr('class', 'legendLinear')
    .attr('transform', `translate(${w * .82}, ${h * .65}) scale(${w * .001})`);

  const legendLinear = legendColor()
    .title('# of Craft Breweries')
    .shapeWidth(50)
    .orient('vertical')
    .scale(color)
    .labelFormat(d3.format(".0f"));

  svg.select('.legendLinear')
    .call(legendLinear);

  svg.append('rect')
    .attr('class', 'background')
    .attr('width', w)
    .attr('height', h)
    .attr('fill', 'white')
    .on('click', reset);


  const g = svg.append('g')
    .attr('id', 'gMap');

  g.selectAll('path') //this creates the chloropleth
    .data(json.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('class', 'feature')
    .attr('id', d => d.properties.name)
    .on('click', clicked)
    .style('fill', d => {
      const value = d.properties.value;
      if (value) {
        return color(value); // if value exists
      } else {
        return '#ccc'; //if value is undefined
      }
    });

    //this section of the commented out code maps the breweries via lat and long values to the map. I couldn't get it to work with the zooming
    //this is something I can work on in the future

    const radiusScale = d3.scaleLinear()
      .domain([d3.min(breweriesPerCityValues), d3.max(breweriesPerCityValues)])
      .range([.5, 5]);

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
      .style('fill', 'yellow')
      .style('stroke', 'gray')
      .style('stroke-width', .25)
      .style('opacity', .75)
      .on('mouseover', function() {
        console.log(active.size());;

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

          console.log(transformValueString);
          console.log('cx:',circleCx);
          console.log('cy:',circleCy);
          console.log('translateX:',translateX);
          console.log('translateY:',translateY);
          console.log('translateScale:',translateScale);

          console.log(circleCx - translateX);

          // console.log(d3.select(this).attr('cx'));

          d3.select('#brewery_tooltip')
            .classed('hidden', false)
            .style('left', circleCx - translateX + 'px')
            .style('top', circleCy - translateY + 'px')
            //take the cx and cy of the circle, and adjust it based on the transform properties

          //foreign object tooltip  
         
          const fo = g.append('foreignObject')
            .attr('class', 'svg_tooltip')
            .attr('x', circleCx)
            .attr('y', circleCy)
            .attr('width', '2px')
            .attr('height', '2px')
          
          const div = fo.append('xhtml:div')
            .append('div')
            // .style('padding', '10px')
            .style('background-color', 'gray');
          
          div.append('p')
            .html('Holmes was certainly not a difficult man to live with.')
            .style('font-size', '2px');

        }
      })
      .on('mouseout', function() {
        d3.select('#brewery_tooltip')
          .classed('hidden', true);
        
        d3.selectAll('.svg_tooltip')
          .remove();
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

      d3.select('#state')
        .html(activeState);

      d3.select('#breweries')
        .html(breweries.length);

      d3.select('#beers')
        .html(beers.length);

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
      active.classed("active", false);
      active = d3.select(null);
      beers = prefilteredBeers; //the reset function resets the variables back to unfiltered
      breweries = prefilteredBreweries;

      svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity);

      d3.select('#state')
        .html('U.S.');

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