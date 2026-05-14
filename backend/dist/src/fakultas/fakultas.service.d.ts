export interface FakultasData {
    nama: string;
    jurusan: string[];
}
export interface FakultasResponse {
    universitas: string;
    fakultas: FakultasData[];
}
export declare class FakultasService {
    private fakultasData;
    constructor();
    private loadFakultasData;
    getAllFakultas(): FakultasResponse;
    getFakultasList(): string[];
    getJurusanByFakultas(fakultasName: string): string[];
}
