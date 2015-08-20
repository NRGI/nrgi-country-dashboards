var exploreOptions, explorePieChart, pieD;
var lineOptions, thisLineChart, lineD;
var thisBarChart;

// This creates the data explorer
d3.json("data/gheiti-revenues.json", function(error, data) {
  // Create pie chart with commodities
  generateExplorer(data);
});

var generateExplorer = function(data) {

  // Company widget
  companiesData = makeCompaniesData(data);
  var companiesChart = new lineChart("#companies-line", companiesData.data[10]);
  
  var companiesSelector = d3.select("#companies-selector");
  
  var comp = companiesSelector.selectAll(".option")
    .data(companiesData.companies); 
    
  comp
    .enter()
    .append("option")
    .attr("class", "option")
    .property("selected", function(d,i){ if (d.value == 10) { return true; } else { return false; }})
    .attr("value", function(d,i){ return d.value;})
    .text(function(d,i){ return d.name;});
    
  companiesSelector
    .on("change", function(){
      companiesChart.setData(companiesData.data[this.value]);
    });
  
  exploreOptions = {
    "records": data["records"],
    "drilldown": "commodity",
    "cuts": {
      "year": "2013"
    }
  }
  pieD = makeExploreData(exploreOptions);
  pieD.data = pieD.commodities;
  explorePieChart = new pieChart("#explore-pie", pieD);

  explorePieCompanies = new companiesWidget(
    "#explore-pie-companies", pieD);

  // Create year slider
  var exploreSlider = document.getElementById( "explore-slider" );
  function filterNormal(value, type) {
    return 1;
  }
  noUiSlider.create(exploreSlider, {
    start: [parseInt(d3.max(pieD.years))],
    step: 1,
    range: {
      'min': parseInt(d3.min(pieD.years)),
      'max': parseInt(d3.max(pieD.years))
    },
    pips: {
    mode: 'steps',
    filter: filterNormal
    },
    direction: 'rtl'
  });
  
  // Add event handler when year slider moved
  exploreSlider.noUiSlider.on('set', function(){
    var year = parseInt(exploreSlider.noUiSlider.get());
    exploreOptions.cuts.year = year;
    pieD = makeExploreData(exploreOptions);
    
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

  barD = {'data' : pieD.companies}
  thisBarChart = new barChart("#explore-revenues", barData(barD));
}

// Line chart
// Should rename to something more descriptive
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

// Resizing of charts on window size change
// Uses underscore debounce to avoid crashing your browser
var resizeCharts = _.debounce(function() {
    explorePieChart.update();
    thisLineChart.update();
    thisGDPLineChart.update();
    thisBarChart.update();
}, 300);
$(window).resize(resizeCharts);

// Show map
$.getJSON("data/ghana-resource-volumes.json", function(data) {
  thisMap = new nrgiMap("", data);
});