(function() {
    'use strict';

    angular
        .module('videoChatApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', 'Principal','$state','$document'];

    function HomeController ($scope, Principal,$state,$document) {
        var vm = this;

        vm.account = null;
        vm.isAuthenticated = null;
        vm.register = register;
        $scope.$on('authenticationSuccess', function() {
            getAccount();
        });

        getAccount();

        function getAccount() {
            Principal.identity().then(function(account) {
                vm.account = account;
                vm.isAuthenticated = Principal.isAuthenticated;
            });
        }
        function register () {
            $state.go('register');
        }
        
        var ws = new WebSocket("ws://"+location.host+"/call");
        
        $scope.keydown = function(e){
        	if(e.keyCode == 13){
        		registername();
        	}
        	
        };
        $scope.keycall = function(e){
        	if(e.keyCode == 13){
        		call();
        	}
        	
        };
        $scope.error = true;
        $scope.error1 = true;
        $scope.disabled = false;
        $scope.disabled1 = true;
        $scope.disabled2 = true;
        
        
        
        
        
        var videoInput = document.getElementById('videoInput');
        var videoOutput = document.getElementById('videoOutput');
        var webRtcPeer;
        var response;
        var callerMessage;
        var from;
        $('#name').focus();

        var registerName = null;
        var registerState = null;
        const NOT_REGISTERED = 0;
        const REGISTERING = 1;
        const REGISTERED = 2;
        
    	var callState = null;
    	const NO_CALL = 0;
    	const PROCESSING_CALL = 1;
    	const IN_CALL = 2;
    	
    	$scope.call=function(){
    		//webRTCservice.call();
    	   
    	 call();
    	};
        $scope.Stop=function(){
        	stop();
        };
      
        ws.onmessage = function(message){
        	var parsedmessage = JSON.parse(message.data);
        	console.info("we have just received a message: "+ message.data);
        	switch(parsedmessage.id){
        	
		        	case "registerResponse":{ 
		        		registerResponse(parsedmessage);
		        		break;
		        	}
		        	case "callResponse":{ 
		        		callResponse(parsedmessage);
		        		break;
		        	}
		        	case "incomingCall":{ 
		        		//webRTCservice.incomingCall(parsedmessage);
		        		incomingCall(parsedmessage);
		        		break;
		        	}
		        	case "startCommunication":{
		        		startCommunication(parsedmessage);
		        		break;
		        	}
		        	case "stopCommunication":{
		        		console.info("communication ended by remote peer ");
		        		stop(true);
		        		break;
		        	}
		        	case "iceCandidate":{ 
		        		webRtcPeer.addIceCandidate(parsedmessage.candidate,function(error){
		        			if(!error)return;
		        			console.error("Error when adding candidate "+ error);
		        		});
		        		break;
		        	}
		        	default : {
		        		console.error("Unreconized message: "+ parsedmessage);
		        	}
        	}
        };
        
        /*function setRegisterState(nextState) {
        	switch (nextState) {
        	case 0:
        		
        		register();
        		setCallState(0);
        		break;
        	case 1:
        		$scope.disabled = false;
        		break;
        	case 2:
        		$scope.disabled = false;
        		setCallState(0);
        		break;
        	default:
        		return;
        	}
        	registerState = nextState;
        }
        
        function setCallState(nextState) {
        	switch (nextState) {
        	case 0:
        		$scope.disabled2 = false;
        		//webRTCservice.call();
        		call();
        		$scope.disabled1 = false;
        		$scope.disabled2 = false;
        		break;
        	case 1:
        		$scope.disabled2 = false;
        		$scope.disabled1 = false;
        		
        		break;
        	case 2:
        		$scope.disabled2 = true;
        		$scope.disabled1 = false;
        		stop();
        		
        		break;
        	default:
        		return;
        	}
        	callState = nextState;
        }*/
        
        $scope.registername=function() {
        	var name = $scope.callerName;
        	if(name == null){
        		$scope.error1=false;
        	}else{
	        	//setRegisterState(REGISTERING);
        		$scope.error1=true;
	        	$scope.disabled2 = false;
	    		$scope.disabled1 = false;
	        	var message = {
	        		id : 'register',
	        		name : name
	        	};
	        	//webRTCservice.sendMessage(message);
	        	sendMessage(message);
	        	$('#peer').focus();
        	}
        };
        
        function onOfferCall(error, offerSdp) {
        	if (error)
        		return console.error('Error generating the offer');
        	console.log('Invoking SDP offer callback function');
        	var message = {
        		id : 'call',
        		from : $scope.callerName,
        		to : $scope.peerName,
        		sdpOffer : offerSdp
        	};
        	//webRTCservice.sendMessage(message);
        	sendMessage(message);
        }
        
        function stop(message) {
        	//setCallState(NO_CALL);
        	if (webRtcPeer) {
        		webRtcPeer.dispose();
        		webRtcPeer = null;

        		if (!message) {
        			var message = {
        				id : 'stop'
        			};
        			//webRTCservice.sendMessage(message);
        			sendMessage(message);
        		}
        	}
        	//hideSpinner(videoInput, videoOutput);
        }
        
        function onError() {
        	//setCallState(NO_CALL);
        	console.log("erreur");
        	 if(error){
                 console.error(error);
                 stop();
             }
        }
        
        function onIceCandidate(candidate) {
        	console.log("Local candidate" + JSON.stringify(candidate));

        	var message = {
        		id : 'onIceCandidate',
        		candidate : candidate
        	};
        	//webRTCservice.sendMessage(message);
        	sendMessage(message);
        }
       
        function resgisterResponse(message) {
        	if (message.response == 'accepted') {
        		//setRegisterState(REGISTERED);
        		console.log("accepted");
        	} else {
        		//setRegisterState(NOT_REGISTERED);
        		var errorMessage = message.message ? message.message
        				: 'Unknown reason for register rejection.';
        		console.log(errorMessage);
        		//alert('Error registering user. See console for further information.');
        	}
        }

        function callResponse(message) {
        	if (message.response != 'accepted') {
        		console.info('Call not accepted by peer. Closing call');
        		var errorMessage = message.message ? message.message
        				: 'Unknown reason for call rejection.';
        		console.log(errorMessage);
        		stop();
        	} else {
        		//setCallState(IN_CALL);
        		webRtcPeer.processAnswer(message.sdpAnswer, function(error) {
        			if (error)
        				return console.error(error);
        		});
        	}
        }

        function startCommunication(message) {
        	//setCallState(IN_CALL);
        	webRtcPeer.processAnswer(message.sdpAnswer, function(error) {
        		if (error){
        			return console.error(error);
        		}
        	});
        }
        function onOfferIncomingCall(error,offerSdp) {
        	if (error)
        		return console.error("Error generating the offer");
        	var response = {
        		id : 'incomingCallResponse',
        		from : from,
        		callResponse : 'accept',
        		sdpOffer : offerSdp
        	};
        	//webRTCservice.sendMessage(response);
        	sendMessage(response);
        }
        function call(){
			   if($scope.peerName == null){
				   $scope.error = false;
			   }else{
				   $scope.error = true;
				   //setCallState(PROCESSING_CALL);
				   //showSpinner(videoInput,videoOutput);
				   var pc_config = {
						   iceServers:[{url:"stun:stun.l.google.com:19302"},

					     {
							   url:"turn:numb.viagenie.ca:3478",
							   credential: "levoyageur", 
							   username: "fkemdjeukeng@yahoo.fr"
						 }]
				   };
				   var options = {
						   localVideo : videoInput,
						   remoteVideo : videoOutput,
						   onicecandidate : onIceCandidate,
						   configuration :pc_config,
						   onerror : onError
				   };
				   
				   webRtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options,function(error){
					  if(error){
						  console.error(error);
					  } 
					  webRtcPeer.generateOffer(onOfferCall);
				   });
               }
		 }
        function sendMessage(message) {
        	var jsonMessage = JSON.stringify(message);
        	console.log('Sending message: ' + jsonMessage);
        	
             	ws.send(jsonMessage);
        	
                
        }
        function incomingCall(message){
        	
			   if(0/*callState*/ != 0/*NO_CALL*/){
				   var response = {
						   id : "incomingCall",
						   from : message.from,
						   callResponse : "reject",
						   message : "busy"
				   };
				   return sendMessage(response);
			   }
           
			   //setCallState(PROCESSING_CALL);
			   if(confirm('User ' + message.from.toLowerCase() + ' is calling you. Do you accept the call?')){
				   //showSpinner(videoInput,videoOutput);
				   console.log("confirm call");
				   from = message.from;
				   var pc_config = {
						   iceServers:[{url:"stun:stun.l.google.com:19302"},

					     {
							   url:"turn:numb.viagenie.ca:3478",
							   credential: "levoyageur", 
							   username: "fkemdjeukeng@yahoo.fr"
						 }]
				   };
				   var options = {
						   localVideo : videoInput,
						   remoteVideo : videoOutput,
						   onicecandidate : onIceCandidate,
						   configuration :pc_config,
						   onerror : onError
				   };
				   webRtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options,
						   function(error){
					           if(error){
					               console.error(error);
					           }
					           webRtcPeer.generateOffer(onOfferIncomingCall);
				           }
				        
				   );
				   
			   }else {
				   var response = {
						  id :"incomingCalldenied",
						  from : message.from,
						  callResponse :  "reject",
						  message :  " User declined"
				   };
				   sendMessage(response);
				   stop();
			   }
		   }
       /*window.onload = function() {
        	console = new Console();
        	//setRegisterState(NOT_REGISTERED);
        	var drag = new Draggabilly($('#videoSmall'));
        	
        	
        }*/
        
     

        window.onbeforeunload = function() {
        	ws.close();
        }

    }
})();
