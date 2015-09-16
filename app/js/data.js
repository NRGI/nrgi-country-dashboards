var makeExploreData = {},
    makeCompaniesData = {},
    lineData = {},
    barData = {};
makeExploreData = function(data) {
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
              return undefinedIsZero(parseFloat(d.value));
            });
          }).entries(items);
        // Create companies: roll up sum of revenue under company name
        robj["companies"] = d3.nest()
          .key(function(d) {
            return d["project_name"];
          })
          .rollup(function(items){
            crobj = {}
            crobj["commodities"] = d3.nest()
              .key(function(d) {
                return d[drilldown];
              })
              .rollup(function(items){
                return d3.sum(items, function(d) {
                  return undefinedIsZero(parseFloat(d.value));
                });
              }).entries(items);
            crobj["revenue"] = d3.nest()
              .key(function(d) {
                return d.value_type;
              })
              .rollup(function(items){
                return d3.sum(items, function(d) {
                  return undefinedIsZero(parseFloat(d.value));
                });
              }).entries(items);
            crobj["sum"] = d3.sum(items, function(d) {
                      return undefinedIsZero(parseFloat(d.value));
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
              var y0 = 0;
              vobj = {};
              vobj["name"] = v.key;
              vobj["value"] = v.values.sum;
              vobj["commodities"] = v.values.commodities;
              vobj["revenue"] = v.values.revenue.map(
                function(r) {
                  robj = {}
                  robj["company_name"] = v.key;
                  robj["name"] = r.key;
                  robj["value"] = r.values;
                  robj["y0"] = y0;
                  robj["y1"] = y0 += r.values;
                  return robj;
                }
              );
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
makeCompaniesData = function(data) {

  var parseDate = d3.time.format("%Y").parse;
  
  this.data = data.records;
  this.data = d3.nest()
    .key(function(d) {
      return d["project_name"];
    })
    .key(function(d) {
      return d.value_type;
    })
    .key(function(d) {
      return d.year;
    })
    .rollup(function(items){
      return d3.sum(items, function(d) {
        return undefinedIsZero(parseFloat(d.value));
      });
    })
    .entries(this.data)
    .map(
      function(d) {
        obj = {};
        obj["name"] = d.key;
        obj["data"] = d.values.map(
          function(v) {
            vobj = {};
            vobj["value_type"] = v.key;
            vobj["name"] = v.key;
            vobj["data"] = v.values.map(
              function(vv) {
                vvobj = {};
                vvobj["name"] = v.key;
                vvobj["year"] = vv.key;
                vvobj["date"] = parseDate(vv.key);
                vvobj["value"] = vv.values;
                vvobj["company_name"] = d.key;
                return vvobj;
              }
            );
            return vobj;
          }
        );
        obj["x"] = {
          "domain": [parseDate("2006"), parseDate("2013")],
          "label": "Year"
        }
        var maxY = d3.max($.map(obj.data, function(k) {
            return $.map(k.data, function(l) {
              return l.value;
            });
          }));
        obj["y"] = {
          "domain": [0, maxY],
          "label": "Revenue"
        }
				obj["currency"] = "GHS";
        return obj;
      }
    );

    this.data.sort(function (a,b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

  var _d = {};
  _d.data = {};

  $.map(this.data, function(k, v){
    _d.data[k.name] = k;
  });
  _d.companies = $.map(_d.data, function(k, v){
    return v;
  });

  return _d;
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
          return undefinedIsZero(parseFloat(d.value));
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

  var maxY = d3.max($.map(this.data, function(k) {
      return $.map(k.data, function(l) {
        return l.value;
      });
    }));

  _d["x"] = {
    "domain": [yd_min, yd_max],
    "label": "Year"
  }

  _d["y"] = {
    "domain": [0, maxY],
    "label": "Revenue"
  }
	_d.currency = "GHS";
  return _d;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function undefinedIsZero(v) {
  if (!isNumeric(v)) {
    return 0;
  }
  return v;
}
barData = function(data) {
  var out = {}
  out.data = data.data;
  xDomain = $.map(data.data, function(d) {
    return d.name;
  });
  yDomain = $.map(data.data, function(d) {
    return d.value;
  });
  yMax = d3.max(yDomain);
  out.x = {
    "domain": xDomain,
    "label": "Company"
  }
  out.y = {
    "domain": [0, yMax],
    "label": "Revenue"
  }
	out.currency = "GHS"
  return out;
}