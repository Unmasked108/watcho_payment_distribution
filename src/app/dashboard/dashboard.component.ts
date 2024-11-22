import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';  // Import CommonModule
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    CommonModule, // Add CommonModule to the imports array
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  taskOption: string | null = null;
  showFileInput = false;

  displayedColumns: string[] = [
    'teamName',
    'teamId',
    'teamStatus',
    'allocation',
    'allocatedTime',
    'completion',
  ];
  teams = [
    {
      teamName: 'Alpha',
      teamId: '001',
      teamStatus: 'Active',
      allocation: 'Not Allocated',
      allocatedTime: null as string | null,  // Ensure correct type
    },
    {
      teamName: 'Beta',
      teamId: '002',
      teamStatus: 'Inactive',
      allocation: 'Not Allocated',
      allocatedTime: null as string | null,  // Ensure correct type
    },
    {
      teamName: 'Gamma',
      teamId: '003',
      teamStatus: 'Active',
      allocation: 'Not Allocated',
      allocatedTime: null as string | null,  // Ensure correct type
    },
  ];

  onOptionSelect() {
    this.showFileInput = this.taskOption === 'import';
  }

  onFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      console.log('File uploaded:', file.name); // Handle file processing here
    }
  }

  allocateLeads() {
    const currentTime = new Date().toLocaleTimeString();
    this.teams.forEach((team) => {
      team.allocation = 'Allocated';
      team.allocatedTime = currentTime;
    });
    console.log('Leads allocated successfully.');
  }

  approveTask(team: any) {
    console.log(`Task approved for team: ${team.teamName}`);
    team.allocation = 'Task Completed';
  }
  generateToken() {
    console.log('Token generation logic not implemented yet.');
  }
}
