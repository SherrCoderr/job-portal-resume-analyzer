package com.jobportal.resumeanalyzer.repository;

import com.jobportal.resumeanalyzer.entity.RoleEnum;
import com.jobportal.resumeanalyzer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<User> findByRole(RoleEnum role);
    long countByRole(RoleEnum role);
}
