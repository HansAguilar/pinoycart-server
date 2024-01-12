export interface IAddItem {
    itemName: string,
    itemDesc: string,
    itemPrice: number,
    itemCategory: [string],
    itemStock: number,
};


export interface IReview {
    itemID: string,
    rating: number,
    comment: string
}
