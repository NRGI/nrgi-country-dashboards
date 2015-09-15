var nrgiMap = {};
var nrgiMap = function(el, data) {
  var locations = data["records"].filter(filterByYear);
  var markers = {}
  for (var i in locations) {
  	var feature = locations[i];
    if (feature['lat'] == '') { continue; }
        var marker = new L.circle(
        	new L.LatLng(
        		feature['lat'],
        		feature['long']
              ), markerSize(feature['value']), {
              fillOpacity: 0.8,
              className: feature["commodity"]
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

  var overlayMaps = markers;    
  layer_MapBox = new L.tileLayer(
  'https://d.tiles.mapbox.com/v3/markbrough.n3kod47p/{z}/{x}/{y}.png',{
      maxZoom: 18, attribution: 'MapBox Streets'
  })
  var lm = $.map(markers, 
          function(k) { 
              return markers[k];
        });
  var map = new L.Map('map', {
      center: new L.LatLng(5.7,-1),
      zoom: 8,
      layers: lm,
      maxZoom: 15
  });
  layer_MapBox.addTo(map);
  L.control.layers({}, overlayMaps,{collapsed:false}).addTo(map);
  map.addLayer(markers["Gold"]);
  map.addLayer(markers["Bauxite"]);
  map.addLayer(markers["Manganese"]);
  map.scrollWheelZoom.disable();

  function markerSize(volume) {
    if (!isNumeric(volume)) { var volume = 0; }
    var max_size = 50000;
    var min_size = 3000;
    var size = volume / 50;
    if (size < min_size) { return min_size; }
    if (size > max_size) { return max_size; }
    return size;
  }

  function getPopupContent(feature) {
    var pc = '<dt>' + feature['project_name'] + '</dt>\
     <dl>Location: ' + feature['location'] + '<br />\
     Production volume: ' + feature['value'] + '\
     ' + feature['value_unit'] + '<br />\
     Commodity: '+ feature['commodity'] + '</dl>';
    return pc;
  }

  function filterByYear(obj) {
    if (obj["year"] != "2013") { return false; }
    return true;
  }
  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
}
