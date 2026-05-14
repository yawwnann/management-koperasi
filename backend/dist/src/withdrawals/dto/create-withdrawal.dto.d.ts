export declare enum WithdrawalPaymentMethod {
    CASH = "Cash",
    BANK_TRANSFER = "BankTransfer"
}
export declare enum SavingType {
    POKOK = "Pokok",
    WAJIB = "Wajib",
    SUKARELA = "Sukarela"
}
export declare class CreateWithdrawalDto {
    nominal: number;
    reason: string;
    savingType: SavingType;
    paymentMethod?: WithdrawalPaymentMethod;
}
