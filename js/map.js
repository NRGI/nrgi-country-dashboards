var nrgiMap = {};
var nrgiMap = function(elID, data, year) {
  var map, layerControl, year;
  var markers = {}

  this.setYear = function(the_year) {
    year = the_year;
    this.update();
  }
  this.setData = function (data, the_year) {
    this.data = data.records;
    year = the_year;
    this.update();
  }
  this.update = function () {
    $.map(markers, function(k, v) {
      k.clearLayers();
    })
    var locations = this.data.filter(filterByYear);
    for (var i in locations) {
      var feature = locations[i];
      if (feature['lat'] == '') { continue; }
        var marker = new L.circle(
          new L.LatLng(
            feature['lat'],
            feature['long']
          ), markerSize(feature['value']), {
            fillOpacity: 0.8,
            className: slugify(feature["commodity"])
            }
          );
          var popupContent = getPopupContent(feature);
          marker.bindPopup(popupContent);
          if (feature["commodity"] in markers) {
            markers[feature["commodity"]].addLayer(marker);
          } else {
            markers[feature["commodity"]] = new L.layerGroup();
            markers[feature["commodity"]].addLayer(marker);
          };
        }

    map.addLayer(markers["Gold"]);
    map.addLayer(markers["Bauxite"]);
    map.addLayer(markers["Manganese"]);

    if (layerControl == undefined) {
      layerControl = L.control.layers({}, markers,{collapsed:false});
      layerControl.addTo(map);
    }
  }

  this._init = function () {
    layer_MapBox = new L.tileLayer(
    'https://d.tiles.mapbox.com/v3/markbrough.n3kod47p/{z}/{x}/{y}.png',{
        maxZoom: 18, attribution: 'MapBox Streets'
    })
    map = new L.Map(elID, {
        center: new L.LatLng(5.7,-1),
        zoom: 8,
        maxZoom: 15
    });
    layer_MapBox.addTo(map);
    map.scrollWheelZoom.disable();
    this.setData(data, year);
  }

  function markerSize(volume) {
    if (!isNumeric(volume)) { var volume = 0; }
    var max_size = 50000;
    var min_size = 3000;
    var size = volume / 50;
    if (size == 0) { return size; }
    if (size < min_size) { return min_size; }
    if (size > max_size) { return max_size; }
    return size;
  }

  function getPopupContent(feature) {
    var pc = '<dt><a href="" class="company-clickable" data-name="' + feature['name'] + '">' + feature['name'] + '</a></dt>\
     <dl>Location: ' + feature['location'] + '<br />\
     Production volume: ' + naToZero(feature['value']) + '\
     ' + feature['value_unit'] + '<br />\
     Commodity: '+ feature['commodity'] + '</dl>';
    return pc;
  }

  function naToZero(value) {
    if (value == null) {
      return 0;
    }
    else if (value == "") {
      return 0;
    }
    else if (isNaN(value)) {
      return 0;
    }
    return value;
  }

  function filterByYear(obj) {
    if (obj["year"] != year) { return false; }
    return true;
  }
  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
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
  this._init();
}
