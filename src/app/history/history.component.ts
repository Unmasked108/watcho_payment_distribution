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
  private readonly apiUrl = 'http://localhost:5000/api/results';

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
      orderId: item.orderId || 'N/A',
      allocatedTeamId: item.teamName || 'N/A',
      allocatedMember: item.memberName || 'N/A',
      paymentStatus: item.paymentStatus || 'N/A',
      profit: item.profitBehindOrder || 0,
      memberProfit: item.membersProfit || 0,
    };
  }

  /**
   * Search by date
   */
  searchByDate(): void {
    this.loadAllResults();
  }
}
