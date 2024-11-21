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
  imports: [LayoutComponent,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatRadioModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.scss'
})
export class TeamsComponent {
  selectedOption: string = 'manage';
  displayedColumns: string[] = ['teamName', 'teamId', 'capacity', 'actions'];
  teams = [
    { teamId: '001', teamName: 'Alpha', capacity: 10 },
    { teamId: '002', teamName: 'Beta', capacity: 15 }
  ];

  teamForm = {
    teamName: '',
    teamLeader: '',
    members: 0,
    capacity: 0
  };

  editingTeam: any = null;

  onGenerateTeam() {
    const newTeam = { ...this.teamForm, teamId: (this.teams.length + 1).toString() };
    this.teams.push(newTeam);
    this.teamForm = { teamName: '', teamLeader: '', members: 0, capacity: 0 };
  }

  editTeam(team: any) {
    this.editingTeam = { ...team };
  }

  saveTeam() {
    const index = this.teams.findIndex((team) => team.teamId === this.editingTeam.teamId);
    if (index !== -1) {
      this.teams[index] = { ...this.editingTeam };
    }
    this.editingTeam = null;
  }

  deleteTeam(teamId: string) {
    this.teams = this.teams.filter((team) => team.teamId !== teamId);
    this.editingTeam = null;
  }
}