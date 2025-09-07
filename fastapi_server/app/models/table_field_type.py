from __future__ import annotations
from typing import Dict
from enum import IntEnum

class TableFieldType(IntEnum):
    FieldTypeString = 0  # default is string
    FieldTypeNumber = 1
    FieldTypeDate = 2
    FieldTypeText = 3    # To hold markdown data
    FieldTypeRelationship = 4
    FieldTypeOption = 5
    FieldTypeYesNo = 6
    FieldTypeStar = 7

    @classmethod
    def str_to_TableFieldType(cls, field_type_str:str) -> TableFieldType:
        try:
            return field_type_str_map[field_type_str]
        except KeyError:
            raise ValueError(
                f"Invalid field type: '{field_type_str}'."
                f"Valid types are: {', '.join(field_type_str_map.keys())}"
            )

field_type_str_map:Dict[str, TableFieldType] = {
   "String": TableFieldType.FieldTypeString,
   "Number": TableFieldType.FieldTypeNumber,
   "Date": TableFieldType.FieldTypeDate,
   "Text": TableFieldType.FieldTypeText,
   "Relationship": TableFieldType.FieldTypeRelationship,
   "Option": TableFieldType.FieldTypeOption,
   "YesNo": TableFieldType.FieldTypeYesNo,
   "Star": TableFieldType.FieldTypeStar,
}


