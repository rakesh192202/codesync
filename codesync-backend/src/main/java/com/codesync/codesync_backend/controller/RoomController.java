package com.codesync.codesync_backend.controller;

import com.codesync.codesync_backend.model.Room;
import com.codesync.codesync_backend.service.RoomService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public Room createRoom(
            @RequestParam String roomName,
            @RequestParam String username,
            @RequestParam(defaultValue = "java") String language) {

        return roomService.createRoom(
                roomName,
                username,
                language
        );
    }
    @PostMapping("/{roomCode}/join")
    public Room joinRoom(
        @PathVariable String roomCode,
        @RequestParam String username) {

    return roomService.joinRoom(roomCode, username);
}
@GetMapping("/{roomCode}")
public Room getRoom(@PathVariable String roomCode) {
    return roomService.getRoom(roomCode);
}
}