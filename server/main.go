package main

import (
	"airport-mode/api"

	"github.com/gin-gonic/gin"
)

func main() {
	d := MockStore()

	router := gin.Default()
	// router.Static("/assets", "./src/assets")
	// router.StaticFile("/", "./src/index.html")
	// router.GET("/api/base/:baseGUID", api.GetBases(d))
	router.GET("/api/bases", api.GetBases(d))
	router.GET("/api/base/:baseGUID", api.GetTables(d))
	router.GET("/api/table/:baseGUID/:tableGUID", api.GetTableByGUID(d))

	router.Run("localhost:8083")

	// fmt.Printf("field: %#v\n", field)
}
