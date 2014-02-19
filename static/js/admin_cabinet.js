$(document).ready(function(){
//  $('.content').css("top", "20px");
  $('#tab').dataTable( {
    "sDom": 'T<"clear">lfrtip',
    "bPaginate" : false,
    sScrollY : $('.layout').height()-280
  });

  $("div[id^=sbbut]").click(function(){
    var id = this.id.replace(/sbbut/,"");
    $.post("/set_sber",{id : id, soid : $("#soid" + id).val()}, function(data){
      $("#alert_div").text("Изменено!").slideDown(function(){
        var self = $(this);
        setTimeout(function(){
          self.slideUp();
        },500)
      })
    })
  })

})