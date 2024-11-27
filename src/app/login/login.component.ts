import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule,HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    CommonModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  isLoginMode: boolean = true;

  constructor(private http: HttpClient, private router: Router) { }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onLogin(form: any) {
    if (form.valid) {
      const email = form.value.email;
      const password = form.value.password;
  
      this.http.post('http://localhost:5000/login', { email, password })
      .subscribe(
        (response: any) => {
          const { token, id: userId, role } = response;

          if (userId && role) {
            // Save user data in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('role', role);
       // Navigate based on role
       this.redirectUserByRole(role);
      } else {
        console.error('User ID or role missing in the response');
      }
    },error => {
          console.error('Login error:', error);
        });
    }
  }
  
  onSignup(form: any) {
    if (form.valid) {
      const { name, email, password, confirmPassword } = form.value;

      if (password === confirmPassword) {
        this.http.post('http://localhost:5000/register', { name, email, password })
          .subscribe(
            () => {
              this.router.navigate(['/login']); // Redirect to login after successful signup
            },
            (error) => {
              console.error('Signup error:', error);
            }
          );
      } else {
        console.error('Passwords do not match');
      }
    }
  }

  private redirectUserByRole(role: string) {
    switch (role) {
      case 'Admin':
        this.router.navigate(['/layout']); // Admin layout
        break;
      case 'TeamLeader':
        this.router.navigate(['/TeamsManager']); // Team manager page
        break;
      default:
        this.router.navigate(['/users']); // Default for team members
        break;
    }
  }
}
