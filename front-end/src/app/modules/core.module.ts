import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MaterialModule } from "./material.module";
import { BrowserModule } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";

@NgModule({
	declarations: [
	],
	imports: [
		CommonModule,
		FormsModule,
		MaterialModule,
	],
	exports: [
		CommonModule,
		FormsModule,
		MaterialModule,
	]
})
export class CoreModule { }
