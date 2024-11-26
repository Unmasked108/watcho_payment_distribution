import { Component, OnInit } from '@angular/core';
import { LayoutComponent } from '../layout/layout.component';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';

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
    ReactiveFormsModule
  ],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
})
export class TeamsComponent implements OnInit {
  selectedOption: string = 'manage';
  displayedColumns: string[] = ['teamName', 'teamId', 'capacity', 'numMembers', 'members', 'actions'];
  teams: Team[] = [];
  teamForm: FormGroup; // Using FormGroup for team form
  editingTeam: Team | null = null;
  selectedTeam: Team | null = null;

  private apiUrl = 'http://localhost:5000/api/teams';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    // Initialize teamForm using FormBuilder
    this.teamForm = this.fb.group({
      teamId: ['', Validators.required],
      teamName: ['', Validators.required],
      teamLeader: ['', Validators.required],
      capacity: [0, [Validators.required, Validators.min(1)]],
      membersList: this.fb.array([]), // Proper initialization
    });
    
  }

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
  get membersList(): FormArray {
    return this.teamForm.get('membersList') as FormArray;
  }
  addMemberToForm(): void {
    this.membersList.push(this.fb.control('', Validators.required));
  }
  
  
  removeMember(index: number): void {
    this.membersList.removeAt(index);
    this.teamForm.patchValue({ numMembers: this.membersList.length });
  }
  

  onGenerateTeam(): void {
    if (this.teamForm.invalid) {
      this.showErrorMessage('All fields are required');
      return;
    }
  
    const newTeam = {
      ...this.teamForm.value,
      numMembers: this.membersList.length, // Ensure numMembers is set
    };
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  
    this.http.post(this.apiUrl, newTeam, { headers }).subscribe(
      (response: any) => {
        this.teams.push(response.team);
        this.showSuccessMessage('Team created successfully!');
        this.resetTeamForm();
      },
      () => this.showErrorMessage('Error creating team!')
    );
  }
  

  resetTeamForm(): void {
    this.teamForm.reset({
      teamId: '',
      teamName: '',
      teamLeader: '',
      capacity: 0,
      membersList: [],
    });
    while (this.membersList.length) {
      this.membersList.removeAt(0);
    }
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
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
    if (this.editingTeam && this.editingTeam._id) {
      const updatedTeam = {
        ...this.editingTeam,
        numMembers: this.editingTeam.membersList.length,
      };
  
      this.http.put(`${this.apiUrl}/${this.editingTeam._id}`, updatedTeam,{headers}).subscribe(
        () => {
          const index = this.teams.findIndex((team) => team._id === this.editingTeam?._id);
          if (index !== -1) this.teams[index] = { ...updatedTeam };
          this.editingTeam = null;
          this.showSuccessMessage('Team updated successfully!');
        },
        () => this.showErrorMessage('Error saving team!')
      );
    } else {
      this.showErrorMessage('No team selected for saving.');
    }
  }
  

  deleteTeam(teamId: string): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
    if (confirm('Are you sure you want to delete this team?')) {
      console.log(teamId)
      this.http.delete(`${this.apiUrl}/${teamId}`,{headers}).subscribe(
        () => {
          this.teams = this.teams.filter((team) => team.teamId !== teamId); // Ensure consistency here
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
  