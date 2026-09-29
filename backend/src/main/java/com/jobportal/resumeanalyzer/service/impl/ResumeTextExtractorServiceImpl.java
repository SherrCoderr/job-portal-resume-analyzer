package com.jobportal.resumeanalyzer.service.impl;

import com.jobportal.resumeanalyzer.exception.FileStorageException;
import com.jobportal.resumeanalyzer.service.ResumeTextExtractorService;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

@Slf4j
@Service
public class ResumeTextExtractorServiceImpl implements ResumeTextExtractorService {

    @Override
    public String extractText(File file, String fileType) {
        if (file == null || !file.exists()) {
            throw new FileStorageException("File does not exist on disk for text extraction");
        }

        String fileName = file.getName().toLowerCase();
        log.info("Extracting text from file: {} (type: {})", fileName, fileType);

        try {
            if (fileName.endsWith(".pdf") || (fileType != null && fileType.contains("pdf"))) {
                return extractTextFromPdf(file);
            } else if (fileName.endsWith(".docx") || (fileType != null && fileType.contains("wordprocessingml"))) {
                return extractTextFromDocx(file);
            } else if (fileName.endsWith(".txt") || (fileType != null && fileType.contains("text/plain"))) {
                return extractTextFromTxt(file);
            } else {
                // Fallback attempt: try PDF then plain text
                try {
                    return extractTextFromPdf(file);
                } catch (Exception ignored) {
                    return extractTextFromTxt(file);
                }
            }
        } catch (Exception e) {
            log.error("Failed to extract text from file {}: {}", fileName, e.getMessage(), e);
            throw new FileStorageException("Could not extract readable text from resume: " + e.getMessage(), e);
        }
    }

    private String extractTextFromPdf(File file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);
            log.info("Extracted {} characters from PDF", text.length());
            return cleanText(text);
        }
    }

    private String extractTextFromDocx(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file);
             XWPFDocument document = new XWPFDocument(fis);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            String text = extractor.getText();
            log.info("Extracted {} characters from DOCX", text.length());
            return cleanText(text);
        }
    }

    private String extractTextFromTxt(File file) throws IOException {
        String text = Files.readString(file.toPath(), StandardCharsets.UTF_8);
        return cleanText(text);
    }

    private String cleanText(String text) {
        if (text == null) return "";
        // Normalize whitespace and linebreaks
        return text.replaceAll("[\\r\\t]+", " ")
                .replaceAll(" +", " ")
                .trim();
    }
}
