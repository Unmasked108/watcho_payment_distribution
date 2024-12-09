import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';  // Import CommonModule
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatGridListModule } from '@angular/material/grid-list';
import { ChangeDetectorRef } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

interface Team {
  teamName: string;
  teamId: string;
  teamStatus: string;
  allocation: string;
  allocatedTime: string | null;
  teamCapacity: number | null; // Add this field
  leadsAllocated: number | null;  // Allowing null
  leadsCompleted: number | null;  // Allowing null
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
    MatNativeDateModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent  {
  taskOption: string | null = null;
  showFileInput = false;
  selectedFile: File | null = null;
  selectedDateRange: string = 'today'; // Set default to "Today"
  customStartDate: Date | null = null;
  customEndDate: Date | null = null;
  
  applyDateFilter(): void {
    let startDate: Date | null = null;
    let endDate: Date | null = null;
  
    // Determine start and end dates based on the selected range
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
      startDate = this.customStartDate;
      endDate = this.customEndDate;
    }
  
    // Display the selected date range
    console.log('Selected Date Range:', {
      start: startDate,
      end: endDate,
    });
  }
  
  

  

  displayedColumns: string[] = [
    'teamName',
    'teamId',
    'teamStatus',
    'allocation',
    'allocatedTime',
    'teamCapacity', // Add this

    'completion',
  ];
  teams: Team[] = [];  // Update the type here

  private apiUrl = 'http://localhost:5000/api/teams';
  private allocationUrl = 'http://localhost:5000/api/allocate-orders';
  private ordersUrl = 'http://localhost:5000/api/orders';


  constructor(private http: HttpClient, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Fetch teams data on component initialization
    this.getTeams();
    this.getAllocations();
    console.log('Teams:', this.teams);  // Log teams to see if the data is populated

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
        teamId: team.teamId,
        teamStatus: 'Active', // Assuming a default value, adjust if needed
        allocation: team.allocationStatus || 'Not Allocated', // Use the backend's allocation status
        allocatedTime: team.allocatedTime || null, // Use the backend's allocated time
        teamCapacity: team.capacity, // Populate capacity from the backend response
        leadsAllocated: null, // Initialize with null or placeholder until fetched
        leadsCompleted: null,
      }));
      // Now call getAllocations after teams are populated
      this.getAllocations();
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

  this.http.get<any[]>(this.allocationUrl, { headers }).subscribe(
    (allocations) => {
      allocations.forEach((allocation) => {
        const team = this.teams.find((t) => t.teamId === allocation.teamId.teamId);
        console.log('Allocations:', allocations);
        if (team) {
          team.allocation = allocation.status || 'Allocated';
          team.allocatedTime = new Date(allocation.allocationDate).toLocaleString();
          team.leadsAllocated = allocation.leadsAllocated;  // Now populated from the API
          team.leadsCompleted = allocation.leadsCompleted;  // Now populated from the API
        }
      });

      // Explicitly trigger change detection to update the UI
      this.cdRef.detectChanges();
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
    this.http.post('http://localhost:5000/api/orders', parsedData, { headers: httpHeaders }).subscribe(
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
    
    // Skip the first row (headers) and start parsing data from the second row
    return rows.slice(1).map((row) => {
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
    });
  }
  
  
  

  // Upload PDF file
  private uploadPDF() {
    const formData = new FormData();
    formData.append('file', this.selectedFile!);

    this.http.post('http://localhost:5000/api/orders/upload-pdf', formData).subscribe(
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
  
  allocateLeads(): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
    this.http.post('http://localhost:5000/api/allocate-orders', {}, { headers }).subscribe(
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
