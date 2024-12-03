import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';  // Import CommonModule
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Team {
  teamName: string;
  teamId: string;
  teamStatus: string;
  allocation: string;
  allocatedTime: string | null;
  teamCapacity: number | null; // Add this field

}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    CommonModule, // Add CommonModule to the imports array
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent  {
  taskOption: string | null = null;
  showFileInput = false;
  selectedFile: File | null = null;

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


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Fetch teams data on component initialization
    this.getTeams();
    this.getAllocations();

  }

  // Fetch teams from backend
  getTeams(): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });

    const role = localStorage.getItem('role');
    const url = role === 'Admin' ? `${this.apiUrl}` : this.apiUrl;

    this.http.get<any[]>(url, {headers}).subscribe(
      (data) => {
        // Populate teams array with relevant data
        this.teams = data.map(team => ({
          teamName: team.teamName,
          teamId: team.teamId,
          teamStatus: 'Active', // Assuming a default value, adjust if needed
          allocation: 'Not Allocated', // Adjust logic as per requirements
          allocatedTime: null,
          teamCapacity: team.capacity, // Populate capacity from the backend response

        }));
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
          const team = this.teams.find((t) => t.teamId === allocation.teamId);
          if (team) {
            team.allocation = allocation.status || 'Allocated';
            team.allocatedTime = new Date(allocation.allocationDate).toLocaleString();
          }
        });
      },
      (error) => {
        console.error('Error fetching allocations:', error);
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
        },
        (error) => {
          console.error('Error saving data:', error);
        }
      );
    };
    reader.readAsText(this.selectedFile!);
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
        this.alertMessage = 'Leads allocated successfully!';
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
}
