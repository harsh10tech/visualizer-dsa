import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PathFinderComponent } from './path-finder/path-finder.component';
import { FrontPageComponent } from './front-page/front-page.component';



const routes: Routes = [
  { path: '', component: FrontPageComponent }, 
  { path: 'pathfinder', component: PathFinderComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

