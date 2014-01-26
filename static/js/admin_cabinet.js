$(document).ready(function(){
  $("button[id]").click(function(){
    var id = this.id.replace(/r/g,"");
    $.post("/request_info",{id : id}, function(html){
      $("d"+id).append(html)
    })
  })

})