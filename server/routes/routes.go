package routes

import (
	"ai-api-tester-server/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, favoritesHandler *handlers.FavoritesHandler, proxyHandler *handlers.ProxyHandler, wsHub *handlers.WebSocketHub) {
	api := r.Group("/api")
	{
		// Favorites routes
		favorites := api.Group("/favorites")
		{
			favorites.GET("/:protocol", favoritesHandler.GetFavoritesByProtocol)
			favorites.POST("", favoritesHandler.CreateFavorite)
			favorites.PUT("/:id", favoritesHandler.UpdateFavorite)
			favorites.DELETE("/:id", favoritesHandler.DeleteFavorite)
		}

		// Proxy routes - 统一代理接口
		proxy := api.Group("/proxy")
		{
			proxy.POST("", proxyHandler.Proxy)           // 通用代理
			proxy.POST("/stream", proxyHandler.ProxyStream) // 流式代理
		}

		// WebSocket endpoint
		api.GET("/ws", wsHub.HandleWebSocket)
	}
}
