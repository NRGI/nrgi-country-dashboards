$(document).ready(function(){
  $(".nav-slider li a").click(function(e){
    e.preventDefault();
    var aHref = $(this).attr('href');
    var aTag = $("article"+ aHref +"");
    $('html,body').animate({scrollTop: aTag.offset().top},'slow');
    document.location.hash = aHref;
  });
  $('body').scrollspy({ target: '#main' });
  $(".scrollTo").click(function(e) {
    e.preventDefault();
    var aHref = $(this).attr('href');
    var aTag = $("article"+ aHref +"");
    $('html,body').animate({scrollTop: aTag.offset().top},'slow');
    document.location.hash = aHref;
  })
});
$(window).scroll(function() {
  if ($(document).scrollTop() > 50) {
    $('nav').addClass('brand-shrink');
  } else {
    $('nav').removeClass('brand-shrink');
  }
});
$(window).on('activate.bs.scrollspy', function(e) {
  var $hash, $node;
  $hash = $("a[href^='#']", e.target).attr("href").replace(/^#/, '');
  $node = $('#' + $hash);
  if ($node.length) {
    $node.attr('id', '');
  }
  document.location.hash = $hash;
  if ($node.length) {
    return $node.attr('id', $hash);
  }
});
layer_MapBox = new L.tileLayer(
'https://d.tiles.mapbox.com/v3/markbrough.nf87l3dn/{z}/{x}/{y}.png',{
    maxZoom: 18, attribution: 'MapBox Streets'
})
var homeMap = new L.Map("homeMap", {
    center: new L.LatLng(5.7,-1),
    zoom: 8,
    maxZoom: 15
});
layer_MapBox.addTo(homeMap);
homeMap.scrollWheelZoom.disable();