$(document).ready(function() {
  h = document.location.hash;
  setTimeout(function() {setPanel(h)}, 500);
});
function setPanel(aHref) {
  // Must start with a hash
  var aTag = $("article"+ aHref +"");
  $('html,body').animate({scrollTop: aTag.offset().top},'slow');
  document.location.hash = aHref;
}
$(document).ready(function(){
  $(".nav-slider li a").click(function(e){
    e.preventDefault();
    setPanel
    var aHref = $(this).attr('href');
    setPanel(aHref);
  });
  $('body').scrollspy({ target: '#main' });
  $(".scrollTo").click(function(e) {
    e.preventDefault();
    var aHref = $(this).attr('href');
    setPanel(aHref);
  });
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