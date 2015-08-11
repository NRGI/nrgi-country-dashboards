var pieChart = {};
var pieChart = function(el, data) {
  this.$el = d3.select(el);
  var el_top = $(el).offset().top;
  var el_left = $(el).offset().left;
  
  var _width, _height, svg, pie, arc, drilldown, cuts, legend, tip;
  var margin = {top: 10, right: 32, bottom: 10, left: 32};


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
          .attr("height", height);

      datacanvas = svg
          .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height + ")");

      tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          return "<strong>" + d.data[drilldown] + "</strong><br /><small>Revenue: $ " + dec(d.data.value) + "</small>";
        });

      // Make pie only 180 rather than 360 degrees, and rotate 90 deg CCW
      pie = d3.layout.pie()
          .value(function(d) { return +d.value; })
          .startAngle(-90*(Math.PI/180))
          .endAngle(90*(Math.PI/180))
          .sort(null);

      // Create arc
      arc = d3.svg.arc()
          .outerRadius(radius - 10)
          .innerRadius(radius - 100);

      // Create legend
      legend = datacanvas.selectAll(".legend")
          .data(["Oil", "Gold", "Other"])
          .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function (d, i) {
            var lw = width * 1.5;
            lw -= 80;
            lh = -height + 20 + (i * 20);
            return "translate(-" + lw + "," + lh + ")";
          });
      legend.append("rect")
          .attr("width", 18)
          .attr("height", 18);
      legend.append("text")
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end");

      svg.call(tip);

      this.setData(data);
  }
  
  this.setData = function(data) {
      this.data = data.data;
      this.drilldown = data.drilldown;
      this.cuts = data.cuts;
      this.update();
  }
  
  this.update = function () {

      // Update to ensure correct size
      this._calcSize();
      width = _width,
      height = _height,
      radius = Math.min(width/2, height);
      svg
        .attr("width", width)
        .attr("height", height);
      datacanvas
        .attr("transform", "translate(" + width / 2 + "," + height + ")");

      // Update arcs
      arc
        .outerRadius(radius - 10)
        .innerRadius(radius - 100);
      datacanvas.selectAll(".arc")
        .attr("d", arc);

      // Update legends
      datacanvas.selectAll(".legend")
        .attr("transform", function (d, i) {
          var lw = width * 1.5;
          // Needs to be this to compensate for a) width, b) datacanvas transform
          lw -= 100;
          lh = -height + 20 + (i * 20);
          return "translate(-" + lw + "," + lh + ")";
        });
      legend.select("rect")
          .attr("x", width - 18)
          .attr("class", function(d) { return d });
      legend.select("text")
          .attr("x", width - 24)
          .text(function (d) { return d; });

      var value = this.value === "count"
          ? function() { return 1; }
          : function(d) { return d.value; };

      // Create arcs
      drilldown = this.drilldown;

      var g = datacanvas.selectAll(".arc")
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
          })
          .on("mouseover", mouseover)
          .on("mouseout", mouseleave);

      g
          .transition().duration(750)
          .attrTween("d", arcTween);
  }
  
  function mouseover(d) {
    tip.show(d);
    var seg = d3.select(this);
    seg
      .transition()
      .duration(200)
      .style("opacity", 0.5);
  }

  function mouseleave(d) {
    tip.hide();
    d3.selectAll(".segment")
      .transition()
      .duration(200)
      .style("opacity", 1);
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