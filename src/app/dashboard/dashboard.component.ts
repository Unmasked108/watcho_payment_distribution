import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';  // Import CommonModule
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatGridListModule } from '@angular/material/grid-list';
import { ChangeDetectorRef } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core'
import { CookieService } from 'ngx-cookie-service';  // Import the CookieService
import { MatCheckboxModule } from '@angular/material/checkbox';

interface Team {
  teamName: string;
  teamId: string;
  teamStatus: string;
  allocation: string;
  allocatedTime: string | null;
  teamCapacity: number | null; // Add this field
  leadsAllocated: number | null;  // Allowing null
  leadsCompleted: number | null;  // Allowing null
  isSelected?: boolean; // Add this property

}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatSelectModule,
    FormsModule,
    CommonModule, // Add CommonModule to the imports array
    MatGridListModule,
    MatCardModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatCheckboxModule
    
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent  {
  taskOption: string | null = null;
  showFileInput = false;
  selectedFile: File | null = null;
  selectedDateRange: string = 'today'; // Default to "Today"
  customStartDate: Date | null = null;
  customEndDate: Date | null = null;
  username: string = ''; 
  initials: string = ''; 

  totalLeadsAllocated: number = 0; // Total allocated leads
  totalLeadsCompleted: number = 0; // Total completed leads

   card149Leads : number=0;
  card299Leads : number=0;
   card149Profit : number=0;
   card299Profit : number=0;
// Add the global date range variables
selectedStartDate: Date | null = null;
selectedEndDate: Date | null = null;

applyDateFilter(): void {
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  // Save the selected date range option to localStorage
  localStorage.setItem('selectedDateRange', this.selectedDateRange);

  // Determine the date range based on the selected option
  if (this.selectedDateRange === 'today') {
    const today = new Date();
    startDate = endDate = today;
  } else if (this.selectedDateRange === 'yesterday') {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    startDate = endDate = yesterday;
  } else if (this.selectedDateRange === 'thisWeek') {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startDate = startOfWeek;
    endDate = today;
  } else if (this.selectedDateRange === 'thisMonth') {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startDate = startOfMonth;
    endDate = today;
  } else if (this.selectedDateRange === 'custom') {
    if (!this.customStartDate || !this.customEndDate) {
      console.warn('Incomplete custom date range!');
      return;
    }
    startDate = new Date(this.customStartDate);
    endDate = new Date(this.customEndDate);

    // Save custom date range as well
    localStorage.setItem('customStartDate', this.customStartDate.toISOString());
localStorage.setItem('customEndDate', this.customEndDate.toISOString());

  }

  // Store the selected date range globally
  this.selectedStartDate = startDate;
  this.selectedEndDate = endDate;

  // Fetch data for the selected date range
  this.fetchLeadsData(startDate, endDate);

  // Call method to update allocations based on the selected date range
  this.updateAllocationsBasedOnDateRange();
}


  fetchLeadsData(startDate: Date | null, endDate: Date | null): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });

    const params = {
      startDate: startDate ? startDate.toISOString() : '',
      endDate: endDate ? endDate.toISOString() : '',
    };

    this.http.get<any[]>(this.allocationUrl, { headers, params }).subscribe(
      (allocations) => {
        let allocatedTotal = 0;
        let completedTotal = 0;

        allocations.forEach((allocation) => {
          allocatedTotal += allocation.leadsAllocated || 0;
          completedTotal += allocation.leadsCompleted || 0;
        });

        this.totalLeadsAllocated = allocatedTotal;
        this.totalLeadsCompleted = completedTotal;

        // Trigger UI update
        this.cdRef.detectChanges();
      },
      (error) => {
        console.error('Error fetching leads data:', error);
      }
    );
  }

  updateAllocationsBasedOnDateRange(): void {
    // If no date range is selected, don't update
    if (!this.selectedStartDate || !this.selectedEndDate) {
      console.warn('Date range is not selected.');
      return;
    }
  
    // Call getAllocations() with the globally selected date range
    this.getAllocations();
  }
  
  

  displayedColumns: string[] = [
    'select',
    'teamName',
    'teamId',
    'allocation',
    'allocatedTime',
    'teamCapacity', // Add this

    // 'completion',
  ];
  teams: Team[] = [];  // Update the type here

  selectAll(event: any): void {
    const isChecked = event.checked;
    this.teams.forEach((team) => (team.isSelected = isChecked));
  }


  private apiUrl = '  https://asia-south1-ads-ai-101.cloudfunctions.net/watcho1_apiapi/teams';
  private allocationUrl = '  https://asia-south1-ads-ai-101.cloudfunctions.net/watcho1_apiapi/allocate-orders';
  private ordersUrl = '  https://asia-south1-ads-ai-101.cloudfunctions.net/watcho1_apiapi/orders';


  // private apiUrl = '  https://asia-south1-ads-ai-101.cloudfunctions.net/watcho1_apiapi/teams';
  // private allocationUrl = '  https://asia-south1-ads-ai-101.cloudfunctions.net/watcho1_apiapi/allocate-orders';
  // private ordersUrl = '  https://asia-south1-ads-ai-101.cloudfunctions.net/watcho1_apiapi/orders';
  constructor(private http: HttpClient, private cdRef: ChangeDetectorRef,private cookieService: CookieService) {}

  ngOnInit(): void {
    // Fetch teams data on component initialization
    this.getTeams();
    this.getAllocations();
    console.log('Teams:', this.teams);  // Log teams to see if the data is populated
    const savedDateRange = localStorage.getItem('selectedDateRange');
    if (savedDateRange) {
        this.selectedDateRange = savedDateRange;
    
        // Restore custom dates if applicable
        if (savedDateRange === 'custom') {
          const savedStartDate = localStorage.getItem('customStartDate');
          const savedEndDate = localStorage.getItem('customEndDate');
          
          if (savedStartDate && savedEndDate) {
            this.customStartDate = new Date(savedStartDate);
            this.customEndDate = new Date(savedEndDate);
          }
        }
    this.applyDateFilter();
    } 
    this.username = localStorage.getItem('username') || ''; 
    this.initials = this.getInitials(this.username); // Generate initials from username

  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase(); // Ensure initials are uppercase
  }

