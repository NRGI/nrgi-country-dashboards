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
          .append("th").text("Company name");
        thead
          .append("th").text("Revenue (GHS)");
        thead
          .append("th").text("Commodities");
        
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
        .html(function(d) {return '<td class="company-name"></td><td class="company-revenue"></td><td class="company-commodity"></td>'});

      companiestr
        .select(".company-name")
        .text(function(d) {return d.name });

      companiestr
        .select(".company-revenue")
        .text(function(d) {return dec(d.value) });

      companiestr
        .select(".company-commodity")
        .html(function(d) {
          companiesbadges = $.map(d.commodities, function(v) {
            return '<span class="badge ' + v.key + '">' + v.key + '</span>' });
          return companiesbadges.join("");});
        
    }

    var dec = d3.format(',.2f');

    this._init();
    this.setData(data);
}