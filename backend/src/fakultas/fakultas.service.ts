import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface FakultasData {
  nama: string;
  jurusan: string[];
}

export interface FakultasResponse {
  universitas: string;
  fakultas: FakultasData[];
}

@Injectable()
export class FakultasService {
  private fakultasData: FakultasResponse;

  constructor() {
    this.loadFakultasData();
  }

  private loadFakultasData() {
    try {
      const filePath = path.join(process.cwd(), 'prisma', 'fakultas.json');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      this.fakultasData = JSON.parse(fileContent);
    } catch (error) {
      console.error('Failed to load fakultas data:', error);
      this.fakultasData = { universitas: '', fakultas: [] };
    }
  }

  getAllFakultas(): FakultasResponse {
    return this.fakultasData;
  }

  getFakultasList(): string[] {
    return this.fakultasData.fakultas.map((f) => f.nama);
  }

  getJurusanByFakultas(fakultasName: string): string[] {
    const fakultas = this.fakultasData.fakultas.find(
      (f) => f.nama === fakultasName,
    );
    return fakultas ? fakultas.jurusan : [];
  }
}
