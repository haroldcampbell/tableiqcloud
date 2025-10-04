from typing import cast, List

import app.db.mockdb as mockdb
from typing import List, Dict, Any, Optional

import app.models as models
import app.api as api
import uuid

def getBases()->List[models.BaseInfo]:
    return mockdb.mock_bases

def getBaseTableInfo(base_guid:str)->models.BaseTableInfo:
    #TODO: add error check. check if base_guid is found
    info:models.BaseTableInfo = mockdb.mock_base_table_info_guid[base_guid]

    return info

def create_table(base_guid:str, table_name:str) -> models.Table:
    base_table_info = mockdb.mock_base_table_info_guid[base_guid]
    if base_table_info is None:
        raise ValueError(f"[create_table] base_guid not found. Can't create table on '{base_guid}'.")

    print(f"[create_table] \n\t base_guid:{base_guid} \n\t table_name: {table_name} \n\t base_table_info:{base_table_info}")

    table = models.Table.new_table(table_name)
    info = models.TableInfo(GUID=table.GUID, Name=table.Name)
    base_table_info.TableInfoArray.append(info)

    mockdb.mock_table.append(table)

    return table

def get_table_field_info_by_guid(base_guid:str, table_guid:str) -> models.table.TableFieldInfo | None:
    base_table_info = mockdb.mock_base_table_info_guid[base_guid]
    guids = [item.GUID for item in base_table_info.TableInfoArray]

    if table_guid not in guids:
        print(f"[get_table_field_info_by_guid] table_guid not found: {table_guid}")
        return None # the base doesn't contain the table guid so return

    result = list(filter((lambda item: item.GUID == table_guid), mockdb.mock_table))
    if len(result) == 0:
        print(f"[get_table_field_info_by_guid] table_guid not found in mockdb.mock_table: {table_guid}")
        return None

    table = result[0]

    return table.get_table_field_info()

def getTableByGUID(base_guid:str, table_guid:str) -> models.Table | None:
    #TODO: add error check.
    base_table_info = mockdb.mock_base_table_info_guid[base_guid]
    guids = [item.GUID for item in base_table_info.TableInfoArray]

    if table_guid not in guids:
        print(f"[getTableByGUID] table_guid not found: `{table_guid}`")
        return None # the base doesn't contain the table guid so return

    result = list(filter((lambda item: item.GUID == table_guid), mockdb.mock_table))
    if len(result) == 0:
        print(f"[getTableByGUID] table_guid not found in mockdb.mock_table: {table_guid}")
        return None

    table = result[0]

    return table

def get_table_field_by_guid(base_guid:str, table_guid:str, table_field_guid:str) -> models.TableField | None:
    table = getTableByGUID(base_guid, table_guid)
    if table is None:
        return None

    return table.get_table_field_by_guid(table_field_guid)

# def _create_dependent_linked_field_in_related_table(base_guid:str, parent_table: models.Table, field_meta: models.FieldMetaData, info:models.FieldParamLinkedFieldInfo) -> models.FieldMetaData:
#     # find the REC_FIELD_NAME field in the parent table
#     rec_field = parent_table.find_table_field_meta_data_by_name(models.TableField.REC_FIELD_NAME)
#     if rec_field is None:
#         raise ValueError(f"[create_table_field] relationship field missing REC_FIELD_NAME. parent_table.GUID:'{parent_table.GUID}'")

#     # Create a dependent linked field in the related table
#     child_field_info = models.FieldParamLinkedFieldInfo(
#         ParentTableGUID=info.LinkedChildTableGUID,
#         LinkedChildTableGUID=parent_table.GUID,
#         LinkedFieldGUID=rec_field.FieldGUID,
#         AllowMultipleValues=True,
#         AllowDuplicates=False,
#         HasPairedDependentField=True,
#         SyncFieldGUID=rec_field.FieldGUID,
#     )
#     child_field_name = field_meta.FieldName + "_child"

#     # Create the dependent linked field in the related table
#     child_table = getTableByGUID(base_guid, info.LinkedChildTableGUID)
#     if child_table is None:
#         raise ValueError(f"[create_table_field] linked child table not found. \n\t info.LinkedChildTableGUID:'{info.LinkedChildTableGUID}'")

#     d: Dict[str, Any] = {models.FieldParamRelationship._Key: child_field_info.model_dump()}

