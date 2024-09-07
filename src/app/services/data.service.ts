import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase('https://walkup-beats-api.pockethost.io/');
  }

  getBaseUrl(): string {
    return this.pb.baseUrl;
  }

  getTeamDetails(teamId: any) {
    return from(this.pb.collection('teams').getOne(teamId));
  }

  updateTeam(teamId: any, teamData: any) {
    return from(this.pb.collection('teams').update(teamId, teamData));
  }

  getTeams(): Observable<any> {
    return from(this.pb.collection('teams').getFullList({
      sort: 'name',
    }));
  }

  getTeamPlayers(teamId: string, page: number = 1, perPage: number = 50): Observable<any> {
    return from(this.pb.collection('players').getFullList({
      filter: `teamId = "${teamId}"`,
      expand: 'teamId',
      sort: 'jerseyNumber',
      fields: 'id,name,pronunciation,jerseyNumber,introFile,songFile'
    }));
  }

  getPlayerData(playerId: string,) {
    return from(this.pb.collection('players').getOne(playerId, {

    }));
  }

  createTeam(formData: any) {
    const data = {
      "name": formData.name,
      "manager": this.pb.authStore.model?.['id'],
      "logo": formData.logo
  };
    return from(this.pb.collection('teams').create(data));
  }

  deleteTeam(teamId: any) {
    return from(this.pb.collection('teams').delete(teamId))
  }

  // This is called before creating a player
  addSong(songData: any) {
    return from(this.pb.collection('songs').create(songData));
  }

  createPlayer(playerData: any) {
    return from(this.pb.collection('players').create(playerData));
  }

  updatePlayer(playerId: any, playerData: any) {
    return from(this.pb.collection('players').update(playerId, playerData));
  }

  deletePlayer(playerId: any) {
    return from(this.pb.collection('players').delete(playerId));
  }
}