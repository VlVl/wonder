$(document).ready(function(){
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