var pieChart = {};
var pieChart = function(el, data) {
  this.$el = d3.select(el);
  var el_top = $(el).offset().top;
  var el_left = $(el).offset().left;
  
  var _width, _height, svg, pie, arc, arcOver, tooltip, years, yearsdiv, drilldown, cuts;
  var margin = {top: 10, right: 32, bottom: 48, left: 32};


  // Calculate based on element (window) size
  this._calcSize = function() {
    _width = parseInt(this.$el.style('width'), 10) - margin.left - margin.right;
    _height = parseInt(this.$el.style('height'), 10) - margin.top - margin.bottom;
  };

  this._calcSize();
  var width = _width,
      height = _height,
      radius = Math.min(width, height),
      color = d3.scale.category20();

  this._init = function() {
      this._calcSize();
      svg = this.$el.append('svg')
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height + ")");

      // Add tooltip div
      tooltip = this.$el.append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

      // FIXME: generalise this to show any dimension
      yearsdiv = this.$el.append("div")
          .attr("class", "pie-years")
          .append("ul");

      // Make pie only 180 rather than 360 degrees, and rotate 90 deg CCW
      pie = d3.layout.pie()
          .value(function(d) { return +d.value; })
          .startAngle(-90*(Math.PI/180))
          .endAngle(90*(Math.PI/180))
          .sort(null);

      // Create arcs: one for normal, and one if selected
      arc = d3.svg.arc()
          .outerRadius(radius - 10)
          .innerRadius(radius - 100);
      
      arcOver = d3.svg.arc()
            .outerRadius(radius)
            .innerRadius(radius - 90);

      this.$el.on("mouseleave", mouseleave);

      this.setData(data);
  }
  
  this.setData = function(data) {
      this.drilldown = data.drilldown;
      this.data = data.records;
      
      drilldown = this.drilldown;
      
      this.cuts = data.cuts;
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
      
      years = $.map(td,
        function(c, index) {
          return c["year"];
        })
        .sort(function (a,b) {
          return a<b;
        });
      
      if (this.cuts != null) {
          this.data = this.data.filter(filterByCut)[0]["values"];
      }
      
      this.update();
  }
  
  this.update = function () {
      var value = this.value === "count"
          ? function() { return 1; }
          : function(d) { return d.value; };

      drilldown = this.drilldown;

  	  var g = svg.selectAll(".arc")
                 .data(pie(this.data));
      
      g
      	  .enter().append("path")
          .attr("d", arc)
  	      .style("stroke", "#fff")
          .style("stroke-width", 1)
  	      .style("fill-rule", "evenodd")
          .attr("class", "arc segment")
          .each(function(d) { this._current = d; })
          .attr("class", function(d) { return "arc segment " + d.data[drilldown]; })
          ;        
                 
      g
          .on("mousemove",mouseover)
          .on("click",mouseclick);
          
      g
          .transition().duration(750)
          .attrTween("d", arcTween);

      // FIXME: generate based on data
        
      var pieul = d3.select(".pie-years ul")
        .selectAll(".year-li")
        .data(years)
        .enter()
        .append("li")
        .attr("class", function(d) {
          if (cuts["year"] == d) {
            return "year-li active";
          }
          return "year-li";
        })
        .attr("data-year", function(d) {return d;})
        .text(function(d) {return d;});
        
      pieul.transition()
        .attr("class", function(d) {
          if (cuts["year"] == d) {
            return "year-li active";
          }
          return "year-li";
        });

  }
  
  function mouseover(d) {
    var seg = d3.select(this);
      seg
        .transition()
        .duration(200)
        .style("opacity", 0.5);
      seg
        .on("mouseleave", mouseleave);
          
      var revenue = dec(d.value);

      d3.select('.tooltip')
        .transition()
        .duration(200)
        .style("opacity", .8);
      d3.select('.tooltip')
        .html("<h4>" + d.data[drilldown] + "</h4><small>Revenue: $ " + revenue + "</small>")  
        .style("left", (d3.event.pageX-el_left+20) + "px")     
        .style("top", (d3.event.pageY-el_top+20) + "px");
  }
  
  function mouseclick(d) {
      var seg = d3.select(this);
      if (seg.classed("selected")) {      
          seg
              .classed("selected", false)
              .transition()
              .duration(200)
              .attr("d", arc)
              .style("stroke-width", 1);
      } else {      
          seg.classed("selected", true)
             .transition()
             .duration(200)
             .attr("d", arcOver)
             .style("stroke", "white")
             .style("stroke-width", 1);          
      }
  }

  function mouseleave(d) {
      d3.selectAll(".segment")
        .transition()
        .duration(200)
        .style("opacity", 1);
      d3.select(".tooltip")
        .style("opacity", 0);
  }
  
  function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
      return arc(i(t));
    };
  }
  
  var dec = d3.format(',.2f');
  
  this._init();
};