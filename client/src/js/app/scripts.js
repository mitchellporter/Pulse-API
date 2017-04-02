/* eslint-disable */
// globes
window.workbert = {
  taskState: 'pending',
  taskInvitationId: null,
  completion_percentage: 0,
  taskId: null,
  inviteId: null,
  updateId: null,
  taskComments: []
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
    } else if (param === 'update') {
      window.workbert.updateId = decodeURIComponent(results[2].replace(/\+/g, " "));
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

function updateTaskOnSetver(task) {
  var postData = {};
  var taskId = $(task).attr('data-id');

  if ($('.radio-button',$(task)).hasClass('-selected')) {
    $('.radio-button',$(task)).removeClass('-selected');
    postData = {
      status: 'in_progress'
    }
  } else {
    $('.radio-button',$(task)).addClass('-selected');
    postData = {
      status: 'completed'
    }
  }
  console.log(task);
  console.log(taskId);
  $.ajax({
    url: '/api/v1/tasks/'+window.workbert.taskId+'/items/'+taskId,
    type: 'PUT',
    headers: {'Authorization': 'bearer ' + localStorage.getItem('ellroiAuth')},
    data: postData,
    success: function (result) {

    },
    error: function (error) {

    }
  });

}

// updates the task info in the DOM
function updateTaskDom(taskDetails) {
  console.log('--- updating task in DOM ---');
  console.log(taskDetails);
  // set percentage complete
  window.workbert.completion_percentage = taskDetails.completion_percentage;
  // in hero
  $('.hero__task-details--progress').html(taskDetails.completion_percentage + '%');
  // in slider
  $('.page-slider_radial .progress-radial').attr('data-progress',taskDetails.completion_percentage);
  $('.page-slider_radial .progress-radial .percentage').html(taskDetails.completion_percentage + '%');
  // set avatar
  $('#taskAvatar').attr('src',taskDetails.assigner.avatar_url);
  // set name
  $('#taskOwner').html(taskDetails.assigner.name);
  // set due date
  $('#taskDueDate').html(moment(taskDetails.due_date).format('MMM DD, YYYY'));
  $('#taskDueDateAccepted').html(moment(taskDetails.due_date).format('MMM DD, YYYY'));
  // set description
  $('#taskDescription').html(taskDetails.title);
  // set tasks
  $('#taskContent').empty();
  $.each(taskDetails.items, function(index,item) {
    if (window.workbert.taskState === 'accepted') {
      if (item.status === 'completed') {
        var el = $('<div class="body-content_bullet -indent" data-id="' + item._id + '"><div style="display:block;" class="radio-button -selected fa fa-check"></div>' + item.text + '</div>');
      } else {
        var el = $('<div class="body-content_bullet -indent" data-id="' + item._id + '"><div style="display:block;" class="radio-button fa fa-check"></div>' + item.text + '</div>');
      }
    } else {
      var el = $('<div class="body-content_bullet" data-id="' + item._id + '"><div class="radio-button fa fa-check"></div>' + item.text + '</div>');
    }
    
    $('#taskContent').append(el);

    el.on('click', function(){
      updateTaskOnSetver(this);
    });
  });
}

// sets up the GIVE UPDATE slider
function setUpUpdateSlider(type) {
  var el;
  if (type === 'random') {
    $('#sliderComments').hide();
  } else {
    if (window.workbert.taskComments.length) {
      $('.comment-item_list').empty();
      $.each(window.workbert.taskComments, function(index,comment) {
        console.log(comment);
        if (comment.message) {
          el = $('<div class="comment-item"><div class="comment-item_heading">Sent: '+ moment(comment.created_at).fromNow() +'</div><div class="comment-item_text">'+ comment.message +'</div></div>');
          console.log(el);
          $('.comment-item_list').append(el);
        };
      });
    }

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
    $submitUpateButton = $('#submitButton', context),
    $closeButton = $('.page-slider_close-button', context),
    $updateButton = $('#updateTask', context),
    $overlay = $('.page-overlay', context),
    $slider = $('.page-slider', context),
    $mainSection = $('#mainSection', context),
    $taskHeading = $('.main-navigation__header', context),
    //$todos = $('.body-content_bullet', context),
    $mainFooter = $('footer', context),
    $footerPending = $('.main-footer__container.-pending', context),
    $footerAccepted = $('.main-footer__container.-accepted', context),
    $throbberFull = $('.throbber-full--main', context),
    $throbber = $('.throbber-full', context),
    $commentBox = $('#commentBox', context);

    function setState(state) {
      if (state === 'accepted') {
        window.workbert.taskState = 'accepted';
        handleTaskProgress();
        $mainSection.addClass('section-accepted');
        $mainSection.removeClass('section-pending');
        $footerPending.hide();
        $footerAccepted.show();
        $taskHeading.html('TASK IN PROGRESS');
      } else if (state === 'completed') {
        window.workbert.taskState = 'completed';
        handleTaskProgress();
        $mainSection.addClass('section-completed');
        $mainSection.removeClass('section-accepted');
        $doneButton.addClass('button--completed');
        $taskHeading.html('TASK IS COMPLETE!');
        $('.body-content_bullet', context).each(function(i,e){
          $('.radio-button', $(this)).addClass('-selected');
        });
      }
    }

    function getTaskFromServer() {
      $.ajax({
        url: '/api/v1/tasks/'+window.workbert.taskId,
        headers: {'Authorization': 'bearer ' + localStorage.getItem('ellroiAuth')},
        success: function (result) {
          console.log('--- getting task from server ---');
          console.log(result);
          if (result.task.status === 'completed') {
            setState('accepted'); // force the icons to be there
            updateTaskDom(result.task);
            setState('completed');
          } else {
            updateTaskDom(result.task);
          }
          $throbberFull.fadeOut();
        },
        error: function (error) {
          if (error.responseJSON) {
            alert(error.responseJSON.error);
            // TODO: This may be buggy. removing cookie if user not found.
            localStorage.removeItem('ellroiAuth')
          } else {
            alert('Sorry. Something went wrong');
          }
          console.log(error.responseJSON);
          $throbberFull.fadeOut();
        }
      });
    }

    function doSignUp() {
      if (!$inputName.val() || !$inputJob.val() || !$inputPassword.val()) {
        alert('please make sure all fields are filled');
        return false;
      }

      var postData = {
        status: 'accepted',
        name: $inputName.val(),
        position: $inputJob.val(),
        password: $inputPassword.val()
      }

      $.ajax({
        url: '/api/v1/tasks/'+window.workbert.taskId+'/invites/'+window.workbert.inviteId,
        type: 'PUT',
        data: postData,
        // headers: {'Authorization': localStorage.getItem('ellroiAuth')},
        success: function (result) {
          if (result.token) {
            localStorage.setItem('ellroiAuth', result.token);
          }
          getTaskFromServer();
          $inputName.val('');
          $inputJob.val('');
          $inputPassword.val('');
          $throbber.fadeOut();
          $slider.removeClass('-is-open');
          $overlay.fadeOut();
          $mainFooter.show();
          $footerPending.fadeIn();
          context.removeClass('-lock');

        },
        error: function (error) {
          alert('Sorry. Something went wrong');
          $throbber.fadeOut();
        }
      });

    }

    $joinButton.click(function(e) {
      e.preventDefault();
      // sign up
      doSignUp();
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
      if (window.workbert.taskState === 'completed') {
        alert('This task has already been completed');
        return false;
      }
      // scroll to the top to avoid scrolly issues
      window.scrollTo(0,0);
      // Task: Set up the update slider depending on whether there is an UPDATE_ID
      if (window.workbert.updateId) {
        setUpUpdateSlider('update');
      } else {
        setUpUpdateSlider('random');
      }

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
      var postData = {
        status: 'accepted'
      }
      e.preventDefault();
      $mainFooter.show();
      // TODO: make call to endpoint
      $throbber.fadeIn();
      $.ajax({
        url: '/api/v1/task_invitations/'+window.workbert.taskInvitationId,
        type: 'PUT',
        headers: {'Authorization': 'bearer ' + localStorage.getItem('ellroiAuth')},
        data: postData,
        success: function (result) {
          getTaskFromServer();
          setState('accepted');
          $slider.removeClass('-is-open');
          $overlay.fadeOut();
          context.removeClass('-lock');
          $throbber.fadeOut();
        },
        error: function (error) {
          alert('Sorry. Something went wrong');
          $throbber.fadeOut();
        }
      })
    })

    // submit update button
    $submitUpateButton.click(function(e) {
      var completionPercentage = $('.page-slider_radial .progress-radial').attr('data-progress'),
        postData = {},
        postUrl = '',
        postType = 'POST',
        commentDetails = {};

      e.preventDefault();
      $throbber.fadeIn();
      console.log('--- send a message ---');
      console.log(window.workbert.updateId);
      if (window.workbert.updateId) {
        // respond to update request
        postType = 'PUT';
        postUrl = '/api/v1/updates/'+window.workbert.updateId;
        postData = {
          completion_percentage: completionPercentage
        }
        // if there is content in the text area, send it with the update.
        if ($commentBox.val()) {
          postData.message = $commentBox.val();
          commentDetails.message = postData.message;
          commentDetails.created_at = new Date();
          window.workbert.taskComments.unshift(commentDetails);
          commentDetails = {};
          $commentBox.val('');
          setUpUpdateSlider();
        }
        // push it in to the window.workbert.taskComments

      } else {
        // random update
        postUrl = '/api/v1/tasks/'+window.workbert.taskId+'/updates';
        postData = {
          type: 'random',
          completion_percentage: completionPercentage
        }
      }
      $.ajax({
        url: postUrl,
        type: postType,
        headers: {'Authorization': 'bearer ' + localStorage.getItem('ellroiAuth')},
        data: postData,
        success: function (result) {
          var updatedTask = {}
          updatedTask = result.update.task;
          updatedTask.completion_percentage = completionPercentage;
          updateTaskDom(updatedTask);
          console.log(updatedTask);
          $throbber.fadeOut();
          $mainFooter.show();
          $slider.removeClass('-is-open');
          $sliderUpdate.hide();
          $overlay.fadeOut();
          context.removeClass('-lock');
        },
        error: function (error) {
          alert('Error sending progress report');
          $throbber.fadeOut();
        }
      });
    })

    $doneButton.click(function(e) {
      e.preventDefault();
      if (window.workbert.taskState === 'completed') {
        alert('This task has already been completed');
        return false;
      }
      var postData = {
        status: 'completed'
      }
      // call endpoint to mark task as complete
      // tasks/{{IN_PROGRESS_TASK_ID}}
      $.ajax({
        url: '/api/v1/tasks/'+window.workbert.taskId,
        type: 'PUT',
        headers: {'Authorization': 'bearer ' + localStorage.getItem('ellroiAuth')},
        data: postData,
        success: function (result) {
          setState('completed');
        },
        error: function (error) {

        }
      });
    })

    // show pending footer
    // $footerPending.fadeIn();

    // first things first. Get the invite details
    $throbberFull.show()
    if (window.workbert.updateId) {
      // Get task update!!! 
      $.ajax({
        url: '/api/v1/updates/'+window.workbert.updateId,
        headers: {'Authorization': 'bearer ' + localStorage.getItem('ellroiAuth')},
        success: function (result) {
          console.log(result);
          // set taskId
          window.workbert.taskId = result.update.task._id;
          // set taskInvitationId
          // window.workbert.taskInvitationId = result.invite.task_invitation;
          // if Auth token exists, don't show slider.
          if (!localStorage.getItem('ellroiAuth')) {
            $slider.addClass('-is-open');
            $overlay.fadeIn();
            context.addClass('-lock');
            $throbberFull.fadeOut();
          } else {
            // get the task details
            $mainFooter.show();
            if (result.update.task.status === 'completed') {
              setState('accepted');
              updateTaskDom(result.update.task);
              // force the dom to render the tasks as complete
              setTimeout(function(){
                setState('completed');
              },100);
              
              // set the comments to the window object for now
              window.workbert.taskComments = result.update.responses;
              $throbberFull.fadeOut();
            } else {
              setState('accepted');
              // set the comments to the window object for now
              window.workbert.taskComments = result.update.responses;
              // should probably hit them with the update slider here
              $updateButton.click();
              $throbberFull.fadeOut();
            }
            updateTaskDom(result.update.task);
          }
        },
        error: function (error) {
          alert('Sorry. Something went wrong');
          $throbberFull.fadeOut();
        }
      });
    } else {
      $.ajax({
        url: '/api/v1/invites/'+window.workbert.inviteId,
        headers: {'Authorization': 'bearer ' + localStorage.getItem('ellroiAuth')},
        success: function (result) {
          console.log(result);
          // set taskId
          window.workbert.taskId = result.invite.task._id;
          // set taskInvitationId
          window.workbert.taskInvitationId = result.invite.task_invitation;
          console.log(window.workbert);
          // if Auth token exists, don't show slider.
          if (!localStorage.getItem('ellroiAuth')) {
            $slider.addClass('-is-open');
            $overlay.fadeIn();
            context.addClass('-lock');
            $throbberFull.fadeOut();
          } else {
            // get the task details
            $mainFooter.show();
            if (result.invite.status === 'accepted') {
              setState('accepted');
            } else {
              $footerPending.fadeIn();
            }
            
            getTaskFromServer();
          }
        },
        error: function (error) {
          alert('Sorry. Something went wrong');
          $throbberFull.fadeOut();
        }
      });
    }

}

$.fn.handleSliderProgress = function() {
  var context = $(this),
    $percentage = $('.percentage',context),
    $increase = $('.page-slider_radial-controls_button.-increase',context),
    $decrease = $('.page-slider_radial-controls_button.-decrease',context),
    $progress = $('.progress-radial', context),
    multiplier = 5;

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

// TODO: may not be needed afterall
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

}

$(function(){
  getQueryParams('invite');
  getQueryParams('update');
  $('#pending-page').handleModal();
  $('#radialProgress').handleSliderProgress();
  $('#sliderComments').handleComments();
  resizeSlider();
  handleTaskProgress();
});


window.addEventListener('resize', resizeSlider);

