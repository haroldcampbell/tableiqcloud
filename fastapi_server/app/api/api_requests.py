from pydantic import BaseModel, Field
from typing import List, Dict, Any

import app.models as models

class RequestDataCreateField(BaseModel):
	BaseGUID: str
	TableGUID: str
	FieldName: str
	FieldType: str
	FieldOptions: Dict[str, Any] = Field(default_factory=dict)

class RequestDataDeleteField(BaseModel):
    BaseGUID: str
    TableGUID: str
    TableFieldGUID: str

class RequestDataUpdateField(BaseModel):
	BaseGUID: str
	TableGUID: str
	TableFieldGUID: str

	FieldName: str
	FieldType: models.TableFieldType

class RequestDataUpdateFieldDataValue(BaseModel):
	BaseGUID:  str
	TableGUID: str
	FieldGUID: str
	FieldData: models.FieldData

class RequestDataCreateRecord(BaseModel):
	BaseGUID:  str
	TableGUID: str

class RequestDataCreateRecordResponse(BaseModel):
	RecordGUID: str
	Cells: List[models.RecordCell] = Field(default_factory=list)

class RequestDataDeleteRecord(BaseModel):
	BaseGUID:   str
	TableGUID:  str
	RecordGUID: str

