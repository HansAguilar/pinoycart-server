export interface ICreateVendor{
    vendorName: string;
    vendorDesc: string;
    vendorID?: string;
    file: string
}

export interface IFollowVendorID{
    followVendor: string
}