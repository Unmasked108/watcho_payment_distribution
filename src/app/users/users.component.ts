import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { MatPaginatorModule } from '@angular/material/paginator'; // Import MatPaginatorModule
import { MatTableModule } from '@angular/material/table'; // Import MatTableModule
import { MatSortModule } from '@angular/material/sort'; // Import MatSortModule
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [MatIconModule, MatCardModule, FormsModule,MatPaginatorModule,MatTableModule,MatSortModule,CommonModule,MatSelectModule], // Include FormsModule here
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  username: string = 'John Doe'; // Default username
  initials: string = this.getInitials(this.username); // Initials based on username
  isDarkMode: boolean = false; // Tracks the current theme mode

  ngOnInit(): void {
    this.isDarkMode = localStorage.getItem('theme') === 'dark'; // Initialize dark mode
    this.applyTheme();
    this.totalRecords = this.paginatedData.length;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light'); // Save theme preference
    this.applyTheme();
  }

  applyTheme() {
    const body = document.body;
    if (this.isDarkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  }

  allocatedLeadsCount = 5; // Just an example, you can set the actual count dynamically
  taskCompleted = false;

  downloadLeads() {
    // Implement logic for downloading leads (e.g., triggering a download of a file)
  }

  uploadTask() {
    // Trigger file input click or handle any other actions
    const fileInput: HTMLInputElement | null = document.querySelector('#fileInput');
    if (fileInput) { // Ensure the element exists before clicking
      fileInput.click();
    }
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      console.log('File selected:', file);
    } else {
      console.error('No file selected or input invalid.');
    }
  }
  

  // Pagination related variables
  currentPage: number = 1;
  itemsPerPage: number = 10; // Default items per page
  totalRecords: number = 0; // Will be updated dynamically based on the data

  displayedColumns: string[] = ['orderId', 'link', 'paymentStatus', 'paymentMode', 'allocationTime', 'endlineTime'];

  // Sample data with new fields
  paginatedData = [
    {
      orderId: 1,
      link: 'http://example.com',
      paymentStatus: 'Completed',
      paymentMode: 'Credit Card',
      allocationTime: '2024-11-24 09:00 AM',
      endlineTime: '2024-11-24 05:00 PM',
    },
    {
      orderId: 2,
      link: 'http://example2.com',
      paymentStatus: 'Pending',
      paymentMode: 'PayPal',
      allocationTime: '2024-11-24 10:30 AM',
      endlineTime: '2024-11-24 06:30 PM',
    },
    {
      orderId: 3,
      link: 'http://example3.com',
      paymentStatus: 'Failed',
      paymentMode: 'Debit Card',
      allocationTime: '2024-11-24 08:00 AM',
      endlineTime: '2024-11-24 04:00 PM',
    },
    {
      orderId: 4,
      link: 'http://example4.com',
      paymentStatus: 'Completed',
      paymentMode: 'Net Banking',
      allocationTime: '2024-11-24 07:45 AM',
      endlineTime: '2024-11-24 03:45 PM',
    },
  ];
  paymentModes: string[] = ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash'];

  // Event triggered when payment mode is changed
  onPaymentModeChange(element: any): void {
    console.log(`Payment mode updated for Order ID ${element.orderId}:`, element.paymentMode);
    // Additional logic like saving the updated value to the backend can go here
  }
  
  // Method to handle pagination change
  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1; // Adjust for zero-based page index
    this.itemsPerPage = event.pageSize; // Adjust the number of items per page
    // Implement any logic to fetch or display paginated data here
    // For now, this will just slice the data based on currentPage and itemsPerPage
    this.paginatedData = this.paginatedData.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }
}
