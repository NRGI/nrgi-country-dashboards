var exploreOptions, explorePieChart, pieD;
var lineOptions, thisLineChart, lineD;
var thisBarChart;
var companiesChart, companiesData, companiesSelector, companyNarratives;

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
  explorePieChart = new pieChart("#explore-pie", pieD);

  explorePieCompanies = new companiesWidget(
    "#explore-pie-companies", pieD);

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
    makeCompaniesClickable();
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
    var resourceMap = new nrgiMap("", data);
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
      .replace(/\n+/g, '<br />');
}

function makeCompaniesClickable() {
  console.log($("#explore-pie-companies td.company-name"));
  $("#explore-pie-companies td.company-name")
    .each(function(company) {
      var company_name = $(this).text();
      $(this).html('<a data-name="' + company_name + '" href="">' + company_name + "</a>")
      .on("click", function(e) {
        e.preventDefault();
        selectCompany(company_name);
        $('html,body').animate({scrollTop: $("article#companies").offset().top},'slow');
      });
    });
}

// Resizing of charts on window size change
// Uses underscore debounce to avoid crashing your browser
var resizeCharts = _.debounce(function() {
    thisLineChart.update();
    explorePieChart.update();
    companiesChart.update();
    lineDPChart.update();
    thisBarChart.update();
    lineGovRevenueChart.update();
}, 1000);
$(window).resize(resizeCharts);

loadRevenueExpenditureChart();
loadDebtExtractivesChart();
loadMap();