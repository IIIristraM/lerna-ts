export class BaseAPI {
    protected mockRequest = <T>(response: T, delay: number = 50) => {
        return new Promise<T>(resolve => {
            setTimeout(() => {
                resolve(response);
            }, delay);
        });
    };
}
