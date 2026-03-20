package com.careerportal.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @PostConstruct
    public void validateConfiguration() {
        // Configuration validation - errors will be thrown when getCloudinary() is called
        // This method can be extended to use proper logging if needed
    }

    private Cloudinary getCloudinary() {
        if (cloudName == null || apiKey == null || apiSecret == null) {
            throw new IllegalStateException(
                    "Cloudinary not configured properly. Check application.properties"
            );
        }

        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    // ================== UPLOAD ==================

    @SuppressWarnings("unchecked")
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }

        try {
            Cloudinary cloudinary = getCloudinary();

            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "auto"
            );

            Map<String, Object> result =
                    cloudinary.uploader().upload(file.getBytes(), uploadParams);

            String secureUrl = (String) result.get("secure_url");

            if (secureUrl == null) {
                throw new IOException("Cloudinary returned null URL");
            }

            return secureUrl;

        } catch (Exception e) {
            throw new IOException("Cloudinary upload failed", e);
        }
    }

    public String uploadFile(MultipartFile file) throws IOException {
        return uploadFile(file, "career-portal");
    }

    // ================== DELETE ==================

    @SuppressWarnings("unchecked")
    public void deleteFile(String publicId) throws IOException {
        try {
            Cloudinary cloudinary = getCloudinary();
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            throw new IOException("Cloudinary delete failed", e);
        }
    }

    // ================== PUBLIC ID EXTRACTION ==================

    public String extractPublicId(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }

        try {
            // Example:
            // https://res.cloudinary.com/demo/image/upload/v1700000000/folder/image.jpg
            String[] split = url.split("/upload/");
            if (split.length < 2) return null;

            String publicId = split[1];

            // Remove version
            if (publicId.startsWith("v")) {
                publicId = publicId.substring(publicId.indexOf("/") + 1);
            }

            // Remove extension
            int dotIndex = publicId.lastIndexOf(".");
            if (dotIndex > 0) {
                publicId = publicId.substring(0, dotIndex);
            }

            return publicId;

        } catch (Exception e) {
            return null;
        }
    }
}
