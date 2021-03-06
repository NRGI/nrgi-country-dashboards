// barchart.js

var barChart = {};

var barChart = function(el, data) {
  this.$el = d3.select(el);

  this.data = null;
  this.xData = null;
  this.yData = null;

  var margin = {top: 15, right: 32, bottom: 120, left: 32};
  var _width, _height;
  // Scales, Axis, line and area functions.
  var x, y, xAxis, line, area, tip, legend;
  // Elements.
  var svg, dataCanvas;
  var barHeight = 20;

  this._calcSize = function() {
    _width = parseInt(this.$el.style('width'), 10) - margin.left - margin.right;
    _height = parseInt(this.$el.style('height'), 10) - margin.top - margin.bottom;
  };

  this.setData = function(data) {
    this.data = data;
    this.xData = this.data.x;
    this.yData = this.data.y;
    this.currency = this.data.currency;
    this.update();
  }
  
  this._init = function() {
    this._calcSize();
    svg = this.$el.append('svg')
      .attr('class', 'chart');      
      
    x = d3.scale.ordinal();
    y = d3.scale.linear();
    
    // Define xAxis function.
    xAxis = d3.svg.axis()
      .scale(x)
      .ticks(6)
      .orient("bottom");

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
        return "<strong>" + d.company_name + "</strong><br /><small>" + d.name + "<br />" + currency + " " + dec(d.value) + "</small>";
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
    // FIXME
    x
      .domain(this.xData.domain)
      .rangeRoundBands([0, _width], .1);

    //FIXME
    y.range([_height, 0])
      .domain(this.yData.domain);
    svg
      .attr('width', _width + margin.left + margin.right)
      .attr('height', _height + margin.top + margin.bottom);

    dataCanvas
      .attr('width', _width)
      .attr('height', _height);

    // Update legends
    var legends = dataCanvas.select(".legends");
    var legend = legends
        .selectAll(".legend")
        .data($.map(this.data.data[0].revenue, function(k) { return k.name; }));

    legend
      .enter()
      .append("g")
      .attr("class", "legend")
      .html("<rect/><text/>");

    legend
      .attr("transform", function (d, i) {
        var lw = _width - 160;
        // Needs to be this to compensate for a) width, b) datacanvas transform
        lh =  (i * 20);
        return "translate(" + lw + "," + lh + ")";
      });

    legend.select("rect")
      .attr("x", 0)
      .attr("width", 18)
      .attr("height", 18)
      .attr("class", function(d) { return slugify(d) });

    legend.select("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(function (d) { return d; });

    var company = dataCanvas.selectAll(".company")
      .data(this.data.data);

    company
      .enter().append("g")
      .attr("class", "g company")
      .attr("transform", function(d) {return "translate(" + x(d.name) + ",0)"});

    company
      .attr("transform", function(d) {return "translate(" + x(d.name) + ",0)"});

    var bar = company.selectAll(".bar")
          .data(function(d) { return d.revenue; })

    bar
      .enter().append("rect")
      .attr("class", function(d) { return "bar " + slugify(d.name); })
      .attr("width", x.rangeBand())
      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
      .attr("x", function(d) { return x(d.name); })
      .attr("y", function(d) { return y(d.y1); })
      .on('mouseover', mouseover);

    bar
      .attr("width", x.rangeBand())
      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
      .attr("x", function(d) { return x(d.name); })
      .attr("y", function(d) { return y(d.y1); })

    // Append Axis.
    svg.select(".x.axis")
      .attr("transform", "translate(" + margin.left + "," + (_height + margin.top + 10) + ")").transition()
      .call(xAxis)  
      .selectAll("text")
      .attr("y", 0)
      .attr("x", -5)
      .attr("dy", ".35em")
      .attr("transform", "rotate(-65)")
      .style("text-anchor", "end")

    svg.selectAll(".x.axis text")
      .attr("title", function() { return d3.select(this).text(); })
      .text(function() { 
        return truncate(d3.select(this).text(), 13, "..."); });

    if (this.yData && this.yData.label) {
      svg.select(".y.axis .label")
        .text(this.yData.label)
        .attr('x', -(_height / 2 + margin.top))
        .attr('y', 10)
        .attr('transform', 'rotate(-90)');
    }
  }

  function truncate(str, maxLength, suffix) {
  	if(str.length > maxLength) {
  		str = str.substring(0, maxLength + 1);
  		str = str + suffix;
  	}
  	return str;
  }

  function mouseover(d) {
    tip.show(d);
    d3.select(this)
      .style("opacity", "0.5")
      .on("mouseout", function () {
        tip.hide();
          d3.select(this)
          .style("opacity", "1");
      });
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