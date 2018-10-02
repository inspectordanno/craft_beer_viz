// this file creates breakpoints and sizes the charts

//first, I get the window dimensions

const wW = window.innerWidth;
const wH = window.innerHeight;

//then, I define a margin

export const margin = {
  top: 10,
  right: 30,
  bottom: 50,
  left: 60
}

//geomap dimensions
export let mapWidth;
export let mapHeight;

//histograms dimensions
export let histWidth;
export let histHeight;

//scatterplot dimenions
export let scatterWidth;
export let scatterHeight;

//then, I set my breakpoints

if (wW >= 768 ) {
  mapWidth = 700;
  mapHeight = 500;

  histWidth = 336;
  histHeight = 222;

  scatterWidth = 692;
  scatterHeight = 535;

//landscape phone 
} else if (wW < 768) {

  mapWidth = 336;
  mapHeight = 222;

  histWidth = 300;
  histHeight = 222;

  scatterWidth = 300;
  scatterHeight = 222;

}

