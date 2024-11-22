import { Component } from '@angular/core';
import { LayoutComponent } from '../layout/layout.component';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    LayoutComponent,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatRadioModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'], // Fixed typo from 'styleUrl' to 'styleUrls'
})
export class TeamsComponent {
  selectedOption: string = 'manage';

  // Define columns, now including numMembers and members actions
  displayedColumns: string[] = ['teamName', 'teamId', 'capacity', 'numMembers', 'members', 'actions'];

  // Sample data with additional entries and the numMembers field
  teams = [
    { teamId: '001', teamName: 'Alpha', capacity: 10, numMembers: 8, members: ['John', 'Doe', 'Smith', 'Alice', 'Eve', 'Bob', 'Charlie', 'David'] },
    { teamId: '002', teamName: 'Beta', capacity: 15, numMembers: 12, members: ['Frank', 'Grace', 'Helen', 'Ivy', 'Jack', 'Kim', 'Laura', 'Mike', 'Nina', 'Oscar', 'Paul', 'Quinn'] },
    { teamId: '003', teamName: 'Gamma', capacity: 20, numMembers: 18, members: ['Sam', 'Tom', 'Uma', 'Victor', 'Will', 'Xena', 'Yara', 'Zane', 'Adam', 'Bella', 'Cody', 'Diana', 'Eric', 'Fiona', 'George', 'Holly', 'Ian', 'Julia'] },
    { teamId: '004', teamName: 'Delta', capacity: 25, numMembers: 22, members: ['Luke', 'Mia', 'Nick', 'Olive', 'Peter', 'Queen', 'Rick', 'Sophia', 'Tim', 'Ursula', 'Vince', 'Walter', 'Xavier', 'Yvonne', 'Zara', 'Amy', 'Ben', 'Chris', 'Dana', 'Elliot', 'Faith', 'Greg'] },
    { teamId: '005', teamName: 'Epsilon', capacity: 30, numMembers: 28, members: ['Harry', 'Isabel', 'Jake', 'Kelly', 'Liam', 'Mason', 'Noah', 'Olivia', 'Peyton', 'Quincy', 'Ryan', 'Sarah', 'Tyler', 'Uma', 'Victor', 'Willow', 'Xander', 'Yasmine', 'Zane', 'Ashley', 'Brian', 'Cathy', 'Dylan', 'Eva', 'Felix', 'Grace', 'Hannah', 'Ian'] },
  ];

  // Form for adding new teams
  teamForm = {
    teamName: '',
    teamLeader: '',
    members: 0,
    capacity: 0,
  };

  // Track the team being edited
  editingTeam: any = null;

  // Track the selected team for managing members
  selectedTeam: any = null;

  // Generate a new team and add to the list
  onGenerateTeam() {
    const newTeam = {
      ...this.teamForm,
      teamId: (this.teams.length + 1).toString().padStart(3, '0'),
      numMembers: this.teamForm.members,
      members: [],
    };
    this.teams.push(newTeam);
    this.teamForm = { teamName: '', teamLeader: '', members: 0, capacity: 0 };
  }

  // Edit a team
  editTeam(team: any) {
    this.editingTeam = { ...team };
  }

  // Save changes to the edited team
  saveTeam() {
    const index = this.teams.findIndex((team) => team.teamId === this.editingTeam.teamId);
    if (index !== -1) {
      this.teams[index] = { ...this.editingTeam };
    }
    this.editingTeam = null;
  }

  // Delete a team by its ID
  deleteTeam(teamId: string) {
    this.teams = this.teams.filter((team) => team.teamId !== teamId);
    this.editingTeam = null;
  }

  // Show members of a team
  showMembers(team: any) {
    this.selectedTeam = team;
    document.body.classList.add('modal-open'); // Dim background effect
  }

  // Close the members card
  closeMembersCard() {
    this.selectedTeam = null;
    document.body.classList.remove('modal-open'); // Remove dim background effect
  }

  // Add a new member to the selected team
  addMember() {
    if (this.selectedTeam) {
      const newMember = prompt('Enter new member name:');
      if (newMember) {
        this.selectedTeam.members.push(newMember);
        this.selectedTeam.numMembers++;
      }
    }
  }

  // Edit a specific member
  editMember(index: number) {
    if (this.selectedTeam) {
      const updatedName = prompt('Edit member name:', this.selectedTeam.members[index]);
      if (updatedName) {
        this.selectedTeam.members[index] = updatedName;
      }
    }
  }

  // Delete a specific member
  deleteMember(index: number) {
    if (this.selectedTeam && confirm('Are you sure you want to delete this member?')) {
      this.selectedTeam.members.splice(index, 1);
      this.selectedTeam.numMembers--;
    }
  }

  // Handle animation end for modal effects
  onAnimationEnd() {
    document.body.classList.add('modal-open');
  }
}
