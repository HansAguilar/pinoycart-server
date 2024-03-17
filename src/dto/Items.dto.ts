export interface IAddItem {
    itemID: string;
    itemName: string;
    itemDesc: string;
    itemPrice: number;
    itemCategory: string[];
    itemStock: number;
    itemImages: string[];
    userID?: string
};


export interface IReview {
    itemID: string;
    rating: number;
    comment: string;
}
