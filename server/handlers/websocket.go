package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// WebSocketHub 维护活跃的 WebSocket 连接
type WebSocketHub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan []byte
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mutex      sync.RWMutex
}

// NewWebSocketHub 创建新的 WebSocket Hub
func NewWebSocketHub() *WebSocketHub {
	return &WebSocketHub{
		clients:    make(map[*websocket.Conn]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
	}
}

// Run 启动 WebSocket Hub
func (h *WebSocketHub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client] = true
			h.mutex.Unlock()
			log.Printf("WebSocket client connected. Total clients: %d", len(h.clients))

		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				client.Close()
			}
			h.mutex.Unlock()
			log.Printf("WebSocket client disconnected. Total clients: %d", len(h.clients))

		case message := <-h.broadcast:
			h.mutex.RLock()
			for client := range h.clients {
				err := client.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					log.Printf("Error sending to WebSocket client: %v", err)
					client.Close()
					delete(h.clients, client)
				}
			}
			h.mutex.RUnlock()
		}
	}
}

// Broadcast 广播消息到所有连接的客户端
func (h *WebSocketHub) Broadcast(message interface{}) {
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling broadcast message: %v", err)
		return
	}

	select {
	case h.broadcast <- data:
	default:
		// Channel full, message dropped
	}
}

// WebSocketUpgrader WebSocket 升级器
var WebSocketUpgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // 允许所有来源
	},
}

// HandleWebSocket WebSocket 处理器
func (h *WebSocketHub) HandleWebSocket(c *gin.Context) {
	conn, err := WebSocketUpgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	h.register <- conn

	// 读取客户端消息（可选，用于心跳等）
	defer func() {
		h.unregister <- conn
	}()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
		// 可以处理客户端发送的消息
	}
}

// LogMessage 日志消息结构
type LogMessage struct {
	Type      string      `json:"type"`       // info, error, success, warn
	Tag       string      `json:"tag"`        // REQUEST BODY, RESPONSE BODY, etc.
	Content   interface{} `json:"content"`     // 日志内容
	Timestamp int64       `json:"timestamp"`
	Model     string      `json:"model,omitempty"`
}
