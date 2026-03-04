import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FarmerSubmission {
    farmerId: string;
    responses: string;
    fieldCoordinates: string;
    fieldCoordinatesList?: Array<string>;
    redeemedNFTId: string;
    claimedSTMileage?: bigint;
    fieldImagePath: string;
    reviewCompleted: boolean;
    selectedSTValue: string;
    currentCrop: string;
    state: string;
    nftId: string;
    deviceId: string;
    oldRandomArrayBooleansArray?: Array<boolean>;
    adminReviewStatus: string;
    pictureId: string;
    fieldSize: string;
    location: string;
    previousCrop: string;
    reqCount?: bigint;
    nftIdAdjustedBooleansArray?: Array<boolean>;
    responsesArray?: Array<string>;
    oldRandomArray?: Array<bigint>;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface UserProfile {
    name: string;
    loginId: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSubmission(submissionId: bigint, submission: FarmerSubmission): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllSubmissions(): Promise<Array<FarmerSubmission>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(): Promise<string>;
    getSubmission(submissionId: bigint): Promise<FarmerSubmission | null>;
    getSubmissionCount(loginId: string): Promise<string>;
    getSubmissionsByDevice(deviceId: string): Promise<Array<FarmerSubmission>>;
    getSubmissionsByFarmer(farmerId: string): Promise<Array<FarmerSubmission>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
