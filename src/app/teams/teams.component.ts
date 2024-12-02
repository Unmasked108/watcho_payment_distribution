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
  teamLeaderEmail: string; // Updated to email
  capacity: number;
  numMembers: number;
  membersList: { userId: string; name: string }[]; // Updated to array of objects
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
    ReactiveFormsModule,
  ],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
})
export class TeamsComponent implements OnInit {
  selectedOption: string = 'manage';
  displayedColumns: string[] = ['teamName', 'teamId', 'capacity', 'numMembers', 'members', 'actions'];
  teams: Team[] = [];
  teamForm: FormGroup;
  editingTeam: Team | null = null;
  selectedTeam: Team | null = null;
  teamData: Team | null = null; // Hold the selected team's data


  private apiUrl = 'http://localhost:5000/api/teams';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.teamForm = this.fb.group({
      teamId: ['', Validators.required],
      teamName: ['', Validators.required],
      teamLeaderEmail: ['', [Validators.required, Validators.email]],
      capacity: [0, [Validators.required, Validators.min(1)]],
      membersList: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });

    const role = localStorage.getItem('role');
    const url = role === 'Admin' ? `${this.apiUrl}` : this.apiUrl;

    this.http.get<Team[]>(url, { headers }).subscribe(
      (data) => {
        console.log('Data received from backend:', data); // Log the received data
        this.teams = data; // Assign the data to the component property
      },      (error) => this.showErrorMessage('Error loading teams')
    );
  }
  loadTeamData(teamId: string): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });

    this.http.get<Team>(`${this.apiUrl}/${teamId}`, { headers }).subscribe(
      (data) => {
        this.teamData = data; // Assign team data when fetched
      },
      (error) => {
        this.showErrorMessage('Error loading team data');
      }
    );
  }

  get membersList(): FormArray {
    return this.teamForm.get('membersList') as FormArray;
  }

  addMemberToForm(): void {
    this.membersList.push(this.fb.control('', [Validators.required, Validators.email]));
  }

  removeMember(index: number): void {
    this.membersList.removeAt(index);
  }

  onGenerateTeam(): void {
    if (this.teamForm.invalid) {
      this.showErrorMessage('All fields are required');
      return;
    }
  
    // Prepare the data for submission
    const newTeam = {
      ...this.teamForm.value,
      memberEmails: this.membersList.value, // Rename membersList to memberEmails
      numMembers: this.membersList.length, // Optional, backend overwrites this
    };
    console.log('Team Form Submission:', this.teamForm.value);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  
    console.log('Submitting Team:', newTeam); // Debugging log
  
    this.http.post(this.apiUrl, newTeam, { headers }).subscribe(
      (response: any) => {
        console.log('Response from Server:', response); // Debugging log
        this.teams.push(response.team);
        this.showSuccessMessage('Team created successfully!');
        this.resetTeamForm();
      },
      (error) => {
        console.error('Error creating team:', error); // Debugging log
        this.showErrorMessage('Error creating team!');
      }
    );
  }
  

  resetTeamForm(): void {
    this.teamForm.reset({
      teamId: '',
      teamName: '',
      teamLeaderEmail: '',
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
  showMembers(membersList: { userId: string; name: string }[]): void {
    this.selectedTeam = { ...this.selectedTeam, membersList } as Team;
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
    if (this.teamData && this.teamData.teamId) {
      const memberName = prompt('Enter new member name:');
      const memberEmail = prompt('Enter new member email:'); // Or userId if preferred
    
      if (memberName && memberEmail) {
        const newMember = { name: memberName, userId: memberEmail }; // Update structure
        this.teamData.membersList.push(newMember);
        this.teamData.numMembers++;
    
        const headers = new HttpHeaders({
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        });
    
        // Include teamId in the update
        this.http.put(`${this.apiUrl}/${this.teamData.teamId}`, {
          ...this.teamData,
          teamId: this.teamData.teamId, // Include teamId in the request
        }, { headers }).subscribe(
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
    } else {
      console.error('Team or TeamId is not valid!');
      this.snackBar.open('Team is not selected or valid!', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
    }
  }

  
  
  editMember(index: number): void {
    if (this.selectedTeam) {
      const member = this.selectedTeam.membersList[index];
      const updatedName = prompt('Edit member name:', member.name);
      const updatedEmail = prompt('Edit member email:', member.userId);
    
      if (updatedName && updatedEmail) {
        this.selectedTeam.membersList[index] = { name: updatedName, userId: updatedEmail };
    
        const headers = new HttpHeaders({
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        });
    
        this.http.put(`${this.apiUrl}/${this.selectedTeam._id}`, this.selectedTeam, { headers }).subscribe(
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
    
      const headers = new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      });
    
      this.http.put(`${this.apiUrl}/${this.selectedTeam._id}`, this.selectedTeam, { headers }).subscribe(
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
  