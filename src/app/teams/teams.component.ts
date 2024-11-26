import { Component, OnInit } from '@angular/core';
import { LayoutComponent } from '../layout/layout.component';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Team {
  _id?: string; // MongoDB's unique identifier (optional during creation)
  teamId: string;
  teamName: string;
  teamLeader: string;
  capacity: number;
  numMembers: number;
  membersList: string[]; // Updated property name
}

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
    MatIconModule,
    FormsModule,
    CommonModule,
    MatSnackBarModule,
  ],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
})
export class TeamsComponent implements OnInit {
  selectedOption: string = 'manage';
  displayedColumns: string[] = ['teamName', 'teamId', 'capacity', 'numMembers', 'members', 'actions'];
  teams: Team[] = [];
  teamForm: Team = {
    teamId: '',
    teamName: '',
    teamLeader: '',
    capacity: 0,
    numMembers: 0,
    membersList: [],
  };
  editingTeam: Team | null = null;
  selectedTeam: Team | null = null;

  private apiUrl = 'http://localhost:5000/api/teams';

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
    console.log(headers)

    const role = localStorage.getItem('role');
    const url = role === 'Admin' ? `${this.apiUrl}` : this.apiUrl;

    this.http.get<Team[]>(url, { headers }).subscribe(
      (data) => (this.teams = data),
      (error) => this.showErrorMessage('Error loading teams')
    );
  }

  addMemberToForm(): void {
    this.teamForm.membersList.push('');
  }

  removeMember(index: number): void {
    this.teamForm.membersList.splice(index, 1);
  }

  onGenerateTeam(): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
    
    if (
      !this.teamForm.teamId ||
      !this.teamForm.teamName ||
      !this.teamForm.teamLeader ||
      !this.teamForm.capacity ||
      this.teamForm.membersList.length === 0
    ) {
      this.showErrorMessage('All fields are required');
      return;
    }

    const newTeam = { ...this.teamForm, numMembers: this.teamForm.membersList.length };

    this.http.post(this.apiUrl, newTeam,{headers}).subscribe(
      (response: any) => {
        this.teams.push(response.team);
        this.showSuccessMessage('Team created successfully!');
        this.resetTeamForm();
      },
      () => this.showErrorMessage('Error creating team!')
    );
  }

  resetTeamForm(): void {
    this.teamForm = { teamId: '', teamName: '', teamLeader: '', membersList: [], capacity: 0, numMembers: 0 };
  }

  editTeam(team: Team): void {
    this.editingTeam = { ...team };
  }
  showMembers(membersList: string[]): void {
    this.selectedTeam = { membersList } as Team;
    document.body.classList.add('modal-open');
  }
  
  closeMembersCard(): void {
    this.selectedTeam = null;
    document.body.classList.remove('modal-open');
  }
  
  saveTeam(): void {
    if (this.editingTeam) {
      const updatedTeam = { ...this.editingTeam, numMembers: this.editingTeam.membersList.length };

      this.http.put(`${this.apiUrl}/${this.editingTeam._id}`, updatedTeam).subscribe(
        () => {
          const index = this.teams.findIndex((team) => team._id === this.editingTeam?._id);
          if (index !== -1) this.teams[index] = { ...updatedTeam };
          this.editingTeam = null;
          this.showSuccessMessage('Team updated successfully!');
        },
        () => this.showErrorMessage('Error saving team!')
      );
    }
  }

  deleteTeam(teamId: string): void {
    if (confirm('Are you sure you want to delete this team?')) {
      this.http.delete(`${this.apiUrl}/${teamId}`).subscribe(
        () => {
          this.teams = this.teams.filter((team) => team.teamId !== teamId);
          this.showSuccessMessage('Team deleted successfully!');
        },
        () => this.showErrorMessage('Error deleting team!')
      );
    }
  }

  showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }

  showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }


  isAdmin(): boolean {
    return localStorage.getItem('role') === 'Admin';
  }

  isTeamLeader(): boolean {
    return localStorage.getItem('role') === 'TeamLeader';
  }

  addMember(): void {
    if (this.selectedTeam) {
      const newMember = prompt('Enter new member name:');
      if (newMember) {
        this.selectedTeam.membersList.push(newMember);
        this.selectedTeam.numMembers++;

    
        this.http.put(`${this.apiUrl}/${this.selectedTeam._id}`, this.selectedTeam).subscribe(
          () => {
            this.snackBar.open('Member added successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
          },
          (error) => {
            console.error('Error adding member:', error);
            this.snackBar.open('Error adding member!', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
          }
        );
      }
    }
  }

  editMember(index: number): void {
    if (this.selectedTeam) {
      const updatedName = prompt('Edit member name:', this.selectedTeam.membersList[index]);
      if (updatedName) {
        this.selectedTeam.membersList[index] = updatedName;
        this.http.put(`${this.apiUrl}/${this.selectedTeam._id}`, this.selectedTeam).subscribe(
          () => {
            this.snackBar.open('Member updated successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
          },
          (error) => {
            console.error('Error updating member:', error);
            this.snackBar.open('Error updating member!', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
          }
        );
      }
    }
  }

  deleteMember(index: number): void {
    if (this.selectedTeam && confirm('Are you sure you want to delete this member?')) {
      this.selectedTeam.membersList.splice(index, 1);
      this.selectedTeam.numMembers--;
      this.http.put(`${this.apiUrl}/${this.selectedTeam._id}`, this.selectedTeam).subscribe(
        () => {
          this.snackBar.open('Member deleted successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
        (error) => {
          console.error('Error deleting member:', error);
          this.snackBar.open('Error deleting member!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        }
      );
    }
  }



  onAnimationEnd() {
    document.body.classList.add('modal-open');
  }
}
  