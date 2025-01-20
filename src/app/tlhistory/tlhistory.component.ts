import { ChangeDetectionStrategy, Component ,OnInit} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule,HttpHeaders} from '@angular/common/http';
import moment from 'moment';
import { RouterLink, RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-tlhistory',
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
    HttpClientModule,
  RouterLink,
RouterOutlet],
  templateUrl: './tlhistory.component.html',
  styleUrl: './tlhistory.component.scss'
})
export class TLHistoryComponent implements OnInit {
  username: string = '';
  initials: string = '';
  isDarkMode: boolean = false;
  selectedDate: Date = new Date();
  displayedColumns: string[] = [ 'orderId', 'orderLink','orderType','memberName', 'paymentStatus', 'completionDate'];
  dataSource = new MatTableDataSource<any>([]);
  teamMembers: any[] = [];

  constructor(private http: HttpClient) {}

  private allocationsUrl = ' https://asia-south1-ads-ai-101.cloudfunctions.net/watcho2_api/api/results';


  ngOnInit(): void {
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    this.username = localStorage.getItem('username') || '';
    this.initials = this.getInitials(this.username);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  searchByDate(): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  
    console.log('Selected Date:', this.selectedDate);
  
    // Format the selected date to YYYY-MM-DD
    const formattedDate = moment(this.selectedDate).format('YYYY-MM-DD');
    console.log('Formatted Date:', formattedDate); // Debugging
  
    // Fetch results for the selected date
    this.http
      .get<any[]>(this.allocationsUrl, { headers, params: { date: formattedDate } })
     
      .subscribe({
        next: (response: any[]) => {
          console.log('Response:', response);
  
          // Map the response to the required structure
          this.teamMembers = response.map((item: any) => ({
            orderId: item.orderId || 'N/A', // Default value if null
            orderLink: item.orderLink || 'N/A', // Default value if null
            orderType: item.orderType || 'N?A',
            paymentStatus: item.paymentStatus || 'N/A', // Default value if null
            memberName: item.memberName || 'N/A', // Default value if null
            completionDate: item.completionDate || 'N/A', // Default value if null
          }));
  
          // Update the dataSource with the new data
          this.dataSource.data = this.teamMembers;
        },
        error: (err) => console.error('Error fetching results:', err),
      });
  }
  
}
