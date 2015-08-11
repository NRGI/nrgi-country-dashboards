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
    this.update();
  }
  
  this._init = function() {
    this._calcSize();
    svg = this.$el.append('svg')
      .attr('class', 'chart');      
      
    x = d3.scale.ordinal();
    y = d3.scale.linear();
    
    tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>" + d.name + "</strong><br />$ " + dec(d.value) + "</small>";
      });

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

    svg.call(tip);

    this.setData(data);
  };
  this.update = function() {
    this._calcSize();
    height = _height,
    width = _width;
    var _this = this;

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
      .domain(["Newmont Ghana Gold Ltd", "Gold Fields (Gh) Ltd", "Chirano Gold Mines Ltd", "GSR(Wassa)Ltd", "Ghana Manganese Co. Ltd", "Abosso Goldfields (Gh) Ltd (Damang)", "Perseus Mining(Ghana)Ltd", "AngloGold Ashanti(Ghana) Ltd", "GSR(Prestea/Bogoso)Ltd", "AngloGold(Iduapriem) Ltd", "Adamus Resources Ltd", "Newmont Golden Ridge Ltd 1", "Ghana Bauxite Company Ltd", "Noble Mining Ltd", "Prestea Sankofa Ltd", "AngloGold Bibiani (Central African Gold)", "Government of Ghana Shares in Anglogold global"])
      .rangeRoundBands([0, _width], .1);

    //FIXME
    y.range([_height, 0])
      .domain([0, 226405055]);
      // .domain(this.yData.domain);
    svg
      .attr('width', _width + margin.left + margin.right)
      .attr('height', _height + margin.top + margin.bottom);

    dataCanvas
      .attr('width', _width)
      .attr('height', _height);
    
    dataCanvas.selectAll(".bar")
          .data(this.data.data)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("width", x.rangeBand())
          .attr("height", function(d) { return _height - y(d.value); })
          .attr("x", function(d) { return x(d.name); })
          .attr("y", function(d) { return y(d.value); })
          .on('mouseover', mouseover);

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
      .text(function() { 
        return truncate(d3.select(this).text(), 13, "..."); });

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

  this.destroy = function() {
    // Any clean-up would go here
    // in this example there is nothing to do
  };
  
  var dec = d3.format(',.2f');

  this._init();
};