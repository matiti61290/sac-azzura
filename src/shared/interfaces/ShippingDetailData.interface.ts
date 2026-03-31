import { Carrier } from "../enum/carrier.enum"

export interface BaseShippingDetailsData {
    latestStatus?: string
    updateViaWebhookAt?: Date
}

export interface MondialRelayDetails extends BaseShippingDetailsData {
    carrier: Carrier.MONDIAL_RELAY
    relayPointId: string
    relayPointName?: string
    stat?: string
    tracing?: any
}

export interface ColissimoDetails extends BaseShippingDetailsData {
    carrier: Carrier.COLISSIMO
    returnChoice: string
    trackingEvents: any[]
}

export type ShippingDetailsData = MondialRelayDetails | ColissimoDetails