import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import moment from 'moment';
interface PaymentStatus {
  name: string;
  paid: number;
  unpaid: number;
}
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
    CommonModule,
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
  paymentStatusData: PaymentStatus[] = [];

  constructor(private http: HttpClient) {} // Inject HttpClient
  

  private allocationsUrl = ' http://localhost:5000/api/results';

  
  ngOnInit(): void {
    this.fetchTeamData();
    
    this.memberPayStatus();
    
    
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
    const headers = new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    });

    if (!this.teamId) {
        console.error('Team ID is not available.');
        return;
    }

    // Fetch already allocated leads for the day
    const allocationUrl = `http://localhost:5000/api/unallocated-leads?teamId=${this.teamId}`;

    this.http.get(allocationUrl, { headers }).subscribe({
        next: (response: any) => {
            const allocatedLeadIds: string[] = response.allocatedLeadIds || [];
            console.log('Already allocated leads:', allocatedLeadIds);

            // Step 1: Deduplicate and filter unallocated leads
            const allOrderIds = this.teamMembers.flatMap((member) => member.orderIds);
            const uniqueOrderIds = Array.from(new Set(allOrderIds));

            const unallocatedOrderIds = uniqueOrderIds.filter((order) =>
                !allocatedLeadIds.includes(order._id)
            );

            console.log('Unallocated leads available for allocation:', unallocatedOrderIds);

            if (unallocatedOrderIds.length === 0) {
                console.warn('No unallocated leads available.');
                return;
            }

            const selectedMembers = this.teamMembers.filter((member) => member.selected);
            if (selectedMembers.length === 0) {
                console.warn('No team members selected for allocation.');
                return;
            }

            // Step 2: Calculate manually allocated leads
            const manuallyAllocatedLeads = selectedMembers.reduce((total, member) => {
                return total + (member.leads || 0);
            }, 0);

            if (manuallyAllocatedLeads > unallocatedOrderIds.length) {
                console.error('Manually allocated leads exceed total available leads.');
                return;
            }

            // Step 3: Calculate remaining leads to distribute
            const remainingLeads = unallocatedOrderIds.length - manuallyAllocatedLeads;

            // Step 4: Allocate remaining leads among members without manual input
            const autoAllocateMembers = selectedMembers.filter(
                (member) => !member.leads || member.leads === 0
            );

            if (autoAllocateMembers.length > 0) {
                const autoAllocatedLeads = Math.floor(remainingLeads / autoAllocateMembers.length);
                const extraLeads = remainingLeads % autoAllocateMembers.length;
                let extraLeadIndex = 0;

                autoAllocateMembers.forEach((member) => {
                    const additionalLead = extraLeadIndex < extraLeads ? 1 : 0;
                    member.leads = autoAllocatedLeads + additionalLead;
                    if (additionalLead) {
                        extraLeadIndex++;
                    }
                });
            }

            // Step 5: Distribute unallocated order IDs
            let orderIndex = 0;
            this.teamMembers = this.teamMembers.map((member) => {
                if (member.selected) {
                    const allocatedLeads = member.leads || 0;
                    const allocatedOrderIds = unallocatedOrderIds.slice(
                        orderIndex,
                        orderIndex + allocatedLeads
                    );
                    orderIndex += allocatedLeads;

                    return {
                        ...member,
                        orderIds: allocatedOrderIds,
                        time: new Date().toLocaleTimeString(),
                        date: new Date().toISOString(),
                        status: 'Completed',
                    };
                } else {
                    return member;
                }
            });

            console.log('Leads allocated:', selectedMembers);
        },
        error: (err) => {
            console.error('Error fetching unallocated leads:', err);
        },
    });
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

  memberPayStatus(): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  
    // Get today's date and format it to YYYY-MM-DD
    const today = moment().format('YYYY-MM-DD');
  
    // Fetch results for today's date
    this.http
      .get<any[]>(this.allocationsUrl, { headers, params: { date: today } })
      .subscribe({
        next: (response: any[]) => {
          console.log('Response:', response);
  
          // Process the response to calculate paid and unpaid counts per member
          const memberWiseCounts = response.reduce((acc, item) => {
            const memberName = item.memberName || 'Unknown'; // Default to 'Unknown' if no member name
            if (!acc[memberName]) {
              acc[memberName] = { name: memberName, paid: 0, unpaid: 0 };
            }
            if (item.paymentStatus === 'Paid') {
              acc[memberName].paid++;
            } else if (item.paymentStatus === 'Unpaid') {
              acc[memberName].unpaid++;
            }
            return acc;
          }, {});
  
          // Convert the object to an array for display and assign to a separate property
          this.paymentStatusData = Object.values(memberWiseCounts);
          console.log('Member-wise Counts:', this.paymentStatusData);
        },
        error: (err) => console.error('Error fetching results:', err),
      });
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
