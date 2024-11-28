import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
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
    MatCheckboxModule,
    MatIconModule,
    FormsModule,
    NgFor,
    NgIf,
  ],
  templateUrl: './team-manager.component.html',
  styleUrls: ['./team-manager.component.scss'],
})
export class TeamManagerComponent implements OnInit {
  username: string = 'John Doe'; // Default username
  initials: string = this.getInitials(this.username); // Initials based on username
  isDarkMode: boolean = false; // Tracks the current theme mode

  totalLeads: number = 0; // Total leads allocated to the team
  displayedColumns: string[] = ['select', 'name', 'id', 'leads', 'time', 'status', 'edit'];
  teamMembers: any[] = []; // Holds team members' data
  isEditing: boolean = false;
  editingMember: any = null;
  teamId: string = 'teamId123'; // Replace with actual teamId

  constructor(private http: HttpClient) {} // Inject HttpClient

  ngOnInit(): void {
    this.fetchTeamData();
  }

  fetchTeamData(): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  
    const role = localStorage.getItem('role');
    const url = role === 'TeamLeader' 
      ? `http://localhost:5000/api/teams?teamId=${this.teamId}`
      : '';  // You can adjust the URL based on the role if necessary.
  
    this.http.get(url, { headers }).subscribe({
      next: (response: any) => {
        const team = response.find((team: any) => team.teamId === this.teamId);
        if (team) {
          this.totalLeads = team.capacity || 0;
          this.teamMembers = team.membersList.map((member: any) => ({
            name: member.name,
            id: member.userId,
            leads: 0,
            time: '',
            status: 'Pending',
            selected: false,
          }));
        }
      },
      error: (err) => {
        console.error('Error fetching team data:', err);
      },
    });
  }
  

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  }

  toggleSelectAll(event: any): void {
    const isChecked = event.checked;
    this.teamMembers.forEach((member) => (member.selected = isChecked));
  }

  isAllSelected(): boolean {
    return this.teamMembers.every((member) => member.selected);
  }

  isIndeterminate(): boolean {
    const selectedCount = this.teamMembers.filter((member) => member.selected).length;
    return selectedCount > 0 && selectedCount < this.teamMembers.length;
  }

  allocateLeads(): void {
    const selectedMembers = this.teamMembers.filter((member) => member.selected);

    if (selectedMembers.length === 0) {
      console.warn('No team members selected for allocation.');
      return;
    }

    const leadsPerMember = Math.floor(this.totalLeads / selectedMembers.length);
    const currentTime = new Date().toLocaleTimeString();

    this.teamMembers = this.teamMembers.map((member) =>
      member.selected
        ? { ...member, leads: leadsPerMember, time: currentTime, status: 'Completed' }
        : member
    );

    console.log('Leads allocated:', selectedMembers);
  }

  saveData(): void {
    console.log('Saving data...');
    const selectedMembers = this.teamMembers.filter((member) => member.selected);
    this.http.post('/api/allocate-orders', { selectedMembers }).subscribe({
      next: (response) => {
        console.log('Data saved successfully:', response);
      },
      error: (err) => {
        console.error('Error saving data:', err);
      },
    });
  }

  openEditCard(member: any): void {
    this.editingMember = { ...member }; // Create a copy of the member
    this.isEditing = true;
  }

  closeEditCard(): void {
    this.isEditing = false;
    this.editingMember = null;
  }

  saveEditedMember(): void {
    const index = this.teamMembers.findIndex((m) => m.id === this.editingMember.id);
    if (index !== -1) {
      this.teamMembers[index] = { ...this.editingMember };
    }
    this.closeEditCard();
  }

  deleteMember(): void {
    this.teamMembers = this.teamMembers.filter((m) => m.id !== this.editingMember.id);
    this.closeEditCard();
  }
}
