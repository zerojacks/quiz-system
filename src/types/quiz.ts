export interface Question {
    id: number;
    title: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

export interface Quiz {
    id: number;
    title: string;
    description: string;
    questions: Question[];
}

export interface UserAnswer {
    questionId: number;
    selectedOption: number;
    isCorrect: boolean;
}