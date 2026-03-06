package handlers

import (
	"ai-api-tester-server/config"
	"ai-api-tester-server/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type FavoritesHandler struct {
	DB *gorm.DB
}

func NewFavoritesHandler() *FavoritesHandler {
	return &FavoritesHandler{DB: config.DB}
}

type CreateFavoriteRequest struct {
	Protocol    string `json:"protocol" binding:"required"`
	Name        string `json:"name" binding:"required"`
	BodyContent string `json:"body_content" binding:"required"`
}

type UpdateFavoriteRequest struct {
	Name        string `json:"name" binding:"required"`
	BodyContent string `json:"body_content" binding:"required"`
}

// GetFavoritesByProtocol - GET /api/favorites/:protocol
func (h *FavoritesHandler) GetFavoritesByProtocol(c *gin.Context) {
	protocol := c.Param("protocol")

	var favorites []models.CustomBodyFavorite
	if err := h.DB.Where("protocol = ?", protocol).Order("created_at DESC").Find(&favorites).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch favorites"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": favorites})
}

// CreateFavorite - POST /api/favorites
func (h *FavoritesHandler) CreateFavorite(c *gin.Context) {
	var req CreateFavoriteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Validate protocol
	validProtocols := map[string]bool{
		"anthropic": true,
		"gemini":    true,
		"openai":    true,
	}
	if !validProtocols[req.Protocol] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid protocol"})
		return
	}

	// Check for duplicate name within the same protocol
	var existingFavorite models.CustomBodyFavorite
	if err := h.DB.Where("protocol = ? AND name = ?", req.Protocol, req.Name).First(&existingFavorite).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Favorite name already exists"})
		return
	}

	favorite := models.CustomBodyFavorite{
		Protocol:    req.Protocol,
		Name:        req.Name,
		BodyContent: req.BodyContent,
	}

	if err := h.DB.Create(&favorite).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create favorite"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": favorite})
}

// UpdateFavorite - PUT /api/favorites/:id
func (h *FavoritesHandler) UpdateFavorite(c *gin.Context) {
	id := c.Param("id")
	uintID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var req UpdateFavoriteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	var favorite models.CustomBodyFavorite
	if err := h.DB.First(&favorite, uintID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Favorite not found"})
		return
	}

	// Check for duplicate name within the same protocol (excluding current favorite)
	var existingFavorite models.CustomBodyFavorite
	if err := h.DB.Where("protocol = ? AND name = ? AND id != ?", favorite.Protocol, req.Name, uintID).First(&existingFavorite).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Favorite name already exists"})
		return
	}

	favorite.Name = req.Name
	favorite.BodyContent = req.BodyContent

	if err := h.DB.Save(&favorite).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update favorite"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": favorite})
}

// DeleteFavorite - DELETE /api/favorites/:id
func (h *FavoritesHandler) DeleteFavorite(c *gin.Context) {
	id := c.Param("id")
	uintID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := h.DB.Delete(&models.CustomBodyFavorite{}, uintID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete favorite"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted successfully"})
}
