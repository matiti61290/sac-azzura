export interface Promotion {
    id: number,
    code: string,
    type: number,
    valeur: number,
    stardate: Date,
    enddate: Date,
    condition: string,
    isActive: boolean
}