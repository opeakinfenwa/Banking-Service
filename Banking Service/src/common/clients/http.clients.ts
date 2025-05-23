import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UserHttpClient {
  constructor(private readonly httpService: HttpService) {}

  async fetchUserById(userId: string): Promise<any> {
    const response$ = this.httpService.get(`http://localhost:5001/users/${userId}`);
    const response = await lastValueFrom(response$);
    return response.data;
  }
}