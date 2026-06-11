package com.lumina.domain.goal.repository;
import com.lumina.domain.goal.entity.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface GoalRepository extends JpaRepository<Goal,UUID> {
    @Query("SELECT g FROM Goal g WHERE g.user.id=:uid AND (:status IS NULL OR g.status=:status) ORDER BY g.createdAt DESC")
    List<Goal> findByUserIdAndStatus(@Param("uid") UUID uid, @Param("status") GoalStatus status);
    Optional<Goal> findByIdAndUserId(UUID id, UUID userId);
}
