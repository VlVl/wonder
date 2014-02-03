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
//  $("input[id^=_ff]").on("onFileAppend",function(e){
  function _send(input){
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
     }

})
function _send(input){
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
}
