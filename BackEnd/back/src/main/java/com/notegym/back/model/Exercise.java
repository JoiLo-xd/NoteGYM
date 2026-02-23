package com.notegym.back.model;

import jakarta.persistence.*;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "exercise")
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; //Este es autoincrementable

    @Column(length = 50)
    private String name; 

    @Column(name = "video_url", length = 255)
    private String videoUrl;

    @Column(name = "duration_time")
    private Integer durationTime;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_path", length = 255)
    private String imagePath;

    @Column(length = 50)
    private String type;

    // Relación ManyToOne: 
    @ManyToOne
    @JoinColumn(name = "creator", referencedColumnName = "username")
    private User creator;

    // Relación ManyToMany inversa
    @ManyToMany(mappedBy = "exercises")
    @JsonIgnore //Por si decaso al convertir a JSON
    private Set<User> users;


    public Exercise() {}

   
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public Integer getDurationTime() { return durationTime; }
    public void setDurationTime(Integer durationTime) { this.durationTime = durationTime; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public User getCreator() { return creator; }
    public void setCreator(User creator) { this.creator = creator; }

    public Set<User> getUsers() { return users; }
    public void setUsers(Set<User> users) { this.users = users; }
}
