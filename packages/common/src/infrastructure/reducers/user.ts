import { Action } from 'redux';

type User = {
    login: string;
};

export default function userReducer(state: User | null = null, action: Action) {
    return state;
}
