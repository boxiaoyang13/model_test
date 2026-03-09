package main

import (
	"ai-api-tester-server/config"
	"ai-api-tester-server/handlers"
	"ai-api-tester-server/routes"
	"flag"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

// Version 版本信息，可以通过 ldflags 在编译时设置
var Version string = "development"

func main() {
	// 定义命令行参数
	showVersion := flag.Bool("v", false, "显示版本信息")
	configPath := flag.String("conf", "config.yaml", "配置文件路径")
	flag.Parse()

	// 如果指定了 -v 参数，显示版本并退出
	if *showVersion {
		fmt.Printf("AI API Tester Server Version: %s\n", Version)
		return
	}

	// 加载配置
	cfg, err := config.LoadConfig(*configPath)
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// 初始化数据库
	db, err := config.InitDB(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	config.DB = db

	// 设置 Gin 运行模式
	if cfg.Server.Mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Setup Gin
	r := gin.Default()

	// Setup CORS
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Setup handlers
	favoritesHandler := handlers.NewFavoritesHandler()

	// Setup WebSocket Hub
	wsHub := handlers.NewWebSocketHub()
	go wsHub.Run()

	proxyHandler := handlers.NewProxyHandler(wsHub)

	// Setup routes
	routes.SetupRoutes(r, favoritesHandler, proxyHandler, wsHub)

	// 启动服务器
	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	log.Printf("Server starting on %s (version: %s, mode: %s)\n", addr, Version, cfg.Server.Mode)
	if err := r.Run(addr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
