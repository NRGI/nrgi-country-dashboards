var pieData = {}
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