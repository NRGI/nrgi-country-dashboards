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
  var x, y, xAxis, line, area, bisector;
  // Elements.
  var svg, dataCanvas;

  this._calcSize = function() {
    _width = parseInt(this.$el.style('width'), 10) - margin.left - margin.right;
    _height = parseInt(this.$el.style('height'), 10) - margin.top - margin.bottom;
  };
  
  var parseDate = d3.time.format("%Y").parse;
  
  // Might want to move data wrangling functions out of these charts...
  this.getData = function(data) {
    var _data = data.data.records;
    
    var years = {}
    
    this.drilldown = "commodity";
    
    var td = _data;
    // Aggregate according to drilldown
    if (this.drilldown != null) {
      this.data = d3.nest()
        .key(function(d) {
          return d.commodity;
        })
        .key(function(d) {
          return d.year;
        })
        .rollup(function(items){
          return d3.sum(items, function(d) { 
            return parseFloat(d.value)
          });
        })
        .entries(_data)
        .map(
          function(d) {
            obj = {};
            obj["commodity"] = d.key;
            obj["data"] = d.values.map(
              function(v) {
                vobj = {};
                vobj["year"] = v.key;
                vobj["date"] = parseDate(v.key);
                vobj["value"] = v.values;
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
        return a.year < b.year;
      });
    }
    this.data = td;
    
    var _d = {}
    _d["data"] = td;
    _d["x"] = {
      "domain": ["2004", "2005", "2006", "2007", "2008", "2009", "2010", 
                 "2011", "2012", "2013"],
      "label": "Time"
    }
    max = data.max;
    _d["y"] = {
      "domain": [0, max],
      "label": "Value"
    }
    return _d;
  }
  
  this.setData = function(data) {
    this.data = this.getData(data);
    this.xData = this.data.x;
    this.yData = this.data.y;
    this.update();
  }
  
  this._init = function() {
    this._calcSize();
    svg = this.$el.append('svg')
      .attr('class', 'chart');      
      
    x = d3.time.scale();
    y = d3.scale.linear();
    
    // Define xAxis function.
    xAxis = d3.svg.axis()
      .scale(x)
      .ticks(6)
      .orient("bottom");

    // Line function.
    line = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); });


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

    _data = this.getData(data);
    
    for(i=0; i < _data.data.length; i++) {      
      dataCanvas.append("path")
        .attr("class", "line line"+i)
        .on("mouseover", mouseover);
    }

    this.$el.append("div")
      .attr("class", "tooltip")
      .html('<dl><dt>Year</dt><dd class="year"></dd><dt>Value</dt><dd class="value"></dd></dl>');

    dataCanvas.append("g")
      .attr("class", "focus-circles");
      
    this.setData(data);
  };
  this.update = function() {
    this._calcSize();
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


    // Need to calculate on the basis of >1 series dates?
    x.range([0, _width])
      .domain(d3.extent(this.data.data[0].data, function(d) { return d.date; }));

    y.range([_height, 0])
      .domain(this.yData.domain);
    svg
      .attr('width', _width + margin.left + margin.right)
      .attr('height', _height + margin.top + margin.bottom);

    dataCanvas
      .attr('width', _width)
      .attr('height', _height);
      
    for(i=0; i < this.data.data.length; i++) {      
      dataLine = dataCanvas.select(".line"+i)
        .datum(this.data.data[i].data)
        .attr("d", line)
        .on("mouseover", mouseover);
    }
      
    // Add focus circles
    // Need to adjust this for multiple series
    dataCanvas.select(".focus-circles").selectAll(".focus-circle").remove();
  	var focuscircles = dataCanvas.select(".focus-circles")
      .selectAll("focus-circle")
  		.data( this.data.data[0].data );
      
    focuscircles
  		.enter()
  		.append("circle")
  			.attr("class","focus-circle")
  			.attr("cx", function(d,i){return x(d.date)})
  			.attr("cy",function(d,i){return y(d.value)})
        .style('opacity', 0)
  			.attr("r",12)
      .on("mouseover", circlemouseover);
      
    focuscircles.exit()
      .remove();

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
          .style("stroke-width", "5px");
      });
  }
  function circlemouseover(d) {
    thecircle = d3.select(this);
    thecircle_x = thecircle.attr("cx");
    thecircle_y = thecircle.attr("cy");
    
    the_tooltip = d3.select(".tooltip");
    the_line = d3.select(".line0");
    
    
    the_tooltip = d3.select('.tooltip');
  
    d3.select(".tooltip .year").text(d.year);
    d3.select(".tooltip .value").text(d.value);
    
    the_tooltip
        .style("left", thecircle_x + "px")     
        .style("top", thecircle_y + "px")
        .transition()
        .duration(200)
        .style("opacity", .8);

    the_line.style("stroke-width", "7px");
    d3.select(this).on("mouseout", function () {
      the_line.style("stroke-width", "5px");
      the_tooltip.style("opacity", 0);
    });
  }

  this.destroy = function(el) {
    // Any clean-up would go here
    // in this example there is nothing to do
  };
  
  var dec = d3.format('0,0[.]0');

  this._init();
};