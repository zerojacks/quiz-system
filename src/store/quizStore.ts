import create from 'zustand'

interface QuizState {
    currentQuiz: Quiz | null;
    userAnswers: UserAnswer[];
    currentQuestionIndex: number;
    setCurrentQuiz: (quiz: Quiz) => void;
    submitAnswer: (answer: UserAnswer) => void;
    nextQuestion: () => void;
    resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
    currentQuiz: null,
    userAnswers: [],
    currentQuestionIndex: 0,

    setCurrentQuiz: (quiz) => set({ currentQuiz: quiz, currentQuestionIndex: 0, userAnswers: [] }),

    submitAnswer: (answer) =>
        set((state) => ({
            userAnswers: [...state.userAnswers, answer]
        })),

    nextQuestion: () =>
        set((state) => ({
            currentQuestionIndex: state.currentQuestionIndex + 1
        })),

    resetQuiz: () =>
        set({
            currentQuestionIndex: 0,
            userAnswers: []
        })
}))