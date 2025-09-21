from __future__ import annotations
from pydantic import BaseModel, Field
from typing import cast, Optional, Any, Dict, List, ClassVar
import uuid

from .table_field_type import TableFieldType
from .field_param_option import FieldParamOption, FieldParamOptionInfo
from .field_param_relationship import FieldParamRelationship, FieldParamLinkedFieldInfo


class FieldMetaData(BaseModel):
    TableGUID: str
    FieldGUID: str
    FieldName: str
    FieldType: TableFieldType
    FieldTypeName: Optional[str] = None
    MetaAttributes: Optional[Any] = None
    FieldParams: Optional[Any] = None  # Optional field for additional options

    def _update_field_type_options(self, field_option_list:List[FieldParamOptionInfo]) -> set[str]:
        existing_params = (
            self.FieldParams.ParamValues if isinstance(self.FieldParams, FieldParamOption) else []
        )

        # Index existing options by OptionId for fast lookup
        existing_params_map = {opt.OptionId: opt for opt in existing_params}
        incoming_ids = {opt.OptionId for opt in field_option_list}

        new_params_list = []

        for incoming in field_option_list:
            existing = existing_params_map.get(incoming.OptionId)
            optionMetaData = incoming.OptionMetaData # TODO: This may need to be sanitized if we have keys
            if existing:
                # Update existing option
                existing.OptionIndex = incoming.OptionIndex
                existing.OptionName = incoming.OptionName.strip() if incoming.OptionName else ""
                existing.OptionMetaData = optionMetaData
                new_params_list.append(existing)
            else:
                # Add new option with new GUID
                new_params_list.append(FieldParamOptionInfo(
                    OptionId=str(uuid.uuid4()).upper(),
                    OptionIndex=incoming.OptionIndex,
                    OptionName=incoming.OptionName.strip() if incoming.OptionName else "",
                    OptionMetaData=optionMetaData,
                ))

        # Update model
        self.FieldParams = FieldParamOption(ParamValues=new_params_list)

        # Compute deleted OptionIds
        deleted_ids = set(existing_params_map.keys()) - incoming_ids

        return deleted_ids

    def update_meta_data(self, field_name:str, ftype:TableFieldType, field_options:Dict[str, Any]):
        self.FieldType = ftype
        self.FieldName = str.strip(field_name)

    def _update_field_type_relationship(self, field_options:Dict[str, Any]):
        # ensure that we are dealing with FieldParamRelationship
        existing_field_params = (self.FieldParams if isinstance(self.FieldParams, FieldParamRelationship) else FieldParamRelationship(**cast(Dict[str, Any], self.FieldParams)))
        new_fieldInfo = FieldParamLinkedFieldInfo(**field_options[FieldParamRelationship._Key])
        old_info_id = existing_field_params.ParamValues.InfoId if existing_field_params.ParamValues else ""

        updated_field_params = existing_field_params.update_field_type_relationship(new_fieldInfo)
        new_info_id = updated_field_params.ParamValues.InfoId if updated_field_params.ParamValues else ""
        self.FieldParams = updated_field_params

        return {"old_info_id":old_info_id, "new_info_id":new_info_id}

    def update_meta_data_field_params(self, ftype:TableFieldType, field_options:Dict[str, Any]) -> Any:
        match ftype:
            case TableFieldType.FieldTypeOption:
                field_option_list:List[FieldParamOptionInfo] = [FieldParamOptionInfo(**o) for o in field_options[FieldParamOption._Key]]
                return self._update_field_type_options(field_option_list)

            case TableFieldType.FieldTypeRelationship:
                return self._update_field_type_relationship(field_options)

        return self


def init_field_params(field_type:TableFieldType, field_params: Optional[Dict[str, Any]]) -> Optional[Any]:
    if field_params is None:
        return None

    match field_type:
        case TableFieldType.FieldTypeOption:
            # Logic for option fields (i.e. FieldTypeOption)
            return FieldParamOption.init(field_params)

        case TableFieldType.FieldTypeRelationship:
            # Logic for linked relationships (i.e. FieldTypeRelationship)
            return FieldParamRelationship.init(field_params)

        case _:
            return None

def init_FieldMetaData(table_guid:str, field_name:str, field_type:TableFieldType,field_params:Optional[Dict[str, Any]] = None )->FieldMetaData:
    guid = str(uuid.uuid4()).upper()
    params = init_field_params(field_type, field_params)

    return FieldMetaData(
        TableGUID=table_guid,
        FieldGUID=guid,
        FieldName=field_name,
        FieldType=field_type,
        FieldParams=params,
    )