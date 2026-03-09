package handlers

import "time"

// CustomBodyFavorite 收藏数据模型
type CustomBodyFavorite struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Protocol    string    `gorm:"size:50;not null;index" json:"protocol"`
	Name        string    `gorm:"size:255;not null" json:"name"`
	BodyContent string    `gorm:"type:text;not null" json:"body_content"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
