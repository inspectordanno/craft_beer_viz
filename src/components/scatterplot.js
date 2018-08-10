import * as d3 from 'd3';

//consulted this histogram example
//https://bl.ocks.org/d3noob/96b74d0bd6d11427dd797892551a103c

//This scatterplot displays beers by their IBU and ABV. Note: not every beer has an IBU value (but every beer has an ABV)! That's why
//there are less data points in this chart than in the other ones.

function scatterplot(beers, exists) {

  let ibuBeers = []; //this is a new array that will only hold beers with that have an IBU data attribute

  beers.forEach(d =>{ //if a beer has an ibu field that isn't blank, push it to the ibuBeer array
    if (d.ibu != "") {
      ibuBeers.push(d);
    }
  });

//dimensions and margins of plot
  const margin = {
      top: 10,
      right: 20,
      bottom: 50,
      left: 60
    }

  const containerWidth = document.querySelector('.scatterplot').clientWidth;
  const containerHeight = document.querySelector('.scatterplot').clientHeight;

  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  const x = d3.scaleLinear() //define x range
    .domain([0, 0.13]) //domain goes from 0% abv to 13% abv
    .range([0, width]);

  const y = d3.scaleLinear() //define x range
      .domain([0, 140])
      .range([height, 0]);

  const xAxis = d3.axisBottom()
    .scale(x)
    .ticks(13)
    .tickFormat(d3.format(',.0%'));

  const yAxis = d3.axisLeft()
      .scale(y)
      .ticks(14);

  if (exists === 'initialized') {

    const svg = d3.select('.scatterplot')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + ","+ margin.top + ")");

    const selection = svg.selectAll('circle')
      .data(ibuBeers)

    selection.enter()
      .append('circle')
      .attr('class', 'beer')
      .attr('cx', d => {
        return x(d.abv);
      })
      .attr('cy', d => {
        return y(d.ibu);
      })
      .attr('r', 5)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('fill', 'var(--beer_brown)');

      //Create X axis
      svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis);

      //text label for x axis
      svg.append("text")
        .attr("transform", `translate(${(width/2)}, ${height + margin.top * 4})`)
        .style("text-anchor", "middle")
        .style('font-size', `${width / 35}px`)
        .attr('fill', 'steelblue')
        .attr('textLength', 150)
        .text("Alcohol by Volume");

      // text label for the y axis
      svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr('y', 0 - margin.left * .6)
          .attr('x', 0 - (height/2))
          .attr('fill', '#b44663')
          .attr('textLength', 35)
          .style("text-anchor", "middle")
          .style('font-size', `${width / 35}px`)
          .text("IBU")

      //Create Y axis
      svg.append("g")
        .attr("class", "axis")
        .call(yAxis);

      svg.append('text')
          .attr('x', width * .75)
          .attr('y', height * .02)
          .attr('fill', 'var(--beer_brown)')
          .style('font-style', 'italic')
          .style('font-size', `${width / 35}px`)
          .attr('textLength', 150)
          .text('Hover over a beer!');
      
          d3.selectAll('.tick>text')
          .each(function(d,i) {
            d3.select(this).attr('letter-spacing', .25);
          })

    } else if (exists === 'update') {

      const svg = d3.select('.scatterplot')
        .select('svg')
        .select('g')

      const t = d3.transition()
          .duration(750);

      const selection = svg.selectAll('circle') //data join
        .data(ibuBeers);

      selection.transition(t) //update
        .attr('cx', d => {
          return x(d.abv);
        })
        .attr('cy', d => {
          return y(d.ibu);
        })

      selection.enter()
        .append('circle')
        .attr('class', 'beer')
        .transition(t)
        .attr('cx', d => {
          return x(d.abv);
        })
        .attr('cy', d => {
          return y(d.ibu);
        })
        .attr('r', 5)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('fill', 'var(--beer_brown)');


        selection.exit()
          .transition(t)
          .attr('r', 0)
          .remove();

    }

    //try to use getBoundingclientrect

    d3.selectAll('.beer')
      .on('mouseenter', function() {
        
        const beerCx = d3.select(this).getBoundingClientRect()
        const beerCy =  d3.select(this).g

        const beerDiv = d3.select('.scatterplot')
          .append('div')
          .attr('class', 'tooltip')
          .style('left', `${beerCx}px`)
          .style('top', `${beerCy}px`);
         
      })
      .on('mouseleave', function() {
       
      })
}

export default scatterplot;
