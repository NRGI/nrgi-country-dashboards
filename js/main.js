$(document).ready(function(){
  $(".nav-slider li a").click(function(e){
    e.preventDefault();
    var aHref = $(this).attr('href');
    var aTag = $("article"+ aHref +"");
    $('html,body').animate({scrollTop: aTag.offset().top},'slow');
    document.location.hash = aHref;
  });
  $('body').scrollspy({ target: '#main' });
});

$(window).scroll(function() {
  if ($(document).scrollTop() > 50) {
    $('nav').addClass('brand-shrink');
  } else {
    $('nav').removeClass('brand-shrink');
  }
});