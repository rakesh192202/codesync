package com.codesync.codesync_backend.websocket;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import com.codesync.codesync_backend.dto.SignalingMessage;
import com.codesync.codesync_backend.dto.SignalingType;

import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class SignalingHandler extends TextWebSocketHandler {

    private final Map<String, WebSocketSession> sessions =
        new ConcurrentHashMap<>();
        private final Map<String, String> userRooms =
        new ConcurrentHashMap<>();

   @Override
public void afterConnectionEstablished(WebSocketSession session) {

    String query = session.getUri().getQuery();

    System.out.println("WebSocket query: " + query);

    if (query == null || query.isBlank()) {
        System.out.println("Missing connection parameters");
        return;
    }

    String username =
            UriComponentsBuilder
                    .fromUri(session.getUri())
                    .build()
                    .getQueryParams()
                    .getFirst("username");

    String roomCode =
            UriComponentsBuilder
                    .fromUri(session.getUri())
                    .build()
                    .getQueryParams()
                    .getFirst("roomCode");

    if (username == null || username.isBlank()
            || roomCode == null || roomCode.isBlank()) {

        System.out.println("Invalid connection parameters");
        return;
    }

    sessions.put(username, session);
    userRooms.put(username, roomCode);

    System.out.println(
            "WebSocket connected: " + username
    );

    System.out.println(
            "Room: " + roomCode
    );
    try {
    sendUserList(roomCode);
} catch (IOException e) {
    e.printStackTrace();
}
}

 @Override
protected void handleTextMessage(
        WebSocketSession session,
        TextMessage message) throws IOException {

    ObjectMapper objectMapper = new ObjectMapper();

    SignalingMessage signalingMessage =
            objectMapper.readValue(
                    message.getPayload(),
                    SignalingMessage.class
            );

    // Validate message
    if (signalingMessage.getType() == null
            || signalingMessage.getSender() == null
            || signalingMessage.getSender().isBlank()
            || signalingMessage.getReceiver() == null
            || signalingMessage.getReceiver().isBlank()
            || signalingMessage.getRoomCode() == null
            || signalingMessage.getRoomCode().isBlank()) {

        System.out.println("Invalid signaling message");
        return;
    }

    SignalingType type = signalingMessage.getType();

    System.out.println("Signaling type: " + type);
    System.out.println("Sender: " + signalingMessage.getSender());
    System.out.println("Receiver: " + signalingMessage.getReceiver());
    System.out.println("Room: " + signalingMessage.getRoomCode());

    switch (type) {

        case OFFER:
            System.out.println("Processing WebRTC offer");
            break;

        case ANSWER:
            System.out.println("Processing WebRTC answer");
            break;

        case ICE_CANDIDATE:
            System.out.println("Processing ICE candidate");
            break;
    }

    String receiver = signalingMessage.getReceiver();

    WebSocketSession receiverSession =
            sessions.get(receiver);

    String receiverRoom =
            userRooms.get(receiver);

    if (receiverSession != null
            && receiverSession.isOpen()
            && signalingMessage.getRoomCode().equals(receiverRoom)) {

        receiverSession.sendMessage(message);

        System.out.println(
                "Message sent to: " + receiver
        );

    } else {

        System.out.println(
                "Message not sent. Receiver is not in the same room."
        );
    }
}
private void sendUserList(String roomCode) throws IOException {

    ObjectMapper objectMapper = new ObjectMapper();

    for (Map.Entry<String, WebSocketSession> entry : sessions.entrySet()) {

        String username = entry.getKey();
        WebSocketSession userSession = entry.getValue();

        String userRoom = userRooms.get(username);

        if (userRoom != null
                && userRoom.equals(roomCode)
                && userSession.isOpen()) {

            Map<String, Object> response = Map.of(
                    "type", "USER_LIST",
                    "roomCode", roomCode,
                    "users", sessions.entrySet()
                            .stream()
                            .filter(e ->
                                    roomCode.equals(
                                            userRooms.get(e.getKey())
                                    )
                            )
                            .map(Map.Entry::getKey)
                            .toList()
            );

            userSession.sendMessage(
                    new TextMessage(
                            objectMapper.writeValueAsString(response)
                    )
            );
        }
    }
}

    @Override
public void afterConnectionClosed(
        WebSocketSession session,
        org.springframework.web.socket.CloseStatus status) {

    String disconnectedUser = null;
    String disconnectedRoom = null;

    for (Map.Entry<String, WebSocketSession> entry
            : sessions.entrySet()) {

        if (entry.getValue().getId().equals(session.getId())) {

            disconnectedUser = entry.getKey();
            disconnectedRoom = userRooms.get(entry.getKey());

            break;
        }
    }

    if (disconnectedUser != null) {

        sessions.remove(disconnectedUser);
        userRooms.remove(disconnectedUser);

        System.out.println(
                "User disconnected: " + disconnectedUser
        );

        if (disconnectedRoom != null) {
            try {
                sendUserList(disconnectedRoom);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    System.out.println(
            "WebSocket disconnected: " + session.getId()
    );
}
}