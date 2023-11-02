export interface Contact {
    id?: number,
    selected?: boolean,
    name: string,
    img?: any,
    email: string,
    country: string,
    region: string,
    company: string,
    position: string,
    channels: string[],
    interestRate: number
}
