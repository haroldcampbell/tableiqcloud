package main

import (
	"tableiq/api"

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
	router.POST("/api/field/new", api.CreateTableField(d))
	router.POST("/api/field/delete", api.DeleteTableField(d))
	router.POST("/api/field/update-info", api.UpdateTableFieldInfo(d))
	router.POST("/api/field/update-value", api.UpdateTableFieldValue(d))
	router.POST("/api/table-record/new", api.CreateTableRecord(d))
	router.POST("/api/table-record/delete", api.DeleteTableRecord(d))

	router.Run("localhost:8083")

	// fmt.Printf("field: %#v\n", field)
}
