package com.jobportal.resumeanalyzer.service;

import java.io.File;

public interface ResumeTextExtractorService {
    String extractText(File file, String fileType);
}
