package com.codesync.codesync_backend.dto;
import com.codesync.codesync_backend.dto.SignalingType;

public class SignalingMessage {

    private SignalingType type;
    private String sender;
    private String receiver;
    private String roomCode;
    private Object data;

    public SignalingMessage() {
    }

    public SignalingMessage(
            SignalingType type,
            String sender,
            String receiver,
            String roomCode,
            Object data) {

        this.type = type;
        this.sender = sender;
        this.receiver = receiver;
        this.roomCode = roomCode;
        this.data = data;
    }

    public SignalingType getType() {
        return type;
    }

    public void setType(SignalingType type) {
        this.type = type;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getReceiver() {
        return receiver;
    }

    public void setReceiver(String receiver) {
        this.receiver = receiver;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}