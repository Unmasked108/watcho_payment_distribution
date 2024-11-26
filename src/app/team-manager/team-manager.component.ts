import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox'; // Added for checkboxes
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
    MatCheckboxModule, // Added for checkbox functionality
    MatIconModule,
    FormsModule,
    NgFor,
    NgIf
  ],
  templateUrl: './team-manager.component.html',
  styleUrls: ['./team-manager.component.scss'],
})
export class TeamManagerComponent {
  username: string = 'John Doe'; // Default username
  initials: string = this.getInitials(this.username); // Initials based on username
  isDarkMode: boolean = false; // Tracks the current theme mode

  totalLeads: number = 50; // Total leads to allocate

  displayedColumns: string[] = ['select', 'name', 'id', 'leads', 'time', 'status', 'edit'];
  teamMembers: any[] = [
    { name: 'John Doe', id: '123', leads: 0, time: '', status: 'Pending', selected: false },
    { name: 'Jane Smith', id: '124', leads: 0, time: '', status: 'Pending', selected: false },
    { name: 'Alice Brown', id: '125', leads: 0, time: '', status: 'Pending', selected: false }
  ];

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

  editMember(member: any): void {
    console.log('Edit member:', member);
    // Implement edit functionality here, such as opening a dialog or editing inline
  }

  allocateLeads() {
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

  saveData() {
    const selectedMembers = this.teamMembers.filter((member) => member.selected);
    console.log('Data saved for selected members:', selectedMembers);
    // Implement database save logic here.
  }

  isEditing: boolean = false;
  editingMember: any = null;

  openEditCard(member: any) {
    this.editingMember = { ...member }; // Create a copy of the member
    this.isEditing = true;
  }

  closeEditCard() {
    this.isEditing = false;
    this.editingMember = null;
  }

  saveEditedMember() {
    const index = this.teamMembers.findIndex((m) => m.id === this.editingMember.id);
    if (index !== -1) {
      this.teamMembers[index] = { ...this.editingMember };
    }
    this.closeEditCard();
  }

  deleteMember() {
    this.teamMembers = this.teamMembers.filter((m) => m.id !== this.editingMember.id);
    this.closeEditCard();
  }
}
