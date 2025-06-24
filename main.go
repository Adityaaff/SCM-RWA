package main

import (
    "encoding/json"
    "fmt"
    "math/rand"
    "net/http"
    "time"
)

type ScaleData struct {
    ItemName string  `json:"itemName"`
    Weight   float64 `json:"weight"`
    ItemType string  `json:"itemType"`
    Timestamp int64   `json:"timestamp"`
}

var itemNames = []string{"Rice Bag", "Flour Sack", "Sugar Pack", "Cement Bag", "Coffee Beans"}
var itemTypes = []string{"Food", "Construction", "Beverage"}

func generateMockScaleData() ScaleData {
    rand.Seed(time.Now().UnixNano())
    return ScaleData{
        ItemName:  itemNames[rand.Intn(len(itemNames))],
        Weight:    5.0 + rand.Float64()*45.0,
        ItemType:  itemTypes[rand.Intn(len(itemTypes))],
        Timestamp: time.Now().Unix(),
    }
}

func scaleDataHandler(w http.ResponseWriter, r *http.Request) {
    data := generateMockScaleData()
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(data)
}

func main() {
    http.HandleFunc("/scale-data", scaleDataHandler)
    fmt.Println("Mock IoT server running on :8080")
    http.ListenAndServe(":8080", nil)
}
