package com.thedevbridge.videochat.OneToOneVideoChat;

import org.kurento.client.KurentoClient;
import org.kurento.client.MediaPipeline;
import org.kurento.client.WebRtcEndpoint;

public class CallMediaPipeline {

	private MediaPipeline pipeline;
	private WebRtcEndpoint callerWebRtcEP;
	private WebRtcEndpoint calleeWebRtcEP;
	
	public CallMediaPipeline(KurentoClient kurento){
		
		try{
			this.pipeline = kurento.createMediaPipeline();
			this.callerWebRtcEP =new WebRtcEndpoint.Builder(this.pipeline).build();
			this.calleeWebRtcEP =new WebRtcEndpoint.Builder(this.pipeline).build();
			
			this.callerWebRtcEP.connect(this.calleeWebRtcEP);
			this.calleeWebRtcEP.connect(this.callerWebRtcEP);
		}catch(Throwable t){
			if(this.pipeline != null){
				this.pipeline.release();
			}
		}
	}
		public String generateSdpAnswerForCaller(String SdpOffer){
			return callerWebRtcEP.processOffer(SdpOffer);
		}
		
		public String generateSdpAnswerForCallee(String SdpOffer){
			return calleeWebRtcEP.processOffer(SdpOffer);
		}
		public void release() {
			if (this.pipeline != null) {
			  this.pipeline.release();
			}
		}
		public WebRtcEndpoint getCallerWebRtcEP() {
			return callerWebRtcEP;
		}
		public WebRtcEndpoint getCalleeWebRtcEP() {
			return calleeWebRtcEP;
		}
		
}
