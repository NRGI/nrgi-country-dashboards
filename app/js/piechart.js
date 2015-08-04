var pieChart = {};
var pieChart = function(el, data) {
  this.$el = d3.select(el);
  var el_top = $(el).offset().top;
  var el_left = $(el).offset().left;
  
  var _width, _height, svg, pie, arc, tooltip, yearsdiv, drilldown, cuts;
  var margin = {top: 10, right: 32, bottom: 48, left: 32};


  // Calculate based on element (window) size
  this._calcSize = function() {
    _width = parseInt(this.$el.style('width'), 10) - margin.left - margin.right;
    _height = parseInt(this.$el.style('height'), 10) - margin.top - margin.bottom;
  };

  this._calcSize();
  var width = _width,
      height = _height,
      radius = Math.min(width/2, height)
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
      var legend = svg.selectAll(".legend")
          .data(["Oil", "Gold", "Other"])
          .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function (d, i) { return "translate(-600," + (-100 + i * 20) + ")"; });

      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .attr("class", function(d) { return d });

      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function (d) { return d; });

      this.$el.on("mouseleave", mouseleave);

      this.setData(data);
  }
  
  this.setData = function(data) {
      this.data = data.data;
      this.drilldown = data.drilldown;
      this.cuts = data.cuts;
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
          .attr("class", function(d) {
            return "arc segment " + d.data[drilldown];
          });

      g
          .on("mousemove",mouseover);

      g
          .transition().duration(750)
          .attrTween("d", arcTween);

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