var yearWidget = {}
yearWidget = function(el, data){
  
  this.$el = d3.select(el);
  
  this._init = function() {
      this.years = data.years;
      // FIXME: generalise this to show any dimension
      yearsdiv = this.$el.append("div")
          .attr("class", "pie-years")
          .append("ul");
      var pieul = d3.select(".pie-years ul")
        .selectAll(".year-li")
        .data(this.years)
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
  }
  
  this._init();
}