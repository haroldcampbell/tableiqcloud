import { Routes } from '@angular/router';
import { BaseTablesComponent } from '../bases/base-tables/base-tables.component';
import { ViewTableComponent } from '../../ui/tables/viewtable/viewtable.component';
import { MainComponent } from '../bases/main/main.component';

export const routes: Routes = [
	{ path: "", component: MainComponent },
	{ path: "base/:baseGUID", component: BaseTablesComponent },
	{ path: "base/:baseGUID/:tableGUID", component: BaseTablesComponent },
	// { path: "table/:tableGUID", component: ViewTableComponent },

];
