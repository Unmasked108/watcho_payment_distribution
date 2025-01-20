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
  mobile: string;

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
  
  displayedColumns: string[] = ['select', 'name',  'leads', 'ordersAllocated', 'time', 'status', 'edit'];
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
           
            if (team && team.teamId) {

            this.teamId = team.teamId; // Dynamically set teamId
          } else {
            console.error('teamId is missing or undefined');
          }
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
  
            // Check if ordersAllocated is stored in localStorage
          const storedData = JSON.parse(localStorage.getItem('ordersAllocated') || '{}');
          this.teamMembers.forEach((member) => {
            if (storedData[member.id]) {
              member.ordersAllocated = storedData[member.id];
            } else {
              member.ordersAllocated = 0;
            }
          });
          
            console.log('Team members:', this.teamMembers);
            console.log('Fetching allocations for teamId:', this.teamId); // Log teamId

            // Fetch allocated leads for the team
            this.http
              .get(`${allocationUrl}?teamIds=${team.teamId}`, { headers })
              .subscribe({
                next: (allocationData: any) => {
                    // Extract the `orders` array from the response
      const orders = allocationData.orders || [];
      
      // Calculate allocated leads count from the `orders` array
      const allocatedLeadsCount = orders.reduce(
        (total: number, order: any) => total + (order.orderIds?.length || 0),
        0
      );

      this.totalLeads = allocatedLeadsCount;
      console.log('Allocated leads count:', this.totalLeads);

      // Map orderIds for allocation
      this.teamMembers.forEach((member) => {
        member.orderIds = orders.flatMap(
          (order: any) => order.orderIds || []
        );
      });

      console.log('Order IDs for allocation:', this.teamMembers);
      this.getOrdersAllocatedForToday(team.teamId);
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
  
  
  
  
  
  
  isCardVisible: boolean = false; // Control card visibility
  responseMessage: string = '';  // Store the message to display
  loading: boolean = false;
  saveData(): void {
    this.loading = true;
  
    const currentDate = new Date();
  
    // Prepare selected members with their IDs, teamId, and maximum leads
    const selectedMembers = this.teamMembers
      .filter((member) => member.selected)
      .map((member) => ({
        id: member.id,
        name: member.name,
        teamId: this.teamId,
        time: currentDate.toISOString(),
        maxLeads: member.leads || 0, // Use the input value or default to 0
      }));
  
    if (selectedMembers.length === 0) {
      console.warn('No team members selected for allocation.');
      this.loading = false;
      this.showCard('No team members selected for allocation.');
      return;
    }
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  
    this.http
      .post('http://localhost:5000/api/leadallocations', { selectedMembers }, { headers })
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          console.log('Data saved successfully:', response);
          this.showCard('Leads allocated successfully!');
            // Store ordersAllocated for each member in localStorage
        selectedMembers.forEach((member) => {
          const storedData = JSON.parse(localStorage.getItem('ordersAllocated') || '{}');
          storedData[member.id] = member.maxLeads;
          localStorage.setItem('ordersAllocated', JSON.stringify(storedData));
        });
          this.fetchTeamData(); // Refresh data
        },
        error: (err) => {
          this.loading = false;
          console.error('Error saving data:', err);
          this.showCard('Failed to allocate leads. Please try again.');
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
            const memberMobile = item.memberMobile || 'N/A'; // Default to 'N/A' if no mobile number
            if (!acc[memberName]) {
              acc[memberName] = { 
                name: memberName, 
                mobile: memberMobile, // Include member mobile
                paid: 0, 
                unpaid: 0 
              };
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
