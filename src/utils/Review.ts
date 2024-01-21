export interface Review {
    id: string;
    invokedUsername: string;
    invokedAvatarUrl: string;
    title: string;
    description: string;
    positiveRating: number;
    negativeRating: number;
    reviewerUsername: string;
    reviwerAvatarUrl: string;
    reviewNumber: number;
    numberOfReviews: number;
}
