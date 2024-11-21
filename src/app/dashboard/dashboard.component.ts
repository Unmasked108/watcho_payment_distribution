import { Component } from '@angular/core';
import { LayoutComponent } from '../layout/layout.component';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    LayoutComponent,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  displayedColumns: string[] = ['teamName', 'teamId', 'teamStatus'];
  teams = [
    { teamName: 'Alpha', teamId: '001', teamStatus: 'Active' },
    { teamName: 'Beta', teamId: '002', teamStatus: 'Inactive' },
    { teamName: 'Gamma', teamId: '003', teamStatus: 'Active' }
  ];
}
