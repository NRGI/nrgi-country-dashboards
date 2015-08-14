var exploreOptions, explorePieChart, pieD;
var lineOptions, thisLineChart, lineD;

// This creates the data explorer
d3.json("data/gheiti-revenues.json", function(error, data) {
  // Create pie chart with commodities
  exploreOptions = {
    "records": data["records"],
    "drilldown": "commodity",
    "cuts": {
      "year": "2013"
    }
  }
  pieD = pieData(exploreOptions);
  pieC = pieD;
  pieD.data = pieD.commodities;
  explorePieChart = new pieChart("#explore-pie", pieD);
  explorePieCompanies = new companiesWidget(
    "#explore-pie-companies", pieD);
  var sliderYears = pieD.years;

  // Create year slider
  var exploreSlider = document.getElementById( "explore-slider" );
  function filterNormal(value, type) {
    return 1;
  }
  noUiSlider.create(exploreSlider, {
    start: [parseInt(d3.max(sliderYears))],
    step: 1,
    range: {
      'min': parseInt(d3.min(sliderYears)),
      'max': parseInt(d3.max(sliderYears))
    },
    pips: {
    mode: 'steps',
    filter: filterNormal
    },
    direction: 'rtl'
  });
  exploreSlider.noUiSlider.on('set', function(){
    var year = parseInt(exploreSlider.noUiSlider.get());
    exploreOptions.cuts.year = year;
    pieD = pieData(exploreOptions);
    pieD.data = pieD.commodities;
    explorePieChart.setData(pieD);
    explorePieCompanies.setData(pieD);
    barD.data = pieD.companies;
    thisBarChart.setData(barData(barD));
  });
  // Create line chart for commodities
  lineOptions = {
    "data": data,
    "drilldown": "commodity"
  }
  lineD = lineData(lineOptions);
  thisLineChart = new lineChart("#explore-line", lineD);

  barD = lineData(lineOptions);
  barD.data = pieD.companies;
  thisBarChart = new barChart("#explore-revenues", barData(barD));
});
var lineGDPOptions, thisGDPLineChart, lineGDPD;
var url = 'data/gdp-extractives.json';
d3.json(url, function(error, data) {
  lineGDPOptions = {
    "data": data,
    "drilldown": "commodity"
  }
  lineGDPD = lineData(lineGDPOptions);
  thisGDPLineChart = new lineChart("#explore-line-growth", lineGDPD);
});
var resizeCharts = _.debounce(function() {
    explorePieChart.update();
    thisLineChart.update();
    thisGDPLineChart.update();
}, 300);
$(window).resize(resizeCharts);

// Show map
$.getJSON("data/ghana-resource-volumes.json", function(data) {
  thisMap = new nrgiMap("", data);
});