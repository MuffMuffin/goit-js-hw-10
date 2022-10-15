google.charts.load('current', {
  packages: ['geochart'],
});
google.charts.setOnLoadCallback(drawRegionsMap);

const region = 'UA';

function drawRegionsMap() {
  var data = google.visualization.arrayToDataTable([['Country'], ['Ukraine']]);

  var options = {
    displayMode: 'regions',
    resolution: 'countries',
    domain: 'UA',
    region: region,
    enableRegionInteractivity: 'false',
    legend: 'null',
    backgroundColor: '#fafafa',
    datalessRegionColor: '#ccc',
    defaultColor: '#000',
  };

  var chart = new google.visualization.GeoChart(
    document.getElementById('country-map')
  );

  chart.draw(data, options);
}
