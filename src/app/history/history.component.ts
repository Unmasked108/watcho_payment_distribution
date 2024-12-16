import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule,HttpHeaders} from '@angular/common/http';
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
    HttpClientModule
  ],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent {
  selectedDate: Date = new Date(); // Default to current date
  displayedColumns: string[] = [
    'assignedTeams',
    'allocatedDate',
    'completionDate',
    'orderId',
    'completionStatus',
  ];
  data: any[] = [];
  filteredData: any[] = [];

  // Replace with your actual API endpoint
  private readonly apiUrl = ' http://localhost:5000/api/history-data';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadHistoryData(); // Load data for the default date
  }

  loadHistoryData(): void {
    const formattedDate = moment(this.selectedDate).format('YYYY-MM-DD'); // Format date for API
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`, // Add the token for authorization
    });
  
    this.http.get<any[]>(`${this.apiUrl}?date=${formattedDate}`, { headers }).subscribe({
      next: (response) => {
        this.data = response;
        this.filteredData = [...this.data]; // Initialize filtered data
      },
      error: (error) => {
        console.error('Error fetching history data:', error);
      },
    });
  }
  
  searchByDate(): void {
    this.loadHistoryData(); // Reload data for the selected date
  }
}