package com.codesync.codesync_backend.controller;

import org.springframework.web.bind.annotation.*;

import com.codesync.codesync_backend.dto.ExecuteRequest;
import com.codesync.codesync_backend.service.CodeExecutionService;

@RestController
@RequestMapping("/api")
public class ExecuteController {

    private final CodeExecutionService codeExecutionService;

    public ExecuteController(CodeExecutionService codeExecutionService) {
        this.codeExecutionService = codeExecutionService;
    }

    @PostMapping("/execute")
    public String execute(@RequestBody ExecuteRequest request) {

        if ("java".equalsIgnoreCase(request.getLanguage())) {
            return codeExecutionService.executeJava(request.getCode());
        }

        return "Unsupported language";
    }
}