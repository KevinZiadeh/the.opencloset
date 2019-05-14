$(document).ready(function() {
  $(window).scroll(function() {
  $(".wrapper").each(function(){
    var pos = $(this).offset().top;

    var winTop = $(window).scrollTop();
    if (pos < winTop + 600) {
      $(this).addClass("slide");
    }
  });
});
$("#errormsgscontainer").delay(4000).fadeOut(400)
});
