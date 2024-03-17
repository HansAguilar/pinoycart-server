export interface ICreateUser {
    username: string;
    password: string;
    role: string
};

export interface IUserLoginInput {
    username: string;
    password: string;
    localCart: any[]
};

export interface IUserEditInput {
    username: string;
};

export interface IUserPayload {
    _id: string;
    username: string;
    role: string
};

export interface IUserOrder {
    items: [
        {
            itemID: string;
            itemQuantity: number;
            deliveryAddress: {
                city: string;
                street: string;
                postal: string
            }
        }
    ]
};


export interface ICart {
    items: [
        {
            itemID: string;
            itemQuantity: number;
            _id?: string;
            itemPrice?: number;
        }
    ],
    userID?: string;
};
