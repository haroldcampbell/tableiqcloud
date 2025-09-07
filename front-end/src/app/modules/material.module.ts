import { NgModule } from "@angular/core";
import { OverlayModule } from '@angular/cdk/overlay';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


@NgModule({
	exports: [
		MatMenuModule,
		MatSelectModule,
		OverlayModule,
		MatCheckboxModule,
		MatSlideToggleModule,
	],
	declarations: [],

})
export class MaterialModule { }