#     child_field_result = child_table.create_table_field_by_name(child_field_name, models.TableFieldType.FieldTypeRelationship, d)
#     if child_field_result.Field is None:
#         raise ValueError(f"[create_table_field] failed to create dependent linked field in child table. \n\t child_field_name:'{child_field_name}'")

#     print(f"[create_table_field] dependent field name: {child_field_name} \n\t child_field_result: {child_field_result}\n")

#     if child_field_result.Field.MetaData is None:
#         raise ValueError(f"Failed to create linked field with correct meta data: {child_field_result.Field}")

#     return child_field_result.Field.MetaData

def create_table_field(req:api.RequestDataCreateField):
    try:
        ftype = models.TableFieldType.str_to_TableFieldType(req.FieldType)
    except ValueError as e:
        raise e
    #TODO: check if BaseGUID exists first

    if (to_table := getTableByGUID(req.BaseGUID, req.TableGUID)) is None:
        raise ValueError(f"Unable to create table field. Table not found. \n\treq.BaseGUID: '{req.BaseGUID}'\n\treq.TableGUID: '{req.TableGUID}'")

    print(f"[create_table_field] req.FieldOptions: {req.FieldOptions}")
    field_records = to_table.create_table_field_by_name(req.FieldName, ftype, req.FieldOptions)

    field = field_records.Field
    param_values = field.MetaData.FieldParams.ParamValues # type: ignore
    param_values = cast(models.FieldParamLinkedFieldInfo, param_values)
    print(f"[create_table_field] param_values: {param_values.model_dump_json(indent=2)}")

    pull = param_values.PullOperation

    from_table_guid = pull.DataFromTableGUID
    from_table_field_guid = pull.DataFromFieldGUID

    if (from_table := getTableByGUID(req.BaseGUID, from_table_guid)) is None:
        raise ValueError(f"Unable to create table field. Table not found. \n\treq.BaseGUID: '{req.BaseGUID}'\n\t from_table_guid: '{from_table_guid}'")

    synced_field_options = models.FieldParamRelationship.to_empty_dict()
    synced_field_records: models.TableFieldRecords = from_table.create_table_field_by_name(req.FieldName, ftype, synced_field_options)

    pull.SyncToFieldGUID = synced_field_records.Field.MetaData.FieldGUID # type: ignore
    pull.SyncToTableGUID = from_table.GUID
    pull.SyncFromFieldGUID = to_table.get_REC_ID_field().MetaData.FieldGUID # type: ignore
    pull.SyncFromTableGUID = to_table.GUID
    print(f"\n\n[create_table_field] pull: {pull.model_dump_json(indent=2)}")
    print(f"\n\n[create_table_field] from_table.Name: {from_table.Name} from_table_guid: {from_table_guid} from_table_field_guid: {from_table_field_guid}")

    # -----------------------------------------------------------------
    # Now update the synced field's meta data to point back to the original field
    synced_field_info: models.FieldParamRelationship =synced_field_records.Field.MetaData.FieldParams # type: ignore
    synced_pull = synced_field_info.ParamValues.PullOperation # type: ignore

    synced_pull.DataFromTableGUID = pull.SyncFromTableGUID
    synced_pull.DataFromFieldGUID = pull.SyncFromFieldGUID
    synced_pull.DataToTableGUID = from_table.GUID
    synced_pull.DataToFieldGUID = pull.SyncToFieldGUID
    synced_pull.SyncToTableGUID = to_table.GUID
    synced_pull.SyncToFieldGUID = pull.DataToFieldGUID
    synced_pull.SyncFromTableGUID = from_table.GUID
    synced_pull.SyncFromFieldGUID = pull.DataFromFieldGUID


    return field_records.Records

def update_simple_table_field_data_value(base_giud:str, table_guid:str, field_guid:str, field_data:models.FieldData) -> Optional[models.FieldData]:
    table = getTableByGUID(base_giud, table_guid)
    if table == None:
        raise ValueError(f"Unable to update table field value. Table not found. \n\tbase_giud: '{base_giud}'\n\ttable_guid: '{table_guid}'")

    fd = models.FieldData(
        CellGUID=field_data.CellGUID,
        RecordGUID=field_data.RecordGUID,
        DataValue=field_data.DataValue
    )

    updatedData = table.update_simple_data_value(field_guid, fd)
    if updatedData is None:
        raise ValueError(f"Unable to update table field value. FieldData not found. \n\tfield_guid: '{field_guid}'\n\tfield_data: '{field_data}'")

    return updatedData


