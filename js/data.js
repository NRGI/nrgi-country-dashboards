var pieData = {},
    lineData = {};
pieData = function(data) {
    this.drilldown = data.drilldown;
    this.data = data.records;
    this.cuts = data.cuts;
    
    drilldown = this.drilldown;
    cuts = this.cuts;
    
    // Cuts should look like e.g. {"year": "2013"}
    function filterByCut(obj) {
      for (var key in cuts) {
        if (obj[key] != cuts[key]) { return false; }
      }
      return true;
    }
    
    var commodities = {}
    
    // Aggregate according to drilldown
    this.data = d3.nest()
      .key(function(d) {
        return d.year;
      })
      .rollup(function(items){
        robj = {}
        // Create commodities: roll up sum of revenue under commodity name
        robj["commodities"] = d3.nest()
          .key(function(d) {
            return d[drilldown];
          })
          .rollup(function(items){
            return d3.sum(items, function(d) {
              return parseFloat(d.value)
            });
          }).entries(items);
        // Create companies: roll up sum of revenue under company name
        robj["companies"] = d3.nest()
          .key(function(d) {
            return d.name;
          })
          .rollup(function(items){
            crobj = {}
            crobj["commodities"] = d3.nest()
              .key(function(d) {
                return d[drilldown];
              })
              .rollup(function(items){
                return d3.sum(items, function(d) {
                  return parseFloat(d.value)
                });
              }).entries(items);
            crobj["sum"] = d3.sum(items, function(d) {
                      return parseFloat(d.value)
                    });
            return crobj;
          })
          .entries(items);
        return robj;
      })
      .entries(this.data)
      // Rename and sort companies
      .map(
        function(d) {
          obj = {};
          obj["year"] = d.key;
          obj["commodities"] = d.values.commodities.map(
            function(v) {
              vobj = {};
              vobj[drilldown] = v.key;
              vobj["value"] = v.values;
              commodities[v.key] = true;
              return vobj;
            }
          );
          obj["companies"] = d.values.companies.map(
            function(v) {
              vobj = {};
              vobj["name"] = v.key;
              vobj["value"] = v.values.sum;
              vobj["commodities"] = v.values.commodities;
              return vobj;
            }
          ).sort(function (a,b) {
              return b.value - a.value;
            });
          return obj;
        }
      );
    var td = this.data;
    // Ensure all commodities exist for each year or are zero.
    for (i=0; i < td.length; i++) {
      var seenc = td[i].commodities.map(
        function(iv) {
          return iv[drilldown];
        }
      );
      $.map(commodities,
        function(c, index) {
          if (seenc.indexOf(index) < 0) {
            vcobj = {}
            vcobj[drilldown] = index;
            vcobj["value"] = "0.0"
            td[i]["commodities"].push(vcobj);
            }
          }
      );
      td[i]["commodities"].sort(function (a,b) {
        if (a.commodity < b.commodity) return -1;
        if (a.commodity > b.commodity) return 1;
        return 0;
      });
    }
    this.data = td;
    
    // Sort by year descending
    this.years = $.map(td,
      function(c, index) {
        return c["year"];
      })
      .sort(function (a,b) {
        return b - a;
      });
    
    // Filter for relevant year
    if (this.cuts != null) {
        this.data = this.data.filter(filterByCut)[0];
    }
    
    var out = {}
    out["commodities"] = this.data.commodities;
    out["companies"] = this.data.companies;
    out["cuts"] = this.cuts;
    out["drilldown"] = this.drilldown;
    out["years"] = this.years;
    return out;
}
lineData = function(data) {
  var _data = data.data.records;
  var parseDate = d3.time.format("%Y").parse;
  var years = {}

  this.drilldown = data.drilldown;

  var td = _data;
  // Aggregate according to drilldown
  if (this.drilldown != null) {
    this.data = d3.nest()
      .key(function(d) {
        return d[this.drilldown];
      })
      .key(function(d) {
        return d.year;
      })
      .rollup(function(items){
        return d3.sum(items, function(d) {
          return parseFloat(d.value)
        });
      })
      .entries(_data)
      .map(
        function(d) {
          obj = {};
          obj["name"] = d.key;
          obj["data"] = d.values.map(
            function(v) {
              vobj = {};
              vobj["year"] = v.key;
              vobj["date"] = parseDate(v.key);
              vobj["value"] = v.values;
              vobj["name"] = d.key;
              years[v.key] = true;
              return vobj;
            }
          );
          return obj;
        }
      );
  }

  var td = this.data;

  for (i=0; i < td.length; i++) {
    var seeny = td[i].data.map(
      function(iv) {
        return iv["year"];
      }
    );
    $.map(years,
      function(c, index) {
        if (seeny.indexOf(index) < 0) {
          vcobj = {}
          vcobj["year"] = index;
          vcobj["date"] = parseDate(index);
          vcobj["value"] = "0.0"
          td[i]["data"].push(vcobj);
          }
        }
    );
    td[i]["data"].sort(function (a,b) {
      return parseFloat(b.year) - parseFloat(a.year);
    });
  }
  this.data = td;
  yd = $.map(years, function(k, v){ return parseFloat(v); });
  yd_min = parseDate(String(d3.min(yd)));
  yd_max = parseDate(String(d3.max(yd)));
  var _d = {}
  _d["drilldown"] = this.drilldown;
  _d["data"] = td;
  _d["x"] = {
    "domain": [yd_min, yd_max],
    "label": "Time"
  }
  max = data.max;
  _d["y"] = {
    "domain": [0, max],
    "label": "Value"
  }
  return _d;
}