//o open the card for team
  // Added for modal functionality
  selectedTeam: Team | null = null; // Holds the team data for the opened modal
  isModalOpen: boolean = false; // Controls the modal visibility
  // Open modal for a specific team
  openTeamDetails(team: Team): void {
    this.selectedTeam = team;
    this.isModalOpen = true;
  }

  // Close the modal
  closeModal(): void {
    this.selectedTeam = null;
    this.isModalOpen = false;
  }

  unallocateOrders(): void {
    if (this.selectedTeam) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      });
  
      // Reuse allocationDate logic from allocateLeads
      const allocationDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
      console.log('Frontend allocationDate:', allocationDate); // Log the allocation date sent to the backend
  
      const payload = {
        teamId: this.selectedTeam.teamId,
        allocationDate,
      };
  
      this.http.post(' https://asia-south1-ads-ai-101.cloudfunctions.net/watcho1_apiapi/unallocate', payload, { headers }).subscribe(
        (response) => {
          console.log('Unallocation response:', response);
          alert('Orders unallocated successfully.');
          this.getTeams(); // Refresh team data
        },
        (error) => {
          console.error('Error unallocating orders:', error);
          alert('Failed to unallocate orders. Check console for details.');
        }
      );
    } else {
      alert('Please select a team.');
    }
  }
  
  

  // Fetch teams from backend
 
  getTeams(): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  
    const role = localStorage.getItem('role');
    const url = role === 'Admin' ? `${this.apiUrl}` : this.apiUrl;
  
    this.http.get<any[]>(url, { headers }).subscribe(
      (data) => {
        // Populate teams array with relevant data
        console.log('Teams data:', data); // Log the response to check the data
        this.teams = data.map(team => ({
          teamName: team.teamName,
          teamId: team.teamId, // Assuming teamId is either a string or an object
          teamStatus: 'Active', // Assuming a default value, adjust if needed
          allocation: team.allocationStatus || 'Not Allocated', // Use the backend's allocation status
          allocatedTime: team.allocatedTime || null, // Use the backend's allocated time
          teamCapacity: team.capacity, // Populate capacity from the backend response
          leadsAllocated: null, // Initialize with null or placeholder until fetched
          leadsCompleted: null, // Initialize with null or placeholder until fetched
        }));
        console.log('Teams array after population:', this.teams);

        // Now call getAllocations after teams are populated
        this.getAllocations(); // Call allocations after teams are loaded
      },
      (error) => {
        console.error('Error fetching teams data:', error);
      }
    );
  }
  
   // Fetch allocations and update the table
   getAllocations(): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  
    const params = {
      startDate: this.selectedStartDate ? this.selectedStartDate.toISOString() : '',
      endDate: this.selectedEndDate ? this.selectedEndDate.toISOString() : '',
    };
  
    console.log('Fetching allocations data with params:', params);
  
    this.http.get<any[]>(this.allocationUrl, { headers, params }).subscribe(
      (allocations) => {
        let totalLeadsAllocated = 0;
        let totalLeadsCompleted = 0;
      
        // New variables for cards
        let card149Leads = 0;
        let card299Leads = 0;
        let card149Profit = 0;
        let card299Profit = 0;
        // Clear previous data
        this.teams.forEach((team) => {
          team.leadsAllocated = 0;
          team.leadsCompleted = 0;
          team.allocation = 'Not Allocated';
          team.allocatedTime = null;
        });
  
        allocations.forEach((allocation) => {
          const teamId = allocation.teamId.teamId;
          console.log('Processing allocation for teamId:', teamId);
  
          // Find the team with the matching teamId
          const team = this.teams.find((t) => t.teamId === teamId);
  
          if (team) {
            console.log(`Found matching team: ${team.teamName}`);
            team.allocation = allocation.status || 'Not Allocated';
            team.allocatedTime = new Date(allocation.allocationDate).toLocaleDateString()||null;

            team.leadsAllocated = (team.leadsAllocated || 0) + (allocation.leadsAllocated || 0);
            team.leadsCompleted = (team.leadsCompleted || 0) + (allocation.leadsCompleted || 0);
  
            // Add to total leads
            totalLeadsAllocated += allocation.leadsAllocated || 0;
            totalLeadsCompleted += allocation.leadsCompleted || 0;
  
            // Process orders in allocation
          allocation.orderIds.forEach((order: any) => {
            if (order.coupon && order.coupon === 'not given'  || order.coupon === null) {
              card299Leads++;
              if (order.paymentStatus === 'Paid') {
                card299Profit += 61; // Add 61 for paid orders
              }
            } else {
              card149Leads++;
              if (order.paymentStatus === 'Paid') {
                card149Profit += 71; // Add 71 for paid orders
              }
            }
          });
          
            console.log('Updated team:', team);
          } else {
            console.log('No matching team found for teamId:', teamId);
          }
        });
  
        // Log the total leads
        console.log('Total Leads Allocated:', totalLeadsAllocated);
        console.log('Total Leads Completed:', totalLeadsCompleted);
  
        console.log('149 Card Leads:', card149Leads, 'Profit:', card149Profit);
        console.log('299 Card Leads:', card299Leads, 'Profit:', card299Profit);
  
        // Update frontend variables
        this.card149Leads = card149Leads;
        this.card299Leads = card299Leads;
        this.card149Profit = card149Profit;
        this.card299Profit = card299Profit;
        // Store totals in variables for the UI
        this.totalLeadsAllocated = totalLeadsAllocated;
        this.totalLeadsCompleted = totalLeadsCompleted;
  

        

        // Trigger change detection to update the UI
        this.cdRef.detectChanges();
        console.log('Allocation data:', allocations);
      },
      (error) => {
        console.error('Error fetching allocations:', error);
      }
    );
  }
    
  
  fetchOrderDetails(teamId: string, leadIds: string[]): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  
    const leadIdsParam = leadIds.join(',');
    this.http.get<any>(`${this.ordersUrl}?leadIds=${leadIdsParam}`, { headers }).subscribe(
      (response) => {
        const orders = response.data || [];
        const team = this.teams.find((t) => t.teamId === teamId);
        console.log("This is response", response);
        
        if (team) {
          // Update the leadsAllocated and leadsCompleted values based on the response
          team.leadsAllocated = response.leadsAllocated;  // This is the count of allocated orders
          team.leadsCompleted = response.leadsCompleted;  // This is the count of completed orders (based on paymentStatus)
  
          // Log the updated values to the console
          console.log(`Leads Allocated: ${team.leadsAllocated}`);
          console.log(`Leads Completed: ${team.leadsCompleted}`);
        }
      },
      (error) => {
        console.error(`Error fetching orders for team ${teamId}:`, error);
      }
    );
  }
  
  onOptionSelect() {
    this.showFileInput = this.taskOption === 'import';
  }

  onFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedFile = input.files[0];
      console.log('File selected:', this.selectedFile.name);
    }
  }

  // Save the uploaded file
  onSaveFile() {
    if (!this.selectedFile) {
      console.error('No file selected.');
      return;
    }

    const fileExtension = this.selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileExtension === 'csv') {
      this.processCSV();

    } else if (fileExtension === 'pdf') {
      this.uploadPDF();
    } else {
      console.error('Unsupported file format. Please upload a CSV or PDF file.');
    }
  }
