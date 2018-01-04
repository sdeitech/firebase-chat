//Create an account on Firebase, and use the credentials they give you in place of the following
var config = {
    apiKey: "AIzaSyDkuWqigDbnvqF4Imiwiay0QT5JwGwxpbo",
    authDomain: "fir-chat-ef67e.firebaseapp.com",
    databaseURL: "https://fir-chat-ef67e.firebaseio.com",
    projectId: "fir-chat-ef67e",
    storageBucket: "fir-chat-ef67e.appspot.com",
    messagingSenderId: "208993285334"
  };
  
  firebase.initializeApp(config);
  
  var database = firebase.database().ref();
  var yourVideo = document.getElementById("yourVideo");
  var friendsVideo = document.getElementById("friendsVideo");
  var yourId = Math.floor(Math.random()*1000000000);
  var servers = {
      url: 'numb.viagenie.ca',
      credential: 'xyz@2629',
      username: ' anubhavg@smartdatainc.net'
  }
  //var servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': 'webrtc','username': 'websitebeaver@mail.com'}]};
  var pc = new RTCPeerConnection(servers);
  pc.onicecandidate = (event => event.candidate?sendMessage(yourId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
  pc.onaddstream = (event => friendsVideo.srcObject = event.stream);
  
  function sendMessage(senderId, data) {
      var msg = database.push({ sender: senderId, message: data });
      msg.remove();
  }
  
  function readMessage(data) {
      var msg = JSON.parse(data.val().message);
      var sender = data.val().sender;
      if (sender != yourId) {
          if (msg.ice != undefined)
              pc.addIceCandidate(new RTCIceCandidate(msg.ice));
          else if (msg.sdp.type == "offer")
              pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
                .then(() => pc.createAnswer())
                .then(answer => pc.setLocalDescription(answer))
                .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})));
          else if (msg.sdp.type == "answer")
              pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      }
  };
  
  database.on('child_added', readMessage);
  
  function showMyFace() {
    navigator.mediaDevices.getUserMedia({audio:true, video:true})
      .then(stream => yourVideo.srcObject = stream)
      .then(stream => pc.addStream(stream))
      .catch(function(err) {
         console.log(err);
      });
  }
  
  function showFriendsFace() {
    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer) )
      .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})) );
  }