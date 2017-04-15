package com.thedevbridge.videochat.config;

import org.kurento.client.KurentoClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.thedevbridge.videochat.OneToOneVideoChat.CallHandler;
import com.thedevbridge.videochat.OneToOneVideoChat.UserRegistry;

@Configuration
@EnableWebSocket
public class OneToOneCallSocketConfig implements WebSocketConfigurer {
	
	final static String DEFAULT_KMS_WS_URI = "ws://localhost:8888/kurento";
	@Bean
	public CallHandler Handler(){
		return new CallHandler();
	}
	@Bean
	public UserRegistry registry(){
		return new UserRegistry();
	}

	@Bean
	public KurentoClient kurentoClient(){
		return KurentoClient.create(System.getProperty("kms.url",
				DEFAULT_KMS_WS_URI));
		
	}
	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry){
		registry.addHandler(Handler(), "/call");
	}
	
	

}
