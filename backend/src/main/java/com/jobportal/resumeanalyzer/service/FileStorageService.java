package com.jobportal.resumeanalyzer.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

public interface FileStorageService {
    String storeFile(MultipartFile file, String subDirectory);
    Path getFilePath(String fileName, String subDirectory);
    Resource loadFileAsResource(String fileName, String subDirectory);
    void deleteFile(String fileName, String subDirectory);
}
