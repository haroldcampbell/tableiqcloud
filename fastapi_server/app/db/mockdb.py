import json
from pathlib import Path
import app.models.base as base
from typing import Dict

def json_load_data(filename:str):
    file_path = Path(__file__).parent / filename
    with open(file_path, "r") as f:
        return json.load(f)
    return None

# load mock bases
bases_data = json_load_data("mock_bases.json")
mock_bases = [base.BaseInfo(**item) for item in bases_data]

# load mock tables
table_data = json_load_data("mock_table.json")
mock_table = [base.Table(**item) for item in table_data]

# generate table_info list
mock_table_info = [
    base.TableInfo(GUID=item.GUID, Name=item.Name) for item in mock_table
]

# list of BaseTableInfo
data = json_load_data("mock_base_table_info_list.json")
mock_base_table_info_list = [base.BaseTableInfo(**item) for item in data]

# dictionary baseGUID: list of BaseTableInfo
mock_base_table_info_guid: Dict[str, base.BaseTableInfo] = {
    item.BaseInfo.GUID: item for item in mock_base_table_info_list
}
