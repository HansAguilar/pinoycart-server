export interface ICreateUser {
    username: string,
    password: string,
    email: string,
    phone: string,
    role: string
};

export interface IUserLoginInput {
    username: string,
    password: string
};

export interface IUserEditInput {
    email: string,
    phone: string,
};

export interface IUserPayload {
    _id: string,
    username: string,
    email: string,
    role: string
};

export interface IAddOrder {
    items: [
        {
            itemID: string,
            itemQuantity: number,
            deliveryAddress: {
                city: string,
                street: string,
                postal: string
            }
        }
    ]
};