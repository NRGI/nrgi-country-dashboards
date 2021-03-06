// linechart.js

var lineChart = {};

var lineChart = function(el, data) {
  this.$el = d3.select(el);

  this.data = null;
  this.xData = null;
  this.yData = null;

  var margin = {top: 10, right: 32, bottom: 48, left: 32};
  var _width, _height;
  // Scales, Axis, line and area functions.
  var x, y, xAxis, line, area, bisector, tip, legend;
  // Elements.
  var svg, dataCanvas;

  this._calcSize = function() {
    _width = parseInt(this.$el.style('width'), 10) - margin.left - margin.right;
    _height = parseInt(this.$el.style('height'), 10) - margin.top - margin.bottom;
  };

  this.setData = function(data) {
    this.data = data.data;
    this.xData = data.x;
    this.yData = data.y;
		this.currency = data.currency;
    this.update();
  }
  
  this._init = function() {
    this._calcSize();
    svg = this.$el.append('svg')
      .attr('class', 'chart');      
      
    x = d3.time.scale();
    y = d3.scale.linear();
    
		//Define xAxis function.
    xAxis = d3.svg.axis()
      .scale(x)
      .ticks(6)
      .orient("bottom");

    // Line function.
    line = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); })
      .interpolate("monotone");

    // Chart elements.
    dataCanvas = svg.append("g")
        .attr('class', 'data-canvas')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
      .attr("class", "x axis")
      .append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle");

    svg.append("g")
      .attr("class", "y axis")
      .append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle");

    dataCanvas.append("g")
      .attr("class", "series");

    dataCanvas.append("g")
      .attr("class", "focus-circles");

    // Create legend
    dataCanvas.append("g")
      .attr("class", "legends");

    this.setData(data);
  };
  this.update = function() {
    this._calcSize();
    height = _height,
    width = _width;
    var _this = this;

		var currency = this.currency;
	  tip = d3.tip()
	    .attr('class', 'd3-tip')
	    .offset([-10, 0])
	    .html(function(d) {
	      return "<strong>" + d.year + "</strong><br /><small>" + d.name + "</small><br /><small>" + currency + " " + dec(d.value) + "</small>";
	    });

    svg.call(tip);

    var yAxisGroup = svg.select('.y.axis');

    yAxisGroup.selectAll('.axis-lines')
      .data([
        {x1: 0, x2: _width + margin.left + margin.right, y1: 0.5, y2: 0.5},
        {x1: 0, x2: _width + margin.left + margin.right, y1: _height + margin.top + 10.5, y2: _height + margin.top + 10.5}
      ])
    .enter().append('line')
      .attr('class', 'axis-lines')
      .attr('x1', function(d) {return d.x1; })
      .attr('y1', function(d) {return d.y1; })
      .attr('x2', function(d) {return d.x2; })
      .attr('y2', function(d) {return d.y2; });

    yAxisGroup.selectAll('.axis-lines')
      .attr('x1', function(d) {return d.x1; })
      .attr('y1', function(d) {return d.y1; })
      .attr('x2', function(d) {return d.x2; })
      .attr('y2', function(d) {return d.y2; });

    yAxisGroup.selectAll('.label-min')
      .data([this.yData.domain[0]])
    .enter().append('text')
      .attr('class', 'label-min')
      .attr('x', 0)
      .attr('y', _height + margin.top)
      .text(function(d) {return d;});

    yAxisGroup.selectAll('.label-min')
      .attr('x', 0)
      .attr('y', _height + margin.top)
      .text(function(d) {return d;});

    yAxisGroup.selectAll('.label-max')
      .data([this.yData.domain[1]])
    .enter().append('text')
      .attr('class', 'label-max')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', '14px') // 14 is for the font size.
      .text(function(d) {return d;});

    yAxisGroup.selectAll('.label-max')
      .attr('x', 0)
      .attr('y', 0)
      .text(function(d) {
        var value = d;
        var suffix = '';
        if (value / 1e6 >= 1) {
          suffix = ' M';
          value = Math.round(value / 1e6);
        }
        return dec(value) + suffix;
      });

    // Provide the range and domain for x and y axes
    x.range([0, _width])
      .domain(this.xData.domain);

    y.range([_height, 0])
      .domain(this.yData.domain);
    svg
      .attr('width', _width + margin.left + margin.right)
      .attr('height', _height + margin.top + margin.bottom);

    dataCanvas
      .attr('width', _width)
      .attr('height', _height);

    // Create lines for all series
    series = dataCanvas.select("g.series").selectAll(".line")
      .data(this.data);

    series
      .enter()
      .append("path")
      .attr("class", function(d) { return "line " + slugify(d.name);})
      .attr("d", function(d) { return line(d.data); });

    series
      .attr("d", function(d) { return line(d.data); });

    series
      .exit().remove();

    // Create focus circle for each data point in each series
    focuscircle = dataCanvas.select("g.focus-circles")
      .selectAll(".focus-circle")
      .data($.map(this.data, function(k) { return k.data; }));

    focuscircle
      .enter()
      .append("circle")
			.attr("class","focus-circle")
      .style('opacity', 0)
			.attr("r",12);

    focuscircle
        .attr("cx", function(d,i){ return x(d.date);})
        .attr("cy",function(d,i){return y(d.value);});

    focuscircle
        .on("mouseover", circlemouseover)
        .on("mouseout", circlemouseout);

    focuscircle.exit().remove();

    // Update legends
    var legends = dataCanvas.select(".legends");
    var legend = legends
        .selectAll(".legend")
        .data($.map(this.data, function(k) { return k.name; }));

    legend
      .enter()
      .append("g")
      .attr("class", "legend")
      .html("<rect/><text/>");

    legend
      .attr("transform", function (d, i) {
        var lw = _width;
        // Needs to be this to compensate for a) width, b) datacanvas transform
        lw -= 100;
        lh =  20 + (i * 20);
        return "translate(-" + lw + "," + lh + ")";
      });

    legend.select("rect")
        .attr("x", _width + 35)
        .attr("width", 18)
        .attr("height", 18)
        .attr("class", function(d) { return slugify(d) });

    legend.select("text")
        .attr("x", _width + 29)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) { return d; });

    legend
        .exit().remove();

    // Append Axis.
    svg.select(".x.axis")
      .attr("transform", "translate(" + margin.left + "," + (_height + margin.top + 10) + ")").transition()
      .call(xAxis);

    if (this.xData && this.xData.label) {
      svg.select(".x.axis .label")
        .text(this.xData.label)
        .attr("x", _width / 2)
        .attr("y", 35);
    }

    if (this.yData && this.yData.label) {
      svg.select(".y.axis .label")
        .text(this.yData.label)
        .attr('x', -(_height / 2 + margin.top))
        .attr('y', 10)
        .attr('transform', 'rotate(-90)');
    }
  }
  
  function mouseover(d) {
    d3.select(this)
      .style("stroke-width", "7px")
      .on("mouseout", function () {
          d3.select(this)
          .style("stroke-width", "4px");
      });
  }
  function circlemouseover(d) {
    thecircle = d3.select(this);
    tip.show(d);
    the_line = d3.select(".line." + slugify(d.name));
    the_line.style("stroke-width", "6px");
  }
  function circlemouseout(d) {
    thecircle = d3.select(this);
    tip.hide();
    the_line = d3.select(".line." + slugify(d.name));
    the_line.style("stroke-width", "4px");
  }

  function slugify(text)
  {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  this.destroy = function() {
    // Any clean-up would go here
    // in this example there is nothing to do
  };
  
  var dec = d3.format(',.2f');

  this._init();
};