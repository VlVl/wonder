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
  $("#reg_form").submit(function(){
    return send_form.call(this,"user",function(res){
      if(!res.errors)
        window.location = res.result;
      else alert(res.errors.toString())
    })
  })
  $("#com_form").submit(function(){
    return send_form.call(this,"company",function(res){
      if(!res.errors)
        $("table").append('<tr id="tr'+res.result.id +'"><td>' + res.result.companyname + '</td><td> '
          + res.result.companyinn< + '/td><td><a href="/request/' + res.result.id +'"">Создать</a></td><td>' +
          '<a href="#"><span id="edit' + res.result.id +'" class="glyphicon glyphicon-pencil"></span></a>' +
          '<a href="#"><span id="del' + res.result.id +'" class="glyphicon glyphicon-trash"></span></a></td></tr>');
      else alert(res.errors.toString())
    })
  })

  function send_form(name, cb){
    var params = {};
    for(var p in this)
      if(new RegExp(name).test(p)) params[p] = this[p].value;
    $.post(this.action,params,function(res){
      cb(res)
    })
    return false;

  }
})