def update_linked_table_field_value(
        base_guid:str,
        to_table_guid: str,
        to_field_guid:str,
        cellGUID:str,
        from_field_data_cell_guid:str) -> models.FieldData:

    # Get the parent table
    if (to_table := getTableByGUID(base_guid, to_table_guid) ) == None:
        raise ValueError(f"Table not found. \n\tbase_guid:'{base_guid}'\n\t to_table_guid:'{to_table_guid}'")

    # Get the field information
    to_field_info = to_table.get_linked_field_info_by_field_guid(to_field_guid) # type: ignore
    if to_field_info == None:
        raise ValueError(f"Field not found or not a relationship field. \n\t to_field_guid:'{to_field_guid}'")


    pull = to_field_info.PullOperation
    from_table = getTableByGUID(base_guid, pull.DataFromTableGUID)

    # from_field_data is the field data from the linked child table that needs to be added to the to_field_data
    from_field_data = from_table.get_cell_data_by_cell_guid(pull.DataFromFieldGUID, from_field_data_cell_guid) # type: ignore
    if from_field_data is None:
        raise ValueError(f"FieldData not found. \n\t DataFromFieldGUID: {pull.DataFromFieldGUID}\n\t from_field_data_cell_guid: {from_field_data_cell_guid}")

    # to_field_data is the parent table field data that needs to be updated with the from_field_data
    if (to_field_data := to_table.get_cell_data_by_cell_guid(to_field_guid, cellGUID)) is None:
        raise ValueError(f"FieldData not found. cellGUID: {cellGUID}")

    # Update the parent field with the data pulled from the linked child table
    to_field_data.update_linked_data_value(from_field_data, to_field_info.AllowMultipleValues)

    print(f"\n\n[update_linked_table_field_value] to_field_info: {to_field_info.model_dump_json(indent=2)}")
    print(f"\n\n[update_linked_table_field_value] from_field_data: {from_field_data.model_dump_json(indent=2)}")
    print(f"\n\n[update_linked_table_field_value] to_field_data: {to_field_data.model_dump_json(indent=2)}")

    # -----------------------------------------------------------------
    # Get the REC_ID field data from the parent table and update the linked child table
    sync_from_field = to_table.get_table_field_by_guid(pull.SyncFromFieldGUID)
    sync_from_data = sync_from_field.get_field_data_by_record_guid(to_field_data.RecordGUID) # type: ignore

    # Get the linked child table where we need to update with the parent REC_ID field data
    sync_to_field = from_table.get_table_field_by_guid(pull.SyncToFieldGUID) # type: ignore
    sync_to_data = sync_to_field.get_field_data_by_record_guid(from_field_data.RecordGUID) # type: ignore
    sync_to_field_params = cast(models.FieldParamRelationship, sync_to_field.MetaData.FieldParams) # type: ignore
    sync_to_field_params_values = cast(models.FieldParamLinkedFieldInfo, sync_to_field_params.ParamValues) # type: ignore

    sync_to_data.update_linked_data_value(sync_from_data, sync_to_field_params_values.AllowMultipleValues) # type: ignore

    print(f"\n\n[update_linked_table_field_value] sync_from_data: {sync_from_data.model_dump_json(indent=2)}") # type: ignore
    print(f"\n\n[update_linked_table_field_value] sync_to_data: {sync_to_data.model_dump_json(indent=2)}") # type: ignore


    return to_field_data


def remove_linked_table_field_value(
        table: models.Table,
        table_field_guid:str,
        cellGUID:str,
        linked_table: models.Table,
        linked_field_GUID: str,
        linked_table_cell_GUID: str) -> models.FieldData:

    if (target_field_data := table.get_cell_data_by_cell_guid(table_field_guid, cellGUID)) is None:
        raise ValueError(f"Store.remove_linked_table_field_value. \n\tFieldData not found. \n\tcellGUID: {cellGUID}")

    # This should never happen but just in case
    if target_field_data.DataValue is None:
        target_field_data.DataValue = []

    linked_data_values: List[models.FieldData] = [
        item if isinstance(item, models.FieldData) else models.FieldData(**item) for item in target_field_data.DataValue
    ]

    # Remove at most one linked field data from the target field data
    for d in linked_data_values:
        if not isinstance(d, models.FieldData):
            d = models.FieldData(**d)

        if d.CellGUID == linked_table_cell_GUID:
            linked_data_values.remove(d)
            break

    target_field_data.DataValue = linked_data_values

    return target_field_data


def save_mock_bases():
    # mockdb.save_mock_bases()
    return None