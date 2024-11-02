import React from 'react'
import { Question, UserAnswer } from '../types/quiz'

interface Props {
    question: Question;
    onSubmit: (answer: UserAnswer) => void;
}

export const QuizQuestion: React.FC<Props> = ({ question, onSubmit }) => {
    const [selectedOption, setSelectedOption] = React.useState<number | null>(null)

    const handleSubmit = () => {
        if (selectedOption === null) return

        onSubmit({
            questionId: question.id,
            selectedOption,
            isCorrect: selectedOption === question.correctAnswer
        })
    }

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">{question.title}</h2>
            <div className="space-y-3">
                {question.options.map((option, index) => (
                    <div
                        key={index}
                        className={`p-3 border rounded cursor-pointer ${selectedOption === index ? 'bg-blue-100 border-blue-500' : ''
                            }`}
                        onClick={() => setSelectedOption(index)}
                    >
                        {option}
                    </div>
                ))}
            </div>
            <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                onClick={handleSubmit}
                disabled={selectedOption === null}
            >
                提交答案
            </button>
        </div>
    )
}