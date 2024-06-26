export interface IAddItem {
    itemID: string;
    itemName: string;
    itemDesc: string;
    itemPrice: number;
    itemCategory: string;
    itemStock: number;
    itemImages: string[];
    vendorID: string
};


export interface IAddReview {
    userID: string;
    itemID: string;
    rating: number;
    comment: string;
}
