import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SigninComponent } from './components/signin/signin.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TestComponent } from './components/test/test.component';
import { StatsPageComponent } from './components/stats-page/stats-page.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ScanHistoryComponent } from './components/scan-history/scan-history.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { ScanHistoryAdminComponent } from './components/scan-history-admin/scan-history-admin.component';
import { DashboardAdminComponent } from './components/dashboard-admin/dashboard-admin.component';
import { AuthGuard } from './guards/auth.guard';
import { ScanComponent } from './components/scan/scan.component';
import { ProblemSubmissionComponent } from './components/problem-submission/problem-submission.component';
import { AlimentateurComponent } from './components/alimentateur/alimentateur.component';
import { WagonDashboardComponent } from './components/wagon-dashboard/wagon-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SigninComponent,
    TestComponent,
    StatsPageComponent,
    ScanHistoryComponent,
    AdminUsersComponent,
    ScanHistoryAdminComponent,
    DashboardAdminComponent,
    ScanComponent,
    ProblemSubmissionComponent,
    AlimentateurComponent,
    WagonDashboardComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ZXingScannerModule,
    BrowserAnimationsModule, // Required for toastr animations
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true,
    }),
  ],
  providers: [AuthGuard],
    bootstrap: [AppComponent]
})
export class AppModule { }
