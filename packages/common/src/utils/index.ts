export * from './cache';

export function formatPrice(price: number = 0) {
    return Intl.NumberFormat('en', {
        currency: 'USD',
        style: 'currency'
    }).format(price)
}
