export interface ServiceError extends Error {
    response?: {
        data: any
        status?: number
    }
}