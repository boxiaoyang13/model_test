BINARY_NAME=apiserver
VERSION?=$(shell git describe --tags --always --dirty 2>/dev/null || echo "development")
LDFLAGS=-X 'main.Version=$(VERSION)'

.PHONY: linux macos clean run all help

all: linux macos

linux:
	@echo "Building for Linux (amd64)..."
	GOOS=linux GOARCH=amd64 go build -ldflags="$(LDFLAGS)" -o $(BINARY_NAME)-linux-amd64
	@echo "Version: $(VERSION)"

macos:
	@echo "Building for macOS (arm64)..."
	GOOS=darwin GOARCH=arm64 go build -ldflags="$(LDFLAGS)" -o $(BINARY_NAME)-darwin-arm64
	@echo "Version: $(VERSION)"

run:
	@echo "Running server..."
	go run main.go

clean:
	@echo "Cleaning up..."
	rm -f $(BINARY_NAME)-*

.DEFAULT_GOAL := help
help:
	@echo "Available targets:"
	@echo "  make linux   - Build for Linux (amd64)"
	@echo "  make macos   - Build for macOS (arm64)"
	@echo "  make run     - Run server locally (go run)"
	@echo "  make all     - Build for all platforms"
	@echo "  make clean   - Remove built binaries"
	@echo ""
	@echo "Options:"
	@echo "  VERSION=v1.0.0 make macos  - Build with specific version"
	@echo ""
	@echo "Current version: $(VERSION)"
