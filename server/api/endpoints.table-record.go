package api

import (
	"fmt"
	"net/http"
	"tableiq/datastore"

	"github.com/gin-gonic/gin"
)

type RequestDataCreateRecord struct {
	BaseGUID  string
	TableGUID string
	// FieldName string
	// FieldType string
}
type RequestDataCreateRecordResponse struct {
	RecordGUID string
	Cells      []*datastore.RecordCell
}

type Context struct {
	GinContext *gin.Context
	Datastore  *datastore.Datastore
	Action     string
}

func NewContext(c *gin.Context, d *datastore.Datastore, action string) *Context {
	return &Context{
		GinContext: c,
		Datastore:  d,
		Action:     action,
	}
}

func (ctx *Context) ErrResponseStatusNotFound(msg string) {
	ctx.GinContext.IndentedJSON(http.StatusNotFound, ErrResponse(ctx.Action, http.StatusBadRequest, msg))
}

func withValidBase(ctx *Context, baseGUID string, handler func(ctx *Context, base datastore.Base)) {
	base, err := ctx.Datastore.GetBaseByGUID(baseGUID)
	if err != nil {
		ctx.ErrResponseStatusNotFound("Unknown base")
		return
	}

	handler(ctx, base)
}

func withValidTable(ctx *Context, base datastore.Base, tableGUID string, handler func(ctx *Context, table *datastore.Table)) {
	table, err := base.GetTableByGUID(tableGUID)
	if err != nil {
		ctx.ErrResponseStatusNotFound("Unknown table")
		return
	}
	handler(ctx, table)
}

func CreateTableRecord(d *datastore.Datastore) func(c *gin.Context) {
	return func(c *gin.Context) {
		var data RequestDataCreateRecord
		ctx := NewContext(c, d, "create-table-record")

		err := c.BindJSON(&data)
		if err != nil {
			ctx.ErrResponseStatusNotFound("Invalid field data")
			return
		}

		withValidBase(ctx, data.BaseGUID, func(ctx *Context, base datastore.Base) {
			withValidTable(ctx, base, data.TableGUID, func(ctx *Context, table *datastore.Table) {
				var nilValue interface{}

				fields := table.GetFields()
				recordGUID := table.AppendRecord(func(recordGUID string) {
					for _, f := range fields {
						f.AppendValue(recordGUID, nilValue)
					}
				})

				result, err := table.GetRecordByGUID(recordGUID)
				if err != nil {
					ctx.ErrResponseStatusNotFound(err.Error())
					return
				}

				resp := RequestDataCreateRecordResponse{
					RecordGUID: recordGUID,
					Cells:      result,
				}
				fmt.Printf("[%s] data:%v result:%v\n", ctx.Action, data, result)
				c.IndentedJSON(http.StatusOK, OkResponse(ctx.Action, resp))

				// Save the changes
				base.DumpDataAsJSON(d)
			})
		})
	}
}
