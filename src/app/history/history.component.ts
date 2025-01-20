import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import moment from 'moment';
import * as FileSaver from 'file-saver';
import { MatOption, MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    FormsModule,
    CommonModule,
    MatSelect,
    MatOption
    // HttpClientModule, // HttpClientModule only needed in app.module.ts, can be removed here
  ],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent implements OnInit {
  selectedDate: Date = new Date(); // Default to the current date
 
  selectedPaidStatus: string | null = null;
  selectedTeamName: string | null = null;
  teamNames: any[] = [];// Optional member filter
  selectedVerifyStatus: string | null=null;


  displayedColumns: string[] = [
    'srNo',

    'orderId',
    'coupon',
    'orderType',
    'orderLink',
    'verification',
    'allocatedTeamName',
    'allocatedMember',
    'mergedColumn',
    
  ];

  data: any[] = [];
  filteredData: any[] = [];
  loading: boolean = false;
  private readonly apiUrl = ' http://localhost:5000/api/results';
  private teamsApiUrl = 'http://localhost:5000/api/teams'

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchTeams();
    // this.loadAllResults(); // Load all results initially
  }
  fetchTeams(): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token from localStorage
    });

    this.http.get<any[]>(this.teamsApiUrl, { headers }).subscribe({
      next: (response) => {
        this.teamNames = response.map(team => ({
          id: team._id,
          name: team.teamName
        }));
      },
      error: (error) => {
        console.error('Error fetching teams:', error);
      }
    });
  }
  onFilterChange(): void {
    this.loadAllResults(); // Re-fetch results based on current filter values
  }

  loadAllResults(): void {
    this.loading = true;

    const formattedDate = this.selectedDate
      ? moment(this.selectedDate).format('YYYY-MM-DD')
      : null;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token from localStorage
    });

    // Build query params dynamically
    const queryParams: any = {};
    if (formattedDate) queryParams.date = formattedDate;
    if (this.selectedPaidStatus) queryParams.paidStatus = this.selectedPaidStatus;
    if (this.selectedTeamName) queryParams.teamName = this.selectedTeamName;
    if (this.selectedVerifyStatus) queryParams.verifyStatus = this.selectedVerifyStatus; // Add Verify Orders filter

    const queryString = new URLSearchParams(queryParams).toString();
    console.log(queryString)

    this.http.get<any[]>(`${this.apiUrl}?${queryString}`, { headers }).subscribe({
      next: (response) => {
        console.log('Response from API:', response);
         // Debugging log
         this.data = response.map((item) => this.formatResult(item));
         this.filteredData = [...this.data]; // Ensure filteredData is initialized
         this.loading = false; // Stop spinner after data is loaded
         this.cdr.detectChanges();
        // Handle the response data
        this.loading = false; // Stop spinner after data is loaded
      },
      error: (error) => {
        console.error('Error fetching results:', error);
        this.loading = false; // Stop spinner even on error
      }
    });
  }

  

  /**
   * Format API result into table-compatible data
   */
  private formatResult(item: any): any {
    return {
      orderId: item.orderId || 'N/A',
      coupon: item.coupon || 'N/A',
      orderLink: item.orderLink || 'N/A',
      orderType: item.orderType || 0,
      allocatedTeamName: item.teamName || 'N/A', // Use `teamName` directly
      verification: item.completionStatus || 'N/A',
      allocatedMember: item.memberName || 'N/A', // Use `memberName` directly
      paymentStatus: item.paymentStatus || 'N/A',
      profit: item.profitBehindOrder || 0,
      memberProfit: item.membersProfit || 0,
    };
  }
  
  /**
   * Download data as CSV
   */
  downloadData(): void {
    this.loading = true; // Start the loader before processing the data

    const formattedDate = moment(this.selectedDate).format('YYYY-MM-DD');
    const headers = ['Order ID','Coupon','Order Link', 'Order Type', 'Team Name','Verification', 'Member Name', 'Payment Status', 'Profit', 'Member Profit',];
    const csvData = this.filteredData.map((row) => ({
      'Order ID': row.orderId,
      'Coupon' : row.coupon,
      'Order Link': row.orderLink,
      'Order Type': row.orderType, // Add orderType to CSV data

      'Team Name': row.allocatedTeamName,
      'Verification': row.verification || 'N/A', // Map completion field

      'Member Name': row.allocatedMember,

      'Payment Status': row.paymentStatus,
      'Profit': `₹${row.profit}`, // Include icon representation in text
      'Member Profit': `₹${row.memberProfit}`, // Include icon representation in text
    }));
  
    const csvContent = [
      headers.map((header) => `"${header}"`).join(','), // Wrap headers in quotes
      ...csvData.map((row) =>
        Object.values(row)
          .map((value) => `"${value}"`) // Wrap each field value in quotes
          .join(',')
      ),
    ].join('\n');
  
    // Add UTF-8 BOM for proper encoding
    const utf8Bom = '\uFEFF';
    const blob = new Blob([utf8Bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `orders_${formattedDate}.csv`;
  
    setTimeout(() => {
      FileSaver.saveAs(blob, fileName);
      this.loading = false; // Stop the loader after download starts
      this.cdr.detectChanges(); // Ensure UI updates
    }, 100); // Simulated delay for async operation  }
  
  }
  /**
   * Search by date
   */
  searchByDate(): void {
    // this.loading = true
    this.loadAllResults();
    
  }
  
}
