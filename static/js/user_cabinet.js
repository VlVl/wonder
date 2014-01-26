$(document).ready(function(){
  $("span[id]").click(function(){
    var id = this.id.replace(/\D/g,""),
        action = this.id.replace(/\d/g,"");
    if(action == "del"){
      $.post("/del", {id : id},function(res){
        $("#alert_div").text("Удалено!").slideDown(function(){
          var self = $(this);
          setTimeout(function(){
            self.slideUp();
            $("#tr"+id).remove();
          },500)
        })
      })
    }
  })

  $("#send_request").click(function(){
    $("#reg_form input").   $.post("/request")
  })
})