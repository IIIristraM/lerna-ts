export const cacheFn = <TArgs extends any[], TRes>(func: (...args: TArgs) => TRes) => {
    const hash: Record<string, TRes> = {};

    return (...args: TArgs) => {
        const key = JSON.stringify(args);
        hash[key] = hash[key] || func(...args);

        return hash[key];
    };
};
