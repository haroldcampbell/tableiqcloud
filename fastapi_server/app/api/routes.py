from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, TypeVar, Generic

import app.db.store as store
import app.models as models
import app.api as api

T = TypeVar('T')
class Response(BaseModel, Generic[T]):
    action: str
    successStatus: bool
    message: Optional[str] = ""
    sessionKey: Optional[str] = ""
    errorCode: int
    jsonBody: T

def okResp(action:str, jsonBody:T)->Response[T]:
    return  Response[T](
        action=action,
        successStatus=True,
        # message="",
        # sessionKey="",
        errorCode=-1,
        jsonBody=jsonBody
    )


def errResp(action:str,jsonBody:T,message:str="", err_code=1)->Response[T]:
    return  Response[T](
        action=action,
        successStatus=False,
         message=message,
        # sessionKey="",
        errorCode=err_code,
        jsonBody=jsonBody
    )

router = APIRouter()

# Returns the list of Bases
@router.get("/api/bases", response_model=Response)
async def get_bases():
    bases = store.getBases()
    return okResp(action="get-bases", jsonBody=bases)


# Returns a single Base
@router.get("/api/base/{base_guid}")
async def get_tables(base_guid: str):
    base_tables = store.getBaseTableInfo(base_guid)
    return okResp(action="get-tables", jsonBody=base_tables)


# Gets a table from a base based on the table_guid
@router.get("/api/table/{base_guid}/{table_guid}")
async def get_table_by_guid(base_guid: str, table_guid: str):
    table = store.getTableByGUID(base_guid, table_guid)
    if table == None:
        return errResp(action="get-table",jsonBody=table, message="Table not found")

    records = table.GetRecords()

    return okResp(action="get-table",jsonBody=records)


@router.post("/api/field/new")
async def create_table_field(request: api.RequestDataCreateField):
    result = store.create_table_field(request)
    return okResp(action="create-table-field", jsonBody=result)


@router.post("/api/field/delete")
async def delete_table_field(request: api.RequestDataDeleteField):
    table = store.getTableByGUID(request.BaseGUID, request.TableGUID)
    if table == None:
        return errResp(action="delete-table-field",jsonBody=table, message="Table not found")

    ok = table.delete_table_field(request.TableFieldGUID)
    if not ok:
        return errResp(action="delete-table-field",jsonBody=table, message="Field not found")

    return okResp(action="delete-table-field", jsonBody=request.TableFieldGUID)


@router.post("/api/field/update-info")
async def update_table_field_info(request: api.RequestDataUpdateField):
    table = store.getTableByGUID(request.BaseGUID, request.TableGUID)
    if table == None:
        return errResp(action="update-info",jsonBody=table, message="Table not found")

    fieldMetaData = table.update_table_field_meta_data(request.TableFieldGUID, request.FieldName, request.FieldType)

    return okResp(action="update-info", jsonBody=fieldMetaData)

@router.post("/api/field/update-value")
async def update_table_field_value(request: api.RequestDataUpdateFieldDataValue):
    table = store.getTableByGUID(request.BaseGUID, request.TableGUID)
    if table == None:
        return errResp(action="update-table-field-value",jsonBody=table, message="Table not found")

    fd = models.FieldData(
        CellGUID=request.FieldData.CellGUID,
        RecordGUID=request.FieldData.RecordGUID,
        DataValue=request.FieldData.DataValue
    )

    try:
        updatedData = table.update_table_field_value(request.FieldGUID, fd)
    except ValueError as e:
        return errResp(action="update-table-field-value", jsonBody=None, message=str(e))

    if updatedData is None:
        return errResp(action="update-table-field-value", jsonBody=updatedData, message="Field not found or update failed")

    return okResp(action="update-table-field-value", jsonBody=updatedData)


@router.post("/api/table-record/new")
async def create_table_record(request: api.RequestDataCreateRecord):
    action_name = "create-table-record"

    table = store.getTableByGUID(request.BaseGUID, request.TableGUID)
    if table == None:
        return errResp(action=action_name,jsonBody=table, message="Table not found")

    try:
        record_guid, record_cells = table.create_table_record()
    except ValueError as e:
        return errResp(action=action_name, jsonBody=None, message=str(e))

    resp = api.RequestDataCreateRecordResponse(
        RecordGUID=record_guid,
        Cells=record_cells
    )
    return okResp(action=action_name, jsonBody=resp)

# @router.post("/api/table-record/delete")
# async def delete_table_record(request: DeleteTableRecordRequest):
#     return {"action": "delete-table-record", "data": ...}