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
import { RouterLink, RouterOutlet } from '@angular/router';

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
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './team-manager.component.html',
  styleUrls: ['./team-manager.component.scss'],
})
export class TeamManagerComponent implements OnInit {
  username: string = ''; // Dynamically set username
  initials: string = ''; // Dynamically set initials// Initials based on username
  isDarkMode: boolean = false; // Tracks the current theme mode

  totalLeads: number = 0; // Total leads allocated to the team
  totalAllocatedLeads: number=0;

  displayedColumns: string[] = ['select', 'name', 'id', 'leads', 'time', 'status', 'edit'];
  teamMembers: any[] = []; // Holds team members' data
  isEditing: boolean = false;
  editingMember: any = null;
  teamId: string = ''; // Dynamically set teamId

  constructor(private http: HttpClient) {} // Inject HttpClient

  ngOnInit(): void {
    this.fetchTeamData();
    
    
  }

  fetchTeamData(): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  
    const teamLeaderId = localStorage.getItem('userId'); // Fetch userId from localStorage
    const role = localStorage.getItem('role'); // Fetch role from localStorage
  
    if (role === 'TeamLeader') {
      const teamUrl = `  http://localhost:5000/api/teams`;
      const allocationUrl = `  http://localhost:5000/api/allocate-orders`;
  
      this.http.get(teamUrl, { headers }).subscribe({
        next: (response: any) => {
          console.log('Response from API:', response);
  
          // Filter teams associated with this TeamLeader
          const teams = response.filter(
            (team: any) => team.teamLeader._id === teamLeaderId
          );
          console.log('Filtered teams:', teams);
  
          if (teams.length > 0) {
            const team = teams[0]; // Assuming the TeamLeader manages a single team
            this.teamId = team.teamId; // Dynamically set teamId
            this.username = team.teamLeaderName || 'Team Leader'; // Add teamLeaderName in backend response
            this.initials = this.getInitials(this.username);
  
            // Map members list
            this.teamMembers = team.membersList.map((member: any) => ({
              name: member.name,
              id: member.userId,
              leads: 0,
              time: '',
              status: 'Pending',
              selected: false,
            }));
  
            console.log('Team members:', this.teamMembers);
            console.log('Fetching allocations for teamId:', team._id); // Log teamId

            // Fetch allocated leads for the team
            this.http
              .get(`${allocationUrl}?teamId=${team._id}`, { headers })
              .subscribe({
                next: (allocationData: any) => {
                  const allocatedLeadsCount = allocationData.reduce(
                    (total: number, allocation: any) =>
                      total + allocation.orderIds.length,
                    0
                  );
  
                  this.totalLeads = allocatedLeadsCount;
                  console.log('Allocated leads count:', this.totalLeads);
  
                  // Map orderIds for allocation
                  this.teamMembers.forEach((member) => {
                    member.orderIds = allocationData.flatMap(
                      (allocation: any) => allocation.orderIds
                    );
                  });
  
                  console.log('Order IDs for allocation:', this.teamMembers);
                  this.getOrdersAllocatedForToday(team._id);
                },
                error: (err) => {
                  console.error('Error fetching allocations:', err);
                },
              });

          } else {
            console.warn('No teams found for this TeamLeader');
          }
        },
        error: (err) => {
          console.error('Error fetching teams:', err);
        },
      });
    } else {
      console.warn('User is not authorized to view teams');
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

  allocateLeads(): void {
    const selectedMembers = this.teamMembers.filter((member) => member.selected);
    if (selectedMembers.length === 0) {
        console.warn('No team members selected for allocation.');
        return;
    }
    // Step 1: Calculate manually allocated leads
    const manuallyAllocatedLeads = selectedMembers.reduce((total, member) => {
        return total + (member.leads || 0); // Sum up manually specified leads
    }, 0);
    if (manuallyAllocatedLeads > this.totalLeads) {
        console.error('Manually allocated leads exceed total available leads.');
        return;
    }
    // Step 2: Calculate remaining leads to distribute
    const remainingLeads = this.totalLeads - manuallyAllocatedLeads;
    // Step 3: Filter members without manual input
    const autoAllocateMembers = selectedMembers.filter((member) => !member.leads || member.leads === 0);
    if (autoAllocateMembers.length > 0) {
        const autoAllocatedLeads = Math.floor(remainingLeads / autoAllocateMembers.length);
        const extraLeads = remainingLeads % autoAllocateMembers.length;
        let extraLeadIndex = 0;
        // Step 4: Allocate remaining leads
        autoAllocateMembers.forEach((member) => {
            const additionalLead = extraLeadIndex < extraLeads ? 1 : 0;
            member.leads = autoAllocatedLeads + additionalLead;
            if (additionalLead) {
                extraLeadIndex++;
            }
        });
    }
    // Step 5: Distribute order IDs correctly
    const allOrderIds = this.teamMembers.flatMap((member) => member.orderIds); // All available order IDs
    let orderIndex = 0;
    this.teamMembers = this.teamMembers.map((member) => {
        if (member.selected) {
            const allocatedLeads = member.leads || 0; // Total leads allocated to this member
            const allocatedOrderIds = allOrderIds.slice(orderIndex, orderIndex + allocatedLeads);
            orderIndex += allocatedLeads; // Move index forward
            return {
                ...member,
                orderIds: allocatedOrderIds, // Correctly sliced order IDs
                time: new Date().toLocaleTimeString(),
                date: new Date().toISOString(),
                status: 'Completed',
            };
        } else {
            return member;
        }
    });
    console.log('Leads allocated:', selectedMembers);
}


  
  
  
  
  
  
  
  
  isCardVisible: boolean = false; // Control card visibility
  responseMessage: string = '';  // Store the message to display
  
  saveData(): void {
    
    const selectedMembers = this.teamMembers
      .filter((member) => member.selected)
      .map((member) => ({
        ...member,
        teamId: this.teamId, // Add teamId to each member
      }));
      
      this.totalAllocatedLeads = selectedMembers.reduce(
        (sum, member) => sum + (member.leads || 0),
        0
      );
    if (selectedMembers.length === 0) {
      console.warn('No team members selected for allocation.');
      return;
    }
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  
    this.http
      .post(
        ' http://localhost:5000/api/lead-allocations',
        { selectedMembers },
        { headers }
      )
      .subscribe({
        next: (response) => {
          console.log('Data saved successfully:', response);
          this.showCard('Data saved successfully!');
          this.fetchTeamData();

        },
        error: (err) => {
          console.error('Error saving data:', err);
          this.showCard('Failed to save data. Please try again.');
        },
      });
  }
  
  
  getOrdersAllocatedForToday(teamId: string): void {
    console.log('Fetching orders allocated for today with teamId:', teamId);

    // Set up the headers, including the Authorization token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`, // Get token from localStorage
    });

    // Send teamId as a query parameter for GET request with headers
    this.http.get<{ totalAllocatedLeads: number }>(`http://localhost:5000/api/total-allocated-leads?teamId=${teamId}`, { headers })
      .subscribe(
        (response) => {
          console.log('Orders allocated:', response);
          this.totalAllocatedLeads = response.totalAllocatedLeads; // Assign the response to the variable
        },
        (error) => {
          console.error('Error fetching orders allocated:', error);
        }
      );
  }
  
  
  
  
  
  showCard(message: string): void {
    this.responseMessage = message;
    this.isCardVisible = true;
  }
  
  closeCard(): void {
    this.isCardVisible = false;
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
