var pieChart = {};
var pieChart = function(el, data) {
  this.$el = d3.select(el);
  var el_top = $(el).offset().top;
  var el_left = $(el).offset().left;
  
  var _width, _height, svg, pie, arc, arcOver, tooltip, years;
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
      years = this.$el.append("div")
          .attr("class", "pie-years");

      // Make pie only 180 rather than 360 degrees, and rotate 90 deg CCW
      pie = d3.layout.pie()
          .sort(null)
          .value(function(d) { return d.size; })
          .startAngle(-90*(Math.PI/180))
          .endAngle(90*(Math.PI/180));

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
      this.data = data;
      this.update();
  }
  
  this.update = function () {
      var value = this.value === "count"
          ? function() { return 1; }
          : function(d) { return d.size; };

  	  var g = svg.selectAll(".arc")
  	      .data(pie(this.data))
    	  .enter().append("g")
          .attr("class", "arc");
      g.append("path")
          .attr("d", arc)
  	      .style("stroke", "#fff")
  	      .style("fill-rule", "evenodd")
          .attr("class", function(d) { return "segment " + d.data.name; })
          .on("mousemove",mouseover)
          .on("click",mouseclick);
          
      // FIXME: generate based on data
      d3.select(".pie-years")
          .html('<ul><li class="active">2013</li><li>2012</li><li>2011</li></ul>')
  }
  
  function mouseover(d) {
    var seg = d3.select(this);
      seg
        .transition()
        .duration(200)
        .style("opacity", 0.5);
      seg
        .on("mouseleave", mouseleave);
          
      var revenue = numberWithCommas(d.value);

      d3.select('.tooltip')
        .transition()
        .duration(200)
        .style("opacity", .8);
      d3.select('.tooltip')
        .html("<h4>" + d.data.name + "</h4><small>Revenue: $ " + revenue + "</small>")  
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
              .style("stroke-width", 0);
      } else {      
          seg.classed("selected", true)
             .transition()
             .duration(200)
             .attr("d", arcOver)
             .style("stroke", "grey")
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
  
  function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  this._init();
};