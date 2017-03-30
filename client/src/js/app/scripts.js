/* eslint-disable */
// globes
window.workbert = {
  taskState: 'pending',
  tasksDone: 1,
  tasksTotal: 4,
  progress: '25%',
  taskId: null,
  inviteId: null
};

// gets query string params and stores them in window obj
function getQueryParams(param) {
    var url = window.location.href;
    var name = param.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';

    if (param === 'task') {
      window.workbert.taskId = decodeURIComponent(results[2].replace(/\+/g, " "));
    } else if (param === 'invite') {
      window.workbert.inviteId = decodeURIComponent(results[2].replace(/\+/g, " "));
    }
}

// resizes the slider based on window height
function resizeSlider() {
  var windowHeight = $(window).height(),
    $sliderBody = $('.page-slider_body'),
    offset = 116;

  console.log('resize me');
  console.log(windowHeight);
  $sliderBody.height(windowHeight - offset);
}

// handles the task progress on the main page
function handleTaskProgress() {
  var context = $('.hero__task-details'),
    $heroPending = $('.-task-pending',context),
    $heroAccepted = $('.-task-accepted',context),
    $progress = $('.hero__task-details--progress',context);
  if (window.workbert.taskState === 'pending') {
    // show pending state
    $heroAccepted.hide();
    $heroPending.show();
  } else {
    // show other state
    $heroAccepted.show();
    $heroPending.hide();
  }
}

