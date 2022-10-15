var region = 'UA';
var countryDataArray = [['Country', 'Color']];
var mapColors = [];

export function prepMap() {
  google.charts.load('current', {
    packages: ['geochart'],
  });
  google.charts.setOnLoadCallback(drawAll);
}

function drawAll() {
  drawWorldMap();
  drawCountryMap();
}

function drawWorldMap() {
  var data = google.visualization.arrayToDataTable(countryDataArray);

  var options = {
    domain: 'UA',
    enableRegionInteractivity: 'false',
    legend: 'null',
    colorAxis: {
      colors: mapColors,
    },
    backgroundColor: 'transparent',
    datalessRegionColor: '#ccc',
    defaultColor: '#ccc',
  };

  var chart = new google.visualization.GeoChart(
    document.getElementById('world-map')
  );
  chart.draw(data, options);
}

function drawCountryMap() {
  var data = google.visualization.arrayToDataTable([['Country'], [region]]);

  var options = {
    displayMode: 'regions',
    resolution: 'countries',
    domain: 'UA',
    region: region,
    enableRegionInteractivity: 'false',
    legend: 'null',
    backgroundColor: 'transparent',
    datalessRegionColor: 'transparent',
    defaultColor: '#ccc',
  };

  var chart = new google.visualization.GeoChart(
    document.getElementById('country-map')
  );

  chart.draw(data, options);
}

export function modifyWorldMap(countries) {
  let counter = 1;
  let countryBlock = [];
  mapColors = [];
  countryDataArray = [['Country', 'Color']];

  countries.forEach(({ short }) => {
    const colorArray = [
      '#9e0142',
      '#d53e4f',
      '#f46d43',
      '#fdae61',
      '#fee08b',
      '#e6f598',
      '#abdda4',
      '#66c2a5',
      '#3288bd',
      '#5e4fa2',
    ];
    mapColors.push(colorArray[counter - 1]);
    countryBlock = [short, counter];
    countryDataArray.push(countryBlock);

    counter += 1;
  });
  drawWorldMap();
}

export function clearWorldMap() {
  countryDataArray = [['Country', 'Color']];
  drawWorldMap();
}

export function modifyCountryMap(short) {
  region = short;
  drawCountryMap();
}
