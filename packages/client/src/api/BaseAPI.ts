export class BaseAPI {
    protected mockRequest = <T>(response: T, delay: number = 1000) => {
        return new Promise<T>((resolve) => {
            setTimeout(() => {
                resolve(response);
            }, delay)
        })
    }
}