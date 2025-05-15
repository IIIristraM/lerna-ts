import { BaseAPI } from '../BaseAPI';
import { User } from './types';

const USER: User ={
    id: "1",
    login: "ktnglazachev",
}

export class UserAPI extends BaseAPI {
    getUserInfo = async () => {
        return this.mockRequest(USER);
    }
}