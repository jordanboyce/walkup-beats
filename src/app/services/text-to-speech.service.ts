import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {
  private apiUrl = 'https://api.elevenlabs.io/v1/text-to-speech';
  private apiKey = environment.elevenLabsApiKey; 
  private voiceId = 'yl2ZDV1MzN4HbQJbMihG'; // Hardcoded voice ID

  constructor(private http: HttpClient) {}

  streamTextToSpeech(name: string, number: string): Observable<Blob> {
    const fullText = "Now batting... Number " + number + "! .." + name + "!";
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'xi-api-key': this.apiKey
    });

    const body = {
      text: fullText,
      model_id: 'eleven_turbo_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.0,
        use_speaker_boost: true
      }
    };

    const ttsUrl = `${this.apiUrl}/${this.voiceId}/stream`;

    // Return an observable with the response as a Blob (binary data)
    return this.http.post(ttsUrl, body, { headers, responseType: 'blob', observe: 'body' });
  }
}
