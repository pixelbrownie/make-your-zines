import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZineService {
  private apiUrl = 'http://localhost:8000/api/zines/';

  constructor(private http: HttpClient) {}

  createZine(zineData: any): Observable<any> {
    return this.http.post(this.apiUrl, zineData);
  }

  getUserZines(): Observable<any> {
    return this.http.get(`${this.apiUrl}mine/`);
  }

  getZineBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.apiUrl}${slug}/`);
  }

  updateZine(slug: string, data: any): Observable<any> {
    // If we're sending a file, we must use FormData
    const hasFile = Object.values(data).some(val => val instanceof File);
    if (hasFile) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      return this.http.patch(`${this.apiUrl}${slug}/`, formData);
    }
    return this.http.patch(`${this.apiUrl}${slug}/`, data);
  }
}
