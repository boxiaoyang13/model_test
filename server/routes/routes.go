package routes

import (
	"ai-api-tester-server/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, favoritesHandler *handlers.FavoritesHandler) {
	api := r.Group("/api")
	{
		favorites := api.Group("/favorites")
		{
			favorites.GET("/:protocol", favoritesHandler.GetFavoritesByProtocol)
			favorites.POST("", favoritesHandler.CreateFavorite)
			favorites.PUT("/:id", favoritesHandler.UpdateFavorite)
			favorites.DELETE("/:id", favoritesHandler.DeleteFavorite)
		}
	}
}