// File Upload Alert
showFileUploadAlert: boolean = false;
fileUploadAlertMessage: string = '';

// Process CSV file
private processCSV() {
  const reader = new FileReader();
  reader.onload = () => {
    const csvData = reader.result as string;
    const headers = ['customerId', 'source', 'coupon', 'status', 'orderId', 'link']; // Predefined headers
    const parsedData = this.parseCSV(csvData, headers);

    if (parsedData.length > 5000) {
      console.error('The file contains more than 5000 records. Only the first 5000 will be processed.');
      parsedData.length = 5000; // Truncate to 5000 records
    }

    console.log('Parsed CSV data:', parsedData);

    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });

    // Send data to the backend
    this.http.post('  https://asia-south1-ads-ai-101.cloudfunctions.net/watcho1_apiapi/orders ' //  https://asia-south1-ads-ai-101.cloudfunctions.net/watcho1_apiapi/orders
      , parsedData, { headers: httpHeaders }).subscribe(
      (response) => {
        console.log('Data saved successfully:', response);
        this.fileUploadAlertMessage = 'Data saved successfully!';
        this.showFileUploadAlert = true;
        
      },
      (error) => {
        console.error('Error saving data:', error);
        this.fileUploadAlertMessage = 'Error saving data. Please try again.';
        this.showFileUploadAlert = true; // Show the file upload alert
      }
    );
  };
  reader.readAsText(this.selectedFile!);
}

