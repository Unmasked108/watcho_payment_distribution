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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

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
    HttpClientModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  isLoginMode: boolean = true;

  constructor(private http: HttpClient, private router: Router, private snackBar: MatSnackBar) {}
  showLoginPassword = false;
  showSignupPassword = false;
  showSignupConfirmPassword = false;
  
  toggleLoginPasswordVisibility(): void {
    this.showLoginPassword = !this.showLoginPassword;
  }
  
  toggleSignupPasswordVisibility(): void {
    this.showSignupPassword = !this.showSignupPassword;
  }
  
  toggleSignupConfirmPasswordVisibility(): void {
    this.showSignupConfirmPassword = !this.showSignupConfirmPassword;
  }
  
  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onLogin(form: any) {
    if (form.valid) {
      const email = form.value.email;
      const password = form.value.password;
  
      this.http.post('http://localhost:5000/login' //http://localhost:5000/login
        , { email, password })
      .subscribe(
        (response: any) => {
          const { token, id: userId, role ,username} = response;

          if (userId && role) {
            // Save user data in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('role', role);
            localStorage.setItem('username', username); // Store username

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
  showSuccessModal = false;

  onSignup(form: any) {
    if (form.valid) {
      const { name, email, password, confirmPassword } = form.value;
  
      if (password === confirmPassword) {
        this.http.post('http://localhost:5000/register' //http://localhost:5000/register
          , { name, email, password }).subscribe(
          () => {
            this.showSuccessModal = true; // Show the success modal
          },
          (error) => {
            console.error('Signup error:', error);
            alert('Signup failed. Please try again.'); // Use a simple alert for failure
          }
        );
      } else {
        alert('Passwords do not match.'); // Use a simple alert for password mismatch
      }
    }
  }
  
  redirectToLogin() {
    this.showSuccessModal = false; // Hide the modal
    this.router.navigate(['/login']); // Redirect to login
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
