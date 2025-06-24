package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"os"
	"sync"
	"time"
)

// ScaleData represents the structure of the IoT weight scale data
type ScaleData struct {
	ItemName  string  `json:"itemName"`
	Weight    float64 `json:"weight"` // in kilograms
	ItemType  string  `json:"itemType"`
	Timestamp int64   `json:"timestamp"`
}

// Config holds the server configuration
type Config struct {
	Port   string // Port to run the server on
	APIKey string // Optional API key for authentication
}

// DataStore manages the latest ScaleData with thread-safe access
type DataStore struct {
	mu   sync.Mutex
	data ScaleData
}

// Global store for the latest data
var store DataStore

// submitScaleDataHandler handles POST requests to submit scale data
func submitScaleDataHandler(config Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			log.Printf("Invalid method from %s: %s", r.RemoteAddr, r.Method)
			return
		}

		// Validate API key if configured
		if config.APIKey != "" {
			auth := r.Header.Get("Authorization")
			if auth != "Bearer "+config.APIKey {
				http.Error(w, "Unauthorized: Invalid or missing API key", http.StatusUnauthorized)
				log.Printf("Unauthorized request from %s: Invalid API key", r.RemoteAddr)
				return
			}
		}

		// Decode the payload
		var data ScaleData
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			http.Error(w, "Invalid payload: "+err.Error(), http.StatusBadRequest)
			log.Printf("Failed to decode payload from %s: %v", r.RemoteAddr, err)
			return
		}

		// Validate data
		if data.ItemName == "" || data.Weight <= 0 || data.ItemType == "" {
			http.Error(w, "Invalid data: missing or invalid fields", http.StatusBadRequest)
			log.Printf("Invalid data received from %s: %+v", r.RemoteAddr, data)
			return
		}

		// Set timestamp if not provided
		if data.Timestamp <= 0 {
			data.Timestamp = time.Now().Unix()
		}

		// Store the data
		store.mu.Lock()
		store.data = data
		store.mu.Unlock()

		log.Printf("Received and stored data from %s: %+v", r.RemoteAddr, data)
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Data stored"})
	}
}

// scaleDataHandler handles GET requests to fetch the latest scale data
func scaleDataHandler(config Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			log.Printf("Invalid method from %s: %s", r.RemoteAddr, r.Method)
			return
		}

		// Validate API key if configured
		if config.APIKey != "" {
			auth := r.Header.Get("Authorization")
			if auth != "Bearer "+config.APIKey {
				http.Error(w, "Unauthorized: Invalid or missing API key", http.StatusUnauthorized)
				log.Printf("Unauthorized request from %s: Invalid API key", r.RemoteAddr)
				return
			}
		}

		// Fetch the latest data
		store.mu.Lock()
		data := store.data
		store.mu.Unlock()

		if data.ItemName == "" {
			http.Error(w, "No data available", http.StatusNotFound)
			log.Printf("GET request from %s: No data available", r.RemoteAddr)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(data); err != nil {
			http.Error(w, "Failed to encode response: "+err.Error(), http.StatusInternalServerError)
			log.Printf("Failed to encode response for %s: %v", r.RemoteAddr, err)
			return
		}

		log.Printf("Served data to %s: %+v", r.RemoteAddr, data)
	}
}

func main() {
	// Parse configuration from flags or environment variables
	port := flag.String("port", getEnv("PORT", "8080"), "Port to run the server")
	apiKey := flag.String("api-key", getEnv("API_KEY", ""), "API key for authentication")
	flag.Parse()

	config := Config{
		Port:   *port,
		APIKey: *apiKey,
	}

	log.Printf("Starting IoT data server with config: %+v", config)

	// Register handlers
	http.HandleFunc("/submit-scale-data", submitScaleDataHandler(config))
	http.HandleFunc("/scale-data", scaleDataHandler(config))

	// Start server
	addr := ":" + config.Port
	log.Printf("IoT data server running on http://localhost%s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// getEnv retrieves an environment variable with a fallback value
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
