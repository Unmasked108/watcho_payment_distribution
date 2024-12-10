import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-users1',
  standalone: true,
  imports: [MatTableModule,MatButtonModule,MatSortModule],
  templateUrl: './users1.component.html',
  styleUrl: './users1.component.scss'
})
export class Users1Component {
  username: string = ''; 
  initials: string = ''; 
  displayedColumns: string[] = ['orderId', 'undo'];
  dataSource = [
    { orderId: 101 },
    { orderId: 102 },
    { orderId: 103 },
    { orderId: 104 },
  ];

  undoAction(orderId: number): void {
    console.log(`Undo action triggered for Order ID: ${orderId}`);
  }
  constructor(private http: HttpClient) {}


  ngOnInit(): void {
    
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
}
