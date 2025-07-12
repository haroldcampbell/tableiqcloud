from pydantic import BaseModel, Field

import app.models as models

class RequestDataCreateField(BaseModel):
	BaseGUID: str
	TableGUID: str
	FieldName: str
	FieldType: str

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
