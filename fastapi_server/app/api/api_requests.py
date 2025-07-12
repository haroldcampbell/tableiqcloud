from pydantic import BaseModel, Field

class RequestDataCreateField(BaseModel):
	BaseGUID: str
	TableGUID: str
	FieldName: str
	FieldType: str

class RequestDataDeleteField(BaseModel):
    BaseGUID: str
    TableGUID: str
    TableFieldGUID: str