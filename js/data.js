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
    if (this.drilldown != null) {
      this.data = d3.nest()
        .key(function(d) {
          return d.year;
        })
        .key(function(d) {
          return d[drilldown];
        })
        .rollup(function(items){
          return d3.sum(items, function(d) { 
            return parseFloat(d.value)
          });
        })
        .entries(this.data)
        .map(
          function(d) {
            obj = {};
            obj["year"] = d.key;
            obj["values"] = d.values.map(
              function(v) {
                vobj = {};
                vobj[drilldown] = v.key;
                vobj["value"] = v.values;
                commodities[v.key] = true;
                return vobj;
              }
            );
            return obj;
          }
        );
    }
    var td = this.data;
    for (i=0; i < td.length; i++) {
      var seenc = td[i].values.map(
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
            td[i]["values"].push(vcobj);
            }
          }
      );
      td[i]["values"].sort(function (a,b) {
        return a.commodity < b.commodity;
      });
    }
    this.data = td;
    
    this.years = $.map(td,
      function(c, index) {
        return c["year"];
      })
      .sort(function (a,b) {
        return a<b;
      });
    
    if (this.cuts != null) {
        this.data = this.data.filter(filterByCut)[0]["values"];
    }
    
    var out = {}
    out["data"] = this.data;
    out["cuts"] = this.cuts;
    out["drilldown"] = this.drilldown;
    out["years"] = this.years;
    return out;
}