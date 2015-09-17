var exploreOptions, explorePieChart, pieD;
var lineOptions, thisLineChart, lineD;
var barChartMining, barChartOil;
var companiesChart, companiesData, companiesSelector, companyNarratives;
var resourceMap;

// This creates the data explorer
d3.json("data/gheiti-revenues.json", function(error, data) {
  // Create pie chart with commodities
  generateExplorer(data);
});

var generateExplorer = function(data) {

  // Company-specific widget
  companiesData = makeCompaniesData(data);
  companiesChart = new lineChart("#companies-line", companiesData.data["Newmont Ghana Gold Ltd"]);
  companiesSelector = d3.select("#companies-selector");
  var comp = companiesSelector.selectAll(".option")
    .data(companiesData.companies); 
  comp
    .enter()
    .append("option")
    .attr("class", "option")
    .attr("value", function(d,i){ return d;})
    .text(function(d,i){ return d;});
  companiesSelector
    .on("change", function(){
      selectCompany(this.value);
    });
  
  // Main explorer
  exploreOptions = {
    "records": data["records"],
    "drilldown": "commodity",
    "cuts": {
      "year": "2013"
    }
  }
  pieD = makeExploreData(exploreOptions);
  pieD.data = pieD.commodities;
	pieD.currency = "GHS";
  explorePieChart = new pieChart("#explore-pie", pieD);

  exploreCompaniesMining = new companiesWidget(
    "#explore-companies-mining", {
      "companies": pieD.companies["Mining"],
      "years": pieD.years
    });

  exploreCompaniesOil = new companiesWidget(
    "#explore-companies-oil", {
      "companies": pieD.companies["Oil and Gas"],
      "years": pieD.years
    });

  makeCompaniesClickable();

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
  });
  
  // Add event handler when year slider moved
  exploreSlider.noUiSlider.on('set', function(){
    var year = parseInt(exploreSlider.noUiSlider.get());
    exploreOptions.cuts.year = year;
    pieD = makeExploreData(exploreOptions);
    
    pieD.data = pieD.commodities;
		pieD.currency = "GHS";
    explorePieChart.setData(pieD);

    exploreCompaniesMining.setData({
      "years": pieD.years,
      "companies": pieD.companies["Mining"]
    });
    exploreCompaniesOil.setData({
      "years": pieD.years,
      "companies": pieD.companies["Oil and Gas"]
    });
    makeCompaniesClickable();

    barDataMining.data = pieD.companies["Mining"];
    barChartMining.setData(barData(barDataMining));
    barDataOil.data = pieD.companies["Oil and Gas"];
    barChartOil.setData(barData(barDataOil));
  });
  // Create line chart for commodities
  lineOptions = {
    "data": data,
    "drilldown": "commodity"
  }
  lineD = lineData(lineOptions);
  thisLineChart = new lineChart("#explore-line", lineD);

  barDataMining = {'data' : pieD.companies["Mining"]}
  barChartMining = new barChart("#explore-revenues-mining", barData(barDataMining));
  barDataOil = {'data' : pieD.companies["Oil and Gas"]}
  barChartOil = new barChart("#explore-revenues-oil", barData(barDataOil));

  // load company narratives, with default
  loadCompanyNarratives("Newmont Ghana Gold Ltd");

}

// Debt and extractives chart
var lineDPOptions, lineDPChart, lineDPData;
function loadDebtExtractivesChart() {
  var url = 'data/debt-petroleum.json';
  d3.json(url, function(error, data) {
    lineDPOptions = {
      "data": data,
      "drilldown": "series"
    }
    lineDPData = lineData(lineDPOptions);
    lineDPChart = new lineChart("#debt-revenue-chart", lineDPData);
  });
}

// Govt revenue, expenditure, extractives chart
var lineGovRevenueData, lineGovRevenueChart;
var url = 'data/govt-revenues-expenditure-extractives.json';
function loadRevenueExpenditureChart() {
  d3.json(url, function(error, data) {
    lineGovRevenueData = lineData({
      "data": data,
      "drilldown": "series"
    });
    lineGovRevenueChart = new lineChart("#govt-revenue-expenditure-extractives-chart",
                               lineGovRevenueData);
  });
}

// Show map
function loadMap() {
  $.getJSON("data/ghana-resource-volumes.json", function(data) {
    resourceMap = new nrgiMap("productionMap", data, 2013);
  });
}

// Load narrative data
function loadCompanyNarratives (default_company) {
  url = "data/company-narratives.json"
  d3.json(url, function(error, data) {
    companyNarratives = {}
    $.map(data.records, function(k, v) {
      companyNarratives[k.company_name] = makeNewlines(k.narrative);
    });
    selectCompany(default_company);
  });
}

function selectCompany(company_name) {
  companiesChart.setData(companiesData.data[company_name]);
  $("#companies-selector-selected").text(company_name);
  $("#companies-narrative").html(companyNarratives[company_name]);
  $("#companies-selector").val(company_name);
}

function makeNewlines(string) {
    return string
      .replace(/\n|\r/g, '<br /><br />');
}

function makeCompaniesClickable() {
  $(".explore-companies-list td.company-name")
    .each(function(company) {
      var company_name = $(this).text();
      $(this).html('<a class="company-clickable" data-name="' + company_name + '" href="">' + company_name + "</a>");
    });
  $(document).on("click", ".company-clickable", function(e) {
    e.preventDefault();
    var company_name = $(this).text();
    selectCompany(company_name);
    $('html,body').animate({scrollTop: $("article#companies").offset().top},'slow');
  });
}

// Resizing of charts on window size change
// Uses underscore debounce to avoid crashing your browser
var resizeCharts = _.debounce(function() {
    thisLineChart.update();
    explorePieChart.update();
    companiesChart.update();
    lineDPChart.update();
    barChartMining.update();
    barChartOil.update();
    lineGovRevenueChart.update();
}, 1000);
$(window).resize(resizeCharts);

loadRevenueExpenditureChart();
loadDebtExtractivesChart();
loadMap();