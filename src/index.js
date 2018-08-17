import {nest} from 'd3-collection';
import {csv, json} from 'd3-fetch';
import {selectAll, on} from 'd3-selection';

import('./style/style.scss');
import('./style/grid_style.scss');
import('./style/bubbles.scss');
//This index file is just importing various modules and making promises out of the .csv files.
//For a more detailed look into how the controller (U.S. map) works to drive the chart data, please look at
//geomap.js.

const dataFiles = ['./data/beers.csv', './data/breweries.csv'];
const promises = [];

dataFiles.forEach(url => {
  promises.push(csv(url)); //this parses the csv file and pushes it to the array
});

promises.push(json('./data/us-states.json')); //this parses the json file and pushes it to the array

//import modules
import geoMap from './components/geomap';

//make promise and export it

Promise.all(promises).then(data => { //here, I am combining the two arrays in the promise into one big array of beer objects
  data[0].forEach(beer => {
    const breweryid = beer.brewery_id;
    data[1].forEach(brewery => {
      if (parseInt(breweryid) == parseInt(brewery.id)) {
        beer.brewery_name = brewery.name;
        beer.brewery_city = brewery.city;
        beer.brewery_state = brewery.State;
      }
    });
  });
  const beers = data[0]; //beer data
  const breweries = data[1]; //brewery data
  const json = data[2]; //geojson data

  const breweriesPerState = nest()
    .key(d => d.State)
    .rollup(value => value.length)
    .entries(breweries);

  console.log(breweriesPerState);

  const breweriesPerStateValues = breweriesPerState.map(d => d.value);

  console.log(breweriesPerStateValues);

  const beersPerState = nest()
    .key(d => d.brewery_state)
    .rollup(value => value.length)
    .entries(beers);

  const breweriesPerCity = nest() //how do i preserve lat and long in here? (ask steven)
      .key(d => d.c_d)
      .rollup(value => value.length)
      .entries(breweries);

    breweriesPerCity.forEach(d => {
      d.breweryList = [];
      breweries.forEach(dd => {
        if (d.key === dd.c_d) {
          d.long = dd.Longitude;
          d.lat = dd.Latitude;
          d.city = dd.city;
          d.state = dd.state;
          d.breweryList.push(dd.name);
        }
      });
    });

    const breweriesPerCityValues = [];

    breweriesPerCity.forEach(d => {
      breweriesPerCityValues.push(d.value);
    })

    console.log(breweriesPerCity);

    breweriesPerState.forEach(d => {
      const dataState = d.key;
      const dataValue = d.value;

      json.features.forEach(j => {
        const jsonState = j.properties.name;

        if (dataState == jsonState) {
          j.properties.value = dataValue;
        }
      });
    });

    geoMap(beersPerState, breweriesPerCity, breweriesPerState, breweriesPerCityValues, breweriesPerStateValues, json, beers, breweries);

})
  .catch(err => console.log(err)); // catching error in promises