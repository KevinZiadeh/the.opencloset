$(document).ready(function(){
  $('.itemadd_select').chosen({no_results_text: "Nothing found!", disable_search_threshold: 4, max_selected_options: 5})
  $(".chosen-container-single").removeAttr("style")
  $(".chosen-container-multi").removeAttr("style")
})