// Handle the modal states
$.fn.handleModal = function() {
  var context = $(this),
    $sliderPin = $('.page-slider--pin', context),
    $sliderAccepted = $('.page-slider--accepted', context),
    $sliderUpdate = $('.page-slider--progress', context),
    $inputName = $('#ellroiFullName', context),
    $inputJob = $('#ellroiJobTitle', context),
    $inputPassword = $('#ellroiPassword', context),
    $joinButton = $('#joinEllroi', context),
    $acceptedButton = $('#taskAccepted', context),
    $acceptButton = $('#acceptTask', context),
    $doneButton = $('#finishTask', context),
    $closeButton = $('.page-slider_close-button', context),
    $updateButton = $('#updateTask', context),
    $overlay = $('.page-overlay', context),
    $slider = $('.page-slider', context),
    $mainSection = $('#mainSection', context),
    $taskHeading = $('.main-navigation__header', context),
    //$todos = $('.body-content_bullet', context),
    $mainFooter = $('footer', context),
    $footerPending = $('.main-footer__container.-pending', context),
    $footerAccepted = $('.main-footer__container.-accepted', context);
    $throbber = $('.throbber-full', context)

    function setState(state) {
      if (state === 'accepted') {
        window.workbert.taskState = 'accepted';
        handleTaskProgress();
        $mainSection.addClass('section-accepted');
        $mainSection.removeClass('section-pending');
        $('.body-content_bullet', context).each(function(i,e){
          console.log(e);
          $(this).addClass('-indent');
          $('.radio-button', $(this)).fadeIn();
        });
        $footerPending.hide();
        $footerAccepted.show();
        $taskHeading.html('TASK IN PROGRESS');
      } else if (state === 'completed') {
        window.workbert.taskState = 'completed';
        handleTaskProgress();
        $mainSection.addClass('section-completed');
        $mainSection.removeClass('section-accepted');
        $doneButton.addClass('button--completed');
        $('.body-content_bullet', context).each(function(i,e){
          $('.radio-button', $(this)).addClass('-selected');
        });
      }
    }

    function loadTask(taskDetails) {
      console.log(taskDetails);
      // set avatar
      $('#taskAvatar').attr('src',taskDetails.assigner.avatar_url);
      // set name
      $('#taskOwner').html(taskDetails.assigner.name);
      // set due date
      $('#taskDueDate').html(taskDetails.due_date);
      // set description
      $('#taskDescription').html(taskDetails.title);
      // set tasks
      $.each(taskDetails.items, function(index,item) {
        console.log(item);
        // check if item is in_progress. if it's done make sure that -selected is set
        // $('#taskContent').append('<div class="body-content_bullet"><div class="radio-button -selected fa fa-check"></div></div>');
        $('#taskContent').append('<div class="body-content_bullet"><div class="radio-button fa fa-check"></div>' + item.text + '</div>');
      });
      // set % complete

      // once all the data is loaded, do this stuff
      $throbber.fadeOut();
      $slider.removeClass('-is-open');
      $overlay.fadeOut();
      $mainFooter.show();
      $footerPending.fadeIn();
      context.removeClass('-lock');
    }

    $joinButton.click(function(e) {
      e.preventDefault();
      // TODO: make call to endpoint
      $throbber.fadeIn();
      // when successfull, clear fields and close slider
      localStorage.setItem('ellroiAuth', 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ODgxMTMwYTM4N2U5ODBmNDhjNzQzZjcifQ.PPFE_iGoi_UGKdETnOv6teeOPmJeUsGWK0lK_fwIPSg');
      
      $.ajax({
        url: 'http://localhost:3000/api/v1/tasks/'+window.workbert.taskId,
        headers: {'Authorization': localStorage.getItem('ellroiAuth')},
        success: function (result) {
          $inputName.val('');
          $inputJob.val('');
          $inputPassword.val('');
          loadTask(result.task);
        },
        error: function (error) {
          alert('Sorry. Something went wrong');
          $throbber.fadeOut();
        }
      });

    })

    $acceptButton.click(function(e) {
      e.preventDefault();
      // scroll to the top to avoid scrolly issues
      window.scrollTo(0,0);
      $mainFooter.hide();
      $sliderPin.hide();
      $sliderAccepted.show();
      $slider.addClass('-is-open');
      $overlay.fadeIn();
      context.addClass('-lock');
    })

    $updateButton.click(function(e) {
      e.preventDefault();
      // scroll to the top to avoid scrolly issues
      window.scrollTo(0,0);
      $mainFooter.hide();
      $sliderPin.hide();
      $sliderAccepted.hide();
      $sliderUpdate.show();
      $sliderUpdate.show();
      $slider.addClass('-is-open');
      $overlay.fadeIn();
      context.addClass('-lock');
    })

    $closeButton.click(function(e) {
      e.preventDefault();
      $mainFooter.show();
      $slider.removeClass('-is-open');
      $sliderUpdate.hide();
      $overlay.fadeOut();
      context.removeClass('-lock');
    })

    $acceptedButton.click(function(e) {
      e.preventDefault();
      $mainFooter.show();
      // TODO: make call to endpoint
      setState('accepted');
      $slider.removeClass('-is-open');
      $overlay.fadeOut();
      context.removeClass('-lock');
    })

    $doneButton.click(function(e) {
      e.preventDefault();
      setState('completed');
    })

    // show pending footer
    // $footerPending.fadeIn();
}

$.fn.handleSliderProgress = function() {
  var context = $(this),
    $percentage = $('.percentage',context),
    $increase = $('.page-slider_radial-controls_button.-increase',context),
    $decrease = $('.page-slider_radial-controls_button.-decrease',context),
    $progress = $('.progress-radial', context),
    multiplier = 25;

  console.log(context);
  console.log($percentage);
  console.log($increase);
  console.log($decrease);
  console.log($progress);

  $increase.click(function(e) {
    e.preventDefault();
    var curProgress = $progress.attr('data-progress');
    var curProgressInt = parseInt(curProgress,10);
    if (curProgressInt < 100) {
      curProgressInt = curProgressInt + multiplier;
      if (curProgressInt > 99) {
        $progress.attr('data-progress', '100');
      } else {
        $progress.attr('data-progress', curProgressInt);
      }
      $percentage.html($progress.attr('data-progress') + '%');
    }
  })
  $decrease.click(function(e) {
    e.preventDefault();
    var curProgress = $progress.attr('data-progress');
    var curProgressInt = parseInt(curProgress,10);
    if (curProgressInt > 0) {
      curProgressInt = curProgressInt - multiplier;
      if (curProgressInt < 1) {
        $progress.attr('data-progress', '0');
      } else {
        $progress.attr('data-progress', curProgressInt);
      }
      $percentage.html($progress.attr('data-progress') + '%');
    }
  })

}

$.fn.handleComments = function() {
  var context = $(this),
    $commentBox = $('.page-slider_textarea', context),
    $comments = $('.comment-item_list', context);

  console.log(context);
  console.log($commentBox);
  console.log($comments);

  function submitComment() {
    var comment = $commentBox.val();
    // TODO: call endpoint
    $comments.prepend('<div class="comment-item"><div class="comment-item_heading">Sent: Just now</div><div class="comment-item_text">' + comment + '</div></div>');
    $commentBox.val('');
  }

  $commentBox.keyup(function(e) {
    if ((e.keyCode || e.which) === 13) {
      submitComment();
    }
  })

}

$(function(){
  getQueryParams('task');
  getQueryParams('invite');
  $('#pending-page').handleModal();
  $('#radialProgress').handleSliderProgress();
  $('#sliderComments').handleComments();
  resizeSlider();
  handleTaskProgress();
});


window.addEventListener('resize', resizeSlider);

