import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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
    // HttpClientModule, // HttpClientModule only needed in app.module.ts, can be removed here
  ],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent implements OnInit {
  selectedDate: Date = new Date(); // Default to the current date
  selectedTeamId: string | null = null; // Optional team filter
  selectedMemberName: string | null = null; // Optional member filter

  displayedColumns: string[] = [
    'orderId',
    'allocatedTeamId',
    'allocatedMember',
    'paymentStatus',
    'profit',
    'memberProfit',
  ];

  data: any[] = [];
  filteredData: any[] = [];
  private readonly apiUrl = ' https://asia-south1-ads-ai-101.cloudfunctions.net/watcho1_apiapi/results';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllResults(); // Load all results initially
  }

  /**
   * Fetch all results for Admin based on the selected date
   */
  loadAllResults(): void {
    const formattedDate = moment(this.selectedDate).format('YYYY-MM-DD');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token from localStorage
    });

    this.http
      .get<any[]>(`${this.apiUrl}?date=${formattedDate}`, { headers })
      .subscribe({
        next: (response) => {
          console.log('Response from API:', response); // Add this line

          this.data = response.map((item) => this.formatResult(item));
          this.filteredData = [...this.data];
        },
        error: (error) => {
          console.error('Error fetching results:', error);
        },
      });
  }

  /**
   * Format API result into table-compatible data
   */
  private formatResult(item: any): any {
    return {
      orderId: item.orderId || 'N/A', // Correct mapping
      allocatedTeamId: item.teamId?.teamName || 'N/A', // Access nested `teamName`
      allocatedMember: item.memberName || 'N/A',
      paymentStatus: item.paymentStatus || 'N/A',
      profit: item.profitBehindOrder || 0,
      memberProfit: item.membersProfit || 0,
    };
  }
  /**
   * Download data as CSV
   */
  downloadData(): void {
    const formattedDate = moment(this.selectedDate).format('YYYY-MM-DD');
    const headers = ['Order ID', 'Team Name', 'Member Name', 'Payment Status', 'Profit', 'Member Profit'];
    const csvData = this.filteredData.map((row) => ({
      'Order ID': row.orderId,
      'Team Name': row.allocatedTeamId,
      'Member Name': row.allocatedMember,
      'Payment Status': row.paymentStatus,
      'Profit': `₹${row.profit}`, // Include icon representation in text
      'Member Profit': `₹${row.memberProfit}`, // Include icon representation in text
    }));

    const csvContent = [
      headers.join(','),
      ...csvData.map((row) => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `orders_${formattedDate}.csv`;

    FileSaver.saveAs(blob, fileName);
  }

  /**
   * Search by date
   */
  searchByDate(): void {
    this.loadAllResults();
  }
}
