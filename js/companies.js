var companiesWidget = {}
companiesWidget = function(el, data) {
    this.$el = d3.select(el);
    var tbody;
    
    this.setData = function(data) {
      this.companies = data.companies;
      this.update();
    }
    
    this._init = function() {
        this.years = data.years;
        // FIXME: generalise this to show any dimension
        
        var table = this.$el.append("table")
          .attr("class", "table");
        var thead = table.append("thead");
        thead
          .append("th").text("Name");
        thead
          .append("th").text("Revenue");
        
        tbody = table.append("tbody");      
    }
    
    this.update = function() {
      var companiestr = tbody.selectAll(".company-tr")
        .data(this.companies);
      
      companiestr
        .enter()
        .append("tr")
        .attr("class", "company-tr");
      
      companiestr
        .html(function(d) {return "<td>" + d.name + "</td>" + "<td>" + dec(d.value) + "</td>";});
        
    }

    var dec = d3.format(',.2f');

    this._init();
    this.setData(data);
}