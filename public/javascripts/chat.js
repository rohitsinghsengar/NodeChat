var socket;
var myUserName;

function enableMsgInput(enable) {
  $('input#msg').prop('disabled', !enable);
}

function enableUsernameField(enable) {
  $('input#userName').prop('disabled', !enable);
}

function appendNewMessage(msg) {
  var html;
  if (msg.target == "All") {
    html = "<span class='allMsg'>" + msg.source + " : " + msg.message + "</span><br/>"
  } else {
    // It is a private message to me
    html = "<span class='privMsg'>" + msg.source + " (P) : " + msg.message + "</span><br/>"
  }
  $('#msgWindow').append(html);
  $("html, body").animate({ scrollTop: $(document).height()-$(window).height() });
}

function appendNewUser(uName, notify) {
  $('select#users').append($('<option></option>').val(uName).html(uName));
  if (notify && (myUserName !== uName) && (myUserName !== 'All'))
    $('#msgWindow').append("<span class='adminMsg'>==>" + uName + " just joined <==<br/>")
}

function handleUserLeft(msg) {
	$("select#users option[value='" + msg.userName + "']").remove();
}

socket = io.connect("http://192.168.1.2:3000");

function setUsername() {
	myUserName = $('input#userName').val();
    socket.emit('set username', $('input#userName').val(), function(data) { console.log('emit set username', data); });
    console.log('Set user name as ' + $('input#userName').val());
}

function sendMessage() {
    var trgtUser = $('select#users').val();
    socket.emit('message', 
                {
                  "inferSrcUser": true,
                  "source": "",
                  "message": $('input#msg').val(),
                  "target": trgtUser
                });
	$('input#msg').val("");
	
}

function setCurrentUsers(usersStr) {
	$('select#users >option').remove()
	appendNewUser('All', false)
	JSON.parse(usersStr).forEach(function(name) {
		appendNewUser(name, false);
	});
	$('select#users').val('All').attr('selected', true);
}

$(function() {
  enableMsgInput(false);

  socket.on('userJoined', function(msg) {
    appendNewUser(msg.userName, true);
  });
  
  socket.on('userLeft', function(msg) {
    handleUserLeft(msg);
  });

  socket.on('message', function(msg) {
    appendNewMessage(msg);
  });

	socket.on('welcome', function(msg) {
		$('.signin').hide();
		setCurrentUsers(msg.currentUsers);
		enableMsgInput(true);
		enableUsernameField(false);
		$('.userlist, footer').show();
	}); 


  socket.on('error', function(msg) {
	  if (msg.userNameInUse) {
		  alert("Username already in use. Try another name.");
	  }
  });
  
  $('input#ok').click(function(e) {
		  setUsername();
		  e.stopPropagation();
		  e.preventDefault();
  });
  
  $('input#msg').keypress(function(e) {
	  if (e.keyCode == 13) {
		  sendMessage();
		  e.stopPropagation();
		  e.stopped = true;
		  e.preventDefault();
	  }
  });
  
});
