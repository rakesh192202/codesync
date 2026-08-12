package com.codesync.codesync_backend.service;

import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;

@Service
public class CodeExecutionService {

    public String executeJava(String code) {

        try {
            Path directory =
                    Files.createTempDirectory("codesync-");

            Path javaFile =
                    directory.resolve("Main.java");

            Files.writeString(javaFile, code);

            ProcessBuilder compileProcess =
                    new ProcessBuilder(
                            "javac",
                            javaFile.toString()
                    );

            compileProcess.redirectErrorStream(true);

            Process compile =
                    compileProcess.start();

            String compileOutput =
                    new String(
                            compile.getInputStream().readAllBytes()
                    );

            int compileExitCode =
                    compile.waitFor();

            if (compileExitCode != 0) {
                return compileOutput;
            }

            ProcessBuilder runProcess =
                    new ProcessBuilder(
                            "java",
                            "-cp",
                            directory.toString(),
                            "Main"
                    );

            runProcess.redirectErrorStream(true);

            Process run =
                    runProcess.start();

            String output =
                    new String(
                            run.getInputStream().readAllBytes()
                    );

            run.waitFor();

            return output;

        } catch (Exception e) {

            return "Execution error: " + e.getMessage();
        }
    }
}