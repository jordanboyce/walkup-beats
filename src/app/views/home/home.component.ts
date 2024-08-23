import { DatePipe, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [JsonPipe, DatePipe, RouterLink, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  teamForm: FormGroup;
  teams: any[] = [];
  baseUrl: string = '';
  defaultLogoUrl = '../temp_logo.jpg';
  isLoading: boolean = false;
  currUser: any;

  constructor(private dataService: DataService, private router: Router, private fb: FormBuilder, private authService: AuthService) {
    this.baseUrl = this.dataService.getBaseUrl();
    this.teamForm = this.fb.group({
      name: ['', Validators.required],
      logo: [null]
    });
  }

  ngOnInit(): void {
   this.getTeamsList();
   this.checkUser();
     
  }

  checkUser() {
    this.authService.refreshAuth();
    this.currUser = this.authService.getCurrentUser();
    console.log(this.currUser);

    if(!this.currUser.verified) {
      console.log('send verify email');
      this.authService.sendVerificationEmail(this.currUser.email).subscribe({
        next: (res: any) => {
          console.log(res);
        }
      });
    } 
  }

  private resetFormAndFileInput(): void {
    this.teamForm.reset();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    this.teamForm.patchValue({
      logo: null
    });
  }

  getTeamsList() {
    this.isLoading = true;
    console.info('fetching all teams');

    this.dataService.getTeams().subscribe({
      next: (res: any) => {
        this.teams = res.map((team: any) => ({
          ...team,
          logoUrl: this.getFullLogoUrl(team.id, team.logo)
        }));
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fething teams: ', err);
        this.isLoading = false;
      }
    });

  }

  getFullLogoUrl(teamId: string, filename: string): string {
    return `${this.baseUrl}api/files/teams/${teamId}/${filename}`;
  }

  navToDetails(teamName: string, teamId: string) {
    this.router.navigate([teamName, teamId]);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type.match(/image\/*/) == null) {
        // If file is not an image, show an error message
        console.error("Only images are supported");
        // You might want to show this error to the user in the UI
        return;
      }
      // Process the image file
      this.teamForm.patchValue({
        logo: file
      });
    }
  }

  onCancel(): void {
    const modal = document.getElementById('team_modal') as HTMLDialogElement;
    modal.close();
    this.resetFormAndFileInput();
  }

  onSubmit(): void {
    if (this.teamForm.valid) {
      const formValue = { ...this.teamForm.value };

      // Check if logo is null and set default
      if (!formValue.logo) {
        // If your API expects a File object
        fetch(this.defaultLogoUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'default_logo.png', { type: 'image/png' });
            formValue.logo = file;
            this.submitTeam(formValue);
          })
          .catch(err => {
            console.error('Error fetching default logo:', err);
            // If fetching fails, you might want to proceed without a logo
            this.submitTeam(formValue);
          });
      } else {
        // If logo is not null, submit as is
        this.submitTeam(formValue);
      }
    }
  }

  private submitTeam(teamData: any): void {
    const modal = document.getElementById('team_modal') as HTMLDialogElement;
    this.dataService.createTeam(teamData).subscribe({
      next: (res: any) => {
        modal.close();
        this.resetFormAndFileInput();
        this.getTeamsList();
      },
      error: (err: any) => {
        console.error('Error creating team: ', err);
      }
    });
  }

}
