(function() {
    'use strict';

    angular
        .module('videoChatApp')
        .service('webRTCservice', service);

    service.$inject = [];

    function service () {
    	  

    	var callState = null;
    	const NO_CALL = 0;
    	const PROCESSING_CALL = 1;
    	const IN_CALL = 2;
    	
    	return {
    		   call:function(){
    			   if(/*$scope.peerName == ""*/true){
    				   //$scope.error = false;
    			   }
    			   setCallState(PROCESSING_CALL);
    			   //showSpinner(videoInput,videoOutput);
    			   var options = {
    					   localVideo : videoInput,
    					   remoteVideo : videoOutput,
    					   onicecandidate : onIceCandidate,
    					   onerror : onError
    			   };
    			   webRtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options,function(error){
    				  if(error){
    					  console.error(error);
    				  } 
    				  webRtcPeer.generateOffer(onOfferCall);
    			   });
    		   }, 
    		   sendMessage: function (message) {
    	        	var jsonMessage = JSON.stringify(message);
    	        	console.log('Sending message: ' + jsonMessage);
    	        	ws.send(jsonMessage);
    	        },
    		   incomingCall : function(message){
    			   if(callState != NO_CALL){
    				   var response = {
    						   id : "incomingCall",
    						   from : message.from,
    						   callResponse : "reject",
    						   message : "busy"
    				   };
    				   return sendMessage(response);
    			   }
    			   //setCallState(PROCESSING_CALL);
    			   if(confirm('User ' + message.from + ' is calling you. Do you accept the call?')){
    				   //showSpinner(videoInput,videoOutput);
    				   from = message.from;
    				   var options = {
    						   localVideo : videoInput,
    						   remoteVideo : videoOutput,
    						   onicecandidate : onIceCandidate,
    						   onerror : onError
    				   };
    				   webRtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options,
    						   function(error){
    					           if(error){
    					               console.error(error);
    					           }
    					           webRtcPeer.generateOffer(incomingCall)
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
    		
    	};
    }
})();
