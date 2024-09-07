import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TextToSpeechService } from '../../services/text-to-speech.service';

@Component({
  selector: 'app-team-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './team-details.component.html',
  styleUrl: './team-details.component.scss'
})
export class TeamDetailsComponent implements OnInit, OnDestroy {
  players: any[] = [];
  selectedPlayer: any;
  teamId: string = '';
  teamName: string = '';
  baseUrl: string = '';
  currentAudio: HTMLAudioElement | null = null;
  currentPlayingPlayerId: string | null = null;
  playerForm: FormGroup;
  teamForm: FormGroup;
  teamLoading: boolean = false;
  playersLoading: boolean = false;
  playerAudio: string = '';

  currentLogo: string | null = null;
  teamLogoUrl: any;

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  errorMessage: string = '';
  successMessage: string = '';
  deleteMessage: string = '';
  pendingDeleteAction: (() => void) | null = null;

  private messageTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private textToSpeechService: TextToSpeechService,
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    public authService: AuthService
  ) {
    this.playerForm = this.fb.group({
      name: ['', Validators.required],
      jerseyNumber: [null],
      introFile: [null],
      songFile: [null]
    });

    this.teamForm = this.fb.group({
      name: ['', Validators.required],
      logo: [null]
    });
  }


  ngOnInit() {
    this.baseUrl = this.dataService.getBaseUrl();
    this.route.params.subscribe(params => {
      this.teamId = params['id'];
      this.getTeamDetails();
      this.getTeamPlayers();
    });

  }


  getTeamDetails() {
    this.teamLoading = true;
    this.dataService.getTeamDetails(this.teamId).subscribe({
      next: (res: any) => {
        this.teamName = res.name;
        this.teamLogoUrl = this.getFullLogoUrl(this.teamId, res.logo);
        this.teamLoading = false;
      },
      error: (err: any) => {
        console.error('Error retrieving team details: ', err);
        this.teamLoading = false;
      }
    });
  }

  getTeamPlayers() {
    this.playersLoading = true;
    this.dataService.getTeamPlayers(this.teamId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.players = res.map((player: any) => ({
          ...player,
          introUrl: this.getFullAudioUrl(player.id, player.introFile),
          songUrl: this.getFullAudioUrl(player.id, player.songFile)
        }));
        this.playersLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching team details: ', err);
        this.playersLoading = false;
      }
    });
  }

  getFullLogoUrl(teamId: string, filename: string): string {
    return `${this.baseUrl}api/files/teams/${teamId}/${filename}`;
  }

  editTeam() {
    this.dataService.getTeamDetails(this.teamId).subscribe({
      next: (res: any) => {
        this.teamForm.patchValue({
          name: res.name,
          logo: null  // We'll keep the actual file on the server
        });
        this.currentLogo = res.logo;  // Store the current logo filename
      },
      error: (err: any) => {
        console.error('Error retrieving team details: ', err)
      }
    });

    const modal = document.getElementById('team_modal') as HTMLDialogElement;
    modal.showModal();
  }

  closeTeamDialog() {
    const modal = document.getElementById('team_modal') as HTMLDialogElement;
    modal.close();
    this.resetFormAndFileInput();
  }

  updateTeam() {
    let formData = new FormData();

    // Always add the name
    formData.append('name', this.teamForm.value.name);

    // Check if a new logo file was selected
    if (this.teamForm.value.logo instanceof File) {
      formData.append('logo', this.teamForm.value.logo);
    } else if (this.currentLogo) {
      // If no new file was selected, but there was an existing logo, do nothing
      // The server will keep the existing logo
    } else {
      // If no new file was selected and there was no existing logo, 
      // you might want to explicitly set it to null or empty
      formData.append('logo', '');
    }

    this.dataService.updateTeam(this.teamId, formData).subscribe({
      next: (res: any) => {
        this.getTeamDetails();
        this.closeTeamDialog();
      },
      error: (err: any) => {
        console.error('Error updating team: ', err)
      }
    });
  }

  deleteTeam() {
    this.dataService.deleteTeam(this.teamId).subscribe({
      next: (res: any) => {
        this.router.navigate(['']);
      },
      error: (err: any) => {
        console.error('Error deleting team: ', err);
      }
    });
  }

  getPlayerInfo(playerId: any) {
    this.dataService.getPlayerData(playerId).subscribe({
      next: (player: any) => {
      },
      error: (err: any) => {
        console.error('Error fetching player details: ', err)
      }
    });
  }

  getFullAudioUrl(playerId: string, filename: string): string {
    return `${this.baseUrl}api/files/players/${playerId}/${filename}`;
  }

  toggleSong(player: any) {
    if (this.isPlaying(player.id)) {
      this.stopSong();
    } else {
      this.playSong(player);
    }
  }

  playSong(player: any) {
    if (this.currentAudio) {
      this.stopSong();
    }
  
    // Play the intro audio first
    const introAudio = new Audio(player.introUrl);
    this.currentPlayingPlayerId = player.id;
    introAudio.play();
  
    // When the intro audio ends, play the song
    introAudio.onended = () => {
      const songAudio = new Audio(player.songUrl);
      this.currentAudio = songAudio;
      songAudio.play();
    };
  
    this.currentAudio = introAudio;
  }

  stopSong() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.currentPlayingPlayerId = null;
    }
  }

  isPlaying(playerId: string): boolean {
    return this.currentPlayingPlayerId === playerId;
  }

  onFileSelectedPlayer(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        console.error("Only audio files are supported");
        return;
      }
      this.playerForm.patchValue({
        songFile: file
      });

      this.playerForm.get('songFile')?.markAsDirty();
    }
  }

  onFileSelectedTeam(event: any): void {
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

  editPlayer(player: any) {
    this.selectedPlayer = player;
    // Populate the form with existing player data
    this.playerForm.patchValue({
      name: player.name,
      jerseyNumber: player.jerseyNumber,
    });

    // Store the player ID for updating
    this.playerForm.addControl('id', this.fb.control(player.id));

    // Open the modal
    const modal = document.getElementById('player_modal') as HTMLDialogElement;
    modal.showModal();
  }

  confirmDelete(deleteItem: 'team' | 'player') {
    const deleteActions = {
      team: {
        message: "Are you sure you want to delete this entire team? This action cannot be undone.",
        action: () => this.deleteTeam()
      },
      player: {
        message: "Are you sure you want to delete this player? This action cannot be undone.",
        action: () => this.deletePlayer()
      }
    };

    this.deleteMessage = deleteActions[deleteItem].message;

    const modal1 = document.getElementById('confirm_delete_modal') as HTMLDialogElement;
    const modal2 = document.getElementById('player_modal') as HTMLDialogElement;

    modal2.close();
    modal1.show();

    // Store the action to be executed later
    this.pendingDeleteAction = deleteActions[deleteItem].action;
  }

  // Add this method to execute the stored action
  executeDelete() {
    if (this.pendingDeleteAction) {
      this.pendingDeleteAction();
      this.pendingDeleteAction = null;
    }
  }


  deletePlayer() {
    this.playersLoading = true;
    const modal = document.getElementById('player_modal') as HTMLDialogElement;

    this.dataService.deletePlayer(this.selectedPlayer.id).subscribe({
      next: (res: any) => {
        this.showMessage('Player deleted successfully.');
        this.getTeamPlayers();
        modal.close();
        this.resetFormAndFileInput();
        this.playersLoading = false;
      },
      error: (err: any) => {
        this.showMessage('Player could not be deleted.', true);
        console.error('Error deleting player: ', err);
        this.playersLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.playerForm.valid) {
      const playerName = this.playerForm.get('name')?.value;
      const playerNumber = this.playerForm.get('jerseyNumber')?.value;

      // Step 1: Generate the TTS audio for the player
      this.createPlayerAudio(playerName, playerNumber).then((audioBlob: Blob) => {
        const formData = new FormData();
        formData.append('name', playerName);
        formData.append('jerseyNumber', playerNumber);
        formData.append('teamId', this.teamId);

        // Append the generated TTS audio to FormData
        if (audioBlob) {
          const audioFile = new File([audioBlob], `${playerName}-intro.mp3`, { type: 'audio/mpeg' });
          formData.append('introFile', audioFile);
        }

        // Append song file if it exists
        const songFile = this.playerForm.get('songFile')?.value;
        if (songFile) {
          formData.append('songFile', songFile);
        }

        const modal = document.getElementById('player_modal') as HTMLDialogElement;

        if (this.selectedPlayer) {
          // Update the player if selectedPlayer is not null
          this.dataService.updatePlayer(this.selectedPlayer.id, formData).subscribe({
            next: (res: any) => {
              this.getTeamPlayers();
              modal.close();
              this.resetFormAndFileInput();
              this.selectedPlayer = null;
              this.showMessage('Player updated successfully.');
            },
            error: (err: any) => {
              console.error('Error updating player: ', err);
              this.showMessage('Player could not be updated.', true);
            }
          });
        } else {
          // Create a new player
          this.dataService.createPlayer(formData).subscribe({
            next: (res: any) => {
              this.getTeamPlayers();
              modal.close();
              this.resetFormAndFileInput();
              this.selectedPlayer = null;
              this.showMessage('Player created successfully.');
            },
            error: (err: any) => {
              console.error("Error creating player: ", err)
              this.showMessage('Player could not be created', true);
            }
          });
        }
      }).catch((error) => {
        console.error('Error generating player audio:', error);
        this.showMessage('Player could not be created due to audio generation error.', true);
      });
    }
  }

  createPlayerAudio(playerName: string, playerNumber: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.textToSpeechService.streamTextToSpeech(playerName, playerNumber).subscribe({
        next: (res: Blob) => {
          resolve(res); // Resolve the Blob when the audio is successfully generated
        },
        error: (err: any) => {
          console.error('Error generating audio:', err);
          reject(err); // Reject the Promise in case of error
        }
      });
    });
  }

  playAudio() {
    const audio = new Audio(this.playerAudio);
    audio.play();
  }


  onCancel(): void {
    const modal = document.getElementById('player_modal') as HTMLDialogElement;
    modal.close();
    this.resetFormAndFileInput();
    this.selectedPlayer = null;
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.players.sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private resetFormAndFileInput(): void {
    // Reset player form
    this.playerForm.reset();
    this.playerForm.patchValue({
      songFile: null
    });

    // Reset team form
    this.teamForm.reset();
    this.teamForm.patchValue({
      logo: null
    });

    // Reset file inputs
    const playerFileInput = document.querySelector('input[type="file"][name="songFile"]') as HTMLInputElement;
    const teamFileInput = document.querySelector('input[type="file"][name="logo"]') as HTMLInputElement;

    if (playerFileInput) {
      playerFileInput.value = '';
    }

    if (teamFileInput) {
      teamFileInput.value = '';
    }
  }

  private showMessage(message: string, isError: boolean = false) {
    // Clear any existing timeout
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }

    // Set the appropriate message
    if (isError) {
      this.errorMessage = message;
      this.successMessage = '';
    } else {
      this.successMessage = message;
      this.errorMessage = '';
    }

    // Set a timeout to clear the message after 3 seconds
    this.messageTimeout = setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
      if (this.cd) {
        this.cd.detectChanges();
      }
    }, 3000);
  }

  ngOnDestroy() {
    this.stopSong();
  }
}