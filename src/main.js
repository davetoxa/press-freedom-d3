window.onload = function () {
  var svg, path, getColor, years = [], colors = []
  var defaultColor = 'white'
  var currentYear = '2014'
  var colors = [
    '#a50026',
    '#d73027',
    '#f46d43',
    '#fdae61',
    '#fee08b',
    '#d9ef8b',
    '#a6d96a',
    '#66bd63',
    '#1a9850',
    '#006837'
  ]

  function init() {
    setMap();
  }

  function setMap() {
    var width = 818, height = 600

    svg = d3.select('#map').append('svg')
        .attr('width', width)
        .attr('height', height)

    var miller = d3.geo.miller()
      .scale(130)
      .translate([width / 2, height / 2])
      .precision(.1)

    path = d3.geo.path().projection(miller)
    getColor = d3.scale.quantize().domain([100,0]).range(colors)

    loadData()
  }

  function loadData() {
    queue()
      .defer(d3.json, "../data/topoworld.json")
      .defer(d3.csv, "../data/freedom.csv")
      .await(processData)
  }

  function processData(error, worldMap, countryData) {
    var world = topojson.feature(worldMap, worldMap.objects.world)
    var countries = world.features
    for (var i in countries) {
        for (var j in countryData) {
            if (countries[i].id == countryData[j].ISO3166) {
                for(var k in countryData[j]) {
                    if (k != 'Country' && k != 'ISO3166') {
                        if (years.indexOf(k) == -1) {
                            years.push(k)
                        }
                        countries[i].properties[k] = Number(countryData[j][k])
                    }
                }
                break;
            }
        }
    }
    drawMap(world)
  }

  function drawMap(world) {
    svg.append('g')
      .selectAll('.country')
      .data(world.features)
      .enter().append('path')
      .attr('class', 'country')
      .attr('d', path)
    sequenceMap()
  }

  function sequenceMap() {
    d3.selectAll('.country').style('fill', function(d) {
      return getColor(d.properties[currentYear]) || defaultColor;
    })
  }

  init()
}
