package com.codesync.codesync_backend.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String roomCode;

    @Column(nullable = false)
    private String roomName;

    @Column(nullable = false)
    private String language;

    @ElementCollection
    private List<String> users = new ArrayList<>();

    public Room() {
    }

    public Room(String roomCode, String roomName, String username, String language) {
        this.roomCode = roomCode;
        this.roomName = roomName;
        this.language = language;
        this.users.add(username);
    }

    public Long getId() {
        return id;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public String getRoomName() {
        return roomName;
    }

    public String getLanguage() {
        return language;
    }

    public List<String> getUsers() {
        return users;
    }

    public void addUser(String username) {
        users.add(username);
    }
}