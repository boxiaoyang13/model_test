package handlers

import (
	"ai-api-tester-server/config"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ProxyHandler struct {
	DB  *gorm.DB
	Hub *WebSocketHub
}

func NewProxyHandler(hub *WebSocketHub) *ProxyHandler {
	return &ProxyHandler{DB: config.DB, Hub: hub}
}

// ProxyRequest 通用代理请求
type ProxyRequest struct {
	URL     string                 `json:"url" binding:"required"`
	Method  string                 `json:"method"` // POST, GET, etc. Default: POST
	Headers map[string]string      `json:"headers"`
	Body    interface{}            `json:"body"`
}

// ProxyResponse 代理响应
type ProxyResponse struct {
	Status     int                    `json:"status"`
	StatusText string                 `json:"statusText"`
	Headers    map[string]string      `json:"headers"`
	Data       interface{}            `json:"data"`
	Duration   int64                  `json:"duration"`
}

// sendLog 发送日志到 WebSocket
func (h *ProxyHandler) sendLog(logType, tag string, content interface{}, model string) {
	logMsg := LogMessage{
		Type:      logType,
		Tag:       tag,
		Content:   content,
		Timestamp: time.Now().UnixMilli(),
		Model:     model,
	}
	h.Hub.Broadcast(logMsg)
}

// extractModel 从 URL 或 headers 中提取模型名称
func extractModel(reqURL string, headers map[string]string) string {
	// 尝试从 URL 中提取模型
	u, err := url.Parse(reqURL)
	if err != nil {
		return ""
	}

	// Gemini 格式: /v1beta/models/{model}:generateContent
	parts := strings.Split(u.Path, "/")
	if len(parts) >= 4 && parts[2] == "models" {
		model := parts[3]
		// 移除可能的操作后缀
		if idx := strings.Index(model, ":"); idx > 0 {
			model = model[:idx]
		}
		return model
	}

	// OpenAI 格式: 从请求体中获取（暂时返回空，因为需要解析 body）
	return ""
}

func splitPath(s string) []string {
	return strings.Split(s, "/")
}

func indexOf(s string, substr string) int {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return i
		}
	}
	return -1
}

// Proxy 通用代理接口
func (h *ProxyHandler) Proxy(c *gin.Context) {
	var req ProxyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// 默认使用 POST 方法
	if req.Method == "" {
		req.Method = "POST"
	}

	// 提取模型名称
	model := extractModel(req.URL, req.Headers)

	startTime := time.Now()

	// 发送请求体日志
	if req.Body != nil {
		h.sendLog("info", "REQUEST BODY", req.Body, model)
	}

	// 序列化请求体
	var bodyReader io.Reader
	if req.Body != nil {
		jsonData, err := json.Marshal(req.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal request body"})
			return
		}
		bodyReader = bytes.NewReader(jsonData)
	}

	// 创建 HTTP 请求
	request, err := http.NewRequest(req.Method, req.URL, bodyReader)
	if err != nil {
		h.sendLog("error", "REQUEST ERROR", err.Error(), model)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 设置请求头
	for key, value := range req.Headers {
		request.Header.Set(key, value)
	}

	// 执行请求
	client := &http.Client{
		Timeout: 120 * time.Second,
	}

	response, err := client.Do(request)
	if err != nil {
		h.sendLog("error", "REQUEST ERROR", err.Error(), model)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer response.Body.Close()

	// 读取响应体
	responseBody, err := io.ReadAll(response.Body)
	if err != nil {
		h.sendLog("error", "RESPONSE ERROR", err.Error(), model)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response"})
		return
	}

	// 解析响应 JSON
	var jsonData interface{}
	if err := json.Unmarshal(responseBody, &jsonData); err != nil {
		// 如果不是 JSON，返回原始文本
		jsonData = string(responseBody)
	}

	// 发送响应体日志
	if response.StatusCode >= 200 && response.StatusCode < 300 {
		h.sendLog("success", "RESPONSE BODY", jsonData, model)
	} else {
		h.sendLog("error", "RESPONSE ERROR", jsonData, model)
	}

	// 构建响应头 map
	responseHeaders := make(map[string]string)
	for key, values := range response.Header {
		if len(values) > 0 {
			responseHeaders[key] = values[0]
		}
	}

	// 返回统一格式响应
	result := ProxyResponse{
		Status:     response.StatusCode,
		StatusText: response.Status,
		Headers:    responseHeaders,
		Data:       jsonData,
		Duration:   time.Since(startTime).Milliseconds(),
	}

	c.JSON(http.StatusOK, result)
}

// ProxyStream 流式代理接口
func (h *ProxyHandler) ProxyStream(c *gin.Context) {
	var req ProxyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// 提取模型名称
	model := extractModel(req.URL, req.Headers)

	startTime := time.Now()

	// 发送请求体日志
	if req.Body != nil {
		h.sendLog("info", "REQUEST BODY (STREAM)", req.Body, model)
	}

	// 序列化请求体
	jsonData, err := json.Marshal(req.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal request body"})
		return
	}

	// 创建 HTTP 请求
	request, err := http.NewRequest("POST", req.URL, bytes.NewReader(jsonData))
	if err != nil {
		h.sendLog("error", "STREAM ERROR", err.Error(), model)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 设置请求头
	for key, value := range req.Headers {
		request.Header.Set(key, value)
	}

	// 执行请求
	client := &http.Client{Timeout: 120 * time.Second}
	response, err := client.Do(request)
	if err != nil {
		h.sendLog("error", "STREAM ERROR", err.Error(), model)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer response.Body.Close()

	// 设置流式响应头
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")

	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Streaming not supported"})
		return
	}

	// 流式转发响应
	chunkCount := 0
	buffer := make([]byte, 1024)

	for {
		n, err := response.Body.Read(buffer)
		if n > 0 {
			chunk := string(buffer[:n])
			chunkCount++
			c.Writer.Write([]byte(chunk))
			flusher.Flush()
		}
		if err != nil {
			break
		}
	}

	duration := time.Since(startTime).Milliseconds()

	// 发送流式完成日志
	h.sendLog("success", "STREAM COMPLETE", fmt.Sprintf("%d chunks received in %dms", chunkCount, duration), model)

	// 发送结束事件
	c.Writer.Write([]byte(fmt.Sprintf("\nevent: done\ndata: {\"chunkCount\": %d, \"duration\": %d}\n\n",
		chunkCount, duration)))
	flusher.Flush()
}