// Close the file upload alert
closeFileUploadAlert() {
  this.showFileUploadAlert = false; // Hide the file upload alert
}

  // Parse CSV data
  private parseCSV(csvData: string, headers: string[]): any[] {
    const rows = csvData.split('\n').filter(row => row.trim() !== ''); // Split rows and remove empty lines
  
    return rows.map((row, rowIndex) => {
      const values = row.split(','); // Split columns by comma
      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index]?.trim() || null; // Map each value to its corresponding header
      });
  
      // Add default values for optional fields if not present
      record.status = record.status || 'Pending';
      record.paymentStatus = record.paymentStatus || 'Unpaid';
      record.paymentModeBy = record.paymentModeBy || 'Cash';
  
      return record;
    }).filter(record => record.customerId && record.orderId); // Ensure mandatory fields are present
  }
  
  
  

  // Upload PDF file
  private uploadPDF() {
    const formData = new FormData();
    formData.append('file', this.selectedFile!);

    this.http.post('  https://asia-south1-ads-ai-101.cloudfunctions.net/watcho1_apiapi/orders/upload-pdf' //  https://asia-south1-ads-ai-101.cloudfunctions.net/watcho1_apiapi/orders/upload-pdf
      , formData).subscribe(
      (response) => {
        console.log('PDF uploaded successfully:', response);
      },
      (error) => {
        console.error('Error uploading PDF:', error);
      }
    );
  }
  showAlert = false; // Tracks if the alert is visible
  alertMessage = ''; // Stores the alert message
  showPopup: boolean = false; // Add this property to the component

  closePopup(): void {
    this.showPopup = false;
  }

onAllocateLeads(): void {
  const selectedTeams = this.teams.filter((team) => team.isSelected);

  if (selectedTeams.length === 0) {
    this.showPopup = true; // Show popup if no team is selected
    return;
  }

  const teamIds = selectedTeams.map((team) => team.teamId); // Use teamId from frontend

  this.allocateLeads(teamIds);
}

  allocateLeads(teamIds: string[]): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  
    const allocationDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
    console.log('Frontend allocationDate:', allocationDate); // Log the allocation date sent to the backend
  
    this.http.post(
      '  https://asia-south1-ads-ai-101.cloudfunctions.net/watcho1_apiapi/allocate-orders',
      { allocationDate , teamIds},
      { headers }
    ).subscribe(
      (response: any) => {
        console.log('Leads allocated successfully:', response);
        this.alertMessage = response.message || 'Leads allocated successfully!';
        this.showAlert = true; // Show the alert
        this.getTeams(); // Refresh the teams' data to reflect updated allocations
      },
      (error) => {
        console.error('Error during lead allocation:', error);
        this.alertMessage = 'Error during lead allocation.';
        this.showAlert = true; // Show the alert with error message
      }
    );
  }
  
  
  
closeAlert(): void {
  this.showAlert = false; // Hide the alert
}

  approveTask(team: any) {
    console.log(`Task approved for team: ${team.teamName}`);
    team.allocation = 'Task Completed';
  }

  generateToken() {
    console.log('Token generation logic not implemented yet.');
  }


//this is for grid 



}
