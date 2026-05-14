import { FakultasService } from './fakultas.service';
export declare class FakultasController {
    private readonly fakultasService;
    constructor(fakultasService: FakultasService);
    getAllFakultas(): {
        success: boolean;
        data: import("./fakultas.service").FakultasResponse;
    };
    getFakultasList(): {
        success: boolean;
        data: string[];
    };
    getJurusanByFakultas(fakultas: string): {
        success: boolean;
        error: {
            message: string;
            statusCode: number;
        };
        data?: undefined;
    } | {
        success: boolean;
        data: string[];
        error?: undefined;
    };
}
