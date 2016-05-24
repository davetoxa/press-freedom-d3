window.onload = function () {
  var width, height, svg, path, getColor, years = [], colors = []
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
    width = 818, height = 600

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
      // .defer(d3.json, "../data/topoworld.json")
      // .defer(d3.csv, "../data/freedom.csv")
      .defer(d3.json, "https://raw.githubusercontent.com/davetoxa/press-freedom-d3/master/data/topoworld.json")
      .defer(d3.csv, "https://raw.githubusercontent.com/davetoxa/press-freedom-d3/master/data/freedom.csv")
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
    addLegend()
  }

  function sequenceMap() {
    d3.selectAll('.country').style('fill', function(d) {
      return getColor(d.properties[currentYear]) || defaultColor;
    })
  }

  function addLegend() {
    var legend_width = 200, legend_height = 10, legend_padding = 10
    var legend_cell_width = legend_width / 10

    var legend = svg.append("g").attr(
      'transform',
      "translate(" + legend_padding + "," + (height-(legend_height+legend_padding)) + ")"
    )

    legend.append('rect')
      .attr('width', legend_width)
      .attr('height', legend_height)
      .style('fill', 'white')

    var lcolors = legend.append('g').style('fill', defaultColor)

    for (i = 0; i < 10; i++) {
      lcolors.append('rect')
        .attr('height', 10)
        .attr('width', legend_cell_width)
        .attr('x', i * legend_cell_width)
        .style('fill', colors[i])
    }
  }

  init()
}
