package com.jobportal.resumeanalyzer.service;

import java.util.List;

public interface SkillParserService {
    List<String> extractSkillsFromText(String text);
    List<String> getSupportedSkills();
}
