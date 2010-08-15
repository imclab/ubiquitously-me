// http://maettig.com/code/css/text-shadow.html
$(document).ready(function() {
  var form = $("#content-form");
  var stepOne = $("#step-one");
  var stepTwo = $("#step-two");
  var stepThree = $("#step-three");
  
  function setupSubmit(submit, position) {
    submit.addClass("next-step").addClass("step-one").attr("data-step", "1");
    submit.css("top", stepOne.height()/2);
    submit.css(position, - submit.width() - 20);
  }
  
  var submit = $("#next");
  setupSubmit(submit, "right");
  setupSubmit($("#previous"), "left");
  
  stepTwo.height(stepOne.height());
  
  var services = [];
  
  form.ajaxForm({
    dataType: 'json',
    beforeSubmit: function(formData, jqForm, options) {
      var firstStep = true;
      var props = ["title", "tags", "description", "rating"]
      for (var prop in formData) {
        if (props.indexOf(formData[prop].name) != -1 && formData[prop].value) {
          firstStep = false;
        }
        if (formData[prop].name == "services[]" && services.indexOf(formData[prop].value) == -1) {
          services.push(formData[prop].value);
        }
      }
      
      if (firstStep) {
        options.url = "/start";
      } else {
        options.url = "/finish";
        return true;
        if (form.attr("data-step") == "step-two") {
          var service = services.pop();
          if (!service) {
            return false;
          }
          $("input.service[value=" + service + "]").attr("checked", false);//.attr("disabled", true);
          options.url = "/finish";
          
        } else {
          return false;
        }
      }
    },
    success: function(post, statusText, xhr, $form) {
      for (var property in post) {
        var input = $("#" + property + "-input");
        if (!input.val())
          input.val(post[property]);
      }
    }
  });
  
  stepTwo.css("display", "none");
  stepThree.css("display", "none");
  
  $("#url-input").bind("keydown", "tab", function() {
    form.trigger("submit");
  });
  $("#tags-input").bind("keydown", "tab", function() {
    $("#next").trigger("click");
  });
  $("#submit").bind("keydown", "tab", function() {
    $("#previous").trigger("click");
  });
  
  $(window).bind("keydown", "left", function() {
    var target = $(event.target);
    $("#previous").trigger("click");
  });
  $(window).bind("keydown", "right", function() {
    var target = $(event.target);
    $("#next").trigger("click");
  });
  
  var pagers = $(".pager");
  
  function updateStep(step) {
    var current_step = form.attr("data-step");
    if (pagers.hasClass(current_step))
      pagers.removeClass(current_step);
    pagers.addClass(step);
    form.attr("data-step", step);
  }
  
  updateStep("step-one");
  
  var state = false;
  $('#content-form .steps').cycle({
			fx:	"scrollHorz", // You can choose any effects that you like, from the Link reference : http://www.malsup.com/jquery/cycle/browser.html
			timeout: 0,
			next: "#next",
			prev: "#previous",
			manualTrump: false,
			sync: true,
			speed: 0,
			nowrap: true,
			prevNextClick: function(isNext, index, slideElement) {
			  var pagers = $(".pager");
			  if (index == 0) {
			    updateStep("step-one");
			    $("#previous").css("display", "none");
			    $("#next").css("display", "block");
			  } else if (index == 1) {
			    updateStep("step-two");
			    $("#previous").css("display", "block");
			    $("#next").css("display", "none");
			  }
			}
	}, true);
	$("a.login").click(function() {
	  return false;
	});
});
