package com.codesync.codesync_backend.service;

import com.codesync.codesync_backend.model.Room;
import com.codesync.codesync_backend.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public Room createRoom(String roomName, String username, String language) {

        String roomCode = UUID.randomUUID()
                .toString()
                .substring(0, 6)
                .toUpperCase();

        Room room = new Room(
                roomCode,
                roomName,
                username,
                language
        );

        return roomRepository.save(room);
    }

    public Room joinRoom(String roomCode, String username) {

        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (!room.getUsers().contains(username)) {
            room.addUser(username);
        }

        return roomRepository.save(room);
    }

    public Room getRoom(String roomCode) {

        return roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }
}