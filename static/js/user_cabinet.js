$(document).ready(function(){
  $("span[id]").click(function(){
    var id = this.id.replace(/\D/g,""),
        action = this.id.replace(/\d/g,"");
    if(action == "del"){
      $.post("/del", {id : id},function(res){
        $("#alert_div").text("Удалено!").slideDown(function(){
          var self = $(this);
          $("#tr"+id).remove();
          setTimeout(function(){
            self.slideUp();
          },500)
        })
      })
    }
  });
  $("input[id^=_ff]").on("onFileAppend",function(e){
      var
        iframe = $('#upload_iframe'),
        form = $('#upload-form');
        iframe.load(function(){
        var data = $(this).contents().text();
        if (data === undefined || data == '') return;

//        iframe.remove();
//        form.remove();
        data = JSON.parse(data);
        var p = data.result.split("|");
        $(".MultiFile-list").remove();
        $(input).parents("ul").append("<li><a href='/file/"+p[1] + "' target='_blank'>" + p[0] + "</a></li>");
      });
      var realFile = $('input[name^=file]'),
        newFile = realFile.clone(),
        usewm = 0;
      realFile.replaceWith(newFile);
      form.append(realFile);
      form.append($('<input type="hidden" name="req_id"/>').val(realFile.attr('rel')));
      form.submit();
     })
  $('span[id^=cedit]').click(function(){
    var id = this.id.replace(/\D/g,"");
    $.post('/get_company',{id : id}, function(data){
      var com = JSON.parse(data);
      $('#name').val(com.companyname);
      $('#inn').val(com.companyinn);
      $('#cid').val(com.id);
      $('.window._com,.overlay').show();
    })
  })
  $('span[id^=redit]').click(function(){
    var id = this.id.replace(/\D/g,"");
    $.post('/request_info',{id : id}, function(data){
      var com = JSON.parse(data);
      $('#amount').val(com.reqamount);
      $('#duedate').val(com.duedate);
      $('#cid').val(com.company_id);
      $('#id').val(com.id);
      $('#sel').empty();
      for (var i = 0; i < com.companies.length; i++) {
        var c = com.companies[i],op = $('<option></option>',{value : c.id}).text(c.name);
        if(c.id == com.company_id) op.attr("selected","selected");
        $('#sel').append(op)
      }
      $('.window._req,.overlay').show();
    })
  })
})
function reset_form(){
  $('#com').reset();
  $('.window._com,.overlay').hide();
  $('#com .MultiFile-label').remove();
  $("#com input[type=file]:not(:last)").remove();

}