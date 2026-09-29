package com.jobportal.resumeanalyzer.service.impl;

import com.jobportal.resumeanalyzer.exception.FileStorageException;
import com.jobportal.resumeanalyzer.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

@Slf4j
@Service
public class LocalFileStorageServiceImpl implements FileStorageService {

    private final Path baseStorageLocation;

    public LocalFileStorageServiceImpl(@Value("${app.storage.upload-dir:uploads/resumes}") String uploadDir) {
        this.baseStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.baseStorageLocation);
            log.info("Initialized file storage directory at: {}", this.baseStorageLocation);
        } catch (IOException e) {
            throw new FileStorageException("Could not create the storage directory at: " + uploadDir, e);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String subDirectory) {
        if (file.isEmpty()) {
            throw new FileStorageException("Failed to store empty file");
        }

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        if (originalFileName.contains("..")) {
            throw new FileStorageException("Filename contains invalid path sequence: " + originalFileName);
        }

        String extension = "";
        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFileName.substring(dotIndex);
        }

        String storedFileName = UUID.randomUUID() + extension;

        try {
            Path targetDir = this.baseStorageLocation;
            if (StringUtils.hasText(subDirectory)) {
                targetDir = this.baseStorageLocation.resolve(subDirectory).normalize();
                Files.createDirectories(targetDir);
            }

            Path targetPath = targetDir.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("File successfully stored: {} as {}", originalFileName, storedFileName);
            return storedFileName;
        } catch (IOException e) {
            throw new FileStorageException("Failed to store file: " + originalFileName, e);
        }
    }

    @Override
    public Path getFilePath(String fileName, String subDirectory) {
        Path dir = this.baseStorageLocation;
        if (StringUtils.hasText(subDirectory)) {
            dir = this.baseStorageLocation.resolve(subDirectory).normalize();
        }
        return dir.resolve(fileName).normalize();
    }

    @Override
    public Resource loadFileAsResource(String fileName, String subDirectory) {
        try {
            Path filePath = getFilePath(fileName, subDirectory);
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new FileStorageException("File not found or unreadable: " + fileName);
            }
        } catch (MalformedURLException e) {
            throw new FileStorageException("Invalid file URL for: " + fileName, e);
        }
    }

    @Override
    public void deleteFile(String fileName, String subDirectory) {
        try {
            Path filePath = getFilePath(fileName, subDirectory);
            Files.deleteIfExists(filePath);
            log.info("Deleted file: {}", fileName);
        } catch (IOException e) {
            log.warn("Could not delete file: {}", fileName, e);
        }
    }
}
