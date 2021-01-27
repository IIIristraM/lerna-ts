type Double = number;

type GetProps<T> = T extends React.ComponentType<infer P> ? P : T extends React.PureComponent<infer P> ? P : never;
