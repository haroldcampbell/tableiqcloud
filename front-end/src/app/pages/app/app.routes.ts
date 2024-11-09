import { Routes } from '@angular/router';
import { ListTablesComponent } from '../tables/listtables/tables.component';
import { ViewTableComponent } from '../tables/viewtable/viewtable.component';

export const routes: Routes = [
	{ path: "", component: ListTablesComponent },
	{ path: "table/:tableGUID", component: ViewTableComponent },

];
