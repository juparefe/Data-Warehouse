
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './login/home.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path:'',
    children: [
      { path: 'login', component: HomeComponent },
      { path: '**', redirectTo:'login' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
