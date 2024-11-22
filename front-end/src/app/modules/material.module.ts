import { NgModule } from "@angular/core";
import { OverlayModule } from '@angular/cdk/overlay';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
	exports: [
		MatMenuModule,
		MatSelectModule,
		OverlayModule,

	],
	declarations: [],

})
export class MaterialModule { }
