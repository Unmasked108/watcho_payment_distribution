import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-team-manager',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    NgFor,
    NgIf,
  ],
  templateUrl: './team-manager.component.html',
  styleUrls: ['./team-manager.component.scss'],
})
export class TeamManagerComponent {
  username: string = 'John Doe'; // Default username
  initials: string = this.getInitials(this.username); // Initials based on username
  isDarkMode: boolean = false; // Tracks the current theme mode

  totalLeads: number = 50; // Total leads to allocate

  teamMembers = [
    { name: 'John Doe', id: 'M001', leads: 0, time: '', status: 'Pending' },
    { name: 'Jane Smith', id: 'M002', leads: 0, time: '', status: 'Pending' },
  ];

  displayedColumns: string[] = ['name', 'id', 'leads', 'time', 'status'];

  ngOnInit(): void {
    this.isDarkMode = localStorage.getItem('theme') === 'dark'; // Initialize dark mode
    this.applyTheme();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light'); // Save theme preference
    this.applyTheme();
  }

  applyTheme() {
    const body = document.body;
    if (this.isDarkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  }

  allocateLeads() {
    const memberCount = this.teamMembers.length;
    const leadsPerMember = Math.floor(this.totalLeads / memberCount);
    const currentTime = new Date().toLocaleTimeString();

    this.teamMembers = this.teamMembers.map((member) => ({
      ...member,
      leads: leadsPerMember,
      time: currentTime,
      status: 'Completed',
    }));

    console.log('Leads allocated:', this.teamMembers);
  }

  saveData() {
    console.log('Data saved:', this.teamMembers);
    // Implement database save logic here.
  }
}
